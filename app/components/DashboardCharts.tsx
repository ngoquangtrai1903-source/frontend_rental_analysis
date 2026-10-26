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
}

const COLORS = ['#3078f0', '#53c39c', '#f19a52', '#8977df']

export default function DashboardCharts({ trend, distribution, total }: DashboardChartsProps) {
  const trendTickInterval = Math.max(0, Math.ceil(trend.length / 8) - 1)
  const pie = distribution.map((item, index) => ({
    ...item,
    value: item.percentage,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <section className="main-grid" aria-label="Biểu đồ tổng quan">
      <div className="card trend-card">
        <div className="card-header">
          <div>
            <h2>Xu hướng theo chu kỳ thời gian</h2>
            <p>Số lượng tin đăng và giá thuê trung bình</p>
          </div>
        </div>
        <div className="chart-legend" aria-label="Chú giải biểu đồ">
          <span><i className="legend-blue" /> Tin đăng</span>
          <span><i className="legend-orange" /> Giá TB (triệu VNĐ)</span>
        </div>
        <div className="chart-frame">
          {trend.length > 0 ? (
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
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  name="Tin đăng"
                  stroke="#3078f0"
                  strokeWidth={2.5}
                  dot={trend.length === 1 ? { r: 4 } : false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPriceMillion"
                  name="Giá TB (triệu)"
                  stroke="#f19a52"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={trend.length === 1 ? { r: 4 } : false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty" role="status">
              Không có dữ liệu trong khoảng thời gian đã chọn.
            </div>
          )}
        </div>
      </div>

      <div className="card distribution-card">
        <div className="card-header">
          <div>
            <h2>Phân bố khoảng giá</h2>
            <p>Tỷ trọng tin đăng theo phân khúc</p>
          </div>
        </div>
        <div className="distribution-content">
          <div className="chart-frame distribution-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
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
            <div className="chart-center" aria-label={`${total.toLocaleString()} tin đăng`}>
              <strong>{total.toLocaleString()}</strong>
              <small>tin đăng</small>
            </div>
          </div>
          <div className="donut-legend">
            {pie.map((item) => (
              <span key={item.label}>
                <i style={{ background: item.color }} />
                {item.label}: {item.percentage}%
              </span>
            ))}
          </div>
        </div>
        {pie[0] && (
          <p className="chart-insight">
            Phân khúc {pie[0].label} chiếm {pie[0].percentage}% lượng tin đăng sau khi lọc.
          </p>
        )}
      </div>
    </section>
  )
}
