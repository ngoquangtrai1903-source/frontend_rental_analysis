'use client'

import React from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line
} from 'recharts'

interface ScatterSizePriceProps {
  data: {
    room: {
      count: number
      r: number
      slope: number
      intercept: number
      color: string
      points: Array<{ x: number; y: number; ward: string }>
    }
    apt: {
      count: number
      r: number
      slope: number
      intercept: number
      color: string
      points: Array<{ x: number; y: number; ward: string }>
    }
  }
  lang?: 'vi' | 'en'
}

export default function ScatterSizePriceChart({ data, lang = 'vi' }: ScatterSizePriceProps) {
  const isEn = lang === 'en'
  const { room, apt } = data

  // Generate regression line points for x from 0 to 150
  const roomLine = [
    { x: 10, regRoom: Math.max(0, room.slope * 10 + room.intercept) },
    { x: 120, regRoom: Math.min(40, room.slope * 120 + room.intercept) }
  ]

  const aptLine = [
    { x: 15, regApt: Math.max(0, apt.slope * 15 + apt.intercept) },
    { x: 140, regApt: Math.min(40, apt.slope * 140 + apt.intercept) }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt = payload[0]?.payload
    if (!pt) return null

    const name = payload[0]?.name || ''
    const isRoomTrend = name.includes('Room Trendline') || name.includes('Hồi quy Phòng trọ')
    const isAptTrend = name.includes('Apartment Trendline') || name.includes('Hồi quy Căn hộ')

    if (isRoomTrend || isAptTrend) {
      const isRoom = isRoomTrend
      return (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            fontSize: '11.5px',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <div style={{ fontWeight: 700, color: isRoom ? room.color : apt.color, marginBottom: '2px' }}>
            {name}
          </div>
          <div style={{ color: '#475569' }}>
            {isEn ? 'Regression model:' : 'Hồi quy tuyến tính:'}{' '}
            <strong>{isRoom ? `y = ${room.slope.toFixed(2)}x + ${room.intercept.toFixed(1)}` : `y = ${apt.slope.toFixed(2)}x + ${apt.intercept.toFixed(1)}`}</strong>
          </div>
        </div>
      )
    }

    const isRoom = name.includes('Room') || name.includes('Phòng')
    const color = isRoom ? room.color : apt.color
    const categoryTitle = isRoom ? (isEn ? 'Rental Room' : 'Phòng trọ') : (isEn ? 'Apartment' : 'Căn hộ/Chung cư')
    const unitPrice = pt.x > 0 ? ((pt.y * 1000) / pt.x).toFixed(1) : '—'

    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
          fontFamily: "'Inter', sans-serif",
          minWidth: '180px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '6px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '4px'
          }}
        >
          <strong style={{ color }}>{categoryTitle}</strong>
          {pt.ward && (
            <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
              {pt.ward}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ color: '#64748b' }}>{isEn ? 'Rent Price:' : 'Giá thuê:'}</span>
            <strong style={{ color: '#0f172a' }}>{pt.y} {isEn ? 'M VND/mo' : 'triệu/tháng'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ color: '#64748b' }}>{isEn ? 'Area:' : 'Diện tích:'}</span>
            <strong style={{ color: '#0f172a' }}>{pt.x} m²</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderTop: '1px dashed #f1f5f9', paddingTop: '3px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>{isEn ? 'Unit Price:' : 'Đơn giá:'}</span>
            <span style={{ color: '#475569', fontSize: '11px', fontWeight: 600 }}>{unitPrice} {isEn ? 'k VND/m²' : 'nghìn/m²'}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Correlation summary badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '12px',
          padding: '10px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Room correlation tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: room.color,
                display: 'inline-block'
              }}
            />
            <span>{isEn ? 'Rental Room:' : 'Phòng trọ:'}</span>
            <strong style={{ color: room.color, fontSize: '13px' }}>r = {room.r.toFixed(2)}</strong>
            <span style={{ color: 'var(--muted, #64748b)', fontSize: '11px' }}>
              (y = {room.slope.toFixed(2)}x {room.intercept >= 0 ? '+' : ''} {room.intercept.toFixed(1)})
            </span>
          </div>

          <span style={{ color: '#cbd5e1' }}>•</span>

          {/* Apt correlation tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: apt.color,
                display: 'inline-block'
              }}
            />
            <span>{isEn ? 'Apartment:' : 'Căn hộ/Chung cư:'}</span>
            <strong style={{ color: apt.color, fontSize: '13px' }}>r = {apt.r.toFixed(2)}</strong>
            <span style={{ color: 'var(--muted, #64748b)', fontSize: '11px' }}>
              (y = {apt.slope.toFixed(2)}x {apt.intercept >= 0 ? '+' : ''} {apt.intercept.toFixed(1)})
            </span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
          {isEn ? 'Limits: Size ≤ 150 m², Rent ≤ 40M' : 'Giới hạn: Diện tích ≤ 150 m², Giá ≤ 40 tr/tháng'}
        </div>
      </div>

      <div style={{ minHeight: '340px', width: '100%' }}>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line, #e2e8f0)" />
            <XAxis
              type="number"
              dataKey="x"
              name={isEn ? 'Size' : 'Diện tích'}
              unit=" m²"
              domain={[0, 150]}
              tick={{ fontSize: 10, fill: 'var(--chart-text-secondary, #64748b)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--line, #e2e8f0)' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={isEn ? 'Rent' : 'Giá thuê'}
              unit={isEn ? ' M' : ' tr'}
              domain={[0, 40]}
              tick={{ fontSize: 10, fill: 'var(--chart-text-secondary, #64748b)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
              content={<CustomTooltip />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
            />

            {/* Room Scatter Points */}
            <Scatter
              name={isEn ? 'Rental Room' : 'Phòng trọ'}
              data={room.points}
              fill={room.color}
              fillOpacity={0.45}
            />

            {/* Apt Scatter Points */}
            <Scatter
              name={isEn ? 'Apartment' : 'Căn hộ/Chung cư'}
              data={apt.points}
              fill={apt.color}
              fillOpacity={0.45}
            />

            {/* Room Regression Line */}
            <Scatter
              name={isEn ? 'Room Trendline' : 'Hồi quy Phòng trọ'}
              data={roomLine}
              line={{ stroke: room.color, strokeWidth: 2.5 }}
              shape={() => <></>}
              legendType="line"
            />

            {/* Apt Regression Line */}
            <Scatter
              name={isEn ? 'Apartment Trendline' : 'Hồi quy Căn hộ'}
              data={aptLine}
              line={{ stroke: apt.color, strokeWidth: 2.5 }}
              shape={() => <></>}
              legendType="line"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
