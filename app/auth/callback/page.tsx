'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    let destination = '/'
    try {
      if (sessionStorage.getItem('rentiq.auth.return') === 'prediction') destination = '/?nav=prediction'
      sessionStorage.removeItem('rentiq.auth.return')
    } catch { /* Use the overview when storage is unavailable. */ }
    const errorDestination = `${destination}${destination.includes('?') ? '&' : '?'}auth_error=callback`
    const code = params.get('code')
    if (params.has('error') || !code) {
      console.warn(
        'Google OAuth callback did not include an authorization code.',
        params.get('error'),
        params.get('error_description')
      )
      router.replace(errorDestination)
      return
    }
    void supabase.auth.exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error || !data.session) {
          console.warn('Failed to exchange Google OAuth code for a session:', error?.message)
          router.replace(errorDestination)
          return
        }
        const avatar =
          data.session?.user?.user_metadata?.avatar_url ||
          data.session?.user?.user_metadata?.picture
        if (typeof avatar === 'string' && avatar.trim()) {
          try {
            localStorage.setItem('rentiq.user.avatar.v1', avatar.trim())
          } catch {
            // Ignore storage restrictions
          }
        }
        router.replace(destination)
      })
      .catch((error: unknown) => {
        console.warn('Unexpected Google OAuth callback failure:', error)
        router.replace(errorDestination)
      })
  }, [params, router])
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Đang hoàn tất đăng nhập Google...</main>
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          Đang hoàn tất đăng nhập Google...
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
