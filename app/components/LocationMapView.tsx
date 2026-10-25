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
import RentalLeaflet from './RentalLeaflet'
import { getPriceTierTheme, getFloodRiskBadge, formatVndPrice } from './MapMarkerPopup'

interface LocationMapViewProps {
  filterQueryString?: string
  activeFiltersCount?: number
}

export default function LocationMapView({
  filterQueryString = '',
  activeFiltersCount = 0
}: LocationMapViewProps) {
  const { points, loading, totalCount, stats, error, refetch } = useRentalMapData(filterQueryString)
  const [selectedPoint, setSelectedPoint] = useState<MapRentalPoint | null>(null)
  const handleSelectPoint = useCallback((point: MapRentalPoint | null) => {
    setSelectedPoint(point)
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
          <h2>Bản Đồ Phân Bố Toạ Độ & Lớp Cảnh Báo Ngập Lụt Toàn Thành Phố</h2>
          <p>
            Hiển thị trực quan toàn bộ toạ độ tin đăng thực tế từ tầng Gold, tích hợp lớp ranh giới Quận/Huyện và cảnh báo ngập lụt lịch sử.
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" /> {loading ? 'Đang truy vấn toạ độ...' : `Đang hiển thị ${points.length.toLocaleString()} / ${totalCount.toLocaleString()} toạ độ`}
        </span>
      </div>

      {error && (
        <div role="alert" className="card" style={{ alignItems: 'center', color: '#991b1b', display: 'flex', justifyContent: 'space-between', padding: 14 }}>
          <span>Không tải được dữ liệu bản đồ: {error}</span>
          <button type="button" className="button secondary" onClick={() => void refetch()}>Thử tải lại</button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards (100% Live from loaded points) */}
      <div className="analysis-cards" style={{ marginTop: '0px' }}>
        <div className="card metric-card">
          <div className="kpi-icon blue"><Navigation size={17} /></div>
          <span>TỔNG TOẠ ĐỘ HIỂN THỊ</span>
          <strong>{points.length.toLocaleString()} tin</strong>
          <small>
            {activeFiltersCount > 0
              ? `Lọc theo ${activeFiltersCount} tiêu chí từ thanh bộ lọc trên cùng`
              : 'Tải toàn bộ 100% dữ liệu toạ độ sẵn có từ kho gold'}
          </small>
        </div>

        <div className="card metric-card">
          <div className="kpi-icon orange"><DollarSign size={17} /></div>
          <span>GIÁ THUÊ TRUNG BÌNH TOẠ ĐỘ</span>
          <strong>{stats.avgPriceMillion} tr / tháng</strong>
          <small>Đơn giá diện tích: {stats.avgPpm2.toLocaleString()} đ/m²</small>
        </div>

        <div className="card metric-card">
          <div className="kpi-icon purple"><Home size={17} /></div>
          <span>CƠ CẤU NGUỒN CUNG</span>
          <strong>
            {points.length > 0 ? `${Math.round((stats.apartmentCount / points.length) * 100)}% Căn hộ` : '0%'}
          </strong>
          <small>{stats.roomCount.toLocaleString()} phòng trọ sinh viên / người đi làm</small>
        </div>
      </div>

      {/* 3. Interactive GIS Map with Clustering & Layer Controllers */}
      <RentalLeaflet
        points={points}
        onSelectPoint={(point) => handleSelectPoint(point)}
      />

      {/* 4. Selected Property Detailed Inspector Card */}
      {selectedPoint && (
        <div
          className="card"
          style={{
            padding: '22px',
            background: '#ffffff',
            border: '2px solid #3078f0',
            marginTop: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(48, 120, 240, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="eyebrow">TOẠ ĐỘ ĐANG THANH TRA (ID: {selectedPoint.list_id})</span>
              <h3 style={{ margin: '4px 0 2px', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
                {selectedPoint.category_name} tại {selectedPoint.ward_name}, TP. Đà Nẵng
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Toạ độ GPS WGS84: {selectedPoint.latitude.toFixed(5)}, {selectedPoint.longitude.toFixed(5)}
              </div>
            </div>
            <button
              className="clear-filter"
              onClick={() => setSelectedPoint(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <X size={16} /> Đóng bảng thanh tra
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>GIÁ THUÊ NIÊM YẾT</span>
              <div style={{ font: '800 22px Manrope', color: getPriceTierTheme(selectedPoint.price_vnd).color, marginTop: '3px' }}>
                {formatVndPrice(selectedPoint.price_vnd)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>DIỆN TÍCH & ĐƠN GIÁ</span>
              <div style={{ font: '700 16px Manrope', color: '#1e293b', marginTop: '4px' }}>
                {selectedPoint.size_m2} m² ({selectedPoint.price_per_m2_vnd?.toLocaleString()} đ/m²)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>CỰ LY ĐIỂM NÓNG CHIẾN LƯỢC</span>
              <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', display: 'grid', gap: '2px' }}>
                <div>🏖️ Biển Mỹ Khê: {selectedPoint.dist_to_beach?.toFixed(1) || 'N/A'} km</div>
                <div>🏙️ CBD Cầu Rồng: {selectedPoint.dist_to_cbd?.toFixed(1) || 'N/A'} km</div>
                <div>🎓 Đại học gần nhất: {selectedPoint.dist_to_nearest_uni?.toFixed(1) || 'N/A'} km</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>ĐÁNH GIÁ RỦI RO & TIỆN ÍCH</span>
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
                  {selectedPoint.flood_risk_label === 0 ? '🟢 Cốt nền cao an toàn' : '🔴 Cần lưu ý ngập'}
                </span>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Nội thất: {selectedPoint.furnishing_status || 'Cơ bản'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
