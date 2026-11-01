'use client'

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface TrendPoint {
  period: string
  count: number
  avgPriceMillion: number
}

interface PriceSegment {
  label: string
  percentage: number
}

interface DashboardChartsProps {
  trend: TrendPoint[]
  distribution: PriceSegment[]
  total: number
  lang?: 'vi' | 'en'
}

const COLORS = ['#3078f0', '#53c39c', '#f19a52', '#8977df']

function translateDistributionLabel(label: string, isEn: boolean): string {
  if (!isEn) return label
  if (label.includes('Dưới')) return label.replace('Dưới', 'Under ').replace('triệu', 'M')
  if (label.includes('Trên')) return label.replace('Trên', 'Over ').replace('triệu', 'M')
  return label.replace('triệu', 'M')
}

export default function DashboardCharts({ trend, distribution, total, lang = 'vi' }: DashboardChartsProps) {
  const isEn = lang === 'en'
  const trendTickInterval = Math.max(0, Math.ceil(trend.length / 8) - 1)
  const pie = distribution.map((item, index) => ({
    ...item,
    label: translateDistributionLabel(item.label, isEn),
    originalLabel: item.label,
    value: item.percentage,
    color: COLORS[index % COLORS.length]
  }))
  const hasDistribution = total > 0 && pie.some((item) => item.percentage > 0)

  return (
    <section className="main-grid" aria-label={isEn ? 'Overview Charts' : 'Biểu đồ tổng quan'}>
      <div className="card trend-card">
        <div className="card-header">
          <div>
            <h2>{isEn ? 'Temporal Trends & Cycles' : 'Xu hướng theo chu kỳ thời gian'}</h2>
            <p>{isEn ? 'Listing volume and average monthly rental rates' : 'Số lượng tin đăng và giá thuê trung bình'}</p>
          </div>
        </div>
        <div className="chart-legend" aria-label={isEn ? 'Chart Legend' : 'Chú giải biểu đồ'}>
          <span><i className="legend-blue" /> {isEn ? 'Listings' : 'Tin đăng'}</span>
          <span><i className="legend-orange" /> {isEn ? 'Avg Rent (M VND)' : 'Giá TB (triệu VNĐ)'}</span>
        </div>
        <div className="chart-frame">
          {trend.length > 0 && total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis
                  dataKey="period"
                  interval={trendTickInterval}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(period: string) => {
                    const [year, month] = period.split('-')
                    return year && month ? `${month}/${year.slice(-2)}` : period
                  }}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    typeof value === 'number' ? value.toLocaleString(isEn ? 'en-US' : 'vi-VN') : value,
                    name
                  ]}
                  labelFormatter={(label) => `${isEn ? 'Period:' : 'Thời gian:'} ${label}`}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px'
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name={isEn ? 'Listings' : 'Tin đăng'}
                  stroke="#3078f0"
                  strokeWidth={2.5}
                  dot={trend.length === 1 ? { r: 4 } : false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPriceMillion"
                  name={isEn ? 'Avg Rent (M)' : 'Giá TB (triệu)'}
                  stroke="#f19a52"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={trend.length === 1 ? { r: 4 } : false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty" role="status">
              {isEn ? 'No data available in the selected period.' : 'Không có dữ liệu trong khoảng thời gian đã chọn.'}
            </div>
          )}
        </div>
      </div>

      <div className="card distribution-card">
        <div className="card-header">
          <div>
            <h2>{isEn ? 'Price Range Distribution' : 'Phân bố khoảng giá'}</h2>
            <p>{isEn ? 'Listing market share by price tier' : 'Tỷ trọng tin đăng theo phân khúc'}</p>
          </div>
        </div>
        <div className="distribution-content">
          <div className="chart-frame distribution-chart">
            {hasDistribution ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: any) => [`${value}%`, isEn ? 'Share' : 'Tỷ trọng']}
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        fontSize: '12px'
                      }}
                    />
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="label"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                    >
                      {pie.map((item) => (
                        <Cell key={item.label} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-center" aria-label={`${total.toLocaleString()} ${isEn ? 'listings' : 'tin đăng'}`}>
                  <strong>{total.toLocaleString()}</strong>
                  <small>{isEn ? 'listings' : 'tin đăng'}</small>
                </div>
              </>
            ) : (
              <div className="chart-empty" role="status">
                {isEn ? 'Insufficient data to classify price tiers.' : 'Chưa đủ dữ liệu để phân loại khoảng giá.'}
              </div>
            )}
          </div>
          {hasDistribution && (
            <div className="donut-legend">
              {pie.map((item) => (
                <span key={item.label}>
                  <i style={{ background: item.color }} />
                  {item.label}: {item.percentage}%
                </span>
              ))}
            </div>
          )}
        </div>
        {hasDistribution && pie[0] && (
          <p className="chart-insight">
            {isEn
              ? `${pie[0].label} tier accounts for ${pie[0].percentage}% of filtered listings.`
              : `Phân khúc ${pie[0].label} chiếm ${pie[0].percentage}% lượng tin đăng sau khi lọc.`}
          </p>
        )}
      </div>
    </section>
  )
}
