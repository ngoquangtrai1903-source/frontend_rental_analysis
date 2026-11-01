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

      <div style={{ flex: 1, minHeight: '340px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
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
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(val: any, name: any) => [
                name === (isEn ? 'Size' : 'Diện tích')
                  ? `${val} m²`
                  : `${val} ${isEn ? 'M VND/mo' : 'triệu/tháng'}`,
                name
              ]}
              labelFormatter={(_, payload) => (payload && payload[0]?.payload?.ward ? payload[0].payload.ward : '')}
              contentStyle={{
                background: 'var(--surface-card, #ffffff)',
                borderColor: 'var(--line, #e2e8f0)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
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
