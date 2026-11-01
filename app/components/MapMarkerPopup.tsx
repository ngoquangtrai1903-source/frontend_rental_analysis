'use client'

import React from 'react'
import {
  MapPin,
  Home,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building,
  X,
  ExternalLink
} from 'lucide-react'
import { MapRentalPoint } from '@/lib/goldQueryService'

interface MapMarkerPopupProps {
  point: MapRentalPoint
  onClose?: () => void
  onSelectDetails?: (point: MapRentalPoint) => void
  lang?: 'vi' | 'en'
}

export function formatVndPrice(priceVnd: number | null, isEn = false): string {
  if (!priceVnd || priceVnd <= 0) return isEn ? 'Negotiable' : 'Thỏa thuận'
  const million = priceVnd / 1000000
  return `${million.toFixed(2)} ${isEn ? 'M VND / mo' : 'triệu / tháng'}`
}

export function getPriceTierTheme(priceVnd: number | null, isEn = false) {
  if (!priceVnd || priceVnd <= 0) {
    return { color: '#10b981', label: isEn ? 'Negotiable' : 'Thương lượng', bg: '#ecfdf5', text: '#065f46' }
  }
  if (priceVnd < 3500000) {
    return { color: '#10b981', label: isEn ? 'Budget / Student' : 'Bình dân / Sinh viên', bg: '#ecfdf5', text: '#065f46' }
  }
  if (priceVnd < 7000000) {
    return { color: '#2563eb', label: isEn ? 'Standard / Studio' : 'Tiêu chuẩn / Studio', bg: '#eff6ff', text: '#1e40af' }
  }
  if (priceVnd < 12000000) {
    return { color: '#8b5cf6', label: isEn ? 'Premium / Serviced' : 'Cao cấp / Dịch vụ', bg: '#f5f3ff', text: '#5b21b6' }
  }
  return { color: '#ef4444', label: isEn ? 'Luxury' : 'Hạng sang / Luxury', bg: '#fef2f2', text: '#991b1b' }
}

