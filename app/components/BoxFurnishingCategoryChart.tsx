'use client'

import React, { useState } from 'react'
import { BoxPlotStats } from '@/lib/presentationAnalyticsService'

interface BoxFurnishingCategoryProps {
  data: Array<{
    status: string
    room: BoxPlotStats | null
    apt: BoxPlotStats | null
  }>
  lang?: 'vi' | 'en'
}

export default function BoxFurnishingCategoryChart({
  data,
  lang = 'vi'
}: BoxFurnishingCategoryProps) {
  const isEn = lang === 'en'
  const [hoveredItem, setHoveredItem] = useState<{
    status: string
    category: string
    stats: BoxPlotStats
  } | null>(null)

  const translateStatus = (s: string) => {
    if (!isEn) return s
    if (s === 'Không nội thất') return 'Unfurnished'
    if (s === 'Nội thất cơ bản') return 'Semi-furnished'
    if (s === 'Đầy đủ nội thất') return 'Fully furnished'
    if (s === 'Nội thất cao cấp') return 'Luxury furnished'
    if (s === 'Không xác định') return 'Unspecified'
    return s
  }

  // Max value across all furnishing tiers
  const maxAxis = Math.max(
    400,
    Math.ceil(
      Math.max(
        ...data.flatMap((d) => [d.room?.max || 0, d.apt?.max || 0])
      ) / 50
    ) * 50
  )

  const renderSingleBox = (stats: BoxPlotStats | null, color: string, catLabel: string, status: string) => {
    if (!stats || stats.count === 0) {
      return (
        <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>
          {isEn ? 'No data' : 'Không có'}
        </div>
      )
    }

    const minPct = (stats.min / maxAxis) * 100
    const maxPct = (stats.max / maxAxis) * 100
    const q1Pct = (stats.q1 / maxAxis) * 100
    const q3Pct = (stats.q3 / maxAxis) * 100
    const medPct = (stats.median / maxAxis) * 100
    const isHovered = hoveredItem?.status === status && hoveredItem?.category === catLabel

    return (
      <div
        onMouseEnter={() => setHoveredItem({ status, category: catLabel, stats })}
        onMouseLeave={() => setHoveredItem(null)}
        style={{
          flex: 1,
          height: '24px',
          position: 'relative',
          background: isHovered ? 'rgba(46, 111, 158, 0.12)' : 'var(--surface-subtle, #f1f5f9)',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background 0.15s ease'
        }}
      >
        {/* Whisker */}
        <div
          style={{
            position: 'absolute',
            left: `${minPct}%`,
            width: `${Math.max(0, maxPct - minPct)}%`,
            top: '50%',
            height: '2px',
            background: 'var(--muted, #64748b)',
            transform: 'translateY(-50%)'
          }}
        />
        {/* Min / Max caps */}
        <div style={{ position: 'absolute', left: `${minPct}%`, top: '25%', height: '50%', width: '2px', background: 'var(--muted, #64748b)' }} />
        <div style={{ position: 'absolute', left: `${maxPct}%`, top: '25%', height: '50%', width: '2px', background: 'var(--muted, #64748b)' }} />

        {/* Box */}
        <div
          style={{
            position: 'absolute',
            left: `${q1Pct}%`,
            width: `${Math.max(3, q3Pct - q1Pct)}%`,
            top: '10%',
            height: '80%',
            background: color,
            opacity: 0.85,
            borderRadius: '3px'
          }}
        />

        {/* Median Line */}
        <div
          style={{
            position: 'absolute',
            left: `${medPct}%`,
            top: '5%',
            height: '90%',
            width: '2px',
            background: 'var(--ink, #0f172a)',
            zIndex: 2
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Legend Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          padding: '10px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#E07B39', borderRadius: '2px' }} />
            <strong>{isEn ? 'Rental Room' : 'Phòng trọ'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#2E6F9E', borderRadius: '2px' }} />
            <strong>{isEn ? 'Apartment' : 'Căn hộ/Chung cư'}</strong>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
          {isEn ? 'Unit: k VND/m² · Solid line inside box = Median' : 'Đơn vị: nghìn đ/m² · Vạch giữa hộp = Median'}
        </div>
      </div>

      {/* Grid of 5 Tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {data.map((tier) => (
          <div
            key={tier.status}
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--line, #e2e8f0)',
              background: 'var(--surface-card, #ffffff)'
            }}
          >
            {/* Tier Title */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <span>{translateStatus(tier.status)}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted, #64748b)', fontWeight: 500 }}>
                {isEn ? 'Room:' : 'Trọ:'} {tier.room ? `${tier.room.count} ${isEn ? 'listings' : 'tin'} (Med ${tier.room.median}k)` : '0'} ·{' '}
                {isEn ? 'Apt:' : 'Căn hộ:'} {tier.apt ? `${tier.apt.count} ${isEn ? 'listings' : 'tin'} (Med ${tier.apt.median}k)` : '0'}
              </span>
            </div>

            {/* Room Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ width: '65px', fontSize: '11px', color: '#E07B39', fontWeight: 600 }}>
                {isEn ? 'Room' : 'Phòng trọ'}
              </span>
              {renderSingleBox(tier.room, '#E07B39', isEn ? 'Rental Room' : 'Phòng trọ', tier.status)}
              <span style={{ width: '50px', fontSize: '11px', textAlign: 'right', fontFamily: 'Manrope, sans-serif' }}>
                {tier.room ? `${tier.room.median}k` : '—'}
              </span>
            </div>

            {/* Apt Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '65px', fontSize: '11px', color: '#2E6F9E', fontWeight: 600 }}>
                {isEn ? 'Apt' : 'Căn hộ'}
              </span>
              {renderSingleBox(tier.apt, '#2E6F9E', isEn ? 'Apartment' : 'Căn hộ/Chung cư', tier.status)}
              <span style={{ width: '50px', fontSize: '11px', textAlign: 'right', fontFamily: 'Manrope, sans-serif' }}>
                {tier.apt ? `${tier.apt.median}k` : '—'}
              </span>
            </div>
          </div>
        ))}

        {/* Global Scale Line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '80px',
            paddingRight: '60px',
            fontSize: '10px',
            color: 'var(--muted, #64748b)',
            borderTop: '1px solid var(--line, #e2e8f0)',
            paddingTop: '6px'
          }}
        >
          <span>0</span>
          <span>{Math.round(maxAxis * 0.25)}k</span>
          <span>{Math.round(maxAxis * 0.5)}k</span>
          <span>{Math.round(maxAxis * 0.75)}k</span>
          <span>{maxAxis}k ({isEn ? 'VND/m²' : 'nghìn đ/m²'})</span>
        </div>
      </div>

      {/* Hover Detail Card - Fixed Height Info Bar (0px Layout Shift) */}
      <div className={`chart-info-bar ${hoveredItem ? 'active' : ''}`}>
        {hoveredItem ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div>
              <strong style={{ color: 'var(--ink)' }}>{translateStatus(hoveredItem.status)}</strong> —{' '}
              <span style={{ color: hoveredItem.category.includes('Phòng') || hoveredItem.category.includes('Room') ? '#E07B39' : '#2E6F9E', fontWeight: 600 }}>
                {hoveredItem.category}
              </span>{' '}
              <span style={{ color: 'var(--muted)' }}>({hoveredItem.stats.count} {isEn ? 'listings' : 'tin'}):</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span>Min: <strong style={{ color: 'var(--ink)' }}>{hoveredItem.stats.min}k</strong></span>
              <span>Q1: <strong style={{ color: 'var(--ink)' }}>{hoveredItem.stats.q1}k</strong></span>
              <span>Median: <strong style={{ color: 'var(--blue, #2E6F9E)' }}>{hoveredItem.stats.median}k</strong></span>
              <span>Q3: <strong style={{ color: 'var(--ink)' }}>{hoveredItem.stats.q3}k</strong></span>
              <span>Max: <strong style={{ color: 'var(--ink)' }}>{hoveredItem.stats.max}k</strong></span>
              <span>Mean: <strong style={{ color: 'var(--ink)' }}>{hoveredItem.stats.mean}k</strong></span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--muted, #64748b)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>
              {isEn
                ? 'Hover over any furnishing tier to view distribution stats (Min, Q1, Median, Q3, Max)...'
                : 'Rê chuột vào thanh phân vị từng mức nội thất để xem chi tiết (Min, Q1, Median, Q3, Max)...'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
