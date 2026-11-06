import type { Session, User } from '@supabase/supabase-js'

export const PREDICTION_LOGIN_MESSAGE = 'Vui lòng đăng nhập để sử dụng tính năng dự đoán giá'

export function isGoogleUser(user: Pick<User, 'app_metadata' | 'is_anonymous'> | null | undefined): boolean {
  return Boolean(user && !user.is_anonymous && user.app_metadata?.provider === 'google')
}

export function hasPredictionSession(session: Session | null | undefined): session is Session {
  return Boolean(
    session?.access_token && session.expires_at &&
    session.expires_at * 1000 > Date.now() && isGoogleUser(session.user)
  )
}
