'use client'

import React from 'react'
import {
  ComposedChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface HistPriceByCategoryProps {
  data: {
    room: { count: number; mean: number; median: number; color: string }
    apt: { count: number; mean: number; median: number; color: string }
    bins: Array<{
      range: string
      binStart: number
      binEnd: number
      binMid: number
      roomCount: number
      aptCount: number
      roomDensity: number
      aptDensity: number
    }>
  }
  lang?: 'vi' | 'en'
}

export default function HistPriceByCategoryChart({ data, lang = 'vi' }: HistPriceByCategoryProps) {
  const isEn = lang === 'en'
  const { room, apt, bins } = data

  const maxVal = Math.max(0, ...bins.map((b) => Math.max(b.roomCount, b.aptCount)))
  if (maxVal === 0) {
    return (
      <div className="chart-empty-state">
        {isEn ? 'Insufficient price distribution data.' : 'Chưa đủ dữ liệu phân phối giá thuê.'}
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const b = payload[0]?.payload
    if (!b) return null

    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          fontSize: '12px',
          fontFamily: "'Inter', sans-serif",
          minWidth: '190px'
        }}
      >
        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
          {isEn ? 'Price Range:' : 'Khoảng giá:'} {b.binStart.toFixed(1)} – {b.binEnd.toFixed(1)} {isEn ? 'M VND/mo' : 'triệu/tháng'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: room.color }} />
              {isEn ? 'Rental Room:' : 'Phòng trọ:'}
            </span>
            <strong style={{ color: room.color }}>
              {b.roomCount.toLocaleString()} {isEn ? 'listings' : 'tin'}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: apt.color }} />
              {isEn ? 'Apartment:' : 'Căn hộ:'}
            </span>
            <strong style={{ color: apt.color }}>
              {b.aptCount.toLocaleString()} {isEn ? 'listings' : 'tin'}
            </strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-chart-frame-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Legend & Stats Badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          padding: '10px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Room Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: room.color,
                display: 'inline-block'
              }}
            />
            <strong>{isEn ? 'Rental Room' : 'Phòng trọ'}</strong>
            <span style={{ color: 'var(--muted, #64748b)' }}>(n = {room.count.toLocaleString()})</span>
            <span style={{ marginLeft: '4px', fontSize: '11px', color: room.color }}>
              Median: <strong>{room.median}{isEn ? 'M' : 'tr'}</strong> | Mean: <strong>{room.mean}{isEn ? 'M' : 'tr'}</strong>
            </span>
          </div>

          <span style={{ color: '#cbd5e1' }}>•</span>

          {/* Apartment Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: apt.color,
                display: 'inline-block'
              }}
            />
            <strong>{isEn ? 'Apartment' : 'Căn hộ/Chung cư'}</strong>
            <span style={{ color: 'var(--muted, #64748b)' }}>(n = {apt.count.toLocaleString()})</span>
            <span style={{ marginLeft: '4px', fontSize: '11px', color: apt.color }}>
              Median: <strong>{apt.median}{isEn ? 'M' : 'tr'}</strong> | Mean: <strong>{apt.mean}{isEn ? 'M' : 'tr'}</strong>
            </span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
          <span style={{ borderBottom: '2px solid #64748b', marginRight: '6px' }}>—</span> {isEn ? 'Solid = Median' : 'Đường liền = Median'}
          <span style={{ borderBottom: '2px dashed #64748b', margin: '0 6px 0 10px' }}>---</span> {isEn ? 'Dashed = Mean' : 'Đường đứt = Mean'}
        </div>
      </div>

      <div style={{ minHeight: '340px', width: '100%' }}>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={bins} margin={{ top: 16, right: 24, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line, #e2e8f0)" />
            <XAxis
              dataKey="binStart"
              unit={isEn ? ' M' : ' tr'}
              tick={{ fontSize: 10, fill: 'var(--chart-text-secondary, #64748b)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--line, #e2e8f0)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--chart-text-secondary, #64748b)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
              content={<CustomTooltip />}
            />

            {/* Room Density / Count Bar */}
            <Bar
              dataKey="roomCount"
              name="roomCount"
              fill={room.color}
              fillOpacity={0.65}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />

            {/* Apt Density / Count Bar */}
            <Bar
              dataKey="aptCount"
              name="aptCount"
              fill={apt.color}
              fillOpacity={0.65}
              radius={[3, 3, 0, 0]}
              maxBarSize={16}
            />

            {/* Room Median (solid) and Mean (dashed) */}
            <ReferenceLine
              x={room.median}
              stroke={room.color}
              strokeWidth={2.5}
              label={{
                value: isEn ? `Room Med ${room.median}M` : `Trọ Med ${room.median}tr`,
                position: 'top',
                fill: room.color,
                fontSize: 10,
                fontWeight: 700
              }}
            />
            <ReferenceLine
              x={room.mean}
              stroke={room.color}
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: isEn ? `Room Mean ${room.mean}M` : `Trọ Mean ${room.mean}tr`,
                position: 'insideTopLeft',
                fill: room.color,
                fontSize: 9
              }}
            />

            {/* Apt Median (solid) and Mean (dashed) */}
            <ReferenceLine
              x={apt.median}
              stroke={apt.color}
              strokeWidth={2.5}
              label={{
                value: isEn ? `Apt Med ${apt.median}M` : `Căn hộ Med ${apt.median}tr`,
                position: 'top',
                fill: apt.color,
                fontSize: 10,
                fontWeight: 700
              }}
            />
            <ReferenceLine
              x={apt.mean}
              stroke={apt.color}
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: isEn ? `Apt Mean ${apt.mean}M` : `Căn hộ Mean ${apt.mean}tr`,
                position: 'insideTopRight',
                fill: apt.color,
                fontSize: 9
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
