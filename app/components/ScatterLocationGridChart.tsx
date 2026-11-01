'use client'

import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { LocationScatterItem } from '@/lib/presentationAnalyticsService'

interface ScatterLocationGridProps {
  data: {
    cbd: LocationScatterItem
    beach: LocationScatterItem
    airport: LocationScatterItem
    uni: LocationScatterItem
  }
  lang?: 'vi' | 'en'
}

export default function ScatterLocationGridChart({
  data,
  lang = 'vi'
}: ScatterLocationGridProps) {
  const isEn = lang === 'en'
  const items = [data.cbd, data.beach, data.airport, data.uni]

  const renderSubChart = (item: LocationScatterItem) => {
    // Generate regression line points from xMin to xMax
    const regLine = [
      { x: item.xMin, regVal: Math.max(0, item.slope * item.xMin + item.intercept) },
      { x: item.xMax, regVal: Math.max(0, item.slope * item.xMax + item.intercept) }
    ]

    const roomPoints = item.points.filter((p) => p.category.includes('Phòng'))
    const aptPoints = item.points.filter((p) => p.category.includes('Căn hộ'))

    const LocationTooltip = ({ active, payload }: any) => {
      if (!active || !payload || !payload.length) return null
      const pt = payload[0]?.payload
      if (!pt) return null

      const name = payload[0]?.name || ''
      const isTrendline = name.includes('Trendline') || name.includes('Hồi quy')
      if (isTrendline) {
        return (
          <div className="chart-custom-tooltip" style={{ padding: '6px 10px', fontSize: '11px' }}>
            <div style={{ fontWeight: 600, color: 'var(--ink, #0f172a)', marginBottom: '2px' }}>
              {isEn ? 'Linear Regression' : 'Đường hồi quy'}
            </div>
            <div style={{ color: 'var(--muted, #475569)' }}>
              {isEn ? item.titleEn || item.title : item.title}: <strong style={{ color: 'var(--ink)' }}>{Number(pt.x).toFixed(1)} km</strong> → <strong style={{ color: 'var(--ink)' }}>{Number(pt.regVal).toFixed(0)} {isEn ? 'k/m²' : 'nghìn/m²'}</strong>
            </div>
          </div>
        )
      }

      const isRoom = name.includes('Room') || name.includes('Phòng')
      const color = isRoom ? '#E07B39' : '#2E6F9E'
      const catTitle = isRoom ? (isEn ? 'Rental Room' : 'Phòng trọ') : (isEn ? 'Apartment' : 'Căn hộ/Chung cư')

      return (
        <div className="chart-custom-tooltip" style={{ padding: '8px 12px', fontSize: '11.5px', minWidth: '155px' }}>
          <div style={{ fontWeight: 700, color, marginBottom: '4px', borderBottom: '1px solid var(--line, #f1f5f9)', paddingBottom: '3px' }}>
            {catTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: 'var(--muted, #64748b)' }}>{isEn ? item.titleEn || item.title : item.title}:</span>
              <strong style={{ color: 'var(--ink, #0f172a)' }}>{Number(pt.x).toFixed(1)} km</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ color: 'var(--muted, #64748b)' }}>{isEn ? 'Unit Rent:' : 'Đơn giá:'}</span>
              <strong style={{ color: 'var(--ink, #0f172a)' }}>{Number(pt.y).toFixed(1)} {isEn ? 'k VND/m²' : 'nghìn/m²'}</strong>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={item.key}
        style={{
          border: '1px solid var(--line, #e2e8f0)',
          borderRadius: '10px',
          padding: '14px',
          background: 'var(--surface-card, #ffffff)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sub-chart Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink, #1e293b)' }}>
            {isEn ? item.titleEn : item.title}
          </span>
          <span className={`location-r-badge ${Math.abs(item.r) >= 0.25 ? 'high' : 'normal'}`}>
            r = {item.r.toFixed(2)}
          </span>
        </div>

        {/* Chart Frame */}
        <div style={{ width: '100%', minHeight: '220px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 8, right: 12, bottom: 12, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line, #e2e8f0)" />
              <XAxis
                type="number"
                dataKey="x"
                name={isEn ? 'Distance' : 'Khoảng cách'}
                unit=" km"
                domain={[0, item.xMax]}
                tick={{ fontSize: 9, fill: 'var(--chart-text-secondary, #64748b)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--line, #e2e8f0)' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={isEn ? 'Unit Price' : 'Giá/m²'}
                unit=" k"
                tick={{ fontSize: 9, fill: 'var(--chart-text-secondary, #64748b)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
                content={<LocationTooltip />}
              />

              {/* Room Points */}
              <Scatter
                name={isEn ? 'Rental Room' : 'Phòng trọ'}
                data={roomPoints}
                fill="#E07B39"
                fillOpacity={0.35}
              />

              {/* Apt Points */}
              <Scatter
                name={isEn ? 'Apartment' : 'Căn hộ/Chung cư'}
                data={aptPoints}
                fill="#2E6F9E"
                fillOpacity={0.35}
              />

              {/* Black Trend Line */}
              <Scatter
                name={isEn ? 'Trendline' : 'Hồi quy'}
                data={regLine}
                line={{ stroke: '#0f172a', strokeWidth: 2 }}
                shape={() => <></>}
                legendType="line"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
          padding: '8px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E07B39' }} />
            <span>{isEn ? 'Rental Room' : 'Phòng trọ'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2E6F9E' }} />
            <span>{isEn ? 'Apartment' : 'Căn hộ/Chung cư'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '2px', background: '#0f172a' }} />
            <span>{isEn ? 'Linear Regression' : 'Đường hồi quy tuyến tính'}</span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
          {isEn ? 'Filtered: dist < 99th percentile' : 'Đã lọc loại bỏ ngoại lệ < 99% quantile'}
        </div>
      </div>

      {/* 2x2 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >
        {items.map(renderSubChart)}
      </div>
    </div>
  )
}
