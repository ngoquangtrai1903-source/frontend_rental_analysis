'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw, Filter, Layers, Info, DollarSign, Home } from 'lucide-react'
import { MapRentalPoint } from '@/lib/goldQueryService'

interface Hotspot {
  name: string
  type: string
  lat: number
  lng: number
}

const DA_NANG_HOTSPOTS: Hotspot[] = [
  { name: 'Trung tâm CBD (Cầu Rồng)', type: 'cbd', lat: 16.0610, lng: 108.2274 },
  { name: 'Bãi biển Mỹ Khê', type: 'beach', lat: 16.0592, lng: 108.2483 },
  { name: 'Bãi biển Phạm Văn Đồng', type: 'beach', lat: 16.0756, lng: 108.2450 },
  { name: 'Sân bay Quốc tế Đà Nẵng', type: 'airport', lat: 16.0538, lng: 108.1994 },
  { name: 'ĐH Bách Khoa (Liên Chiểu)', type: 'uni', lat: 16.0750, lng: 108.1530 },
  { name: 'ĐH Kinh Tế (Ngũ Hành Sơn)', type: 'uni', lat: 16.0490, lng: 108.2430 }
]

const WARDS = [
  'Tất cả quận/huyện',
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

export default function LocationMapView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [points, setPoints] = useState<MapRentalPoint[]>([])
  const [loading, setLoading] = useState(true)

  // Map filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('all')
  const [selectedWard, setSelectedWard] = useState<string>('all')

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Hover & selection state
  const [hoveredPoint, setHoveredPoint] = useState<MapRentalPoint | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<MapRentalPoint | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Bounds for projection
  // Đà Nẵng city core: Lat 15.98 - 16.14, Lng 108.12 - 108.30
  const baseBounds = useMemo(() => ({
    minLat: 15.98,
    maxLat: 16.14,
    minLng: 108.12,
    maxLng: 108.30
  }), [])

  // Fetch coordinates from API
  const fetchMapData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('mode', 'map')
      params.set('limit', '3500')

      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedWard !== 'all' && selectedWard !== 'Tất cả quận/huyện') params.set('ward', selectedWard)

      if (selectedPriceTier === 'under_4m') params.set('max_price', '4000000')
      else if (selectedPriceTier === '4m_8m') {
        params.set('min_price', '4000000')
        params.set('max_price', '8000000')
      } else if (selectedPriceTier === 'above_8m') {
        params.set('min_price', '8000000')
      }

      const res = await fetch(`/api/gold-query?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setPoints(json.points || [])
      }
    } catch (e) {
      console.error('Failed to load map data:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedPriceTier, selectedWard])

  useEffect(() => {
    fetchMapData()
  }, [fetchMapData])

  // Coordinate projector
  const project = useCallback(
    (lat: number, lng: number, width: number, height: number) => {
      const padding = 40
      const w = width - padding * 2
      const h = height - padding * 2

      const xNorm = (lng - baseBounds.minLng) / (baseBounds.maxLng - baseBounds.minLng)
      const yNorm = (baseBounds.maxLat - lat) / (baseBounds.maxLat - baseBounds.minLat)

      // Apply zoom & pan centered
      const centerX = width / 2
      const centerY = height / 2

      const px = centerX + (xNorm * w + padding - centerX) * zoom + pan.x
      const py = centerY + (yNorm * h + padding - centerY) * zoom + pan.y

      return { x: px, y: py }
    },
    [baseBounds, zoom, pan]
  )

  // Reverse project for click/hit detection
  const findPointAt = useCallback(
    (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = clientX - rect.left
      const clickY = clientY - rect.top

      for (let i = points.length - 1; i >= 0; i--) {
        const pt = points[i]
        const { x, y } = project(pt.latitude, pt.longitude, canvas.width, canvas.height)
        const dist = Math.hypot(clickX - x, clickY - y)
        if (dist <= 8) {
          return { point: pt, pos: { x: clickX, y: clickY } }
        }
      }
      return null
    },
    [points, project]
  )

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear background
    ctx.fillStyle = '#f4f7fb'
    ctx.fillRect(0, 0, width, height)

    // Draw reference geographical grid & waters
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw East Sea / Beach visual area (Right side of Da Nang)
    const seaP1 = project(16.14, 108.26, width, height)
    const seaP2 = project(15.98, 108.28, width, height)
    ctx.fillStyle = '#e8f2fe'
    ctx.beginPath()
    ctx.moveTo(seaP1.x, 0)
    ctx.lineTo(width, 0)
    ctx.lineTo(width, height)
    ctx.lineTo(seaP2.x, height)
    ctx.closePath()
    ctx.fill()

    // Sea label
    ctx.fillStyle = '#9cb8dc'
    ctx.font = '600 11px DM Sans'
    ctx.fillText('BIỂN ĐÔNG (MỸ KHÊ / SƠN TRÀ)', width - 170, 30)

    // Draw rental points
    for (const pt of points) {
      const { x, y } = project(pt.latitude, pt.longitude, width, height)

      // Skip offscreen points
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue

      const isApartment = pt.category_name?.includes('Căn hộ')
      const isHighEnd = pt.price_vnd && pt.price_vnd >= 10000000

      ctx.beginPath()
      ctx.arc(x, y, isHighEnd ? 4.5 : 3.5, 0, Math.PI * 2)

      if (isHighEnd) {
        ctx.fillStyle = 'rgba(230, 90, 40, 0.75)'
      } else if (isApartment) {
        ctx.fillStyle = 'rgba(48, 120, 240, 0.70)'
      } else {
        ctx.fillStyle = 'rgba(40, 167, 100, 0.70)'
      }

      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 0.75
      ctx.stroke()
    }

    // Highlight selected or hovered point
    const target = hoveredPoint || selectedPoint
    if (target) {
      const { x, y } = project(target.latitude, target.longitude, width, height)
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.fillStyle = '#ff4d4f'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.stroke()
    }

    // Draw Hotspots (POI)
    for (const spot of DA_NANG_HOTSPOTS) {
      const { x, y } = project(spot.lat, spot.lng, width, height)
      if (x < 0 || x > width || y < 0 || y > height) continue

      ctx.fillStyle = '#17233d'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Hotspot Label
      ctx.fillStyle = '#17233d'
      ctx.font = '700 10px DM Sans'
      ctx.fillText(spot.name, x + 8, y + 3)
    }
  }, [points, zoom, pan, hoveredPoint, selectedPoint, project])

  // Mouse event handlers for Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    } else if (canvasRef.current) {
      const match = findPointAt(e.clientX, e.clientY, canvasRef.current)
      if (match) {
        setHoveredPoint(match.point)
        setTooltipPos(match.pos)
      } else {
        setHoveredPoint(null)
      }
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const match = findPointAt(e.clientX, e.clientY, canvasRef.current)
      if (match) {
        setSelectedPoint(match.point)
      }
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88
    setZoom((z) => Math.max(0.7, Math.min(6.0, z * zoomFactor)))
  }

  // Summary metrics for current points on map
  const mapStats = useMemo(() => {
    if (points.length === 0) return { count: 0, avgPrice: 0, avgPpm2: 0, aptCount: 0 }
    const validPrices = points.filter((p) => p.price_vnd && p.price_vnd > 0)
    const sumPrice = validPrices.reduce((a, b) => a + (b.price_vnd || 0), 0)
    const sumPpm2 = validPrices.reduce((a, b) => a + (b.price_per_m2_vnd || 0), 0)
    const aptCount = points.filter((p) => p.category_name?.includes('Căn hộ')).length

    return {
      count: points.length,
      avgPrice: validPrices.length > 0 ? Number(((sumPrice / validPrices.length) / 1000000).toFixed(1)) : 0,
      avgPpm2: validPrices.length > 0 ? Math.round(sumPpm2 / validPrices.length) : 0,
      aptCount
    }
  }, [points])

  return (
    <div className="workspace-view">
      {/* Hero Header */}
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <MapPin size={22} />
        </div>
        <div>
          <span className="eyebrow">LOCATION INTELLIGENCE & GIS MAP</span>
          <h2>Bản đồ Phân bố Không gian BĐS Cho thuê Đà Nẵng</h2>
          <p>Trực quan hóa 3,238 tọa độ thực tế từ tầng Gold, tương tác lọc đa lớp theo giá, loại hình và cự ly.</p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" /> {loading ? 'Đang tải...' : `${points.length} tọa độ sẵn sàng`}
        </span>
      </div>

      {/* Map Interactive Toolbar */}
      <div className="filter-panel" style={{ marginTop: '0px' }}>
        <div className="filter-item">
          <label>Loại hình BĐS</label>
          <select
            className="filter-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tất cả loại hình</option>
            <option value="Căn hộ/Chung cư">Căn hộ/Chung cư (Xanh dương)</option>
            <option value="Phòng trọ">Phòng trọ (Xanh lá)</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Khoảng giá</label>
          <select
            className="filter-control"
            value={selectedPriceTier}
            onChange={(e) => setSelectedPriceTier(e.target.value)}
          >
            <option value="all">Tất cả mức giá</option>
            <option value="under_4m">Dưới 4 triệu / tháng</option>
            <option value="4m_8m">4 — 8 triệu / tháng</option>
            <option value="above_8m">Trên 8 triệu / tháng (Cam)</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Quận / Huyện</label>
          <select
            className="filter-control"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            {WARDS.map((w) => (
              <option key={w} value={w === 'Tất cả quận/huyện' ? 'all' : w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button
            className="clear-filter"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedPriceTier('all')
              setSelectedWard('all')
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
          >
            <RotateCcw size={14} /> Đặt lại góc nhìn
          </button>
        </div>
      </div>

      {/* Map Metrics Row */}
      <div className="analysis-cards">
        <div className="card metric-card">
          <div className="kpi-icon blue"><Navigation size={17} /></div>
          <span>Tọa độ hiển thị</span>
          <strong>{mapStats.count.toLocaleString()} tin</strong>
          <small>Phủ sóng trên toàn địa bàn Đà Nẵng</small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon orange"><DollarSign size={17} /></div>
          <span>Giá thuê TB trong vùng</span>
          <strong>{mapStats.avgPrice} tr / tháng</strong>
          <small>Đơn giá: {mapStats.avgPpm2.toLocaleString()} đ/m²</small>
        </div>
        <div className="card metric-card">
          <div className="kpi-icon purple"><Home size={17} /></div>
          <span>Tỷ lệ Căn hộ / Phòng trọ</span>
          <strong>
            {mapStats.count > 0 ? `${Math.round((mapStats.aptCount / mapStats.count) * 100)}% Căn hộ` : '0%'}
          </strong>
          <small>{mapStats.count - mapStats.aptCount} phòng trọ sinh viên/người đi làm</small>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="map-wrapper">
        <canvas
          ref={canvasRef}
          className="map-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
        />

        {/* Floating Zoom Controls */}
        <div className="map-controls">
          <button
            className="map-btn"
            title="Phóng to"
            onClick={() => setZoom((z) => Math.min(6, z * 1.3))}
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="map-btn"
            title="Thu nhỏ"
            onClick={() => setZoom((z) => Math.max(0.7, z * 0.75))}
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="map-btn"
            title="Căn giữa"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Legend */}
        <div className="map-legend-overlay">
          <strong>CHÚ THÍCH PHÂN TẦNG:</strong>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ background: '#3078f0' }} />
            <span>Căn hộ / Chung cư (Thuê chuyên gia / Expat)</span>
          </div>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ background: '#28a745' }} />
            <span>Phòng trọ (Bình dân / Sinh viên)</span>
          </div>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ background: '#e65a28' }} />
            <span>Phân khúc Cao cấp (&gt; 10 triệu / tháng)</span>
          </div>
          <div className="map-legend-row">
            <span className="map-legend-dot" style={{ background: '#17233d' }} />
            <span>Điểm nóng trọng điểm (CBD, Biển, Sân bay, ĐH)</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="map-tooltip"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <strong>{hoveredPoint.category_name || 'Phòng cho thuê'} · {hoveredPoint.ward_name}</strong>
            <div>
              Giá: {hoveredPoint.price_vnd ? `${(hoveredPoint.price_vnd / 1000000).toFixed(1)} tr/tháng` : 'Thỏa thuận'} · {hoveredPoint.size_m2} m²
            </div>
            <div style={{ fontSize: '10px', color: '#9cb8dc' }}>
              Cách biển: {hoveredPoint.dist_to_beach?.toFixed(1) || 'N/A'} km · Cách CBD: {hoveredPoint.dist_to_cbd?.toFixed(1) || 'N/A'} km
            </div>
          </div>
        )}
      </div>

      {/* Selected Property Inspector Drawer / Card */}
      {selectedPoint && (
        <div className="card" style={{ padding: '20px', background: '#ffffff', border: '2px solid #3078f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="eyebrow">CHI TIẾT ĐỊA ĐIỂM ĐÃ CHỌN (ID: {selectedPoint.list_id})</span>
              <h3 style={{ margin: '4px 0', fontSize: '18px' }}>
                {selectedPoint.category_name} tại {selectedPoint.ward_name}, Đà Nẵng
              </h3>
            </div>
            <button className="clear-filter" onClick={() => setSelectedPoint(null)}>Đóng lại ✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Giá thuê niêm yết</span>
              <div style={{ font: '800 18px Manrope', color: 'var(--blue)' }}>
                {selectedPoint.price_vnd ? `${(selectedPoint.price_vnd / 1000000).toFixed(2)} triệu` : 'Thỏa thuận'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Diện tích & Đơn giá</span>
              <div style={{ font: '700 15px Manrope' }}>
                {selectedPoint.size_m2} m² ({selectedPoint.price_per_m2_vnd?.toLocaleString()} đ/m²)
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Khoảng cách tiện ích</span>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                Biển: {selectedPoint.dist_to_beach?.toFixed(1)} km · CBD: {selectedPoint.dist_to_cbd?.toFixed(1)} km
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Nội thất & Ngập lụt</span>
              <div style={{ fontSize: '12px' }}>
                {selectedPoint.furnishing_status || 'Cơ bản'} · {selectedPoint.flood_risk_label === 0 ? '🟢 An toàn ngập' : '🟠 Cần chú ý'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
