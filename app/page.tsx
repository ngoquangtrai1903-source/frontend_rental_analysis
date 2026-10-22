'use client'

import { useState } from 'react'
import { Activity, BarChart3, Bell, ChevronDown, CircleHelp, Download, Filter, Home, LayoutDashboard, MapPin, Menu, MoreHorizontal, Search, Settings2, ShieldAlert, SlidersHorizontal, Sparkles, TrendingUp, Users, X } from 'lucide-react'

const navItems = [
  { label: 'Tổng quan', icon: LayoutDashboard },
  { label: 'Vị trí & khu vực', icon: MapPin },
  { label: 'Tiện ích', icon: Home },
  { label: 'Rủi ro ngập lụt', icon: ShieldAlert },
  { label: 'Phân tích nâng cao', icon: BarChart3 },
]

const wards = [
  { name: 'Hòa Cường Bắc', count: 342, price: '4.8 tr', change: '+12.4%', tone: 'blue' },
  { name: 'Mỹ An', count: 288, price: '5.2 tr', change: '+8.7%', tone: 'orange' },
  { name: 'Thạc Gián', count: 245, price: '4.1 tr', change: '+6.2%', tone: 'purple' },
  { name: 'An Hải Bắc', count: 212, price: '6.3 tr', change: '+4.8%', tone: 'green' },
]

const chartBars = [58, 73, 52, 86, 68, 91, 78, 65, 82, 70, 95, 88]
const activityRows = [
  ['Mỹ An', '2.5 - 4.0 tr', '18 - 28 m²', 'Thấp', 'Hôm nay'],
  ['Hòa Cường Bắc', '3.0 - 5.5 tr', '25 - 42 m²', 'Trung bình', 'Hôm nay'],
  ['An Hải Bắc', '4.5 - 8.0 tr', '35 - 60 m²', 'Thấp', 'Hôm qua'],
]