export function getFloodRiskBadge(riskLabel: number | null, isEn = false) {
  if (riskLabel === null) {
    return {
      icon: <AlertTriangle size={13} className="text-slate-500" />,
      text: isEn ? 'No flood data' : 'Chưa có dữ liệu ngập',
      className: 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }
  if (riskLabel === 0) {
    return {
      icon: <ShieldCheck size={13} className="text-emerald-600" />,
      text: isEn ? 'High ground · Safe' : 'Cốt nền cao · An toàn',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }
  if (riskLabel === 1) {
    return {
      icon: <AlertTriangle size={13} className="text-amber-600" />,
      text: isEn ? 'Mild flood in storms' : 'Ngập nhẹ khi bão lớn',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }
  return {
    icon: <ShieldAlert size={13} className="text-rose-600" />,
    text: isEn ? 'Lowland · High risk' : 'Vùng trũng · Nguy cơ cao',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  }
}

export function translateCategoryName(categoryName: string | null | undefined, isEn = false): string {
  if (!categoryName) return isEn ? 'Rental Property' : 'Bất động sản cho thuê'
  if (!isEn) return categoryName
  if (categoryName.includes('Căn hộ') || categoryName.includes('Chung cư')) return 'Apartment'
  if (categoryName.includes('Phòng trọ') || categoryName.includes('Phòng')) return 'Rental Room'
  if (categoryName.includes('Nhà nguyên căn') || categoryName.includes('Nhà riêng')) return 'Whole House'
  if (categoryName.includes('Mặt bằng') || categoryName.includes('Văn phòng')) return 'Commercial/Office'
  return categoryName
}

export default function MapMarkerPopup({
  point,
  onClose,
  onSelectDetails,
  lang = 'vi'
}: MapMarkerPopupProps) {
  const isEn = lang === 'en'
  const isApt = point.category_name?.includes('Căn hộ')
  const theme = getPriceTierTheme(point.price_vnd, isEn)
  const floodBadge = getFloodRiskBadge(point.flood_risk_label, isEn)
  const categoryDisplay = translateCategoryName(point.category_name, isEn)
  const title = isEn
    ? `${categoryDisplay} in ${point.ward_name || 'Da Nang'}`
    : `${point.category_name || 'Tin cho thuê'} tại ${point.ward_name || 'Đà Nẵng'}`

  return (
    <div
      className="map-marker-popup-card"
      style={{
        width: '320px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Header Image Thumbnail & Close button */}
      <div style={{ position: 'relative', height: '110px', background: isApt ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          {isApt ? <Building size={34} style={{ margin: '0 auto 4px', opacity: 0.9 }} /> : <Home size={34} style={{ margin: '0 auto 4px', opacity: 0.9 }} />}
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.95 }}>
            {categoryDisplay}
          </span>
        </div>

        {/* Badge tier */}
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: theme.text,
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '99px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
          }}
        >
          {theme.label}
        </span>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label={isEn ? 'Close popup' : 'Đóng cửa sổ'}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div style={{ padding: '14px 16px' }}>
        {/* Title & Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '11px', marginBottom: '3px' }}>
          <MapPin size={13} style={{ flexShrink: 0, color: '#3b82f6' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isEn ? `${point.ward_name || 'Hai Chau'} Ward, Da Nang` : `Phường ${point.ward_name || 'Hải Châu'}, TP. Đà Nẵng`}
          </span>
        </div>
        <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 700, lineHeight: 1.4, margin: '5px 0 0' }}>
          {title}
        </h3>

        {/* Price & Size Highlight */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
          <div style={{ color: theme.color, fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px', fontFamily: "'Manrope', sans-serif" }}>
            {formatVndPrice(point.price_vnd, isEn)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
            {point.size_m2 ? `${Math.round(point.size_m2)} m²` : (isEn ? 'N/A' : 'Chưa rõ DT')}
          </div>
        </div>

        {point.price_per_m2_vnd && (
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
            {isEn ? 'Unit price:' : 'Đơn giá:'} {point.price_per_m2_vnd.toLocaleString()} {isEn ? 'VND/m²' : 'đ/m²'}
          </div>
        )}

        {/* Flood Risk Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '10px',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '11px',
            fontWeight: 600,
            background: point.flood_risk_label === null ? '#f8fafc' : point.flood_risk_label === 0 ? '#ecfdf5' : point.flood_risk_label === 1 ? '#fffbeb' : '#fef2f2',
            color: point.flood_risk_label === null ? '#475569' : point.flood_risk_label === 0 ? '#065f46' : point.flood_risk_label === 1 ? '#92400e' : '#991b1b'
          }}
        >
          {floodBadge.icon}
          <span>{floodBadge.text}</span>
        </div>

        {/* Distance Proximity Indicators */}
        <div className="popup-distance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>{isEn ? 'Beach' : 'Biển'}</span>
            <strong style={{ fontSize: '11px', color: '#0284c7' }}>
              {point.dist_to_beach ? `${point.dist_to_beach.toFixed(1)} km` : '—'}
            </strong>
          </div>
          <div className="popup-distance-divider" style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>{isEn ? 'Dragon CBD' : 'CBD Rồng'}</span>
            <strong style={{ fontSize: '11px', color: '#4f46e5' }}>
              {point.dist_to_cbd ? `${point.dist_to_cbd.toFixed(1)} km` : '—'}
            </strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>{isEn ? 'University' : 'Đại học'}</span>
            <strong style={{ fontSize: '11px', color: '#059669' }}>
              {point.dist_to_nearest_uni ? `${point.dist_to_nearest_uni.toFixed(1)} km` : '—'}
            </strong>
          </div>
        </div>

        {/* Amenities Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
          {point.has_elevator === 1 && (
            <span className="popup-amenity-tag" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🛗 {isEn ? 'Elevator' : 'Thang máy'}
            </span>
          )}
          {point.has_balcony === 1 && (
            <span className="popup-amenity-tag" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🌅 {isEn ? 'Balcony' : 'Ban công'}
            </span>
          )}
          {point.private_bathroom === 1 && (
            <span className="popup-amenity-tag" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🚿 {isEn ? 'Private WC' : 'WC riêng'}
            </span>
          )}
          {point.has_parking === 1 && (
            <span className="popup-amenity-tag" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🛵 {isEn ? 'Parking' : 'Chỗ để xe'}
            </span>
          )}
        </div>

        {/* Action Button */}
        {onSelectDetails && (
          <button
            onClick={() => onSelectDetails(point)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px 0',
              background: '#3078f0',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              fontWeight: 700,
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(48, 120, 240, 0.25)'
            }}
          >
            <ExternalLink size={13} /> {isEn ? 'View property details' : 'Xem chi tiết phòng trọ'}
          </button>
        )}
      </div>
    </div>
  )
}
