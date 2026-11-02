'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react'

export interface OAuthConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onOpenPrivacyPolicy: () => void
  isLoading?: boolean
  lang?: 'vi' | 'en'
}

export const OAUTH_CONSENT_STORAGE_KEY = 'rentiq.oauth.consent.v1'

export interface ConsentRecord {
  status: 'consented'
  consentedAt: string
  version: string
  legalFramework: string[]
}

export function saveOAuthConsent(): void {
  try {
    const record: ConsentRecord = {
      status: 'consented',
      consentedAt: new Date().toISOString(),
      version: '2026-11-02',
      legalFramework: [
        'Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15 & NĐ 356/2025/NĐ-CP',
        'Luật Thương mại điện tử số 122/2025/QH15 & NĐ 248/2026/NĐ-CP',
        'Luật An ninh mạng số 116/2025/QH15 & NĐ 333/2026/NĐ-CP',
        'Luật Quảng cáo (sửa đổi) số 75/2025/QH15 & NĐ 342/2025/NĐ-CP',
        'Luật Trí tuệ nhân tạo số 134/2025/QH15 & NĐ 142/2026/NĐ-CP'
      ]
    }
    localStorage.setItem(OAUTH_CONSENT_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // LocalStorage might be restricted
  }
}

export function getStoredOAuthConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(OAUTH_CONSENT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentRecord
  } catch {
    return null
  }
}

export function clearOAuthConsent(): void {
  try {
    localStorage.removeItem(OAUTH_CONSENT_STORAGE_KEY)
  } catch {
    // Ignore
  }
}

