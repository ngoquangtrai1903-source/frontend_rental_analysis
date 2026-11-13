'use client'

import { useQuery } from '@tanstack/react-query'
import { Home } from 'lucide-react'

const amenityLabelsEn: Record<string, string> = {
  has_balcony: 'Balcony',
  free_hours: '24/7 access',
  has_camera_security: 'Security cameras',
  has_elevator: 'Elevator',
  has_mezzanine: 'Mezzanine',
  private_bathroom: 'Private bathroom',
  wifi: 'Wi-Fi',
  has_parking: 'Parking',
  has_window: 'Window',
}
interface AmenityLiftItem {
  key: string
  label: string
  countWith: number
  countWithout: number
  avgPriceWithMillion: number
  avgPriceWithoutMillion: number
  liftPct: number
  ppm2With: number
  ppm2Without: number
}

interface AmenitiesViewProps {
  filterQueryString?: string
  onCategoryChange: (category: string) => void
  lang?: 'vi' | 'en'
}

export default function AmenitiesView({ filterQueryString = '', onCategoryChange, lang = 'vi' }: AmenitiesViewProps) {
  const isEn = lang === 'en'
  const filterCategory = new URLSearchParams(filterQueryString).get('category_name') || 'all'
  const query = useQuery({
    queryKey: ['amenity-lifts', filterCategory, filterQueryString],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams(filterQueryString)
      params.set('mode', 'amenities')

      const amenitiesRes = await fetch(`/api/gold-query?${params.toString()}`, { signal })
      const readResponse = async (res: Response) => {
        if (res.ok) return res.json()
        const response = await res.json().catch(() => ({}))
        throw new Error(response.message || response.error || (isEn ? `Server error (${res.status})` : `Lỗi máy chủ (${res.status})`))
      }
      const amenitiesJson = await readResponse(amenitiesRes)
      if (!Array.isArray(amenitiesJson)) {
        throw new Error(isEn ? 'Invalid amenities analysis response.' : 'Dữ liệu phân tích tiện ích trả về không hợp lệ.')
      }
      return amenitiesJson as AmenityLiftItem[]
    }
  })
  const amenitiesData = query.data ?? []
  const loading = query.isLoading

  return (
    <div className="workspace-view">
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <Home size={22} />
        </div>
        <div>
          <h2>
            {isEn ? 'Value-Add Amenities & Pricing Premium Analysis' : 'Phân tích Giá trị Gia tăng theo Tiện ích Phòng trọ'}
          </h2>
          <p>
            {isEn
              ? 'Average rent with and without each amenity.'
              : 'So sánh giá thuê trung bình giữa nhóm có và không có tiện ích.'}
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" />{' '}
          {loading
            ? isEn ? 'Loading data…' : 'Đang tải dữ liệu…'
            : query.isError
              ? isEn ? 'Failed to load' : 'Tải dữ liệu thất bại'
              : isEn ? `${amenitiesData.length} amenities` : `${amenitiesData.length} tiện ích`}
        </span>
      </div>

      {query.isError && (
        <div role="alert" className="card data-error-state">
          <span>{isEn ? 'Unable to load amenity data. Please try again.' : 'Không tải được dữ liệu tiện ích. Vui lòng thử lại.'}</span>
          <button type="button" className="button secondary" onClick={() => void query.refetch()}>
            {isEn ? 'Retry' : 'Thử tải lại'}
          </button>
        </div>
      )}

      {/* Category selector */}
      <div className="toolbar" style={{ margin: '10px 0 0' }}>
        <div className="tabs">
          <button
            className={`tab ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('')}
          >
            {isEn ? 'All types' : 'Tất cả'}
          </button>
          <button
            className={`tab ${filterCategory === 'Căn hộ/Chung cư' ? 'active' : ''}`}
            onClick={() => onCategoryChange('Căn hộ/Chung cư')}
          >
            {isEn ? 'Apartments' : 'Căn hộ'}
          </button>
          <button
            className={`tab ${filterCategory === 'Phòng trọ' ? 'active' : ''}`}
            onClick={() => onCategoryChange('Phòng trọ')}
          >
            {isEn ? 'Rental rooms' : 'Phòng trọ'}
          </button>
        </div>
      </div>

      {/* Amenity Lift Cards Grid */}
      <div className="lift-grid">
        {amenitiesData.map((item) => (
          <div className="lift-card" key={item.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '13px' }}>{isEn ? (amenityLabelsEn[item.key] ?? 'Other amenity') : ({ has_balcony: 'Ban công', has_parking: 'Chỗ để xe', free_hours: 'Giờ tự do', has_window: 'Cửa sổ', wifi: 'Wi-Fi' } as Record<string, string>)[item.key] || item.label}</strong>
              <span className={`lift-badge ${item.liftPct > 0 ? 'positive' : 'neutral'}`}>
                {item.liftPct > 0 ? `+${item.liftPct}%` : `${item.liftPct}%`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{isEn ? 'With amenity' : 'Có tiện ích'}</span>
                <div style={{ font: "800 18px 'Manrope', sans-serif", color: 'var(--blue)' }}>
                  {item.avgPriceWithMillion} {isEn ? 'M' : 'tr'}
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {item.ppm2With.toLocaleString()} {isEn ? 'VND/m²' : 'đ/m²'}
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{isEn ? 'Without' : 'Không có'}</span>
                <div style={{ font: "700 15px 'Manrope', sans-serif", color: 'var(--muted)' }}>
                  {item.avgPriceWithoutMillion} {isEn ? 'M' : 'tr'}
                </div>
                <small style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {item.ppm2Without.toLocaleString()} {isEn ? 'VND/m²' : 'đ/m²'}
                </small>
              </div>
            </div>

            {/* Coverage bar */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px', color: 'var(--muted)' }}>
                <span>{isEn ? `${item.countWith} listings with this amenity` : `${item.countWith} tin có tiện ích`}</span>
                <span>{item.countWith + item.countWithout > 0 ? Math.round((item.countWith / (item.countWith + item.countWithout)) * 100) : 0}%</span>
              </div>
              <div className="summary-track">
                <span
                  style={{
                    width: `${item.countWith + item.countWithout > 0 ? Math.round((item.countWith / (item.countWith + item.countWithout)) * 100) : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {!loading && amenitiesData.length === 0 && (
          <div role="status" className="chart-empty-state">
            {query.isError
              ? (isEn ? 'Unable to display data when request fails.' : 'Không thể hiển thị dữ liệu khi yêu cầu tải thất bại.')
              : (isEn ? 'Insufficient data to compare amenities with current filters.' : 'Chưa đủ dữ liệu để so sánh các tiện ích với bộ lọc hiện tại.')}
          </div>
        )}
      </div>

    </div>
  )
}
