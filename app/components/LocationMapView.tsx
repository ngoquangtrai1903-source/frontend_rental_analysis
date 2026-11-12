'use client'

import { useCallback, useState } from 'react'
import {
  MapPin,
  Navigation,
  DollarSign,
  Home,
  X
} from 'lucide-react'
import { MapRentalPoint } from '@/lib/goldQueryService'
import useRentalMapData from '@/app/hooks/useRentalMapData'
import RentalMapbox from './RentalMapbox'
import { getPriceTierTheme, getFloodRiskBadge, formatVndPrice, translateCategoryName } from './MapMarkerPopup'
import { getNearestBeachName, getNearestUniversityName } from '../../lib/locationPlaces'
import GoogleMapsActions from './GoogleMapsActions'

interface LocationMapViewProps {
  filterQueryString?: string
  activeFiltersCount?: number
  lang?: 'vi' | 'en'
}

export default function LocationMapView({
  filterQueryString = '',
  activeFiltersCount = 0,
  lang = 'vi'
}: LocationMapViewProps) {
  const isEn = lang === 'en'
  const { points, loading, totalCount, stats, error, refetch } = useRentalMapData(filterQueryString)
  const [selectedPoint, setSelectedPoint] = useState<MapRentalPoint | null>(null)
  const handleSelectPoint = useCallback((point: MapRentalPoint | null) => {
    setSelectedPoint(point)
    if (point) {
      setTimeout(() => {
        const el = document.getElementById('property-inspector-card')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 60)
    }
  }, [])

  return (
    <div className="workspace-view">
      {/* 1. Hero Header */}
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <MapPin size={22} />
        </div>
        <div>
          <span className="eyebrow">GIS SPATIAL INTELLIGENCE · RENTIQ DA NANG</span>
          <h2>
            {isEn
              ? 'Coordinate Distribution & Citywide Rental Map'
              : 'Bản Đồ Phân Bố Toạ Độ & Tin Cho Thuê Toàn Thành Phố'}
          </h2>
          <p>
            {isEn
              ? 'Visualizes live listing coordinates from Gold schema across Da Nang.'
              : 'Hiển thị trực quan toàn bộ toạ độ tin đăng thực tế từ tầng Gold trên địa bàn TP. Đà Nẵng.'}
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" />{' '}
          {loading
            ? isEn ? 'Querying coordinates...' : 'Đang truy vấn toạ độ...'
            : isEn
              ? `Displaying ${points.length.toLocaleString()} / ${totalCount.toLocaleString()} coordinates`
              : `Đang hiển thị ${points.length.toLocaleString()} / ${totalCount.toLocaleString()} toạ độ`}
        </span>
      </div>

      {error && (
        <div role="alert" className="card" style={{ alignItems: 'center', color: '#991b1b', display: 'flex', justifyContent: 'space-between', padding: 14 }}>
          <span>{isEn ? `Failed to load map data: ${error}` : `Không tải được dữ liệu bản đồ: ${error}`}</span>
          <button type="button" className="button secondary" onClick={() => void refetch()}>
            {isEn ? 'Retry' : 'Thử tải lại'}
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards (100% Live from loaded points) */}
      <div className="analysis-cards" style={{ marginTop: '0px' }}>
        <div className="card metric-card">
          <div className="kpi-icon blue"><Navigation size={17} /></div>
          <span>{isEn ? 'TOTAL VISUALIZED POINTS' : 'TỔNG TOẠ ĐỘ HIỂN THỊ'}</span>
          <strong>{points.length.toLocaleString()} {isEn ? 'listings' : 'tin'}</strong>
          <small>
            {activeFiltersCount > 0
              ? isEn
                ? `Filtered by ${activeFiltersCount} criteria from top filter bar`
                : `Lọc theo ${activeFiltersCount} tiêu chí từ thanh bộ lọc trên cùng`
              : isEn
                ? 'Displaying 100% available coordinates from Gold store'
                : 'Tải toàn bộ 100% dữ liệu toạ độ sẵn có từ kho gold'}
          </small>
        </div>

        <div className="card metric-card">
          <div className="kpi-icon orange"><DollarSign size={17} /></div>
          <span>{isEn ? 'Average rent of listings on the map' : 'Giá thuê trung bình các tin trên bản đồ'}</span>
          <strong>{stats.avgPriceMillion} {isEn ? 'M / mo' : 'tr / tháng'}</strong>
          <small>{isEn ? `Unit rate: ${stats.avgPpm2.toLocaleString()} VND/m²` : `Đơn giá diện tích: ${stats.avgPpm2.toLocaleString()} đ/m²`}</small>
        </div>

        <div className="card metric-card">
          <div className="kpi-icon purple"><Home size={17} /></div>
          <span>{isEn ? 'SUPPLY BREAKDOWN' : 'CƠ CẤU NGUỒN CUNG'}</span>
          <strong>
            {points.length > 0
              ? `${Math.round((stats.apartmentCount / points.length) * 100)}% ${isEn ? 'Apartments' : 'Căn hộ'}`
              : '0%'}
          </strong>
          <small>
            {isEn
              ? `${stats.roomCount.toLocaleString()} rental room listings`
              : `${stats.roomCount.toLocaleString()} tin phòng trọ`}
          </small>
        </div>
      </div>

      {/* 3. Interactive GIS Map with Clustering & Layer Controllers */}
      <RentalMapbox
        points={points}
        loading={loading}
        selectedPoint={selectedPoint}
        onSelectPoint={handleSelectPoint}
        lang={lang}
      />

      {/* 4. Selected Property Detailed Inspector Card */}
      {selectedPoint && (
        <div
          id="property-inspector-card"
          className="card selected-property-card"
          style={{
            padding: '22px',
            border: '2px solid #3078f0',
            marginTop: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(48, 120, 240, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="eyebrow">
                {isEn
                  ? `SELECTED PROPERTY DETAILS (ID: ${selectedPoint.list_id})`
                  : `CHI TIẾT PHÒNG TRỌ ĐANG CHỌN (ID: ${selectedPoint.list_id})`}
              </span>
              <h3 style={{ margin: '4px 0 2px', fontSize: '19px', fontWeight: 800, color: 'var(--ink)' }}>
                {translateCategoryName(selectedPoint.category_name, isEn)} {isEn ? 'in' : 'tại'} {selectedPoint.ward_name}, TP. Đà Nẵng
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {isEn ? 'GPS WGS84 Coordinates:' : 'Toạ độ GPS WGS84:'} {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}
              </div>
            </div>
            <button
              className="clear-filter"
              onClick={() => setSelectedPoint(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <X size={16} /> {isEn ? 'Close details' : 'Đóng chi tiết'}
            </button>
          </div>

          <GoogleMapsActions latitude={selectedPoint.latitude} longitude={selectedPoint.longitude} lang={lang} />

          <div className="selected-property-metrics" style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{isEn ? 'LISTED RENT' : 'GIÁ THUÊ NIÊM YẾT'}</span>
              <div style={{ font: "800 22px 'Manrope', sans-serif", color: getPriceTierTheme(selectedPoint.price_vnd, isEn).color, marginTop: '3px' }}>
                {formatVndPrice(selectedPoint.price_vnd, isEn)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{isEn ? 'SIZE & RATE' : 'DIỆN TÍCH & ĐƠN GIÁ'}</span>
              <div style={{ font: "700 16px 'Manrope', sans-serif", color: 'var(--ink)', marginTop: '4px' }}>
                {selectedPoint.size_m2 ? `${Math.round(selectedPoint.size_m2)} m²` : (isEn ? 'N/A' : 'Chưa rõ DT')} ({selectedPoint.price_per_m2_vnd ? `${selectedPoint.price_per_m2_vnd.toLocaleString()} ${isEn ? 'VND/m²' : 'đ/m²'}` : 'N/A'})
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{isEn ? 'Distances to places of interest' : 'Khoảng cách đến các địa điểm'}</span>
              <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', display: 'grid', gap: '2px' }}>
                <div>🏖️ {isEn ? 'Nearest beach' : 'Bãi biển gần nhất'}: {getNearestBeachName(selectedPoint.nearest_beach_code, isEn)} · {selectedPoint.dist_to_beach ? `${selectedPoint.dist_to_beach.toFixed(1)} km` : '—'}</div>
                <div>🏙️ {isEn ? 'Dragon Bridge CBD' : 'CBD Cầu Rồng'}: {selectedPoint.dist_to_cbd ? `${selectedPoint.dist_to_cbd.toFixed(1)} km` : '—'}</div>
                <div>🎓 {isEn ? 'Nearest University' : 'Đại học gần nhất'}: {getNearestUniversityName(selectedPoint.nearest_uni_code, isEn)} · {selectedPoint.dist_to_nearest_uni ? `${selectedPoint.dist_to_nearest_uni.toFixed(1)} km` : '—'}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>{isEn ? 'RISK & AMENITIES' : 'ĐÁNH GIÁ RỦI RO & TIỆN ÍCH'}</span>
              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: selectedPoint.flood_risk_label === 0 ? '#ecfdf5' : '#fef2f2',
                    color: selectedPoint.flood_risk_label === 0 ? '#065f46' : '#991b1b',
                    marginBottom: '4px'
                  }}
                >
                  {selectedPoint.flood_risk_label === 0
                    ? (isEn ? '🟢 High ground · Safe' : '🟢 Cốt nền cao an toàn')
                    : (isEn ? '🔴 Flood caution' : '🔴 Cần lưu ý ngập')}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {isEn ? 'Furnishing: ' : 'Nội thất: '}
                  {selectedPoint.furnishing_status
                    ? (isEn
                        ? (selectedPoint.furnishing_status.toLowerCase().includes('đầy đủ') ? 'Fully furnished' : selectedPoint.furnishing_status.toLowerCase().includes('cơ bản') ? 'Semi furnished' : 'Unfurnished')
                        : selectedPoint.furnishing_status)
                    : (isEn ? 'Basic' : 'Cơ bản')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
