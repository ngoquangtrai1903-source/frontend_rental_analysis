'use client'

import React, { useState } from 'react'

interface WardBoxItem {
  wardName: string
  count: number
  min: number
  q1: number
  median: number
  q3: number
  max: number
}

interface WardPpm2BoxPlotProps {
  wards: WardBoxItem[]
  cityMedian: number
  lang?: 'vi' | 'en'
}

export default function WardPpm2BoxPlotChart({
  wards,
  cityMedian,
  lang = 'vi'
}: WardPpm2BoxPlotProps) {
  const isEn = lang === 'en'
  const [hoveredWard, setHoveredWard] = useState<WardBoxItem | null>(null)

  if (!wards || wards.length === 0) {
    return (
      <div className="chart-empty-state">
        {isEn ? 'No ward with ≥ 30 listings.' : 'Chưa có phường nào đạt ngưỡng ≥ 30 tin đăng.'}
      </div>
    )
  }

  // Calculate axis maximum
  const maxAxisVal = Math.max(350, Math.ceil((Math.max(...wards.map((w) => w.max)) * 1.1) / 50) * 50)
  const medianPct = (cityMedian / maxAxisVal) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Legend & Citywide Reference Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '16px',
          padding: '8px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              background: '#8FB8DE',
              border: '1px solid #4a7fa8',
              borderRadius: '2px',
              display: 'inline-block'
            }}
          />
          <span>{isEn ? 'Ward IQR Box (Q1 – Q3, Whiskers: Min – Max)' : 'Hộp IQR phường (Q1 – Q3, râu: Min – Max)'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '18px',
              borderTop: '2px dashed #ef4444',
              display: 'inline-block'
            }}
          />
          <span style={{ color: '#dc2626', fontWeight: 600 }}>
            {isEn ? 'Citywide Median:' : 'Median toàn thành phố:'} {cityMedian} {isEn ? 'k VND/m²' : 'nghìn đ/m²'}
          </span>
        </div>
      </div>

      {/* Boxplot Area */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '26px',
          paddingTop: '6px'
        }}
      >
        {/* Vertical Reference Line for Citywide Median */}
        <div
          style={{
            position: 'absolute',
            left: `calc(130px + (100% - 190px) * ${medianPct / 100})`,
            top: '0',
            bottom: '26px',
            width: '2px',
            borderLeft: '2px dashed #ef4444',
            zIndex: 3,
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-18px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '3px',
              whiteSpace: 'nowrap'
            }}
          >
            {cityMedian}k
          </span>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {wards.map((item) => {
            const leftWhiskerPct = (item.min / maxAxisVal) * 100
            const rightWhiskerPct = (item.max / maxAxisVal) * 100
            const q1Pct = (item.q1 / maxAxisVal) * 100
            const q3Pct = (item.q3 / maxAxisVal) * 100
            const medPct = (item.median / maxAxisVal) * 100

            const isHovered = hoveredWard?.wardName === item.wardName

            return (
              <div
                key={item.wardName}
                onMouseEnter={() => setHoveredWard(item)}
                onMouseLeave={() => setHoveredWard(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: isHovered ? 'var(--surface-subtle, #eff6ff)' : 'transparent',
                  boxShadow: isHovered ? '0 1px 4px rgba(37, 99, 235, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                {/* Ward Label */}
                <div
                  style={{
                    width: '120px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--ink, #1e293b)'
                  }}
                  title={item.wardName}
                >
                  {item.wardName}
                </div>

                {/* Track */}
                <div
                  style={{
                    flex: 1,
                    height: '24px',
                    position: 'relative',
                    background: 'var(--surface-subtle, #f1f5f9)',
                    borderRadius: '4px'
                  }}
                >
                  {/* Whisker Line (Min to Max) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftWhiskerPct}%`,
                      width: `${Math.max(0, rightWhiskerPct - leftWhiskerPct)}%`,
                      top: '50%',
                      height: '2px',
                      background: 'var(--muted, #475569)',
                      transform: 'translateY(-50%)'
                    }}
                  />
                  {/* Min Cap */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftWhiskerPct}%`,
                      top: '25%',
                      height: '50%',
                      width: '2px',
                      background: 'var(--muted, #475569)'
                    }}
                  />
                  {/* Max Cap */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${rightWhiskerPct}%`,
                      top: '25%',
                      height: '50%',
                      width: '2px',
                      background: 'var(--muted, #475569)'
                    }}
                  />

                  {/* Box (Q1 to Q3) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${q1Pct}%`,
                      width: `${Math.max(3, q3Pct - q1Pct)}%`,
                      top: '12%',
                      height: '76%',
                      background: '#8FB8DE',
                      border: '1.5px solid #2e6f9e',
                      borderRadius: '3px',
                      boxShadow: isHovered ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                      transition: 'transform 0.1s ease'
                    }}
                  />

                  {/* Median Line inside box */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${medPct}%`,
                      top: '8%',
                      height: '84%',
                      width: '2.5px',
                      background: 'var(--ink, #0f172a)',
                      zIndex: 2
                    }}
                  />
                </div>

                {/* Median Value Text */}
                <div
                  style={{
                    width: '65px',
                    fontSize: '11px',
                    textAlign: 'left',
                    color: 'var(--muted, #64748b)',
                    fontFamily: 'Manrope, sans-serif'
                  }}
                >
                  <strong style={{ color: '#2e6f9e' }}>{item.median}</strong> k
                  <span style={{ fontSize: '10px', display: 'block', color: '#94a3b8' }}>
                    n={item.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* X Axis Ticks */}
        <div
          style={{
            position: 'absolute',
            left: '138px',
            right: '77px',
            bottom: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--line, #cbd5e1)',
            paddingTop: '4px',
            fontSize: '10px',
            color: 'var(--muted, #64748b)'
          }}
        >
          <span>0</span>
          <span>{Math.round(maxAxisVal * 0.25)}k</span>
          <span>{Math.round(maxAxisVal * 0.5)}k</span>
          <span>{Math.round(maxAxisVal * 0.75)}k</span>
          <span>{maxAxisVal}k ({isEn ? 'VND/m²' : 'đ/m²'})</span>
        </div>
      </div>

      {/* Hover Card Detail - Stable Height to Prevent Layout Shift */}
      <div className={`chart-info-bar ${hoveredWard ? 'active' : ''}`}>
        {hoveredWard ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <strong style={{ color: 'var(--ink, #1e3a8a)', fontSize: '13px' }}>{hoveredWard.wardName}</strong>{' '}
              <span style={{ color: 'var(--muted, #64748b)' }}>({hoveredWard.count} {isEn ? 'listings' : 'tin đăng'})</span>:
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontFamily: "'Inter', sans-serif" }}>
              <span>Min: <strong style={{ color: 'var(--ink)' }}>{hoveredWard.min}k</strong></span>
              <span>Q1: <strong style={{ color: 'var(--ink)' }}>{hoveredWard.q1}k</strong></span>
              <span>Median: <strong style={{ color: 'var(--blue, #1d4ed8)', fontSize: '13px' }}>{hoveredWard.median}k</strong></span>
              <span>Q3: <strong style={{ color: 'var(--ink)' }}>{hoveredWard.q3}k</strong></span>
              <span>Max: <strong style={{ color: 'var(--ink)' }}>{hoveredWard.max}k</strong></span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--muted, #94a3b8)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>
              {isEn
                ? 'Hover over any ward row above to inspect detailed box plot statistics (Min, Q1, Median, Q3, Max).'
                : 'Rê chuột vào dòng từng phường để xem chi tiết các phân vị (Min, Q1, Trung vị, Q3, Max).'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