export default function OAuthConsentModal({
  isOpen,
  onClose,
  onConfirm,
  onOpenPrivacyPolicy,
  isLoading = false,
  lang = 'vi'
}: OAuthConsentModalProps) {
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedDataUsage, setAgreedDataUsage] = useState(false)
  const [showError, setShowError] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!agreedTerms || !agreedDataUsage) {
      setShowError(true)
      return
    }
    saveOAuthConsent()
    onConfirm()
  }

  const isEn = lang === 'en'

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="oauth-consent-title"
    >
      <div
        className="quick-modal oauth-consent-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, calc(100vw - 32px))',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e0ecff 0%, #dbeafe 100%)',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '2px'
                }}
              >
                <span>{isEn ? 'Personal Data Protection' : 'Bảo vệ Dữ liệu Cá nhân'}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span style={{ color: '#059669' }}>{isEn ? 'VN Legal Standards 2026' : 'Luật BVDLCN 91/2025'}</span>
              </div>
              <h3
                id="oauth-consent-title"
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: "'Manrope', sans-serif",
                  color: 'var(--ink)'
                }}
              >
                {isEn ? 'Consent to Personal Data Collection' : 'Đồng thuận Thu thập & Xử lý Dữ liệu'}
              </h3>
            </div>
          </div>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Đóng'}
            title={isEn ? 'Close' : 'Đóng'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Intro */}
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 16px 0' }}>
          {isEn
            ? 'In compliance with Vietnam Personal Data Protection Law No. 91/2025/QH15, Cybersecurity Law No. 116/2025/QH15, and related 2026 decrees, please confirm your voluntary consent before authenticating with Google OAuth:'
            : 'Tuân thủ Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15, Nghị định 356/2025/NĐ-CP và Luật An ninh mạng 116/2025/QH15, RentIQ xin thông báo và chỉ tiến hành thu thập thông tin khi nhận được sự đồng thuận chủ động từ bạn:'}
        </p>

        {/* Data Fields Collected Box */}
        <div
          style={{
            background: 'var(--surface-subtle, #f8fafc)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--muted)',
              letterSpacing: '0.05em',
              marginBottom: '10px'
            }}
          >
            {isEn ? 'Data Requested from Google Account' : 'Dữ liệu sẽ tiếp nhận từ Google OAuth'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Mail size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--ink)' }}>
                  {isEn ? 'Email Address' : 'Địa chỉ Email'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3, display: 'block' }}>
                  {isEn ? 'Account identification & security alerts' : 'Xác thực tài khoản & thông báo bảo mật'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <User size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--ink)' }}>
                  {isEn ? 'Display Name' : 'Họ và Tên hiển thị'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3, display: 'block' }}>
                  {isEn ? 'Workspace greeting & display' : 'Hiển thị lời chào & không gian làm việc'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ImageIcon size={16} style={{ color: '#8b5cf6', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--ink)' }}>
                  {isEn ? 'Profile Photo' : 'Ảnh đại diện (Avatar)'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3, display: 'block' }}>
                  {isEn ? 'User avatar in topbar navigation' : 'Biểu tượng người dùng góc điều hướng'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Lock size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: 'var(--ink)' }}>
                  {isEn ? 'Google Subject ID' : 'Mã định danh OAuth'}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.3, display: 'block' }}>
                  {isEn ? 'Encrypted session tokens in Supabase' : 'Khóa phiên mã hóa, không lưu mật khẩu'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Commitments */}
        <div
          style={{
            background: 'var(--surface-subtle, #f0fdf4)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '18px',
            fontSize: '12px',
            lineHeight: 1.55,
            color: '#166534'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
            <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
            <span>{isEn ? 'RentIQ Privacy Commitments (2026 Standards):' : 'Cam kết bảo vệ dữ liệu từ RentIQ (Chuẩn 2026):'}</span>
          </div>
          <ul style={{ margin: '0', paddingLeft: '20px', display: 'grid', gap: '4px' }}>
            <li>
              <strong>{isEn ? 'No commercial resale:' : 'Không thương mại hóa:'}</strong>{' '}
              {isEn
                ? 'Your personal data is never sold or used for behavioral ad tracking (Law 75/2025).'
                : 'Dữ liệu cá nhân tuyệt đối không bị bán hay dùng cho quảng cáo bám đuổi (Luật 75/2025).'}
            </li>
            <li>
              <strong>{isEn ? 'AI Transparency:' : 'Minh bạch AI (Luật 134/2025):'}</strong>{' '}
              {isEn
                ? 'Your identity is never used to train third-party AI models. AI price forecasts are advisory only.'
                : 'Thông tin cá nhân không dùng để huấn luyện AI. Kết quả định giá AI mang tính tham khảo.'}
            </li>
            <li>
              <strong>{isEn ? 'Right to Revoke & Erasure:' : 'Quyền rút lại & xóa dữ liệu:'}</strong>{' '}
              {isEn
                ? 'You can revoke consent and permanently erase your data at any time under Settings.'
                : 'Bạn có quyền rút lại đồng thuận và xóa dữ liệu bất kỳ lúc nào tại mục Cài đặt (Luật 91/2025).'}
            </li>
          </ul>
        </div>

        {/* Explicit Consent Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              lineHeight: 1.5,
              cursor: 'pointer',
              color: 'var(--ink)'
            }}
          >
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => {
                setAgreedTerms(e.target.checked)
                if (e.target.checked && agreedDataUsage) setShowError(false)
              }}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--blue)', cursor: 'pointer' }}
            />
            <span>
              {isEn ? (
                <>
                  I have read, understood, and agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onOpenPrivacyPolicy()
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blue)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                      fontWeight: 600
                    }}
                  >
                    Privacy Policy
                  </button>{' '}
                  and Terms of Service of RentIQ.
                </>
              ) : (
                <>
                  Tôi xác nhận đã đọc, hiểu rõ và đồng ý với{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onOpenPrivacyPolicy()
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blue)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                      fontWeight: 600
                    }}
                  >
                    Chính sách Bảo vệ Dữ liệu Cá nhân
                  </button>{' '}
                  và Quy chế nền tảng của RentIQ.
                </>
              )}
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              lineHeight: 1.5,
              cursor: 'pointer',
              color: 'var(--ink)'
            }}
          >
            <input
              type="checkbox"
              checked={agreedDataUsage}
              onChange={(e) => {
                setAgreedDataUsage(e.target.checked)
                if (e.target.checked && agreedTerms) setShowError(false)
              }}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--blue)', cursor: 'pointer' }}
            />
            <span>
              {isEn ? (
                'I explicitly consent to RentIQ and Supabase processing my email, full name, and avatar solely for authentication and workspace session management.'
              ) : (
                'Tôi tự nguyện đồng thuận cho RentIQ & Supabase tiếp nhận và xử lý email, họ tên và ảnh đại diện phục vụ mục đích định danh đăng nhập và duy trì phiên làm việc.'
              )}
            </span>
          </label>
        </div>

        {/* Validation Alert */}
        {showError && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '12px',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>
              {isEn
                ? 'Please check both consent boxes to proceed under Vietnam Personal Data Protection Law.'
                : 'Theo Luật BVDLCN 91/2025, vui lòng chọn đầy đủ 2 ô đồng thuận để tiếp tục đăng nhập.'}
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderTop: '1px solid var(--line)',
            paddingTop: '16px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="button secondary"
            style={{ padding: '9px 16px', fontSize: '13px' }}
          >
            {isEn ? 'Cancel' : 'Hủy bỏ'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="button primary"
            style={{
              padding: '9px 20px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#2563eb',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <>
                <span className="pulse-spinner" style={{ width: '14px', height: '14px' }} />
                <span>{isEn ? 'Connecting to Google...' : 'Đang chuyển tới Google...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>{isEn ? 'Agree & Sign in with Google' : 'Đồng ý & Đăng nhập Google'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
