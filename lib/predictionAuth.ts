import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from './supabaseConfig'
import { isGoogleUser, PREDICTION_LOGIN_MESSAGE } from './predictionAccess'

function denied(status = 401, code = 'AUTH_REQUIRED', error = PREDICTION_LOGIN_MESSAGE) {
  return Response.json({ success: false, code, error }, {
    status,
    headers: { 'Cache-Control': 'private, no-store' }
  })
}

export async function authorizePrediction(req: Request): Promise<Response | null> {
  const token = /^Bearer\s+(\S+)$/i.exec(req.headers.get('authorization') || '')?.[1]
  if (!token) return denied()

  // A separate, stateless client prevents sharing a user's session between requests.
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  })
  try {
    const { data, error } = await authClient.auth.getUser(token)
    if (error) {
      if (!error.status || error.status >= 500) {
        return denied(503, 'AUTH_UNAVAILABLE', 'Không thể kiểm tra đăng nhập. Vui lòng thử lại.')
      }
      return denied()
    }
    if (!data.user) return denied()
    if (!isGoogleUser(data.user)) return denied(403, 'GOOGLE_AUTH_REQUIRED')
    return null
  } catch {
    return denied(503, 'AUTH_UNAVAILABLE', 'Không thể kiểm tra đăng nhập. Vui lòng thử lại.')
  }
}
