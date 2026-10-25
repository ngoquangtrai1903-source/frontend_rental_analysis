'use client'

import { Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function DashboardCharts({ trend, distribution, total }: { trend: { period: string; count: number; avgPriceMillion: number }[]; distribution: { label: string; percentage: number }[]; total: number }) {
  const colors = ['#3078f0', '#53c39c', '#f19a52', '#8977df']
  const pie = distribution.map((item, index) => ({ ...item, value: item.percentage, fill: colors[index % colors.length] }))
  return <div className="main-grid">
    <div className="card trend-card"><div style={{ height: 250 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ top: 10, right: 18, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" /><XAxis dataKey="period" tick={{ fontSize: 10 }} /><YAxis yAxisId="left" tick={{ fontSize: 10 }} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} /><Tooltip /><Line yAxisId="left" type="monotone" dataKey="count" name="Tin đăng" stroke="#3078f0" strokeWidth={2.5} dot={false} /><Line yAxisId="right" type="monotone" dataKey="avgPriceMillion" name="Giá TB (triệu)" stroke="#f19a52" strokeWidth={2.5} strokeDasharray="5 4" dot={false} /></LineChart></ResponsiveContainer></div></div>
    <div className="card distribution-card"><div style={{ height: 250, position: 'relative' }}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip /><Pie data={pie} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="82%" paddingAngle={2} /></PieChart></ResponsiveContainer><div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><strong>{total.toLocaleString()}<br /><small>tin đăng</small></strong></div></div><div className="donut-legend">{pie.map((item) => <span key={item.label}><i style={{ background: item.fill }} />{item.label}: {item.percentage}%</span>)}</div></div>
  </div>
}
