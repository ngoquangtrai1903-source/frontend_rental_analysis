'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const code = params.get('code')
    if (!code) { router.replace('/'); return }
    void supabase.auth.exchangeCodeForSession(code).finally(() => router.replace('/'))
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
