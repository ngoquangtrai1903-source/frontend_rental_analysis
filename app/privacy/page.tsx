'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Scale,
  Cpu,
  FileText,
  Mail,
  ArrowLeft,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export default function PrivacyPage() {
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const isEn = lang === 'en'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f7f9fc)', color: 'var(--ink, #17233d)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--blue, #3078f0)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={16} />
            <span>{isEn ? 'Back to Dashboard' : 'Quay lại Dashboard'}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              style={{
                background: '#fff',
                border: '1px solid var(--line, #e8edf5)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>
            <button
              onClick={() => window.print()}
              style={{
                background: '#fff',
                border: '1px solid var(--line, #e8edf5)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              <span>{isEn ? 'Print' : 'In / Lưu PDF'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line, #e8edf5)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(23, 35, 61, 0.04)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                RentIQ Da Nang Market Intelligence · Legal Framework 2026
              </div>
              <h1 style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800, fontFamily: "'Manrope', sans-serif" }}>
                {isEn ? 'Privacy Policy & Data Protection Statement' : 'Chính sách Bảo vệ Dữ liệu Cá nhân & Điều khoản Nền tảng'}
              </h1>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--muted, #8490a8)', lineHeight: 1.6 }}>
            {isEn
              ? 'Effective as of November 2, 2026. This comprehensive privacy statement governs all interactions with RentIQ, including Google OAuth authentication, analytics queries, and AI features.'
              : 'Hiệu lực áp dụng: Cập nhật ngày 02/11/2026. Văn bản này quy định chi tiết về việc thu thập, xử lý và bảo vệ dữ liệu cá nhân của người dùng trên nền tảng RentIQ khi sử dụng tính năng Đăng nhập bằng Google OAuth và các dịch vụ phân tích dữ liệu bất động sản.'}
          </p>
        </div>

        {/* Legal citations */}
        <div
          style={{
            background: 'var(--surface-subtle, #f8fafc)',
            border: '1px solid var(--line, #e8edf5)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            fontSize: '12px',
            lineHeight: 1.6
          }}
        >
          <strong style={{ color: '#2563eb', display: 'block', marginBottom: '6px' }}>
            {isEn ? 'Governing Vietnamese Legislation (2026 Baseline):' : 'Căn cứ Pháp lý Áp dụng tại Việt Nam (Cập nhật 02/11/2026):'}
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted, #475569)' }}>
            <li><strong>Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15</strong> và Nghị định số 356/2025/NĐ-CP quy định chi tiết thi hành Luật BVDLCN.</li>
            <li><strong>Luật Thương mại điện tử số 122/2025/QH15</strong> và Nghị định số 248/2026/NĐ-CP về bảo vệ thông tin người dùng trên nền tảng số.</li>
            <li><strong>Luật An ninh mạng số 116/2025/QH15</strong> và Nghị định số 333/2026/NĐ-CP về an toàn thông tin mạng và ứng phó sự cố an ninh dữ liệu.</li>
            <li><strong>Luật Quảng cáo (sửa đổi) số 75/2025/QH15</strong> và Nghị định số 342/2025/NĐ-CP về tiếp thị kỹ thuật số và bảo vệ quyền riêng tư người dùng.</li>
            <li><strong>Luật Trí tuệ nhân tạo số 134/2025/QH15</strong> và Nghị định số 142/2026/NĐ-CP về minh bạch mô hình AI và trách nhiệm hệ thống AI.</li>
          </ul>
        </div>

        {/* Main Content Articles */}
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line, #e8edf5)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(23, 35, 61, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            fontSize: '13px',
            lineHeight: 1.7
          }}
        >
          {/* Article 1 */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              <span>{isEn ? 'Article 1. Data Collection via Google OAuth & Informed Consent' : 'Điều 1. Thu thập Dữ liệu qua Google OAuth & Đồng thuận Tự nguyện'}</span>
            </h2>
            <p style={{ margin: '0 0 10px' }}>
              {isEn
                ? 'RentIQ implements voluntary, prior opt-in consent before triggering Google OAuth. When you authenticate using Google, RentIQ receives:'
                : 'Để tuân thủ nguyên tắc đồng thuận rõ ràng theo Điều 9 Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15, RentIQ chỉ kích hoạt quy trình đăng nhập Google OAuth khi người dùng chủ động tích chọn xác nhận đồng thuận tại bảng thông báo. Danh mục dữ liệu cá nhân tiếp nhận từ Google bao gồm:'}
            </p>
            <ul style={{ margin: '0 0 10px', paddingLeft: '22px' }}>
              <li><strong>Họ và Tên (Full Name):</strong> Hiển thị chào mừng và định danh tài khoản người dùng trên giao diện.</li>
              <li><strong>Địa chỉ Email (Google Email):</strong> Định danh duy nhất tài khoản, tiếp nhận xác thực phiên và nhận thông báo bảo mật.</li>
              <li><strong>Ảnh đại diện (Avatar URL):</strong> Hiển thị avatar người dùng tại góc điều hướng dashboard.</li>
              <li><strong>Mã định danh số (Google OAuth Subject ID):</strong> Khóa đối chiếu an toàn liên kết với hệ thống Supabase Auth.</li>
            </ul>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', color: '#166534', fontSize: '12px' }}>
              ✔ <strong>Cam kết An toàn:</strong> RentIQ KHÔNG BAO GIỜ yêu cầu, truy cập hay lưu trữ mật khẩu tài khoản Google cá nhân của người dùng. Mọi tương tác định danh được bảo mật bằng chuẩn OAuth 2.0 / OpenID Connect.
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={18} />
              <span>{isEn ? 'Article 2. Purpose of Processing & Non-Commercialization Guarantee' : 'Điều 2. Mục đích Xử lý & Cam kết Không Bán Dữ liệu'}</span>
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              Dữ liệu cá nhân chỉ được sử dụng nhằm mục đích: (i) Duy trì phiên đăng nhập và bảo mật tài khoản; (ii) Cá nhân hóa cấu hình bộ lọc và ghi nhớ tùy chọn phân tích bất động sản; (iii) Thực hiện nghĩa vụ báo cáo kỹ thuật và kiểm tra an ninh mạng theo yêu cầu cơ quan có thẩm quyền.
            </p>
            <p style={{ margin: 0, fontWeight: 600, color: '#1e40af' }}>
              RentIQ cam kết tuyệt đối: Không thương mại hóa, không bán, không cho thuê và không chia sẻ danh sách thông tin người dùng cho bất kỳ bên thứ ba nào vì mục đích tiếp thị hoặc quảng cáo mục tiêu (Tuân thủ Luật Quảng cáo 75/2025 & Nghị định 342/2025/NĐ-CP).
            </p>
          </section>

          {/* Article 3 */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} />
              <span>{isEn ? 'Article 3. AI Transparency & Model Training Restrictions (Law 134/2025)' : 'Điều 3. Minh bạch Trí tuệ Nhân tạo & Cam kết Không Train AI (Luật 134/2025)'}</span>
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              RentIQ ứng dụng các giải pháp Trí tuệ Nhân tạo (Machine Learning & Large Language Models) hỗ trợ dự đoán giá thuê phòng và giải thích các biểu đồ thị trường Đà Nẵng. Tuân thủ Luật Trí tuệ nhân tạo số 134/2025/QH15 và Nghị định 142/2026/NĐ-CP:
            </p>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--line, #e8edf5)', borderRadius: '8px', padding: '10px 14px' }}>
                <strong>• Dữ liệu cá nhân không dùng để huấn luyện mô hình:</strong> Tên và email người dùng không bao giờ được đưa vào tập dữ liệu huấn luyện hoặc gửi tới các mô hình AI công cộng.
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid var(--line, #e8edf5)', borderRadius: '8px', padding: '10px 14px' }}>
                <strong>• Miễn trừ trách nhiệm kết quả AI:</strong> Mọi ước tính giá và phân tích từ AI chỉ mang tính chất tham khảo số liệu, không thay thế chứng thư thẩm định giá độc lập hay lời khuyên đầu tư tài chính.
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} />
              <span>{isEn ? 'Article 4. Rights of Data Subjects & Right to Erasure' : 'Điều 4. Quyền của Chủ thể Dữ liệu & Quyền Yêu cầu Xóa Bỏ (Right to Erasure)'}</span>
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              Căn cứ Chương II Luật Bảo vệ Dữ liệu Cá nhân số 91/2025/QH15, người dùng sở hữu các quyền sau đây:
            </p>
            <ul style={{ margin: '0 0 8px', paddingLeft: '22px' }}>
              <li><strong>Quyền được biết & Quyền đồng ý:</strong> Được thông báo minh bạch trước khi dữ liệu được thu thập.</li>
              <li><strong>Quyền truy cập & Xem dữ liệu:</strong> Xem toàn bộ dữ liệu cá nhân đang lưu trữ bất kỳ lúc nào trong mục Cài đặt.</li>
              <li><strong>Quyền rút lại sự đồng ý:</strong> Có thể thu hồi quyền xử lý dữ liệu ngay tại giao diện người dùng.</li>
              <li><strong>Quyền yêu cầu xóa vĩnh viễn dữ liệu (Right to be Forgotten):</strong> Người dùng có thể yêu cầu xóa toàn bộ thông tin tài khoản và nhật ký định danh trên RentIQ bằng cách bấm nút "Rút lại đồng thuận & Xóa dữ liệu" trong Cài đặt hoặc gửi email tới DPO.</li>
            </ul>
          </section>

          {/* Article 5 */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} />
              <span>{isEn ? 'Article 5. Data Protection Officer (DPO) Contact' : 'Điều 5. Thông tin Liên hệ Bộ phận Phụ trách Bảo vệ Dữ liệu (DPO)'}</span>
            </h2>
            <p style={{ margin: '0 0 8px' }}>
              Mọi thắc mắc, yêu cầu thực thi quyền dữ liệu cá nhân, hoặc phản ánh về bảo mật an ninh mạng xin vui lòng gửi về:
            </p>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', color: '#1e40af' }}>
              <div><strong>Đơn vị kiểm soát dữ liệu:</strong> Ban Quản trị Dự án RentIQ Da Nang Market Intelligence</div>
              <div><strong>Địa chỉ:</strong> Khu Công nghệ Cao, TP. Đà Nẵng, Việt Nam</div>
              <div><strong>Thư điện tử DPO:</strong> <a href="mailto:privacy@rentiq.vn" style={{ color: '#2563eb', fontWeight: 700 }}>privacy@rentiq.vn</a></div>
              <div><strong>Thời hạn phản hồi cam kết:</strong> Tối đa 72 giờ làm việc kể từ thời điểm tiếp nhận văn bản yêu cầu.</div>
            </div>
          </section>
        </div>

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={16} />
            <span>{isEn ? 'Return to RentIQ Dashboard' : 'Trở về Bảng Điều Khiển RentIQ'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
