'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const code = params.get('code')
    if (!code) { router.replace('/'); return }
    void supabase.auth.exchangeCodeForSession(code).finally(() => router.replace('/'))
  }, [params, router])
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Đang hoàn tất đăng nhập Google...</main>
}
