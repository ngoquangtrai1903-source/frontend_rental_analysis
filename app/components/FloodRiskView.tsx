'use client'

import { useQuery } from '@tanstack/react-query'
import { ShieldAlert, CheckCircle, AlertTriangle, Droplets, TrendingUp, AlertOctagon, RotateCcw } from 'lucide-react'
import { FloodAuditSummary } from '@/lib/goldQueryService'

interface FloodRiskViewProps {
  filterQueryString?: string
  lang?: 'vi' | 'en'
}

export default function FloodRiskView({ filterQueryString = '', lang = 'vi' }: FloodRiskViewProps) {
  const isEn = lang === 'en'
  const query = useQuery({
    queryKey: ['flood-risk', filterQueryString],
    queryFn: async ({ signal }) => {
      const url = `/api/gold-query?mode=flood_risk${filterQueryString ? `&${filterQueryString}` : ''}`
      const res = await fetch(url, { signal })
      if (!res.ok) {
        const response = await res.json().catch(() => ({}))
        throw new Error(response.message || response.error || (isEn ? `Server error (${res.status})` : `Lỗi máy chủ (${res.status})`))
      }
      const json: FloodAuditSummary = await res.json()
      if (!Array.isArray(json.wardDetails)) {
        throw new Error(isEn ? 'Invalid flood risk audit data format.' : 'Dữ liệu kiểm toán rủi ro ngập không hợp lệ.')
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
          <h2>
            {isEn ? 'Flood risk' : 'Rủi ro ngập lụt'}
          </h2>
          <p>
            {isEn
              ? 'Based on recorded floods in 2022 and 2025; not a current forecast.'
              : 'Dựa trên ghi nhận ngập năm 2022 và 2025, không phải dự báo hiện tại.'}
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" />{' '}
          {loading
            ? isEn ? 'Loading…' : 'Đang tải…'
            : auditData
              ? isEn ? `${auditData.safePercentage}% low risk` : `${auditData.safePercentage}% rủi ro thấp`
              : isEn ? 'No data' : 'Chưa có dữ liệu'}
        </span>
      </div>

      {query.isError && (
        <div role="alert" className="card data-error-state">
          <span>{isEn ? `Failed to load flood risk data: ${query.error.message}` : `Không tải được dữ liệu rủi ro ngập: ${query.error.message}`}</span>
          <button type="button" className="button secondary" onClick={() => void query.refetch()}>
            <RotateCcw size={14} /> {isEn ? 'Retry' : 'Thử tải lại'}
          </button>
        </div>
      )}

      {/* KPI Cards - 100% Live from Supabase */}
      <div className="analysis-cards">
        <div className="card metric-card">
          <div className="kpi-icon green"><CheckCircle size={17} /></div>
          <span>{isEn ? 'Low-risk listings' : 'Tin có rủi ro thấp'}</span>
          <strong>{auditData ? `${auditData.safePercentage}%` : loading ? '...' : '—'}</strong>
          <small>
            {auditData
              ? isEn
                ? `${auditData.safeCount.toLocaleString()} / ${auditData.totalListings.toLocaleString()} low-risk listings`
                : `${auditData.safeCount.toLocaleString()} / ${auditData.totalListings.toLocaleString()} tin rủi ro thấp`
              : loading
                ? isEn ? 'Calculating...' : 'Đang tính toán...'
                : query.isError
                  ? isEn ? 'Failed to load.' : 'Không thể tải dữ liệu.'
                  : isEn ? 'No data.' : 'Chưa có dữ liệu.'}
          </small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon blue"><Droplets size={17} /></div>
          <span>{isEn ? 'Flood records · 2022 & 2025' : 'Ghi nhận ngập · 2022 & 2025'}</span>
          <strong>{auditData ? `${auditData.flood2022Count + auditData.flood2025Count} ${isEn ? 'records' : 'lượt'}` : loading ? '...' : '—'}</strong>
          <small>{isEn ? 'Counted separately for each year' : 'Mỗi năm được tính riêng'}</small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon orange"><TrendingUp size={17} /></div>
          <span>{isEn ? 'Rent difference' : 'Chênh lệch giá thuê'}</span>
          <strong>{auditData ? `-${auditData.floodDiscountPct}%` : loading ? '...' : '—'}</strong>
          <small>{isEn ? 'Average rent discount compared to safe zones' : 'Chênh lệch giá thuê trung bình so với vùng an toàn'}</small>
        </div>
      </div>

      {/* Flood Safety Matrix by Ward - 100% Live from Supabase */}
      <div className="card flood-panel" style={{ padding: '20px', marginTop: '14px' }}>
        <div className="flood-panel-header">
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>
              {isEn ? 'Flood risk by ward' : 'Rủi ro ngập theo phường'}
            </h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
              {isEn
                ? 'Based on listings matching your filters.'
                : 'Theo các tin đăng trong bộ lọc hiện tại.'}
            </p>
          </div>
          <button className="clear-filter" onClick={() => void query.refetch()} disabled={query.isFetching}>
            <RotateCcw size={14} /> {isEn ? 'Refresh' : 'Làm mới'}
          </button>
        </div>

        <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
              {isEn ? 'Loading ward data…' : 'Đang tải dữ liệu theo phường…'}
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
                      {zone.status === 'safe' ? (isEn ? 'Low risk' : 'Rủi ro thấp') : zone.status === 'alert' ? (isEn ? 'Recorded flooding' : 'Có ghi nhận ngập') : (isEn ? 'Check locally' : 'Cần kiểm tra thêm')}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                      ({zone.totalRooms} {isEn ? 'listings' : 'tin đăng'})
                    </span>
                  </div>
                  <p className="flood-zone-note" style={{ margin: '3px 0 0', fontSize: '11px', lineHeight: 1.4 }}>
                    {isEn ? 'Average rent: ' : 'Giá thuê TB: '}<strong>{zone.avgPriceMillion} {isEn ? 'M/mo' : 'tr/tháng'}</strong> ({zone.avgPpm2.toLocaleString()} {isEn ? 'VND/m²' : 'đ/m²'}).
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div className={`flood-score ${zone.status}`} style={{ font: "800 16px 'Manrope', sans-serif" }}>
                    {zone.safeScore}%
                  </div>
                  <small style={{ fontSize: '9px', color: 'var(--muted)' }}>{isEn ? 'Low-risk listings' : 'Tin rủi ro thấp'}</small>
                </div>
              </div>
            ))
          ) : (
            <div role="status" className="chart-empty-state">
              {isEn ? 'No data for the selected area and filter conditions.' : 'Chưa có dữ liệu theo khu vực và điều kiện lọc đã chọn.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
