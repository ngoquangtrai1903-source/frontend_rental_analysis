'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { hasPredictionSession } from '@/lib/predictionAccess'

export function usePredictionSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const rejectedToken = useRef<string | null>(null)
  const currentToken = useRef<string | null>(null)

  const lock = useCallback(() => {
    rejectedToken.current = currentToken.current
    setSession(null)
    setChecking(false)
  }, [])

  useEffect(() => {
    let mounted = true
    let revision = 0
    let expiryTimer: ReturnType<typeof setTimeout> | undefined

    const applySession = (next: Session | null) => {
      if (!mounted) return
      clearTimeout(expiryTimer)
      currentToken.current = next?.access_token ?? null
      const allowed = hasPredictionSession(next) && next.access_token !== rejectedToken.current
      setSession(allowed ? next : null)
      setChecking(false)
      if (allowed) {
        expiryTimer = setTimeout(() => {
          // Fail closed if automatic refresh cannot renew the session in time.
          setSession(null)
          void checkSession()
        }, Math.min(next.expires_at! * 1000 - Date.now(), 2_147_483_647))
      }
    }

    const checkSession = async () => {
      const requestRevision = ++revision
      try {
        const { data, error } = await supabase.auth.getSession()
        if (requestRevision === revision) applySession(error ? null : data.session)
      } catch {
        if (requestRevision === revision) applySession(null)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      revision++
      // Keep this callback synchronous: Supabase auth methods acquire a shared lock.
      applySession(next)
    })
    void checkSession()
    const onVisible = () => { if (document.visibilityState === 'visible') void checkSession() }
    window.addEventListener('focus', checkSession)
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(checkSession, 60_000)
    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(expiryTimer)
      clearInterval(timer)
      window.removeEventListener('focus', checkSession)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return { session, checking, lock }
}
