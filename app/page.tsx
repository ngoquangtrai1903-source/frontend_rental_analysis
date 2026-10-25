'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import AmenitiesView from './components/AmenitiesView'
import FloodRiskView from './components/FloodRiskView'
import AdvancedAnalyticsView from './components/AdvancedAnalyticsView'
import DashboardCharts from './components/DashboardCharts'
import { useFilterStore } from './store/filterStore'

const LocationMapView = dynamic(() => import('./components/LocationMapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '650px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid var(--line)',
      gap: '12px'
    }}>
      <div className="pulse-spinner" style={{ width: '28px', height: '28px' }} />
      <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
        Đang khởi tạo bản đồ GIS Đà Nẵng...
      </span>
    </div>
  )
})
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Filter,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
  LogIn,
  LogOut
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Tổng quan', icon: LayoutDashboard },
  { label: 'Vị trí & khu vực', icon: MapPin },
  { label: 'Tiện ích', icon: Home },
  { label: 'Rủi ro ngập lụt', icon: ShieldAlert },
  { label: 'Phân tích nâng cao', icon: BarChart3 }
]

const WARDS_OPTIONS = [
  'Hải Châu',
  'Thanh Khê',
  'Sơn Trà',
  'Ngũ Hành Sơn',
  'Liên Chiểu',
  'Cẩm Lệ',
  'Hòa Cường',
  'Hòa Khánh',
  'Hòa Xuân',
  'An Hải',
  'An Khê',
  'Hải Vân'
]

const CATEGORY_OPTIONS = [
  'Căn hộ/Chung cư',
  'Phòng trọ'
]

const FURNISHING_OPTIONS = [
  'Đầy đủ nội thất',
  'Nội thất cao cấp',
  'Nội thất cơ bản',
  'Không nội thất'
]

interface WardData {
  name: string
  count: number
  avgPrice: number
}

interface PriceDistribution {
  label: string
  count: number
  percentage: number
}

interface TrendPoint {
  period: string
  count: number
  avgPriceMillion: number
}

interface RentalRecord {
  source: string
  list_id: string
  posted_date: string | null
  price_vnd: number | null
  size_m2: number | null
  ward_name: string | null
  category_name: string | null
  furnishing_status: string | null
  flood_risk_label: number | null
  price_per_m2_vnd: number | null
}

