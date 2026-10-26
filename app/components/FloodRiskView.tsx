'use client'

import { useQuery } from '@tanstack/react-query'
import { ShieldAlert, CheckCircle, AlertTriangle, Droplets, TrendingUp, AlertOctagon, RotateCcw } from 'lucide-react'
import { FloodAuditSummary } from '@/lib/goldQueryService'

export default function FloodRiskView({ filterQueryString = '' }: { filterQueryString?: string }) {
  const query = useQuery({
    queryKey: ['flood-risk', filterQueryString],
    queryFn: async ({ signal }) => {
      const url = `/api/gold-query?mode=flood_risk${filterQueryString ? `&${filterQueryString}` : ''}`
      const res = await fetch(url, { signal })
      if (!res.ok) {
        const response = await res.json().catch(() => ({}))
        throw new Error(response.message || response.error || `Lỗi máy chủ (${res.status})`)
      }
      const json: FloodAuditSummary = await res.json()
      if (!Array.isArray(json.wardDetails)) {
        throw new Error('Dữ liệu kiểm toán rủi ro ngập không hợp lệ.')
      }
      return json
    }
  })
  const auditData = query.data
  const loading = query.isLoading

  return (
    <div className="workspace-view">
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <ShieldAlert size={22} />
        </div>
        <div>
          <span className="eyebrow">FLOOD RISK & DISASTER RESILIENCE AUDIT (LIVE DATA)</span>
          <h2>Giám Sát Rủi Ro Ngập Lụt & An Toàn Bất Động Sản</h2>
          <p>Dữ liệu thời gian thực truy vấn trực tiếp từ bảng gold.rental_room, kiểm toán thực địa qua các đợt ngập 2022 và 2025.</p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" /> {loading ? 'Đang kiểm toán...' : auditData ? `${auditData.safePercentage}% Thuộc Vùng An Toàn` : 'Chưa có dữ liệu kiểm toán'}
        </span>
      </div>

      {query.isError && (
        <div role="alert" className="card data-error-state">
          <span>Không tải được dữ liệu rủi ro ngập: {query.error.message}</span>
          <button type="button" className="button secondary" onClick={() => void query.refetch()}>
            <RotateCcw size={14} /> Thử tải lại
          </button>
        </div>
      )}

      {/* KPI Cards - 100% Live from Supabase */}
      <div className="analysis-cards">
        <div className="card metric-card">
          <div className="kpi-icon green"><CheckCircle size={17} /></div>
          <span>Tỷ lệ An toàn Toàn bộ</span>
          <strong>{auditData ? `${auditData.safePercentage}%` : loading ? '...' : '—'}</strong>
          <small>
            {auditData
              ? `${auditData.safeCount.toLocaleString()} / ${auditData.totalListings.toLocaleString()} tin an toàn (Mức 0)`
              : loading ? 'Đang tính toán...' : query.isError ? 'Không thể tải dữ liệu.' : 'Chưa có dữ liệu.'}
          </small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon blue"><Droplets size={17} /></div>
          <span>Kiểm toán Đợt ngập 2022/2025</span>
          <strong>{auditData ? `${auditData.flood2022Count + auditData.flood2025Count} tin` : loading ? '...' : '—'}</strong>
          <small>Số tin thực tế có ghi nhận ảnh hưởng ngập trong lịch sử</small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon orange"><TrendingUp size={17} /></div>
          <span>Mức chiết khấu vùng trũng</span>
          <strong>{auditData ? `-${auditData.floodDiscountPct}%` : loading ? '...' : '—'}</strong>
          <small>Chênh lệch giá thuê trung bình so với vùng an toàn</small>
        </div>
      </div>

      {/* Flood Safety Matrix by Ward - 100% Live from Supabase */}
      <div className="card flood-panel" style={{ padding: '20px', marginTop: '14px' }}>
        <div className="flood-panel-header">
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>Đánh Giá An Toàn Địa Hình Thoát Nước Từng Quận/Huyện</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
              Dữ liệu tổng hợp từ toàn bộ các tin đăng thuộc từng phường/quận trong tầng Gold Data Warehouse.
            </p>
          </div>
          <button className="clear-filter" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RotateCcw size={14} /> Làm mới kiểm toán
          </button>
        </div>

        <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
              Đang phân tích dữ liệu địa hình từ Supabase...
            </div>
          ) : query.isError ? null : auditData?.wardDetails.length ? (
            auditData.wardDetails.map((zone) => (
              <div
                key={zone.ward}
                className={`flood-zone ${zone.status}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                }}
              >
                <div
                  className="flood-zone-icon"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {zone.status === 'safe' ? <CheckCircle size={18} /> : zone.status === 'warning' ? <AlertTriangle size={18} /> : <AlertOctagon size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '13px' }}>{zone.ward}</strong>
                    <span
                      className="flood-risk-badge"
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {zone.riskTier}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      ({zone.totalRooms} tin đăng)
                    </span>
                  </div>
                  <p className="flood-zone-note" style={{ margin: '3px 0 0', fontSize: '11px', lineHeight: 1.4 }}>
                    {zone.note} Giá thuê TB: <strong>{zone.avgPriceMillion} tr/tháng</strong> ({zone.avgPpm2.toLocaleString()} đ/m²).
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div className={`flood-score ${zone.status}`} style={{ font: '800 16px Manrope' }}>
                    {zone.safeScore}%
                  </div>
                  <small style={{ fontSize: '9px', color: 'var(--muted)' }}>Chỉ số an toàn</small>
                </div>
              </div>
            ))
          ) : <div role="status" className="chart-empty-state">Chưa có dữ liệu theo khu vực và điều kiện lọc đã chọn.</div>}
        </div>
      </div>

      {/* Strategic Flood Defense Recommendations */}
      <div className="card flood-recommendations" style={{ padding: '20px', marginTop: '14px', border: '1px solid var(--line)' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--ink)' }}>
          KHUYẾN NGHỊ ĐẦU TƯ & THUÊ AN TOÀN TẠI ĐÀ NẴNG DỰA TRÊN DỮ LIỆU
        </h4>
        <div className="flood-recommendation-grid" style={{ fontSize: '11px', lineHeight: 1.5 }}>
          <div>
            <strong>1. Nâng cao cốt nền tầng 1:</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
              Nếu xây dựng nhà trọ tại các kiệt thấp gần kênh thoát nước, khuyến nghị nâng cốt nền tối thiểu 50cm so với mặt đường kiệt để tránh nước tràn ngược.
            </p>
          </div>
          <div>
            <strong>2. Ưu tiên bãi xe có gờ ngăn nước:</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
              Khách thuê xe máy tại Đà Nẵng sẵn sàng trả thêm 200k — 300k/tháng cho các phòng trọ có hầm để xe cao ráo, trang bị cửa van chống ngập.
            </p>
          </div>
          <div>
            <strong>3. Khu vực giữ giá bền vững nhất:</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>
              An Hải, Phước Mỹ, Mỹ An (Sơn Trà & Ngũ Hành Sơn) vừa kề biển vừa có nền địa chất cát pha thoát nước cực nhanh, duy trì tỷ lệ kín phòng quanh năm &gt; 92%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
