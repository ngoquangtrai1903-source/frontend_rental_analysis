'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Scale,
  Mail,
  X,
  ExternalLink,
  ChevronRight,
  Printer,
  CheckCircle2,
  Cpu,
  ArrowLeft
} from 'lucide-react'

export interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  lang?: 'vi' | 'en'
  openedFromConsent?: boolean
  onBackToConsent?: () => void
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
  lang = 'vi',
  openedFromConsent = false,
  onBackToConsent
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'ai'>('privacy')

  if (!isOpen) return null

  const isEn = lang === 'en'

  const handleReturn = () => {
    if (onBackToConsent) {
      onBackToConsent()
    } else {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleReturn}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-modal-title"
    >
      <div
        className="quick-modal privacy-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(780px, calc(100vw - 32px))',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          maxHeight: 'calc(100dvh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <span>RentIQ Legal & Privacy</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span style={{ color: '#059669' }}>Cập nhật 02/11/2026</span>
              </div>
              <h3
                id="privacy-policy-modal-title"
                style={{
                  margin: '2px 0 0',
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: "'Manrope', sans-serif",
                  color: 'var(--ink)'
                }}
              >
                {isEn ? 'Privacy Policy & Terms of Service' : 'Chính sách Bảo mật & Điều khoản Sử dụng'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="icon-button"
              title={isEn ? 'Print or save PDF' : 'In hoặc lưu PDF'}
              style={{ width: '32px', height: '32px', borderRadius: '8px' }}
            >
              <Printer size={16} />
            </button>
            <button
              className="modal-close-button"
              onClick={handleReturn}
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
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 0',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'privacy' ? '#2563eb' : 'var(--surface-subtle, #f1f5f9)',
              color: activeTab === 'privacy' ? '#fff' : 'var(--muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={14} />
            <span>{isEn ? 'Privacy Policy (Law 91/2025)' : 'Chính sách Bảo mật (Luật 91/2025)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'ai' ? '#2563eb' : 'var(--surface-subtle, #f1f5f9)',
              color: activeTab === 'ai' ? '#fff' : 'var(--muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Cpu size={14} />
            <span>{isEn ? 'AI Disclosures (Law 134/2025)' : 'Minh bạch AI (Luật 134/2025)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'terms' ? '#2563eb' : 'var(--surface-subtle, #f1f5f9)',
              color: activeTab === 'terms' ? '#fff' : 'var(--muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} />
            <span>{isEn ? 'Terms & Cybersecurity' : 'Điều khoản & An ninh mạng'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 4px 16px 0',
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'var(--ink)'
          }}
        >
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--surface-subtle, #f8fafc)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '12px',
                  color: 'var(--muted)'
                }}
              >
                <strong>{isEn ? 'Legal References (Updated 02/11/2026):' : 'Căn cứ Pháp lý (Cập nhật 02/11/2026):'}</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  <li>Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15 & Nghị định số 356/2025/NĐ-CP.</li>
                  <li>Luật Giao dịch Điện tử & Thương mại điện tử số 122/2025/QH15 & Nghị định 248/2026/NĐ-CP.</li>
                  <li>Luật An ninh mạng số 116/2025/QH15 & Nghị định 333/2026/NĐ-CP.</li>
                  <li>Luật Quảng cáo (sửa đổi) số 75/2025/QH15 & Nghị định 342/2025/NĐ-CP.</li>
                  <li>Luật Trí tuệ nhân tạo số 134/2025/QH15 & Nghị định 142/2026/NĐ-CP.</li>
                </ul>
              </div>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '1. Collection of Personal Data via Google OAuth' : '1. Thu thập Dữ liệu Cá nhân qua Google OAuth'}
                </h4>
                <p style={{ margin: '0 0 8px' }}>
                  {isEn
                    ? 'When you log in to RentIQ using Google OAuth, with your explicit prior consent, our platform receives and processes the following minimum personal data points:'
                    : 'Khi bạn chọn đăng nhập bằng tài khoản Google (Google OAuth) và thực hiện xác nhận đồng thuận (Opt-in consent), RentIQ thu thập và xử lý các thông tin cá nhân tối thiểu sau đây:'}
                </p>
                <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
                  <li>
                    <strong>{isEn ? 'Full Name:' : 'Họ và Tên (Display Name):'}</strong>{' '}
                    {isEn ? 'Used for user greeting and account personalization.' : 'Dùng để hiển thị lời chào và cá nhân hóa không gian làm việc.'}
                  </li>
                  <li>
                    <strong>{isEn ? 'Email Address:' : 'Địa chỉ Email:'}</strong>{' '}
                    {isEn
                      ? 'Used as unique identifier, authentication session key, and critical security notices.'
                      : 'Định danh tài khoản người dùng, duy trì phiên đăng nhập và gửi cảnh báo an toàn bảo mật.'}
                  </li>
                  <li>
                    <strong>{isEn ? 'Avatar URL:' : 'Ảnh đại diện (Avatar URL):'}</strong>{' '}
                    {isEn ? 'Used to display user profile picture in top navigation.' : 'Hiển thị hình đại diện trên thanh menu tài khoản người dùng.'}
                  </li>
                  <li>
                    <strong>{isEn ? 'OAuth Subject ID:' : 'Mã định danh duy nhất (Google Subject ID):'}</strong>{' '}
                    {isEn
                      ? 'Used to link sessions securely in Supabase Auth. RentIQ NEVER accesses or stores your Google password.'
                      : 'Khóa đối chiếu định danh an toàn qua Supabase Auth. RentIQ KHÔNG BAO GIỜ yêu cầu hay lưu trữ mật khẩu Google của bạn.'}
                  </li>
                </ul>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '2. Purpose of Data Processing & Non-Sale Guarantee' : '2. Mục đích Xử lý Dữ liệu & Cam kết Không Thương mại hóa'}
                </h4>
                <p style={{ margin: '0 0 8px' }}>
                  {isEn
                    ? 'Your personal data is collected solely for service provision, personalized dashboard analytics, and platform security. RentIQ commits:'
                    : 'Dữ liệu cá nhân chỉ được sử dụng cho mục đích vận hành kỹ thuật, cá nhân hóa trải nghiệm phân tích bất động sản và kiểm soát an ninh. RentIQ cam kết:'}
                </p>
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#166534',
                    fontSize: '12px',
                    lineHeight: 1.5
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {isEn ? 'Strict No-Commercialization Rule (Law 91/2025 & Law 75/2025):' : 'Nguyên tắc bảo vệ tuyệt đối (Luật 91/2025 & Luật 75/2025):'}
                  </strong>
                  {isEn
                    ? 'RentIQ does NOT sell, rent, lease, or share personal data with advertisers or data brokers. No cross-site profiling or behavioral retargeting is executed on your profile.'
                    : 'RentIQ KHÔNG bán, cho thuê, trao đổi hoặc cung cấp dữ liệu cá nhân cho các bên thứ ba chạy quảng cáo bám đuổi (behavioral retargeting) hoặc các công ty môi giới dữ liệu.'}
                </div>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '3. Data Subject Rights (Vietnam Law No. 91/2025)' : '3. Quyền của Chủ thể Dữ liệu theo Luật BVDLCN 91/2025'}
                </h4>
                <p style={{ margin: '0 0 8px' }}>
                  {isEn
                    ? 'As a data subject under Vietnamese legislation, you possess fully enforceable legal rights:'
                    : 'Bạn có đầy đủ các quyền hợp pháp được pháp luật Việt Nam bảo hộ:'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#2563eb' }}>{isEn ? '• Right to Know & Consent:' : '• Quyền được biết & Đồng thuận:'}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Right to be informed before any data processing starts.' : 'Được thông báo đầy đủ trước khi thu thập dữ liệu.'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#2563eb' }}>{isEn ? '• Right to Withdraw Consent:' : '• Quyền rút lại Đồng thuận:'}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Revoke permissions at any time via Settings modal.' : 'Rút lại sự đồng ý bất cứ lúc nào trong mục Cài đặt.'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#2563eb' }}>{isEn ? '• Right to Erasure (Forgotten):' : '• Quyền yêu cầu Xóa dữ liệu:'}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Request complete deletion of stored credentials & logs.' : 'Yêu cầu xóa vĩnh viễn tài khoản và thông tin đã thu thập.'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '12px', color: '#2563eb' }}>{isEn ? '• Right to Complaint:' : '• Quyền Khiếu nại:'}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Lodge grievances with Data Protection Authority (A05).' : 'Khiếu nại đến Cục An ninh mạng và Phòng chống tội phạm CNC.'}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '4. Third-Party Data Processors & Infrastructure' : '4. Các Bên Xử lý Dữ liệu Thứ ba & Hạ tầng Lưu trữ'}
                </h4>
                <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
                  <li>
                    <strong>Google LLC (Google Identity Services):</strong> Cung cấp giao thức xác thực OAuth 2.0 an toàn.
                  </li>
                  <li>
                    <strong>Supabase Inc. (Database & Auth Cloud):</strong> Hạ tầng Data Warehouse tầng Gold và dịch vụ lưu trữ phiên làm việc, đạt chứng nhận bảo mật SOC 2 Type II và ISO/IEC 27001.
                  </li>
                </ul>
              </section>

              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Mail size={18} />
                <div>
                  <strong>RentIQ Data Protection Office (DPO):</strong>{' '}
                  <a href="mailto:privacy@rentiq.vn" style={{ color: '#2563eb', fontWeight: 700 }}>
                    privacy@rentiq.vn
                  </a>{' '}
                  · {isEn ? 'Response within 72 business hours.' : 'Tiếp nhận & xử lý trong 72 giờ làm việc.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                  border: '1px solid #c7d2fe',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '12px',
                  color: '#3730a3'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                  <Sparkles size={16} style={{ color: '#6366f1' }} />
                  <span>
                    {isEn
                      ? 'AI Transparency Framework — Vietnam Law on Artificial Intelligence No. 134/2025/QH15 & Decree 142/2026/NĐ-CP'
                      : 'Khung Minh bạch Trí tuệ Nhân tạo — Luật Trí tuệ Nhân tạo số 134/2025/QH15 & Nghị định 142/2026/NĐ-CP'}
                  </span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.55 }}>
                  {isEn
                    ? 'RentIQ implements transparent disclosures regarding AI features deployed on the platform (AI Price Prediction & Chart AI Explainer).'
                    : 'RentIQ công bố minh bạch nguyên tắc vận hành của các phân hệ Trí tuệ Nhân tạo được tích hợp trên nền tảng (Dự đoán giá thuê AI và Trợ lý AI Giải thích biểu đồ).'}
                </p>
              </div>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '1. Scope of AI Usage in RentIQ' : '1. Phạm vi Ứng dụng AI trên RentIQ'}
                </h4>
                <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
                  <li>
                    <strong>{isEn ? 'AI Rental Price Prediction:' : 'Dự đoán giá thuê AI (Predictive ML):'}</strong>{' '}
                    {isEn
                      ? 'Employs supervised regression models trained on aggregated real estate listing attributes (area, ward, amenities).'
                      : 'Sử dụng mô hình học máy (Machine Learning) dựa trên các đặc trưng tin đăng đã làm sạch (diện tích, khu vực, tiện ích, rủi ro ngập).'}
                  </li>
                  <li>
                    <strong>{isEn ? 'Chart AI Explainer:' : 'Trợ lý AI Phân tích Biểu đồ (LLM Explainer):'}</strong>{' '}
                    {isEn
                      ? 'Translates statistical data from market charts into actionable narrative summaries.'
                      : 'Sử dụng mô hình ngôn ngữ lớn (LLM) để diễn giải số liệu thống kê từ biểu đồ thành các bản tóm tắt nhận định thị trường.'}
                  </li>
                </ul>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '2. Strict Protection Against Model Retraining' : '2. Cam kết Bảo vệ Dữ liệu Người dùng đối với Mô hình AI'}
                </h4>
                <div
                  style={{
                    background: 'var(--surface-subtle, #f8fafc)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '12px',
                    lineHeight: 1.55
                  }}
                >
                  <p style={{ margin: '0 0 6px' }}>
                    ✅ <strong>{isEn ? 'No Personal Data in AI Prompts:' : 'Không truyền dữ liệu cá nhân vào Prompt:'}</strong>{' '}
                    {isEn
                      ? 'Your email, Google identity, and user profile are NEVER forwarded to LLM inference APIs (OpenRouter, Google Gemini, OpenAI).'
                      : 'Địa chỉ email, danh tính Google và thông tin cá nhân của người dùng TUYỆT ĐỐI KHÔNG được gửi kèm trong prompt truy vấn AI.'}
                  </p>
                  <p style={{ margin: 0 }}>
                    ✅ <strong>{isEn ? 'Zero Training Retention:' : 'Không sử dụng để tái huấn luyện AI:'}</strong>{' '}
                    {isEn
                      ? 'Prompt payloads are transmitted under non-retention agreements where API providers are strictly barred from using prompt tokens for model training.'
                      : 'Các truy vấn phân tích chỉ mang ngữ cảnh dữ liệu bất động sản tổng hợp và tuân thủ điều khoản không lưu trữ để huấn luyện mô hình của nhà cung cấp API.'}
                  </p>
                </div>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#dc2626' }}>
                  {isEn ? '3. Legal Disclaimer for AI Outputs' : '3. Cảnh báo & Miễn trừ Trách nhiệm Pháp lý về Kết quả AI'}
                </h4>
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: '#991b1b',
                    fontSize: '12px',
                    lineHeight: 1.55
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                    <AlertTriangle size={15} />
                    <span>{isEn ? 'Advisory Notice:' : 'Thông báo Khuyến nghị Pháp lý:'}</span>
                  </div>
                  {isEn
                    ? 'Outputs generated by AI systems on RentIQ are purely statistical and educational estimations. They DO NOT constitute certified appraisals, legal financial advice, or binding transaction commitments. Users must conduct independent in-person due diligence prior to executing leases or financial contracts.'
                    : 'Mọi ước tính giá thuê, điểm tiềm năng hoặc nhận định từ AI chỉ mang tính chất tham khảo phân tích thị trường. Các kết quả này KHÔNG cấu thành chứng thư thẩm định giá độc lập, không phải khuyến nghị đầu tư tài chính và không có giá trị ràng buộc pháp lý trong các giao dịch ký kết hợp đồng thuê nhà thực tế.'}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'terms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '1. Platform Terms of Use (Law 122/2025/QH15)' : '1. Quy chế Hoạt động & Điều khoản Nền tảng (Luật 122/2025)'}
                </h4>
                <p style={{ margin: '0 0 8px' }}>
                  {isEn
                    ? 'RentIQ Da Nang Market Intelligence provides real estate aggregation and visual analytics tools. Users agree to access the dashboard lawfully and avoid scraping, automated denial of service, or unauthorized extraction.'
                    : 'RentIQ là nền tảng cung cấp thông tin và phân tích dữ liệu thị trường cho thuê bất động sản tại TP. Đà Nẵng. Người dùng cam kết sử dụng dịch vụ đúng quy định pháp luật, không thực hiện hành vi can thiệp trái phép, tấn công từ chối dịch vụ hoặc sao chép tự động dữ liệu có hệ thống.'}
                </p>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '2. Cybersecurity & Incident Notification (Law 116/2025 & Decree 333/2026)' : '2. An ninh mạng & Ứng phó Sự cố Dữ liệu (Luật 116/2025 & NĐ 333/2026)'}
                </h4>
                <p style={{ margin: '0 0 8px' }}>
                  {isEn
                    ? 'RentIQ strictly applies Transport Layer Security (TLS 1.3), end-to-end tokenization, and strict database Row-Level Security (RLS) on Supabase schemas.'
                    : 'Toàn bộ kết nối giữa trình duyệt và RentIQ được mã hóa bằng giao thức TLS 1.3. Hệ thống cơ sở dữ liệu tầng Gold được thiết lập chính sách Row-Level Security (RLS) nghiêm ngặt.'}
                </p>
                <div
                  style={{
                    background: 'var(--surface-subtle, #f8fafc)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px'
                  }}
                >
                  <strong>{isEn ? '72-Hour Breach Notification Standard:' : 'Quy chuẩn Thông báo Sự cố 72 giờ:'}</strong>{' '}
                  {isEn
                    ? 'In the unlikely event of a verified data breach impacting personal credentials, RentIQ will notify affected users and the National Cyber Security Center within 72 hours.'
                    : 'Trong trường hợp phát hiện sự cố an ninh mạng có nguy cơ ảnh hưởng đến dữ liệu cá nhân của người dùng, RentIQ sẽ kích hoạt quy trình ứng cứu sự cố và thông báo tới chủ thể dữ liệu cùng cơ quan chức năng trong vòng 72 giờ theo luật định.'}
                </div>
              </section>

              <section>
                <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                  {isEn ? '3. Data Protection Contact & DPO' : '3. Kênh Tiếp nhận & Bộ phận Phụ trách Dữ liệu (DPO)'}
                </h4>
                <p style={{ margin: '0 0 6px' }}>
                  {isEn
                    ? 'For any inquiry, consent withdrawal, or data erasure request, please reach out directly to our Data Protection Officer:'
                    : 'Mọi yêu cầu thực thi quyền chủ thể dữ liệu (rút lại đồng thuận, xóa tài khoản, sao lưu dữ liệu), vui lòng liên hệ Bộ phận Bảo vệ Dữ liệu Cá nhân:'}
                </p>
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Mail size={18} />
                  <div>
                    <strong>RentIQ Data Protection Office (DPO):</strong>{' '}
                    <a href="mailto:privacy@rentiq.vn" style={{ color: '#2563eb', fontWeight: 700 }}>
                      privacy@rentiq.vn
                    </a>{' '}
                    · Tiếp nhận & xử lý trong 72 giờ làm việc.
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--line)',
            paddingTop: '14px',
            flexShrink: 0,
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            © 2026 RentIQ Market Intelligence · TP. Đà Nẵng
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {openedFromConsent && (
              <button
                type="button"
                className="button secondary"
                onClick={handleReturn}
                style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={14} />
                <span>{isEn ? 'Back to Consent' : 'Quay lại màn hình đồng thuận'}</span>
              </button>
            )}
            <button
              type="button"
              className="button primary"
              onClick={handleReturn}
              style={{ padding: '8px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {openedFromConsent ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>{isEn ? 'Understood & Return to Sign-in' : 'Đã hiểu & Quay lại đăng nhập'}</span>
                </>
              ) : (
                <span>{isEn ? 'Close & Understood' : 'Đóng & Đã hiểu'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