interface KpiData {
  total_listings: number
  avg_price_million: number
  avg_size_m2: number
  flood_risk_low_percentage: number
  apartment_percentage: number
  room_percentage: number
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('Tổng quan')
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Tổng quan')
  const [darkMode, setDarkMode] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    void supabase.auth.getUser().then(({ data }) => { if (mounted) setUserEmail(data.user?.email ?? null) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUserEmail(session?.user?.email ?? null)
    })
    return () => { mounted = false; listener.subscription.unsubscribe() }
  }, [])

  const signInWithGoogle = async () => {
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) { setErrorMessage(`Không thể đăng nhập Google: ${error.message}`); setAuthLoading(false) }
  }

  const signOut = async () => { await supabase.auth.signOut(); setAccountMenuOpen(false) }

  // Filter States (BĐS Domain Standards)
  const filterStore = useFilterStore()
  const { wardFilter, categoryFilter, furnishingFilter, priceRangeFilter, sizeRangeFilter, proximityFilter, floodRiskFilter, reqElevator, reqBalcony, reqPrivateBath, reqParking, searchInput, searchQuery, setFilter } = filterStore
  const setWardFilter = (value: string) => setFilter('wardFilter', value)
  const setCategoryFilter = (value: string) => setFilter('categoryFilter', value)
  const setFurnishingFilter = (value: string) => setFilter('furnishingFilter', value)
  const setPriceRangeFilter = (value: string) => setFilter('priceRangeFilter', value)
  const setSizeRangeFilter = (value: string) => setFilter('sizeRangeFilter', value)
  const setProximityFilter = (value: string) => setFilter('proximityFilter', value)
  const setFloodRiskFilter = (value: string) => setFilter('floodRiskFilter', value)
  const setReqElevator = (value: boolean) => setFilter('reqElevator', value)
  const setReqBalcony = (value: boolean) => setFilter('reqBalcony', value)
  const setReqPrivateBath = (value: boolean) => setFilter('reqPrivateBath', value)
  const setReqParking = (value: boolean) => setFilter('reqParking', value)
  const setSearchInput = (value: string) => setFilter('searchInput', value)
  const setSearchQuery = (value: string) => setFilter('searchQuery', value)

  // Pagination & Sorting States
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('posted_date')
  const [ascending, setAscending] = useState(false)

  // Dashboard Data States
  const [kpiData, setKpiData] = useState<KpiData | null>(null)
  const [wards, setWards] = useState<WardData[]>([])
  const [priceDistribution, setPriceDistribution] = useState<PriceDistribution[]>([])
  const [trendData, setTrendData] = useState<TrendPoint[]>([])
  const [records, setRecords] = useState<RentalRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (wardFilter) count++
    if (categoryFilter) count++
    if (furnishingFilter) count++
    if (priceRangeFilter) count++
    if (sizeRangeFilter) count++
    if (proximityFilter) count++
    if (floodRiskFilter) count++
    if (reqElevator) count++
    if (reqBalcony) count++
    if (reqPrivateBath) count++
    if (reqParking) count++
    if (searchQuery) count++
    return count
  }, [
    wardFilter,
    categoryFilter,
    furnishingFilter,
    priceRangeFilter,
    sizeRangeFilter,
    proximityFilter,
    floodRiskFilter,
    reqElevator,
    reqBalcony,
    reqPrivateBath,
    reqParking,
    searchQuery
  ])

  // Clear all filters
  const handleClearFilters = () => {
    filterStore.reset()
    setWardFilter('')
    setCategoryFilter('')
    setFurnishingFilter('')
    setPriceRangeFilter('')
    setSizeRangeFilter('')
    setProximityFilter('')
    setFloodRiskFilter('')
    setReqElevator(false)
    setReqBalcony(false)
    setReqPrivateBath(false)
    setReqParking(false)
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
  }

  // Global Filter Query String builder - Shared Across All Workspace Tabs
  const filterQueryString = useMemo(() => {
    const params = new URLSearchParams()

    if (wardFilter) params.set('ward_name', wardFilter)
    if (categoryFilter) params.set('category_name', categoryFilter)
    if (furnishingFilter) params.set('furnishing_status', furnishingFilter)
    if (floodRiskFilter !== '') params.set('flood_risk_label', floodRiskFilter)
    if (searchQuery) params.set('search', searchQuery)

    // Price segments
    if (priceRangeFilter === 'under_3m') {
      params.set('max_price', '3000000')
    } else if (priceRangeFilter === '3m_5m' || priceRangeFilter === '3m_6m') {
      params.set('min_price', '3000000')
      params.set('max_price', '5000000')
    } else if (priceRangeFilter === '5m_8m' || priceRangeFilter === '6m_10m') {
      params.set('min_price', '5000000')
      params.set('max_price', '8000000')
    } else if (priceRangeFilter === '8m_15m') {
      params.set('min_price', '8000000')
      params.set('max_price', '15000000')
    } else if (priceRangeFilter === 'above_15m' || priceRangeFilter === 'above_10m') {
      params.set('min_price', '15000000')
    }

    // Usable area range
    if (sizeRangeFilter === 'under_20') {
      params.set('max_size', '20')
    } else if (sizeRangeFilter === '20_35') {
      params.set('min_size', '20')
      params.set('max_size', '35')
    } else if (sizeRangeFilter === '35_50') {
      params.set('min_size', '35')
      params.set('max_size', '50')
    } else if (sizeRangeFilter === 'above_50') {
      params.set('min_size', '50')
    }

    // Hotspot proximity
    if (proximityFilter === 'beach_1_5km') params.set('max_dist_beach', '1.5')
    else if (proximityFilter === 'beach_3km') params.set('max_dist_beach', '3.0')
    else if (proximityFilter === 'cbd_2km') params.set('max_dist_cbd', '2.0')
    else if (proximityFilter === 'uni_1_5km') params.set('max_dist_uni', '1.5')

    // Amenities
    if (reqElevator) params.set('has_elevator', '1')
    if (reqBalcony) params.set('has_balcony', '1')
    if (reqPrivateBath) params.set('private_bathroom', '1')
    if (reqParking) params.set('has_parking', '1')

    return params.toString()
  }, [
    wardFilter,
    categoryFilter,
    furnishingFilter,
    priceRangeFilter,
    sizeRangeFilter,
    proximityFilter,
    floodRiskFilter,
    reqElevator,
    reqBalcony,
    reqPrivateBath,
    reqParking,
    searchQuery
  ])

  // Reactive Data Fetcher
  const fetchDashboardData = useCallback(async () => {
    setFiltering(true)
    try {
      const params = new URLSearchParams(filterQueryString)
      params.set('mode', 'dashboard')
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('ascending', String(ascending))

      const res = await fetch(`/api/gold-query?${params.toString()}`)
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        console.error('API Error details:', errJson)
        setErrorMessage(errJson.message || errJson.error || `Lỗi máy chủ (${res.status})`)
        return
      }

      setErrorMessage(null)
      const json = await res.json()
      setKpiData(json.kpi || null)
      setWards(json.wards || [])
      setPriceDistribution(json.priceDistribution || [])
      setTrendData(json.trend || [])
      setRecords(json.records?.data || [])
      setTotalCount(json.records?.count || 0)
      setTotalPages(json.records?.totalPages || 1)
    } catch (err: any) {
      console.error('Failed to query Supabase gold schema:', err)
      setErrorMessage(err?.message || 'Không thể kết nối đến máy chủ')
    } finally {
      setFiltering(false)
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    sortBy,
    ascending,
    filterQueryString
  ])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Dynamic conic gradient for price distribution donut chart
  const donutGradient = useMemo(() => {
    if (!priceDistribution || priceDistribution.length === 0) {
      return 'conic-gradient(#3078f0 0% 100%)'
    }
    const colors = ['#3078f0', '#53c39c', '#f19a52', '#8977df']
    let currentPct = 0
    const parts = priceDistribution.map((item, idx) => {
      const start = currentPct
      currentPct += item.percentage
      const color = colors[idx % colors.length]
      return `${color} ${start}% ${currentPct}%`
    })
    return `conic-gradient(${parts.join(', ')})`
  }, [priceDistribution])

  // Trend Chart dynamic SVG paths
  const trendSvgPaths = useMemo(() => {
    if (!trendData || trendData.length < 2) {
      return {
        countPath: 'M0 140 C100 120 200 130 350 90 S550 70 700 20',
        pricePath: 'M0 160 C100 150 200 140 350 110 S550 90 700 60',
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      }
    }

    const width = 700
    const height = 135
    const n = trendData.length

    const counts = trendData.map((d) => d.count)
    const prices = trendData.map((d) => d.avgPriceMillion)

    const maxCount = Math.max(...counts, 1)
    const minCount = Math.min(...counts, 0)
    const maxPrice = Math.max(...prices, 1)
    const minPrice = Math.min(...prices, 0)

    const countPoints = trendData.map((d, i) => {
      const x = (i / (n - 1)) * width
      const ratio = (d.count - minCount) / (maxCount - minCount || 1)
      const y = height - ratio * (height - 25) - 10
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })

    const pricePoints = trendData.map((d, i) => {
      const x = (i / (n - 1)) * width
      const ratio = (d.avgPriceMillion - minPrice) / (maxPrice - minPrice || 1)
      const y = height - ratio * (height - 30) - 15
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })

    return {
      countPath: `M ${countPoints.join(' L ')}`,
      pricePath: `M ${pricePoints.join(' L ')}`,
      labels: trendData.map((d) => d.period.slice(5))
    }
  }, [trendData])

  if (loading && !kpiData) {
    return (
      <main className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark"><Sparkles size={18} /></div>
            <span>Rent<span className="brand-accent">IQ</span></span>
          </div>
          <div className="workspace-label">WORKSPACE</div>
          <div className="workspace-select">
            <div className="workspace-avatar">DN</div>
            <div>
              <strong>Da Nang Market</strong>
              <small>Gold Data Warehouse</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </aside>
        <section className="content">
          <div className="page-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loading-indicator">
              <span className="pulse-spinner" />
              <span>Đang kết nối Supabase Schema Gold...</span>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <span>Rent<span className="brand-accent">IQ</span></span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`workspace-select workspace-button ${workspaceMenuOpen ? 'selected' : ''}`} onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}>
          <div className="workspace-avatar">DN</div>
          <div>
            <strong>Da Nang Market</strong>
            <small>Data Warehouse · gold</small>
          </div>
          <ChevronDown size={15} />
        </button>
        {workspaceMenuOpen && <div className="sidebar-popover workspace-popover"><strong>Da Nang Market</strong><span>Gold Data Warehouse</span><button onClick={() => setWorkspaceMenuOpen(false)}>Đang sử dụng</button></div>}
        <nav className="main-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
                onClick={() => setActiveNav(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Rủi ro ngập lụt' && <span className="nav-dot" />}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings2 size={18} /><span>Cài đặt</span></button>
          <button className="nav-item" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /><span>Trợ giúp</span></button>
          <div className={`user-card ${accountMenuOpen ? 'selected' : ''}`}>
            <div className="user-avatar">{userEmail ? userEmail.slice(0, 2).toUpperCase() : '??'}</div>
            <div>
              <strong>{userEmail ? userEmail.split('@')[0] : 'Chưa đăng nhập'}</strong>
              <small>{userEmail || 'Tài khoản Google'}</small>
            </div>
            <button className="account-trigger" aria-label="Mở menu tài khoản" onClick={() => setAccountMenuOpen(!accountMenuOpen)}><MoreHorizontal size={17} /></button>
          </div>
          {accountMenuOpen && <div className="sidebar-popover account-popover">{userEmail ? <><strong>{userEmail}</strong><button onClick={() => setSettingsOpen(true)}>Hồ sơ & cài đặt</button><button onClick={() => void signOut()}><LogOut size={12} /> Đăng xuất</button></> : <button onClick={() => void signInWithGoogle()}><LogIn size={12} /> {authLoading ? 'Đang chuyển tới Google...' : 'Đăng nhập bằng Google'}</button>}<button onClick={() => setAccountMenuOpen(false)}>Đóng menu</button></div>}
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="content">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark"><Sparkles size={16} /></div>
            <strong>Rent<span className="brand-accent">IQ</span></strong>
          </div>
          <div className="breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <strong>{activeNav}</strong>
          </div>
          <div className="top-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder="Tìm khu vực, loại hình..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={18} /><i /></button>
            <button className="top-avatar" aria-label="Mở menu tài khoản" onClick={() => setAccountMenuOpen(!accountMenuOpen)}>{userEmail ? userEmail.slice(0, 2).toUpperCase() : '??'}</button>
            <button className="mobile-menu" aria-label="Menu" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={20} /></button>
          </div>
        </header>

        {notificationsOpen && <div className="quick-popover notification-popover"><strong>Thông báo</strong><p>Dữ liệu Gold đã được đồng bộ gần đây.</p><p>Không có cảnh báo mới.</p><button onClick={() => setNotificationsOpen(false)}>Đóng</button></div>}
        {mobileNavOpen && <div className="mobile-nav-popover">{navItems.map((item) => <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileNavOpen(false) }}>{item.label}</button>)}</div>}
        {(settingsOpen || helpOpen) && <div className="modal-backdrop" onClick={() => { setSettingsOpen(false); setHelpOpen(false) }}><div className="quick-modal" onClick={(e) => e.stopPropagation()}>{settingsOpen ? <><h3>Cài đặt dashboard</h3><label className="setting-row"><span>Chế độ tối</span><input type="checkbox" checked={darkMode} onChange={(e) => { setDarkMode(e.target.checked); document.body.classList.toggle('dark-mode', e.target.checked) }} /></label><label className="setting-row"><span>Tự động làm mới dữ liệu</span><input type="checkbox" defaultChecked /></label></> : <><h3>Trợ giúp</h3><p>Chọn mục trong sidebar để xem từng nhóm phân tích. Dùng Bộ lọc để áp dụng điều kiện cho dashboard và bản đồ.</p></>}<button className="button secondary" onClick={() => { setSettingsOpen(false); setHelpOpen(false) }}>Đóng</button></div></div>}

        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="live-dot" /> LIVE DATA · SCHEMA GOLD (RENTAL_ROOM)
                {filtering && (
                  <span className="loading-indicator">
                    <span className="pulse-spinner" /> Đang lọc...
                  </span>
                )}
              </div>
              <h1>Bảng Điều Khiển Thị Trường Thuê Đà Nẵng</h1>
              <p>Dữ liệu tổng hợp từ Data Warehouse tầng Gold với cơ chế Dynamic Query Builder.</p>
            </div>

            <div className="heading-actions">
              <button
                className="button secondary"
                onClick={() => {
                  const csv = records.map(r => `${r.ward_name},${r.category_name},${r.price_vnd},${r.size_m2}`).join('\n')
                  const blob = new Blob([`Khu vực,Loại hình,Giá,Diện tích\n${csv}`], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'rental_gold_export.csv'
                  a.click()
                }}
              >
                <Download size={16} /> Xuất CSV
              </button>

              <button
                className={`button ${filterOpen ? 'primary' : 'secondary'}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={16} /> Bộ lọc
                {activeFiltersCount > 0 && (
                  <span className="filter-count">{activeFiltersCount}</span>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span><strong>Lỗi kết nối dữ liệu:</strong> {errorMessage}</span>
              <button
                className="button secondary"
                style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                onClick={() => fetchDashboardData()}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* DYNAMIC QUERY FILTER PANEL */}
          {filterOpen && (
            <div className="filter-panel">
              <div className="filter-item">
                <label>Khu vực (Ward)</label>
                <select
                  className="filter-control"
                  value={wardFilter}
                  onChange={(e) => {
                    setWardFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả quận/huyện</option>
                  {WARDS_OPTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Loại hình</label>
                <select
                  className="filter-control"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả loại hình</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Nội thất</label>
                <select
                  className="filter-control"
                  value={furnishingFilter}
                  onChange={(e) => {
                    setFurnishingFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả nội thất</option>
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Khoảng giá</label>
                <select
                  className="filter-control"
                  value={priceRangeFilter}
                  onChange={(e) => {
                    setPriceRangeFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="under_3m">Dưới 3 triệu (Bình dân)</option>
                  <option value="3m_5m">3 — 5 triệu (Tiêu chuẩn)</option>
                  <option value="5m_8m">5 — 8 triệu (Căn hộ dịch vụ)</option>
                  <option value="8m_15m">8 — 15 triệu (Cao cấp)</option>
                  <option value="above_15m">Trên 15 triệu (Hạng sang)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Diện tích</label>
                <select
                  className="filter-control"
                  value={sizeRangeFilter}
                  onChange={(e) => {
                    setSizeRangeFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả diện tích</option>
                  <option value="under_20">Dưới 20 m² (Phòng nhỏ / KTX)</option>
                  <option value="20_35">20 — 35 m² (Studio / 1PN)</option>
                  <option value="35_50">35 — 50 m² (Rộng / 1-2PN)</option>
                  <option value="above_50">Trên 50 m² (Căn lớn / Nhà riêng)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Cự ly điểm nóng</label>
                <select
                  className="filter-control"
                  value={proximityFilter}
                  onChange={(e) => {
                    setProximityFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả cự ly</option>
                  <option value="beach_1_5km">🏖️ Cận biển Mỹ Khê (≤ 1.5 km)</option>
                  <option value="beach_3km">🏖️ Cận biển (≤ 3.0 km)</option>
                  <option value="cbd_2km">🏙️ Cận CBD Cầu Rồng (≤ 2.0 km)</option>
                  <option value="uni_1_5km">🎓 Cận cụm ĐH lớn (≤ 1.5 km)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Rủi ro ngập</label>
                <select
                  className="filter-control"
                  value={floodRiskFilter}
                  onChange={(e) => {
                    setFloodRiskFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Tất cả cấp độ</option>
                  <option value="0">Thấp / An toàn (0)</option>
                  <option value="1">Trung bình (1)</option>
                  <option value="2">Nguy cơ cao (2)</option>
                </select>
              </div>

              <div className="filter-item" style={{ minWidth: '220px', flex: '1 1 100%' }}>
                <label>Tiện ích thiết yếu</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      checked={reqElevator}
                      onChange={(e) => { setReqElevator(e.target.checked); setPage(1) }}
                    />
                    🛗 Thang máy
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      checked={reqBalcony}
                      onChange={(e) => { setReqBalcony(e.target.checked); setPage(1) }}
                    />
                    🌅 Ban công
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      checked={reqPrivateBath}
                      onChange={(e) => { setReqPrivateBath(e.target.checked); setPage(1) }}
                    />
                    🚿 Vệ sinh riêng
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 500, color: 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      checked={reqParking}
                      onChange={(e) => { setReqParking(e.target.checked); setPage(1) }}
                    />
                    🛵 Bãi đỗ xe
                  </label>
                </div>
              </div>

              <div className="filter-actions">
                {activeFiltersCount > 0 && (
                  <button className="clear-filter" onClick={handleClearFilters}>
                    <RotateCcw size={14} /> Đặt lại
                  </button>
                )}
                <button className="clear-filter" onClick={() => setFilterOpen(false)}>
                  <X size={14} /> Đóng
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-wrap">
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                Đang lọc ({activeFiltersCount}):
              </span>
              {wardFilter && (
                <span className="filter-chip">
                  Khu vực: {wardFilter}
                  <button onClick={() => { setWardFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {categoryFilter && (
                <span className="filter-chip">
                  Loại hình: {categoryFilter}
                  <button onClick={() => { setCategoryFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {furnishingFilter && (
                <span className="filter-chip">
                  Nội thất: {furnishingFilter}
                  <button onClick={() => { setFurnishingFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {priceRangeFilter && (
                <span className="filter-chip">
                  Giá: {priceRangeFilter === 'under_3m' ? '< 3 triệu' : priceRangeFilter === '3m_5m' || priceRangeFilter === '3m_6m' ? '3-5 triệu' : priceRangeFilter === '5m_8m' || priceRangeFilter === '6m_10m' ? '5-8 triệu' : priceRangeFilter === '8m_15m' ? '8-15 triệu' : '> 15 triệu'}
                  <button onClick={() => { setPriceRangeFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {sizeRangeFilter && (
                <span className="filter-chip">
                  DT: {sizeRangeFilter === 'under_20' ? '< 20m²' : sizeRangeFilter === '20_35' ? '20-35m²' : sizeRangeFilter === '35_50' ? '35-50m²' : '> 50m²'}
                  <button onClick={() => { setSizeRangeFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {proximityFilter && (
                <span className="filter-chip">
                  Cự ly: {proximityFilter === 'beach_1_5km' ? 'Biển ≤ 1.5km' : proximityFilter === 'beach_3km' ? 'Biển ≤ 3km' : proximityFilter === 'cbd_2km' ? 'CBD ≤ 2km' : 'ĐH ≤ 1.5km'}
                  <button onClick={() => { setProximityFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {reqElevator && (
                <span className="filter-chip">
                  🛗 Thang máy
                  <button onClick={() => { setReqElevator(false); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {reqBalcony && (
                <span className="filter-chip">
                  🌅 Ban công
                  <button onClick={() => { setReqBalcony(false); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {reqPrivateBath && (
                <span className="filter-chip">
                  🚿 WC riêng
                  <button onClick={() => { setReqPrivateBath(false); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {reqParking && (
                <span className="filter-chip">
                  🛵 Chỗ để xe
                  <button onClick={() => { setReqParking(false); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {floodRiskFilter !== '' && (
                <span className="filter-chip">
                  Rủi ro ngập: {floodRiskFilter === '0' ? 'Thấp' : floodRiskFilter === '1' ? 'Trung bình' : 'Cao'}
                  <button onClick={() => { setFloodRiskFilter(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-chip">
                  Tìm kiếm: &quot;{searchQuery}&quot;
                  <button onClick={() => { setSearchInput(''); setSearchQuery(''); setPage(1) }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Navigation views or main dashboard - Synchronized with Global Filters */}
          {activeNav === 'Vị trí & khu vực' && (
            <LocationMapView
              filterQueryString={filterQueryString}
              activeFiltersCount={activeFiltersCount}
            />
          )}
          {activeNav === 'Tiện ích' && (
            <AmenitiesView
              filterQueryString={filterQueryString}
            />
          )}
          {activeNav === 'Rủi ro ngập lụt' && (
            <FloodRiskView
              filterQueryString={filterQueryString}
            />
          )}
          {activeNav === 'Phân tích nâng cao' && (
            <AdvancedAnalyticsView
              filterQueryString={filterQueryString}
            />
          )}

          {activeNav === 'Tổng quan' && (
            <>
              <div className="toolbar">
                <div className="tabs" role="tablist" aria-label="Các góc nhìn phân tích">
                  <button
                    className={`tab ${activeTab === 'Tổng quan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Tổng quan')}
                    role="tab"
                    aria-selected={activeTab === 'Tổng quan'}
                  >
                    Tổng quan
                  </button>
                  <button
                    className={`tab ${activeTab === 'Thị trường' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Thị trường')}
                    role="tab"
                    aria-selected={activeTab === 'Thị trường'}
                  >
                    Thị trường
                  </button>
                  <button
                    className={`tab ${activeTab === 'Nguồn cung' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Nguồn cung')}
                    role="tab"
                    aria-selected={activeTab === 'Nguồn cung'}
                  >
                    Nguồn cung
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Sắp xếp:
                  </span>
                  <select
                    className="filter-control"
                    style={{ width: 'auto', height: '32px', fontSize: '11px' }}
                    value={`${sortBy}_${ascending}`}
                    onChange={(e) => {
                      const [col, asc] = e.target.value.split('_')
                      setSortBy(col)
                      setAscending(asc === 'true')
                      setPage(1)
                    }}
                  >
                    <option value="posted_date_false">Mới nhất trước</option>
                    <option value="posted_date_true">Cũ nhất trước</option>
                    <option value="price_vnd_false">Giá giảm dần</option>
                    <option value="price_vnd_true">Giá tăng dần</option>
                    <option value="size_m2_false">Diện tích giảm dần</option>
                  </select>
                </div>
              </div>

              {activeTab !== 'Tổng quan' && (
                <AnalysisTab
                  tab={activeTab}
                  kpiData={kpiData}
                  wards={wards}
                  priceDistribution={priceDistribution}
                />
              )}

              {activeTab === 'Tổng quan' && (
                <>
                  {/* KPI CARDS */}
                  <section className="kpi-grid">
                    <Kpi
                      icon={<Home size={18} />}
                      label="Tin đăng (sau lọc)"
                      value={kpiData?.total_listings.toLocaleString() || '0'}
                      delta={totalCount === 3238 ? 'Toàn bộ' : `${((totalCount / 3238) * 100).toFixed(0)}% mẫu`}
                      note="dữ liệu kho gold"
                      tone="blue"
                    />
                    <Kpi
                      icon={<TrendingUp size={18} />}
                      label="Giá thuê trung bình"
                      value={`${kpiData?.avg_price_million.toFixed(2) || '0'} tr`}
                      delta={kpiData?.avg_price_million && kpiData.avg_price_million > 6 ? 'Phân khúc cao' : 'Bình dân'}
                      note="VNĐ / tháng"
                      tone="orange"
                    />
                    <Kpi
                      icon={<Activity size={18} />}
                      label="Diện tích trung bình"
                      value={`${kpiData?.avg_size_m2.toFixed(1) || '0'} m²`}
                      delta="Chuẩn thị trường"
                      note="m²/phòng"
                      tone="purple"
                    />
                    <Kpi
                      icon={<ShieldAlert size={18} />}
                      label="Tỷ lệ an toàn ngập lụt"
                      value={`${kpiData?.flood_risk_low_percentage.toFixed(0) || '0'}%`}
                      delta={kpiData && kpiData.flood_risk_low_percentage > 70 ? 'An toàn' : 'Cần chú ý'}
                      note="khu vực rủi ro = 0"
                      tone="green"
                    />
                  </section>

                  {/* CHARTS GRID */}
                  <DashboardCharts trend={trendData} distribution={priceDistribution} total={kpiData?.total_listings || 0} />
                  {/* Legacy chart markup retained below for layout compatibility */}
                  <section style={{ display: 'none' }} className="main-grid">
                    {/* SVG Trend Chart */}
                    <div className="card trend-card">
                      <CardHeader
                        title="Xu hướng theo chu kỳ thời gian"
                        subtitle="Số lượng tin đăng & giá thuê trung bình (tính toán động từ schema gold)"
                        action=""
                      />
                      <div className="chart-legend">
                        <span><i className="legend-blue" /> Tin đăng</span>
                        <span><i className="legend-orange" /> Giá TB (tr VNĐ)</span>
                      </div>
                      <div className="chart-area">
                        <div className="y-labels">
                          <span>Cao</span>
                          <span>TB</span>
                          <span>Thấp</span>
                          <span>0</span>
                        </div>
                        <div className="line-chart">
                          <div className="grid-lines">
                            <i /><i /><i /><i />
                          </div>
                          <svg viewBox="0 0 700 135" preserveAspectRatio="none">
                            <path
                              d={trendSvgPaths.countPath}
                              fill="none"
                              stroke="#3078f0"
                              strokeWidth="2.5"
                            />
                            <path
                              d={trendSvgPaths.pricePath}
                              fill="none"
                              stroke="#f19a52"
                              strokeWidth="2.5"
                              strokeDasharray="5 4"
                            />
                          </svg>
                          <div className="x-labels">
                            {trendSvgPaths.labels.map((lbl, idx) => (
                              <span key={idx}>T{lbl}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Donut Distribution Chart */}
                    <div className="card distribution-card">
                      <CardHeader
                        title="Phân bố khoảng giá"
                        subtitle="Tỷ trọng theo các phân khúc giá"
                        action=""
                      />
                      <div className="donut-wrap">
                        <div
                          className="donut"
                          style={{ background: donutGradient }}
                        >
                          <div className="donut-hole">
                            <strong>{kpiData?.total_listings.toLocaleString() || '0'}</strong>
                            <span>tin đăng</span>
                          </div>
                        </div>
                        <div className="donut-legend">
                          {priceDistribution.map((item, index) => {
                            const colors = ['#3078f0', '#53c39c', '#f19a52', '#8977df']
                            return (
                              <Legend
                                key={item.label}
                                color={colors[index % colors.length]}
                                label={item.label}
                                value={`${item.percentage}%`}
                              />
                            )
                          })}
                        </div>
                      </div>
                      <div className="insight">
                        <Sparkles size={16} />
                        <span>
                          <strong>Insight:</strong> Phân khúc {priceDistribution[0]?.label || 'chủ đạo'} chiếm {priceDistribution[0]?.percentage || 0}% lượng tin đăng sau khi lọc.
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* BOTTOM GRID: TOP WARDS & PAGINATED LISTINGS */}
                  <section className="bottom-grid">
                    {/* Top Wards */}
                    <div className="card area-card">
                      <CardHeader
                        title="Top Khu vực (Nguồn cung)"
                        subtitle="Khu vực có nhiều tin đăng nhất theo tiêu chí lọc"
                        action=""
                      />
                      <div className="ward-list">
                        {wards.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                            Không có dữ liệu khu vực phù hợp
                          </div>
                        ) : (
                          wards.map((ward, index) => {
                            const tones = ['blue', 'orange', 'purple', 'green', 'blue']
                            const maxCount = Math.max(...wards.map((w) => w.count), 1)
                            const barWidth = (ward.count / maxCount) * 100
                            return (
                              <div className="ward-row" key={ward.name}>
                                <span className="rank">0{index + 1}</span>
                                <div className={`ward-icon ${tones[index % tones.length]}`}>
                                  <MapPin size={15} />
                                </div>
                                <div className="ward-name">
                                  <strong>{ward.name}</strong>
                                  <small>{ward.count} tin đăng</small>
                                </div>
                                <div className="ward-bar">
                                  <span style={{ width: `${Math.max(10, barWidth)}%` }} />
                                </div>
                                <div className="ward-price">
                                  <strong>{(ward.avgPrice / 1000000).toFixed(1)} tr</strong>
                                  <small>TB / tháng</small>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    {/* Paginated Listings Table */}
                    <div className="card activity-card">
                      <CardHeader
                        title="Danh sách tin đăng thực tế (gold.rental_room)"
                        subtitle={`Hiển thị ${records.length} / ${totalCount.toLocaleString()} kết quả`}
                        action=""
                      />
                      <div className="activity-table">
                        <div className="table-head">
                          <span>KHU VỰC</span>
                          <span>GIÁ THUÊ</span>
                          <span>DIỆN TÍCH</span>
                          <span>RỦI RO NGẬP</span>
                          <span>NGÀY ĐĂNG</span>
                        </div>
                        {records.length === 0 ? (
                          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                            Không tìm thấy tin đăng nào phù hợp với bộ lọc hiện tại.
                          </div>
                        ) : (
                          records.map((r, index) => {
                            const riskText =
                              r.flood_risk_label === 0 ? 'Thấp' : r.flood_risk_label === 1 ? 'Trung bình' : 'Cao'
                            const riskClass =
                              r.flood_risk_label === 0 ? 'low' : r.flood_risk_label === 1 ? 'medium' : 'high'

                            return (
                              <div className="table-row" key={`${r.source}_${r.list_id}_${index}`}>
                                <div>
                                  <strong>{r.ward_name || 'N/A'}</strong>
                                  <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                                    {r.category_name || 'Phòng cho thuê'}
                                  </div>
                                </div>
                                <span>
                                  {r.price_vnd ? `${(r.price_vnd / 1000000).toFixed(1)} tr` : 'Thỏa thuận'}
                                </span>
                                <span>{r.size_m2 ? `${Math.round(r.size_m2)} m²` : 'N/A'}</span>
                                <span className={`risk ${riskClass}`}>{riskText}</span>
                                <small>{r.posted_date ? r.posted_date.slice(0, 10) : 'Gần đây'}</small>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Pagination Bar */}
                      <div className="pagination-container">
                        <span>
                          Trang {page} / {totalPages || 1} ({totalCount.toLocaleString()} tin)
                        </span>
                        <div className="pagination-controls">
                          <button
                            className="page-btn"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            <ChevronLeft size={14} /> Trước
                          </button>
                          <button
                            className="page-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          >
                            Sau <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function Kpi({
  icon,
  label,
  value,
  delta,
  note,
  tone
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta: string
  note: string
  tone: string
}) {
  return (
    <div className="card kpi-card">
      <div className={`kpi-icon ${tone}`}>{icon}</div>
      <div className="kpi-label">
        {label}
        <MoreHorizontal size={16} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={delta.startsWith('-') ? 'negative' : 'positive'}>{delta}</span>
        <span>{note}</span>
      </div>
    </div>
  )
}

function CardHeader({
  title,
  subtitle,
  action
}: {
  title: string
  subtitle: string
  action: string
}) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action && (
        <button className="card-action">
          {action} <span>→</span>
        </button>
      )}
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="legend-item">
      <i style={{ background: color }} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function AnalysisTab({
  tab,
  kpiData,
  wards,
  priceDistribution
}: {
  tab: string
  kpiData: KpiData | null
  wards: WardData[]
  priceDistribution: PriceDistribution[]
}) {
  const market = tab === 'Thị trường'
  const maxWardCount = wards.length > 0 ? Math.max(...wards.map((w) => w.count), 1) : 1

  return (
    <section className="analysis-tab" role="tabpanel">
      <div className="analysis-intro">
        <div>
          <span className="eyebrow">{market ? 'MARKET SIGNALS' : 'SUPPLY INTELLIGENCE'}</span>
          <h2>{market ? 'Nhịp chuyển động của thị trường' : 'Bức tranh nguồn cung chi tiết'}</h2>
          <p>
            {market
              ? 'Theo dõi nhu cầu, mặt bằng giá và các tín hiệu đang thay đổi theo khu vực từ kho dữ liệu gold.rental_room.'
              : 'Đánh giá độ phủ tin đăng, loại hình và khoảng trống nguồn cung tại Đà Nẵng theo thời gian thực.'}
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" /> Dữ liệu đã đồng bộ từ Schema Gold
        </span>
      </div>

      <div className="analysis-cards">
        <MetricCard
          label={market ? 'Tổng quy mô mẫu lọc' : 'Tin đăng đang theo dõi'}
          value={kpiData?.total_listings.toLocaleString() || '0'}
          note="Từ kho dữ liệu gold.rental_room"
          tone="blue"
        />
        <MetricCard
          label={market ? 'Giá thuê trung bình' : 'Tỷ lệ căn hộ'}
          value={market ? `${kpiData?.avg_price_million.toFixed(2) || '0'} tr` : `${kpiData?.apartment_percentage || 0}%`}
          note={market ? 'Mặt bằng giá chung toàn bộ mẫu lọc' : 'Trong tổng số nguồn cung lọc'}
          tone="orange"
        />
        <MetricCard
          label={market ? 'Tỷ lệ an toàn ngập' : 'Tỷ lệ phòng trọ'}
          value={market ? `${kpiData?.flood_risk_low_percentage || 0}%` : `${kpiData?.room_percentage || 0}%`}
          note="Phân khúc an toàn ngập úng"
          tone="purple"
        />
      </div>

      {/* Dynamic Supply / Market Breakdown */}
      <div className="analysis-lower" style={{ marginTop: '16px' }}>
        <div className="card recommendation-card">
          <CardHeader
            title={market ? 'Tín hiệu trọng điểm theo dữ liệu thực' : 'Phân bổ nguồn cung theo khu vực'}
            subtitle={market ? 'Insight tự động phân tích từ tập dữ liệu đang lọc' : 'Top khu vực có mật độ tin đăng cao nhất'}
            action=""
          />
          <div className="recommendation-list">
            {wards.slice(0, 3).map((w) => (
              <div className="insight-row" key={w.name}>
                <div className="insight-icon">
                  <MapPin size={16} />
                </div>
                <div>
                  <strong>{w.name}: {w.count} bài đăng</strong>
                  <p>
                    Giá thuê trung bình: {(w.avgPrice / 1000000).toFixed(1)} tr/tháng · Tỷ trọng: {kpiData && kpiData.total_listings > 0 ? Math.round((w.count / kpiData.total_listings) * 100) : 0}% tổng nguồn cung.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mini-summary">
          <CardHeader
            title="Tỷ trọng nguồn cung"
            subtitle="Phân theo khu vực dẫn đầu"
            action=""
          />
          <div className="summary-bars">
            {wards.slice(0, 4).map((w) => {
              const pct = Math.round((w.count / maxWardCount) * 100)
              return (
                <div className="summary-bar" key={w.name}>
                  <div>
                    <span>{w.name}</span>
                    <strong>{w.count} tin</strong>
                  </div>
                  <div className="summary-track">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}



function MetricCard({
  label,
  value,
  note,
  tone
}: {
  label: string
  value: string
  note: string
  tone: string
}) {
  return (
    <div className="card metric-card">
      <div className={`kpi-icon ${tone}`}><Activity size={17} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}
