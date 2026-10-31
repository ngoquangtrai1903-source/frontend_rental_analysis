'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import AmenitiesView from './components/AmenitiesView'
import FloodRiskView from './components/FloodRiskView'
import AdvancedAnalyticsView from './components/AdvancedAnalyticsView'
import PricePredictionView from './components/PricePredictionView'
import DashboardCharts from './components/DashboardCharts'
import DashboardHelp from './components/DashboardHelp'
import { useFilterStore } from './store/filterStore'
import { useTranslation } from './store/languageStore'
import { Language } from './i18n/translations'

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
import { fetchAllRecords, toCsv } from '@/lib/csv'

const SETTINGS_STORAGE_KEY = 'rentiq.dashboard.settings.v1'
const DEFAULT_START_DATE = '2026-01-01'

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getProfileAvatarUrl(user: {
  user_metadata?: Record<string, unknown>
  identities?: Array<{ provider?: string; identity_data?: Record<string, unknown> | null }> | null
} | null | undefined): string | null {
  const googleIdentity = user?.identities?.find((identity) => identity.provider === 'google')
  const candidates = [
    googleIdentity?.identity_data?.picture,
    googleIdentity?.identity_data?.avatar_url,
    user?.user_metadata?.picture,
    user?.user_metadata?.avatar_url
  ]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    try {
      const url = new URL(candidate)
      if (url.protocol === 'https:') return url.href
    } catch {
      continue
    }
  }

  return null
}

