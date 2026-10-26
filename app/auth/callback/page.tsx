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
    const code = params.get('code')
    if (params.has('error') || !code) {
      console.warn(
        'Google OAuth callback did not include an authorization code.',
        params.get('error'),
        params.get('error_description')
      )
      router.replace('/?auth_error=callback')
      return
    }
    void supabase.auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          console.warn('Failed to exchange Google OAuth code for a session:', error.message)
          router.replace('/?auth_error=callback')
          return
        }
        router.replace('/')
      })
      .catch((error: unknown) => {
        console.warn('Unexpected Google OAuth callback failure:', error)
        router.replace('/?auth_error=callback')
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