function formatNumber(value: string) { return value }

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Tổng quan')
  const [filterOpen, setFilterOpen] = useState(false)
  const [period, setPeriod] = useState('30 ngày qua')

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>Rent<span className="brand-accent">IQ</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-select"><div className="workspace-avatar">DN</div><div><strong>Da Nang Market</strong><small>Phân tích thị trường</small></div><ChevronDown size={15} /></div>
        <nav className="main-nav">
          {navItems.map((item) => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => setActiveNav(item.label)}><Icon size={18} /><span>{item.label}</span>{item.label === 'Rủi ro ngập lụt' && <span className="nav-dot" />}</button> })}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={18} /><span>Cài đặt</span></button><button className="nav-item"><CircleHelp size={18} /><span>Trợ giúp</span></button><div className="user-card"><div className="user-avatar">NT</div><div><strong>Nguyễn Trí</strong><small>Quản trị viên</small></div><MoreHorizontal size={17} /></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Sparkles size={16} /></div><strong>Rent<span className="brand-accent">IQ</span></strong></div><div className="breadcrumb"><span>Dashboard</span><span>/</span><strong>{activeNav}</strong></div><div className="top-actions"><div className="search-box"><Search size={16} /><input placeholder="Tìm kiếm dữ liệu..." /><kbd>⌘ K</kbd></div><button className="icon-button"><Bell size={18} /><i /></button><button className="top-avatar">NT</button><button className="mobile-menu"><Menu size={20} /></button></div></header>
        <div className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> LIVE DATA · CẬP NHẬT 5 PHÚT TRƯỚC</div><h1>Chào buổi sáng, Nguyễn Trí</h1><p>Đây là bức tranh tổng quan về thị trường cho thuê tại Đà Nẵng.</p></div><div className="heading-actions"><button className="button secondary"><Download size={16} /> Xuất báo cáo</button><button className="button primary" onClick={() => setFilterOpen(!filterOpen)}><Filter size={16} /> Bộ lọc <span className="filter-count">3</span></button></div></div>
          {filterOpen && <div className="filter-panel"><div><label>Khu vực</label><button className="select-button">Toàn thành phố <ChevronDown size={15} /></button></div><div><label>Khoảng giá</label><button className="select-button">0 — 15 triệu <ChevronDown size={15} /></button></div><div><label>Loại hình</label><button className="select-button">Tất cả loại hình <ChevronDown size={15} /></button></div><button className="clear-filter" onClick={() => setFilterOpen(false)}><X size={15} /> Đóng bộ lọc</button></div>}
          <div className="toolbar"><div className="tabs"><button className="tab active">Tổng quan</button><button className="tab">Thị trường</button><button className="tab">Nguồn cung</button></div><button className="period-select" onClick={() => setPeriod(period === '30 ngày qua' ? '90 ngày qua' : '30 ngày qua')}>{period}<ChevronDown size={15} /></button></div>
          <section className="kpi-grid"><Kpi icon={<Home size={18} />} label="Tổng số tin đăng" value="3,238" delta="+14.8%" note="so với tháng trước" tone="blue"/><Kpi icon={<TrendingUp size={18} />} label="Giá thuê trung bình" value="4.72 tr" delta="+6.2%" note="so với tháng trước" tone="orange"/><Kpi icon={<Activity size={18} />} label="Diện tích trung bình" value="32.6 m²" delta="+2.4%" note="so với tháng trước" tone="purple"/><Kpi icon={<ShieldAlert size={18} />} label="Điểm rủi ro ngập" value="Thấp" delta="-8.1%" note="cải thiện so với tháng trước" tone="green"/></section>
          <section className="main-grid"><div className="card trend-card"><CardHeader title="Xu hướng thị trường" subtitle="Số lượng tin đăng & giá thuê trung bình" action="Xem chi tiết"/><div className="chart-legend"><span><i className="legend-blue" /> Tin đăng mới</span><span><i className="legend-orange" /> Giá trung bình</span></div><div className="chart-area"><div className="y-labels"><span>6 tr</span><span>4 tr</span><span>2 tr</span><span>0</span></div><div className="line-chart"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 700 190" preserveAspectRatio="none"><path d="M0 140 C45 128 62 145 104 112 S166 130 208 92 S275 114 314 78 S370 104 414 69 S476 82 518 55 S579 74 620 34 S672 48 700 18" fill="none" stroke="#3078f0" strokeWidth="3"/><path d="M0 168 C52 158 66 160 108 145 S164 152 208 128 S270 139 316 121 S374 130 415 104 S476 115 520 97 S579 104 620 78 S674 88 700 67" fill="none" stroke="#f19a52" strokeWidth="3" strokeDasharray="6 5"/></svg><div className="x-labels"><span>T5</span><span>T6</span><span>T7</span><span>T8</span><span>T9</span><span>T10</span><span>T11</span></div></div></div></div><div className="card distribution-card"><CardHeader title="Phân bố giá thuê" subtitle="Theo khoảng giá / tháng" action=""/><div className="donut-wrap"><div className="donut"><div className="donut-hole"><strong>3,238</strong><span>tin đăng</span></div></div><div className="donut-legend"><Legend color="#3078f0" label="2 – 4 triệu" value="42%"/><Legend color="#53c39c" label="4 – 6 triệu" value="31%"/><Legend color="#f19a52" label="6 – 10 triệu" value="18%"/><Legend color="#e5e9f1" label="Khác" value="9%"/></div></div><div className="insight"><Sparkles size={16}/><span><strong>Insight:</strong> Phân khúc 2–4 triệu chiếm tỷ trọng cao nhất.</span></div></div></section>
          <section className="bottom-grid"><div className="card area-card"><CardHeader title="Nguồn cung theo khu vực" subtitle="Top khu vực có nhiều tin đăng nhất" action="Xem tất cả"/><div className="ward-list">{wards.map((ward, index) => <div className="ward-row" key={ward.name}><span className="rank">0{index + 1}</span><div className={`ward-icon ${ward.tone}`}><MapPin size={15}/></div><div className="ward-name"><strong>{ward.name}</strong><small>{ward.count} tin đăng</small></div><div className="ward-bar"><span style={{width: `${Math.max(46, 100 - index * 14)}%`}} /></div><div className="ward-price"><strong>{ward.price}</strong><small>{ward.change} <TrendingUp size={11}/></small></div></div>)}</div></div><div className="card activity-card"><CardHeader title="Hoạt động gần đây" subtitle="Cập nhật từ dữ liệu thị trường" action=""/><div className="activity-table"><div className="table-head"><span>KHU VỰC</span><span>GIÁ THUÊ</span><span>DIỆN TÍCH</span><span>RỦI RO</span><span>THỜI GIAN</span></div>{activityRows.map((row) => <div className="table-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span>{row[2]}</span><span className={`risk ${row[3] === 'Thấp' ? 'low' : 'medium'}`}>{row[3]}</span><small>{row[4]}</small></div>)}</div><button className="view-all">Xem toàn bộ hoạt động <span>→</span></button></div></section>
        </div>
      </section>
    </main>
  )
}

function Kpi({ icon, label, value, delta, note, tone }: { icon: React.ReactNode, label: string, value: string, delta: string, note: string, tone: string }) { return <div className="card kpi-card"><div className={`kpi-icon ${tone}`}>{icon}</div><div className="kpi-label">{label}<MoreHorizontal size={16}/></div><div className="kpi-value">{value}</div><div className="kpi-foot"><span className={delta.startsWith('-') ? 'negative' : 'positive'}>{delta}</span><span>{note}</span></div></div> }
function CardHeader({ title, subtitle, action }: { title: string, subtitle: string, action: string }) { return <div className="card-header"><div><h2>{title}</h2><p>{subtitle}</p></div>{action && <button className="card-action">{action} <span>→</span></button>}</div> }
function Legend({ color, label, value }: { color: string, label: string, value: string }) { return <div className="legend-item"><i style={{background: color}} /><span>{label}</span><strong>{value}</strong></div> }