const navItems = [
  { id: 'Tổng quan', labelVi: 'Tổng quan', labelEn: 'Overview', icon: LayoutDashboard },
  { id: 'Vị trí & khu vực', labelVi: 'Vị trí & khu vực', labelEn: 'Location & Area', icon: MapPin },
  { id: 'Tiện ích', labelVi: 'Tiện ích', labelEn: 'Amenities', icon: Home },
  { id: 'Rủi ro ngập lụt', labelVi: 'Rủi ro ngập lụt', labelEn: 'Flood Risk', icon: ShieldAlert },
  { id: 'Phân tích nâng cao', labelVi: 'Phân tích nâng cao', labelEn: 'Advanced Analytics', icon: BarChart3 },
  { id: 'Dự đoán giá AI', labelVi: 'Dự đoán giá AI', labelEn: 'AI Price Prediction', icon: Sparkles }
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
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const signingOut = useRef(false)
  const dashboardRequestId = useRef(0)
  const dashboardAbortController = useRef<AbortController | null>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const modalTriggerRef = useRef<HTMLElement | null>(null)
  const modalOpen = settingsOpen || helpOpen

  const openSettings = () => {
    modalTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setHelpOpen(false)
    setSettingsOpen(true)
  }

  const openHelp = () => {
    modalTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSettingsOpen(false)
    setHelpOpen(true)
  }

  const closeModal = () => {
    setSettingsOpen(false)
    setHelpOpen(false)
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null')
      if (saved && typeof saved === 'object') {
        if (typeof saved.darkMode === 'boolean') setDarkMode(saved.darkMode)
        if (typeof saved.autoRefresh === 'boolean') setAutoRefresh(saved.autoRefresh)
      }
    } catch {
      // Unavailable storage or invalid saved data must not prevent using the app.
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    document.body.classList.toggle('dark-mode', darkMode)
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ darkMode, autoRefresh }))
      setSettingsSaved(true)
    } catch {
      setSettingsSaved(false)
    }
  }, [settingsLoaded, darkMode, autoRefresh])

  useEffect(() => {
    let mounted = true
    let hadSession = false
    const url = new URL(window.location.href)
    if (url.searchParams.has('auth_error')) {
      setAuthMessage('Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.')
      url.searchParams.delete('auth_error')
      window.history.replaceState(null, '', url)
    }
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return
        if (error) throw error
        if (hadSession && !data.session && !signingOut.current) setAuthMessage('Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.')
        hadSession = Boolean(data.session)
        setUserEmail(data.session?.user.email ?? null)
        setUserAvatarUrl(getProfileAvatarUrl(data.session?.user))
      } catch (error) {
        console.error('Failed to read Supabase auth session:', error)
        if (mounted) setAuthMessage('Không thể kiểm tra phiên đăng nhập. Kiểm tra kết nối hoặc đăng nhập lại.')
      }
    }
    void checkSession()
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT' && hadSession && !signingOut.current) setAuthMessage('Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.')
      hadSession = Boolean(session)
      setUserEmail(session?.user?.email ?? null)
      setUserAvatarUrl(getProfileAvatarUrl(session?.user))
      if (session) setAuthMessage('')
    })
    window.addEventListener('focus', checkSession)
    const timer = window.setInterval(checkSession, 60_000)
    return () => { mounted = false; listener.subscription.unsubscribe(); window.removeEventListener('focus', checkSession); window.clearInterval(timer) }
  }, [])

  useEffect(() => {
    if (!accountMenuOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountMenuOpen])

  useEffect(() => {
    if (!modalOpen) return

    const modal = modalRef.current
    const getFocusableElements = () => Array.from(
      modal?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    )
    getFocusableElements()[0]?.focus()

    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = getFocusableElements()
      if (focusable.length === 0) {
        event.preventDefault()
        modal?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !modal?.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !modal?.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', keepFocusInside)
      const trigger = modalTriggerRef.current
      if (trigger?.isConnected) trigger.focus()
      else document.querySelector<HTMLElement>('.top-avatar')?.focus()
    }
  }, [modalOpen])

  const signInWithGoogle = async () => {
    setAuthLoading(true)
    setAuthMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
      if (error) throw error
    } catch (error) {
      console.error('Google OAuth sign-in failed:', error)
      setAuthMessage('Không thể mở đăng nhập Google. Kiểm tra kết nối và thử lại.')
    } finally { setAuthLoading(false) }
  }

  const signOut = async () => {
    signingOut.current = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setAuthMessage(''); setAccountMenuOpen(false)
    } catch (error) {
      console.error('Supabase sign-out failed:', error)
      setAuthMessage('Đăng xuất chưa thành công. Vui lòng thử lại trong menu tài khoản.')
    }
    finally { signingOut.current = false }
  }

  // Language & Translation
  const { lang, setLang, toggleLang } = useTranslation()

  // Filter States (BĐS Domain Standards)
  const filterStore = useFilterStore()
  const { wardFilter, categoryFilter, furnishingFilter, priceRangeFilter, sizeRangeFilter, floodRiskFilter, reqElevator, reqBalcony, reqPrivateBath, reqParking, searchInput, searchQuery, setFilter } = filterStore
  const setWardFilter = (value: string) => setFilter('wardFilter', value)
  const setCategoryFilter = (value: string) => setFilter('categoryFilter', value)
  const setFurnishingFilter = (value: string) => setFilter('furnishingFilter', value)
  const setPriceRangeFilter = (value: string) => setFilter('priceRangeFilter', value)
  const setSizeRangeFilter = (value: string) => setFilter('sizeRangeFilter', value)
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
  const [todayDate] = useState(getTodayDate)
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE)
  const [endDate, setEndDate] = useState(todayDate)

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
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')

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
    if (startDate || endDate) count++
    if (wardFilter) count++
    if (categoryFilter) count++
    if (furnishingFilter) count++
    if (priceRangeFilter) count++
    if (sizeRangeFilter) count++
    if (floodRiskFilter) count++
    if (reqElevator) count++
    if (reqBalcony) count++
    if (reqPrivateBath) count++
    if (reqParking) count++
    if (searchQuery) count++
    return count
  }, [
    startDate,
    endDate,
    wardFilter,
    categoryFilter,
    furnishingFilter,
    priceRangeFilter,
    sizeRangeFilter,
    floodRiskFilter,
    reqElevator,
    reqBalcony,
    reqPrivateBath,
    reqParking,
    searchQuery
  ])

  // Clear all filters
  const handleClearFilters = () => {
    setStartDate(DEFAULT_START_DATE)
    setEndDate(todayDate)
    filterStore.reset()
    setWardFilter('')
    setCategoryFilter('')
    setFurnishingFilter('')
    setPriceRangeFilter('')
    setSizeRangeFilter('')
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
    if (startDate) params.set('start_date', startDate)
    if (endDate) params.set('end_date', endDate)

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

    // Amenities
    if (reqElevator) params.set('has_elevator', '1')
    if (reqBalcony) params.set('has_balcony', '1')
    if (reqPrivateBath) params.set('private_bathroom', '1')
    if (reqParking) params.set('has_parking', '1')

    return params.toString()
  }, [
    startDate,
    endDate,
    wardFilter,
    categoryFilter,
    furnishingFilter,
    priceRangeFilter,
    sizeRangeFilter,
    floodRiskFilter,
    reqElevator,
    reqBalcony,
    reqPrivateBath,
    reqParking,
    searchQuery
  ])

  // Reactive Data Fetcher
  const fetchDashboardData = useCallback(async () => {
    dashboardAbortController.current?.abort()
    const controller = new AbortController()
    dashboardAbortController.current = controller

    const requestId = ++dashboardRequestId.current
    setFiltering(true)
    try {
      const params = new URLSearchParams(filterQueryString)
      params.set('mode', 'dashboard')
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      params.set('sortBy', sortBy)
      params.set('ascending', String(ascending))

      const res = await fetch(`/api/gold-query?${params.toString()}`, {
        signal: controller.signal
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        if (requestId === dashboardRequestId.current) {
          console.error('API Error details:', errJson)
          setErrorMessage(errJson.message || errJson.error || `Lỗi máy chủ (${res.status})`)
        }
        return
      }

      const json = await res.json()
      if (requestId !== dashboardRequestId.current || controller.signal.aborted) return

      setErrorMessage(null)
      setKpiData(json.kpi || null)
      setWards(json.wards || [])
      setPriceDistribution(json.priceDistribution || [])
      setTrendData(json.trend || [])
      setRecords(json.records?.data || [])
      setTotalCount(json.records?.count || 0)
      setTotalPages(json.records?.totalPages || 1)
      setLastRefreshAt(new Date())
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted || requestId !== dashboardRequestId.current) {
        return
      }
      console.error('Failed to query Supabase gold schema:', err)
      setErrorMessage(err?.message || 'Không thể kết nối đến máy chủ')
    } finally {
      if (requestId === dashboardRequestId.current) {
        setFiltering(false)
        setLoading(false)
      }
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
    return () => {
      dashboardAbortController.current?.abort()
    }
  }, [fetchDashboardData])

  useEffect(() => {
    // Wait until the current request finishes before scheduling another refresh.
    if (!settingsLoaded || !autoRefresh || filtering || loading) return

    const timer = window.setTimeout(() => {
      void fetchDashboardData()
    }, 60_000)

    return () => window.clearTimeout(timer)
  }, [settingsLoaded, autoRefresh, filtering, loading, fetchDashboardData])

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
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <Icon size={18} />
                <span>{lang === 'en' ? item.labelEn : item.labelVi}</span>
                {item.id === 'Rủi ro ngập lụt' && <span className="nav-dot" />}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={openSettings}><Settings2 size={18} /><span>{lang === 'en' ? 'Settings' : 'Cài đặt'}</span></button>
          <button className="nav-item" onClick={openHelp}><CircleHelp size={18} /><span>{lang === 'en' ? 'Help' : 'Trợ giúp'}</span></button>
          <button className={`user-card ${accountMenuOpen ? 'selected' : ''}`} aria-label="Mở menu tài khoản" onClick={() => setAccountMenuOpen((open) => !open)}>
            <span className="user-avatar">
              {userAvatarUrl ? <img className="profile-avatar-image" src={userAvatarUrl} alt="" onError={() => setUserAvatarUrl(null)} /> : userEmail ? userEmail.slice(0, 2).toUpperCase() : '??'}
            </span>
            <span>
              <strong>{userEmail ? userEmail.split('@')[0] : 'Chưa đăng nhập'}</strong>
              <small>{userEmail || 'Tài khoản Google'}</small>
            </span>
              <MoreHorizontal size={17} />
          </button>
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
            <strong>{lang === 'en' ? (navItems.find((n) => n.id === activeNav)?.labelEn || activeNav) : activeNav}</strong>
          </div>
          <div className="top-actions">
            <button
              className="lang-toggle-button"
              onClick={toggleLang}
              title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
              aria-label="Đổi ngôn ngữ / Change language"
            >
              <span className={lang === 'vi' ? 'lang-active' : ''}>VI</span>
              <span className="lang-sep">/</span>
              <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
            </button>
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder={lang === 'en' ? 'Search area, category...' : 'Tìm khu vực, loại hình...'}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button" aria-label="Thông báo" title="Thông báo và trạng thái dữ liệu" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={18} /><i /></button>
            <div className="account-menu-anchor" ref={accountMenuRef}>
              <button
                className="top-avatar"
                aria-label="Mở menu tài khoản"
                title={userEmail ? `Tài khoản: ${userEmail}` : 'Mở menu tài khoản'}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                {userAvatarUrl ? (
                  <img className="profile-avatar-image" src={userAvatarUrl} alt="" onError={() => setUserAvatarUrl(null)} />
                ) : userEmail ? userEmail.slice(0, 2).toUpperCase() : '??'}
              </button>
              {accountMenuOpen && (
                <div className="sidebar-popover account-popover" role="menu">
                  {userEmail ? (
                    <>
                      <div className="account-popover-header">
                        <div className="user-avatar">
                          {userAvatarUrl ? (
                            <img className="profile-avatar-image" src={userAvatarUrl} alt="" onError={() => setUserAvatarUrl(null)} />
                          ) : userEmail.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="account-identity">
                          <strong>{userEmail.split('@')[0]}</strong>
                          <small>{userEmail}</small>
                        </div>
                      </div>
                      <button role="menuitem" onClick={() => { openSettings(); setAccountMenuOpen(false) }}>
                        <Settings2 size={14} /> Hồ sơ & cài đặt
                      </button>
                      <button role="menuitem" className="account-signout" onClick={() => void signOut()}>
                        <LogOut size={14} /> Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button role="menuitem" onClick={() => void signInWithGoogle()}>
                      <LogIn size={14} /> {authLoading ? 'Đang chuyển tới Google...' : 'Đăng nhập bằng Google'}
                    </button>
                  )}
                  <button role="menuitem" className="account-close" onClick={() => setAccountMenuOpen(false)}>Đóng menu</button>
                </div>
              )}
            </div>
            <button className="mobile-menu" aria-label="Menu điều hướng" title="Mở menu điều hướng" onClick={() => setMobileNavOpen(!mobileNavOpen)}><Menu size={20} /></button>
          </div>
        </header>

        {notificationsOpen && <div className="quick-popover notification-popover"><strong>Trạng thái dữ liệu</strong>
          {filtering ? <p><span className="live-dot" /> Đang làm mới dữ liệu theo bộ lọc hiện tại…</p> : errorMessage ? <p style={{ color: '#c65361' }}>⚠ Không thể tải dữ liệu: {errorMessage}</p> : <p><span className="live-dot" /> Dữ liệu đang hoạt động bình thường.</p>}
          <p>{lastRefreshAt ? `Cập nhật lần cuối: ${lastRefreshAt.toLocaleTimeString('vi-VN')}` : 'Chưa có lần cập nhật thành công.'}</p>
          {!filtering && !errorMessage && <p>{totalCount.toLocaleString('vi-VN')} tin đăng phù hợp với bộ lọc hiện tại.</p>}
          <button onClick={() => { setNotificationsOpen(false); void fetchDashboardData() }}>Làm mới ngay</button><button onClick={() => setNotificationsOpen(false)}>Đóng</button>
        </div>}
        {mobileNavOpen && <div className="mobile-nav-popover">
          {navItems.map((item) => <button key={item.id} onClick={() => { setActiveNav(item.id); setMobileNavOpen(false) }}>{lang === 'en' ? item.labelEn : item.labelVi}</button>)}
          <button onClick={() => { setMobileNavOpen(false); openSettings() }}>{lang === 'en' ? 'Settings' : 'Cài đặt'}</button>
          <button onClick={() => { setMobileNavOpen(false); openHelp() }}>{lang === 'en' ? 'Help' : 'Trợ giúp'}</button>
        </div>}
        {modalOpen && <div className="modal-backdrop" onClick={closeModal}><div ref={modalRef} className="quick-modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-title" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
          {settingsOpen ? <>
            <div className="modal-heading"><div><span className="modal-eyebrow">WORKSPACE</span><h3 id="dashboard-modal-title">{lang === 'en' ? 'Dashboard Settings' : 'Cài đặt dashboard'}</h3><p>{lang === 'en' ? 'Customize display preferences and data behavior.' : 'Tùy chỉnh trải nghiệm hiển thị và dữ liệu.'}</p></div><button className="modal-close-button" aria-label="Đóng" title="Đóng cài đặt" onClick={closeModal}><X size={17} /></button></div>
            <div className="settings-group"><span className="settings-group-title">{lang === 'en' ? 'Language' : 'Ngôn ngữ'}</span>
              <label className="setting-row"><span><strong>{lang === 'en' ? 'Display Language' : 'Ngôn ngữ hiển thị'}</strong><small>{lang === 'en' ? 'Switch between Vietnamese and English' : 'Chuyển đổi giữa Tiếng Việt và English'}</small></span>
                <select className="filter-control" style={{ width: '130px', padding: '6px 8px', fontSize: '12px' }} value={lang} onChange={(e) => setLang(e.target.value as Language)}>
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
            <div className="settings-group"><span className="settings-group-title">{lang === 'en' ? 'Appearance' : 'Giao diện'}</span>
              <label className="setting-row"><span><strong>{lang === 'en' ? 'Dark Mode' : 'Chế độ tối'}</strong><small>{lang === 'en' ? 'Reduce brightness for night-time work' : 'Giảm độ sáng khi làm việc ban đêm'}</small></span><input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} /></label>
            </div>
            <div className="settings-group"><span className="settings-group-title">{lang === 'en' ? 'Data' : 'Dữ liệu'}</span>
              <label className="setting-row"><span><strong>{lang === 'en' ? 'Auto-refresh Data' : 'Tự động làm mới dữ liệu'}</strong><small>{lang === 'en' ? 'Refresh overview every 60 seconds after data loads' : 'Làm mới tổng quan sau mỗi 60 giây khi tải xong dữ liệu'}</small></span><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /></label>
            </div>
            <div className="settings-status"><span className="live-dot" /> {settingsSaved ? (lang === 'en' ? 'Settings saved on this browser' : 'Cài đặt đã lưu trên trình duyệt này') : (lang === 'en' ? 'Settings apply to this session only' : 'Cài đặt chỉ áp dụng trong phiên này; chưa lưu được trên trình duyệt')}</div>
          </> : <>
            <div className="modal-heading"><div><span className="modal-eyebrow">{lang === 'en' ? 'USER GUIDE' : 'HƯỚNG DẪN'}</span><h3 id="dashboard-modal-title">{lang === 'en' ? 'Help & Documentation' : 'Trợ giúp'}</h3></div><button className="modal-close-button" aria-label="Đóng" title="Đóng hướng dẫn" onClick={closeModal}><X size={17} /></button></div>
            <DashboardHelp activeNav={activeNav} lang={lang} />
          </>}
          <button className="button primary modal-action" onClick={closeModal}>{lang === 'en' ? 'Got It' : 'Đã hiểu'}</button>
        </div></div>}

        <div className="page-wrap">
          {authMessage && <div role="alert" className="card" style={{ padding: 16, marginBottom: 16 }}>
            <p>{authMessage}</p>
            <button className="button secondary" disabled={authLoading} onClick={() => void signInWithGoogle()}>{authLoading ? 'Đang mở Google…' : 'Đăng nhập lại'}</button>
            <button className="button secondary" onClick={() => setAuthMessage('')}>Đóng</button>
          </div>}
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
              <h1>{lang === 'en' ? 'Da Nang Rental Market Dashboard' : 'Bảng Điều Khiển Thị Trường Thuê Đà Nẵng'}</h1>
              <p>{lang === 'en' ? 'Aggregated analytics from Gold layer Data Warehouse with Dynamic Query Builder.' : 'Dữ liệu tổng hợp từ Data Warehouse tầng Gold với cơ chế Dynamic Query Builder.'}</p>
            </div>

            <div className="heading-actions">
              <button
                className={`button ${activeNav === 'Dự đoán giá AI' ? 'primary' : 'secondary'}`}
                onClick={() => setActiveNav('Dự đoán giá AI')}
              >
                <Sparkles size={16} /> {lang === 'en' ? 'AI Price Prediction' : 'Dự đoán giá AI'}
              </button>
              <button
                className="button secondary"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true)
                  setExportMessage('')
                  try {
                    const params = new URLSearchParams(filterQueryString)
                    params.set('sortBy', sortBy)
                    params.set('ascending', String(ascending))
                    const allRecords = await fetchAllRecords<RentalRecord>(params.toString())
                    const csv = toCsv([
                      [lang === 'en' ? 'Ward' : 'Khu vực', lang === 'en' ? 'Category' : 'Loại hình', lang === 'en' ? 'Price' : 'Giá', lang === 'en' ? 'Size' : 'Diện tích'],
                      ...allRecords.map(r => [r.ward_name, r.category_name, r.price_vnd, r.size_m2])
                    ])
                    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'rental_gold_export.csv'
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
                    setExportMessage(lang === 'en'
                      ? `Exported ${allRecords.length.toLocaleString('en-US')} listings according to filters at export time.`
                      : `Đã xuất ${allRecords.length.toLocaleString('vi-VN')} tin theo bộ lọc lúc bấm xuất.`)
                  } catch (error) {
                    setExportMessage(error instanceof Error ? error.message : (lang === 'en' ? 'Failed to export CSV. Please try again.' : 'Không thể xuất CSV. Vui lòng thử lại.'))
                  } finally {
                    setExporting(false)
                  }
                }}
              >
                <Download size={16} /> {exporting ? (lang === 'en' ? 'Exporting…' : 'Đang xuất…') : (lang === 'en' ? 'Export CSV' : 'Xuất CSV')}
              </button>

              <button
                className={`button ${filterOpen ? 'primary' : 'secondary'}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={16} /> {lang === 'en' ? 'Filters' : 'Bộ lọc'}
                {activeFiltersCount > 0 && (
                  <span className="filter-count">{activeFiltersCount}</span>
                )}
              </button>
            </div>
          </div>

          {exportMessage && <p role="status">{exportMessage}</p>}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="posted-start">{lang === 'en' ? 'Posted from' : 'Ngày đăng từ'}</label>
                  {startDate !== DEFAULT_START_DATE && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      onClick={() => { setStartDate(DEFAULT_START_DATE); setPage(1) }}
                      title="Khôi phục mốc mặc định từ tháng 1/2026"
                    >
                      {lang === 'en' ? 'Reset Jan 2026' : 'Về T1/2026'}
                    </button>
                  )}
                  {startDate === DEFAULT_START_DATE && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                      onClick={() => { setStartDate(''); setPage(1) }}
                      title="Bỏ mốc tháng 1/2026 để xem toàn bộ dữ liệu lịch sử trước 2026"
                    >
                      {lang === 'en' ? 'All history' : 'Tất cả lịch sử'}
                    </button>
                  )}
                </div>
                <input
                  id="posted-start"
                  className="filter-control"
                  type="date"
                  value={startDate}
                  max={endDate || todayDate}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && endDate && val > endDate) return
                    setStartDate(val)
                    setPage(1)
                  }}
                />
              </div>
              <div className="filter-item">
                <label htmlFor="posted-end">{lang === 'en' ? 'Posted to' : 'Ngày đăng đến'}</label>
                <input
                  id="posted-end"
                  className="filter-control"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={todayDate}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && ((startDate && val < startDate) || val > todayDate)) return
                    setEndDate(val)
                    setPage(1)
                  }}
                />
              </div>
              <div className="filter-item">
                <label>{lang === 'en' ? 'Ward' : 'Khu vực (Ward)'}</label>
                <select
                  className="filter-control"
                  value={wardFilter}
                  onChange={(e) => {
                    setWardFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All districts' : 'Tất cả quận/huyện'}</option>
                  {WARDS_OPTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>{lang === 'en' ? 'Category' : 'Loại hình'}</label>
                <select
                  className="filter-control"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All categories' : 'Tất cả loại hình'}</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>{lang === 'en' ? 'Furnishing' : 'Nội thất'}</label>
                <select
                  className="filter-control"
                  value={furnishingFilter}
                  onChange={(e) => {
                    setFurnishingFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All furnishings' : 'Tất cả nội thất'}</option>
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>{lang === 'en' ? 'Price Range' : 'Khoảng giá'}</label>
                <select
                  className="filter-control"
                  value={priceRangeFilter}
                  onChange={(e) => {
                    setPriceRangeFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All price ranges' : 'Tất cả mức giá'}</option>
                  <option value="under_3m">Dưới 3 triệu (Bình dân)</option>
                  <option value="3m_5m">3 — 5 triệu (Tiêu chuẩn)</option>
                  <option value="5m_8m">5 — 8 triệu (Căn hộ dịch vụ)</option>
                  <option value="8m_15m">8 — 15 triệu (Cao cấp)</option>
                  <option value="above_15m">Trên 15 triệu (Hạng sang)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>{lang === 'en' ? 'Area Size' : 'Diện tích'}</label>
                <select
                  className="filter-control"
                  value={sizeRangeFilter}
                  onChange={(e) => {
                    setSizeRangeFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All sizes' : 'Tất cả diện tích'}</option>
                  <option value="under_20">Dưới 20 m² (Phòng nhỏ / KTX)</option>
                  <option value="20_35">20 — 35 m² (Studio / 1PN)</option>
                  <option value="35_50">35 — 50 m² (Rộng / 1-2PN)</option>
                  <option value="above_50">Trên 50 m² (Căn lớn / Nhà riêng)</option>
                </select>
              </div>


              <div className="filter-item">
                <label>{lang === 'en' ? 'Flood Risk' : 'Rủi ro ngập'}</label>
                <select
                  className="filter-control"
                  value={floodRiskFilter}
                  onChange={(e) => {
                    setFloodRiskFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">{lang === 'en' ? 'All risk levels' : 'Tất cả cấp độ'}</option>
                  <option value="0">Thấp / An toàn (0)</option>
                  <option value="1">Trung bình (1)</option>
                  <option value="2">Nguy cơ cao (2)</option>
                </select>
              </div>

              <div className="filter-item" style={{ minWidth: '220px', flex: '1 1 100%' }}>
                <label>{lang === 'en' ? 'Essential Amenities' : 'Tiện ích thiết yếu'}</label>
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
                    <RotateCcw size={14} /> {lang === 'en' ? 'Reset' : 'Đặt lại'}
                  </button>
                )}
                <button className="clear-filter" onClick={() => setFilterOpen(false)}>
                  <X size={14} /> {lang === 'en' ? 'Close' : 'Đóng'}
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Summary */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-wrap" aria-label="Điều kiện lọc đang áp dụng">
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                {lang === 'en' ? `Active Filters (${activeFiltersCount})` : `Điều kiện đang áp dụng (${activeFiltersCount})`}
              </span>
              {(startDate || endDate) && (
                <span className="filter-chip">
                  Ngày đăng: {startDate || 'bất kỳ'} — {endDate || 'bất kỳ'}
                  <button
                    aria-label="Đặt lại điều kiện ngày đăng"
                    title={startDate === DEFAULT_START_DATE && endDate === todayDate ? 'Xóa lọc ngày để xem tất cả lịch sử' : 'Đặt lại về mặc định từ tháng 1/2026'}
                    onClick={() => {
                      if (startDate === DEFAULT_START_DATE && endDate === todayDate) {
                        setStartDate('')
                        setEndDate('')
                      } else {
                        setStartDate(DEFAULT_START_DATE)
                        setEndDate(todayDate)
                      }
                      setPage(1)
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
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
              lang={lang}
            />
          )}
          {activeNav === 'Tiện ích' && (
            <AmenitiesView
              filterQueryString={filterQueryString}
              lang={lang}
            />
          )}
          {activeNav === 'Rủi ro ngập lụt' && (
            <FloodRiskView
              filterQueryString={filterQueryString}
              lang={lang}
            />
          )}
          {activeNav === 'Phân tích nâng cao' && (
            <AdvancedAnalyticsView
              filterQueryString={filterQueryString}
              lang={lang}
            />
          )}

          {activeNav === 'Dự đoán giá AI' && (
            <PricePredictionView />
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
                  <button
                    className={`tab ${activeTab === 'Dự đoán giá AI' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Dự đoán giá AI')}
                    role="tab"
                    aria-selected={activeTab === 'Dự đoán giá AI'}
                  >
                    Dự đoán giá AI
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
                      const separator = e.target.value.lastIndexOf('_')
                      const col = e.target.value.slice(0, separator)
                      const asc = e.target.value.slice(separator + 1)
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
                    <option value="size_m2_true">Diện tích tăng dần</option>
                  </select>
                </div>
              </div>

              {activeTab === 'Dự đoán giá AI' && (
                <PricePredictionView />
              )}

              {activeTab !== 'Tổng quan' && activeTab !== 'Dự đoán giá AI' && (
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
                      label={lang === 'en' ? 'Listings (Filtered)' : 'Tin đăng (sau lọc)'}
                      value={kpiData?.total_listings.toLocaleString() || '0'}
                      delta={totalCount === 3238 ? (lang === 'en' ? 'All' : 'Toàn bộ') : `${((totalCount / 3238) * 100).toFixed(0)}% ${lang === 'en' ? 'sample' : 'mẫu'}`}
                      note={lang === 'en' ? 'gold schema' : 'dữ liệu kho gold'}
                      tone="blue"
                    />
                    <Kpi
                      icon={<TrendingUp size={18} />}
                      label={lang === 'en' ? 'Average Rent' : 'Giá thuê trung bình'}
                      value={`${kpiData?.avg_price_million.toFixed(2) || '0'} ${lang === 'en' ? 'M' : 'tr'}`}
                      delta={kpiData?.avg_price_million && kpiData.avg_price_million > 6 ? (lang === 'en' ? 'Premium' : 'Phân khúc cao') : (lang === 'en' ? 'Budget' : 'Bình dân')}
                      note={lang === 'en' ? 'VND / month' : 'VNĐ / tháng'}
                      tone="orange"
                    />
                    <Kpi
                      icon={<Activity size={18} />}
                      label={lang === 'en' ? 'Average Size' : 'Diện tích trung bình'}
                      value={`${kpiData?.avg_size_m2.toFixed(1) || '0'} m²`}
                      delta={lang === 'en' ? 'Market standard' : 'Chuẩn thị trường'}
                      note={lang === 'en' ? 'm² / unit' : 'm²/phòng'}
                      tone="purple"
                    />
                    <Kpi
                      icon={<ShieldAlert size={18} />}
                      label={lang === 'en' ? 'Flood Safety Ratio' : 'Tỷ lệ an toàn ngập lụt'}
                      value={`${kpiData?.flood_risk_low_percentage.toFixed(0) || '0'}%`}
                      delta={kpiData && kpiData.flood_risk_low_percentage > 70 ? (lang === 'en' ? 'Safe' : 'An toàn') : (lang === 'en' ? 'Caution' : 'Cần chú ý')}
                      note={lang === 'en' ? 'zero risk = 0' : 'khu vực rủi ro = 0'}
                      tone="green"
                    />
                  </section>

                  {/* CHARTS GRID */}
                  <DashboardCharts trend={trendData} distribution={priceDistribution} total={kpiData?.total_listings || 0} lang={lang} />
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
                        title={lang === 'en' ? 'All Areas (Supply)' : 'Tất cả khu vực (Nguồn cung)'}
                        subtitle={lang === 'en' ? 'All areas with listings, sorted descending by volume' : 'Toàn bộ khu vực có tin đăng, sắp xếp theo số lượng giảm dần'}
                        action=""
                      />
                      <div className="ward-list">
                        {wards.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                            {lang === 'en' ? 'No matching area data' : 'Không có dữ liệu khu vực phù hợp'}
                          </div>
                        ) : (
                          wards.map((ward, index) => {
                            const tones = ['blue', 'orange', 'purple', 'green', 'blue']
                            const maxCount = Math.max(...wards.map((w) => w.count), 1)
                            const barWidth = (ward.count / maxCount) * 100
                            return (
                              <div className="ward-row" key={ward.name}>
                                <span className="rank">{index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
                                <div className={`ward-icon ${tones[index % tones.length]}`}>
                                  <MapPin size={15} />
                                </div>
                                <div className="ward-name">
                                  <strong>{ward.name}</strong>
                                  <small>{ward.count} {lang === 'en' ? 'listings' : 'tin đăng'}</small>
                                </div>
                                <div className="ward-bar">
                                  <span style={{ width: `${Math.max(10, barWidth)}%` }} />
                                </div>
                                <div className="ward-price">
                                  <strong>{(ward.avgPrice / 1000000).toFixed(1)} {lang === 'en' ? 'M' : 'tr'}</strong>
                                  <small>{lang === 'en' ? 'Avg / mo' : 'TB / tháng'}</small>
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
                        title={lang === 'en' ? 'Actual Listings (gold.rental_room)' : 'Danh sách tin đăng thực tế (gold.rental_room)'}
                        subtitle={lang === 'en' ? `Showing ${records.length} / ${totalCount.toLocaleString('en-US')} results` : `Hiển thị ${records.length} / ${totalCount.toLocaleString('vi-VN')} kết quả`}
                        action=""
                      />
                      <div className="activity-table" aria-busy={filtering}>
                        <div className="table-head">
                          <span>{lang === 'en' ? 'AREA' : 'KHU VỰC'}</span>
                          <span>{lang === 'en' ? 'RENT' : 'GIÁ THUÊ'}</span>
                          <span>{lang === 'en' ? 'SIZE' : 'DIỆN TÍCH'}</span>
                          <span>{lang === 'en' ? 'FLOOD RISK' : 'RỦI RO NGẬP'}</span>
                          <span>{lang === 'en' ? 'POSTED' : 'NGÀY ĐĂNG'}</span>
                        </div>
                        {filtering ? (
                          <div className="listings-skeleton" role="status" aria-label={lang === 'en' ? 'Loading listings' : 'Đang tải tin đăng'}>
                            {Array.from({ length: 5 }, (_, index) => (
                              <div className="listings-skeleton-row" aria-hidden="true" key={index}>
                                <span /><span /><span /><span /><span />
                              </div>
                            ))}
                          </div>
                        ) : records.length === 0 ? (
                          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)' }}>
                            {lang === 'en' ? 'No listings found matching current filters.' : 'Không tìm thấy tin đăng nào phù hợp với bộ lọc hiện tại.'}
                          </div>
                        ) : (
                          records.map((r, index) => {
                            const riskText =
                              lang === 'en'
                                ? (r.flood_risk_label === 0 ? 'Low' : r.flood_risk_label === 1 ? 'Medium' : 'High')
                                : (r.flood_risk_label === 0 ? 'Thấp' : r.flood_risk_label === 1 ? 'Trung bình' : 'Cao')
                            const riskClass =
                              r.flood_risk_label === 0 ? 'low' : r.flood_risk_label === 1 ? 'medium' : 'high'

                            return (
                              <div className="table-row" key={`${r.source}_${r.list_id}_${index}`}>
                                <div>
                                  <strong>{r.ward_name || 'N/A'}</strong>
                                  <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                                    {r.category_name || (lang === 'en' ? 'Rental Room' : 'Phòng cho thuê')}
                                  </div>
                                </div>
                                <span>
                                  {r.price_vnd ? `${(r.price_vnd / 1000000).toFixed(1)} ${lang === 'en' ? 'M' : 'tr'}` : (lang === 'en' ? 'Negotiable' : 'Thỏa thuận')}
                                </span>
                                <span>{r.size_m2 ? `${Math.round(r.size_m2)} m²` : 'N/A'}</span>
                                <span className={`risk ${riskClass}`}>{riskText}</span>
                                <small>{r.posted_date ? r.posted_date.slice(0, 10) : (lang === 'en' ? 'Recent' : 'Gần đây')}</small>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Pagination Bar */}
                      <div className="pagination-container">
                        <span>
                          {lang === 'en' ? `Page ${page} / ${totalPages || 1} (${totalCount.toLocaleString('en-US')} listings)` : `Trang ${page} / ${totalPages || 1} (${totalCount.toLocaleString('vi-VN')} tin)`}
                        </span>
                        <div className="pagination-controls">
                          <button
                            className="page-btn"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            <ChevronLeft size={14} /> {lang === 'en' ? 'Prev' : 'Trước'}
                          </button>
                          <button
                            className="page-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          >
                            {lang === 'en' ? 'Next' : 'Sau'} <ChevronRight size={14} />
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
