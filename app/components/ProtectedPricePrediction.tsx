'use client'

import { LockKeyhole, LogIn } from 'lucide-react'
import PricePredictionView from './PricePredictionView'
import { usePredictionSession } from '../hooks/usePredictionSession'
import { PREDICTION_LOGIN_MESSAGE } from '@/lib/predictionAccess'

export default function ProtectedPricePrediction({ lang, onSignIn, authLoading }: {
  lang: 'vi' | 'en'
  onSignIn: () => void
  authLoading: boolean
}) {
  const { session, checking, lock } = usePredictionSession()
  const isEn = lang === 'en'

  if (session) {
    return <PricePredictionView key={session.user.id} lang={lang} onAuthRequired={lock} />
  }

  return (
    <section className="card prediction-access-card" aria-labelledby="prediction-access-title" aria-busy={checking}>
      <div className="prediction-access-icon"><LockKeyhole size={28} aria-hidden="true" /></div>
      <h2 id="prediction-access-title">
        {isEn ? 'AI Price Prediction' : 'Dự đoán giá AI'}
      </h2>
      <p role="status">
        {checking
          ? (isEn ? 'Checking your sign-in status…' : 'Đang kiểm tra phiên đăng nhập…')
          : (isEn ? 'Please sign in to use price prediction' : PREDICTION_LOGIN_MESSAGE)}
      </p>
      {!checking && (
        <>
          <button type="button" className="btn-predict prediction-signin" onClick={onSignIn} disabled={authLoading}>
            <LogIn size={18} aria-hidden="true" />
            {authLoading
              ? (isEn ? 'Opening Google…' : 'Đang mở Google…')
              : (isEn ? 'Sign in with Google' : 'Đăng nhập bằng Google')}
          </button>
          <p className="prediction-access-hint">
            {isEn
              ? 'You can still explore the overview, maps and amenities without signing in.'
              : 'Bạn vẫn có thể xem tổng quan, bản đồ và tiện ích mà không cần đăng nhập.'}
          </p>
        </>
      )}
    </section>
  )
}
