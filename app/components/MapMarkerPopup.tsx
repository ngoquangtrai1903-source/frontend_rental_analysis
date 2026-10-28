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
}

export function formatVndPrice(priceVnd: number | null): string {
  if (!priceVnd || priceVnd <= 0) return 'Thỏa thuận'
  const million = priceVnd / 1000000
  return `${million.toFixed(2)} triệu / tháng`
}

export function getPriceTierTheme(priceVnd: number | null) {
  if (!priceVnd || priceVnd <= 0) {
    return { color: '#10b981', label: 'Thương lượng', bg: '#ecfdf5', text: '#065f46' }
  }
  if (priceVnd < 3500000) {
    return { color: '#10b981', label: 'Bình dân / Sinh viên', bg: '#ecfdf5', text: '#065f46' }
  }
  if (priceVnd < 7000000) {
    return { color: '#2563eb', label: 'Tiêu chuẩn / Studio', bg: '#eff6ff', text: '#1e40af' }
  }
  if (priceVnd < 12000000) {
    return { color: '#8b5cf6', label: 'Cao cấp / Dịch vụ', bg: '#f5f3ff', text: '#5b21b6' }
  }
  return { color: '#ef4444', label: 'Hạng sang / Luxury', bg: '#fef2f2', text: '#991b1b' }
}

export function getFloodRiskBadge(riskLabel: number | null) {
  if (riskLabel === null) {
    return {
      icon: <AlertTriangle size={13} className="text-slate-500" />,
      text: 'Chưa có dữ liệu ngập',
      className: 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }
  if (riskLabel === 0) {
    return {
      icon: <ShieldCheck size={13} className="text-emerald-600" />,
      text: 'Cốt nền cao · An toàn',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }
  if (riskLabel === 1) {
    return {
      icon: <AlertTriangle size={13} className="text-amber-600" />,
      text: 'Ngập nhẹ khi bão lớn',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }
  return {
    icon: <ShieldAlert size={13} className="text-rose-600" />,
    text: 'Vùng trũng · Nguy cơ cao',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  }
}

export default function MapMarkerPopup({
  point,
  onClose,
  onSelectDetails
}: MapMarkerPopupProps) {
  const isApt = point.category_name?.includes('Căn hộ')
  const theme = getPriceTierTheme(point.price_vnd)
  const floodBadge = getFloodRiskBadge(point.flood_risk_label)
  const title = `${point.category_name || 'Tin cho thuê'} tại ${point.ward_name || 'Đà Nẵng'}`

  return (
    <div
      style={{
        width: '320px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'San Francisco', sans-serif"
      }}
    >
      {/* Header Image Thumbnail & Close button */}
      <div style={{ position: 'relative', height: '110px', background: isApt ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          {isApt ? <Building size={34} style={{ margin: '0 auto 4px', opacity: 0.9 }} /> : <Home size={34} style={{ margin: '0 auto 4px', opacity: 0.9 }} />}
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.95 }}>
            {point.category_name || 'Bất động sản cho thuê'}
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
            Phường {point.ward_name || 'Hải Châu'}, TP. Đà Nẵng
          </span>
        </div>
        <h3 style={{ color: '#0f172a', fontSize: 13, fontWeight: 700, lineHeight: 1.4, margin: '5px 0 0' }}>
          {title}
        </h3>

        {/* Price & Size Highlight */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
          <div style={{ color: theme.color, fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'San Francisco', sans-serif" }}>
            {formatVndPrice(point.price_vnd)}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
            {point.size_m2 ? `${Math.round(point.size_m2)} m²` : 'Chưa rõ DT'}
          </div>
        </div>

        {point.price_per_m2_vnd && (
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px' }}>
            Đơn giá: {point.price_per_m2_vnd.toLocaleString()} đ/m²
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Biển</span>
            <strong style={{ fontSize: '11px', color: '#0284c7' }}>
              {point.dist_to_beach ? `${point.dist_to_beach.toFixed(1)} km` : '—'}
            </strong>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>CBD Rồng</span>
            <strong style={{ fontSize: '11px', color: '#4f46e5' }}>
              {point.dist_to_cbd ? `${point.dist_to_cbd.toFixed(1)} km` : '—'}
            </strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Đại học</span>
            <strong style={{ fontSize: '11px', color: '#059669' }}>
              {point.dist_to_nearest_uni ? `${point.dist_to_nearest_uni.toFixed(1)} km` : '—'}
            </strong>
          </div>
        </div>

        {/* Amenities Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
          {point.has_elevator === 1 && (
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🛗 Thang máy
            </span>
          )}
          {point.has_balcony === 1 && (
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🌅 Ban công
            </span>
          )}
          {point.private_bathroom === 1 && (
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🚿 WC riêng
            </span>
          )}
          {point.has_parking === 1 && (
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '9px', padding: '2px 5px', borderRadius: '4px', fontWeight: 600 }}>
              🛵 Chỗ để xe
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
              padding: '7px 0',
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
            <ExternalLink size={13} /> Xem thông số thanh tra
          </button>
        )}
      </div>
    </div>
  )
}
