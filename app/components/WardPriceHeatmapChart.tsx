'use client'

import React, { useState, useId, useRef, useCallback, useEffect } from 'react'
import type { PriceHeatmapCell } from '@/lib/goldQueryService'

interface WardPriceHeatmapChartProps {
  heatmapData: PriceHeatmapCell[]
  wards: string[]
  categories: string[]
  maxPrice: number
  loading?: boolean
  lang?: 'vi' | 'en'
}

function getHeatTier(medianMillion: number, maxMillion: number, isEn = false) {
  const ratio = maxMillion > 0 ? medianMillion / maxMillion : 0
  if (ratio >= 0.75) {
    return { name: isEn ? 'Luxury' : 'Cao cấp', tag: isEn ? '🔥 Luxury' : '🔥 Cao cấp', className: 'tier-luxury' }
  }
  if (ratio >= 0.5) {
    return { name: isEn ? 'High' : 'Khá cao', tag: isEn ? '📈 High' : '📈 Khá cao', className: 'tier-high' }
  }
  if (ratio >= 0.25) {
    return { name: isEn ? 'Mid' : 'Phổ thông', tag: isEn ? '⚖️ Mid' : '⚖️ Phổ thông', className: 'tier-mid' }
  }
  return { name: isEn ? 'Budget' : 'Tiết kiệm', tag: isEn ? '🏷️ Budget' : '🏷️ Giá rẻ', className: 'tier-low' }
}

function translateCategory(category: string, isEn: boolean): string {
  if (!isEn) return category
  if (category.includes('Căn hộ') || category.includes('Chung cư')) return 'Apartment'
  if (category.includes('Phòng trọ')) return 'Rental Room'
  if (category.includes('Nhà nguyên căn') || category.includes('Nhà riêng')) return 'Whole House'
  if (category.includes('Mặt bằng') || category.includes('Văn phòng')) return 'Commercial/Office'
  return category
}

export default function WardPriceHeatmapChart({
  heatmapData,
  wards,
  categories,
  maxPrice,
  loading = false,
  lang = 'vi'
}: WardPriceHeatmapChartProps) {
  const isEn = lang === 'en'
  const chartId = useId().replace(/:/g, '')
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{
    wardName: string
    category: string
    cell?: PriceHeatmapCell
    intensity: number
  } | null>(null)

  const handleCellEnter = useCallback(
    (payload: { wardName: string; category: string; cell?: PriceHeatmapCell; intensity: number }) => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
      setHoveredCell(payload)
    },
    []
  )

  const handleCellLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
    }
    // 120ms grace period so moving across cell boundaries or gaps never flickers
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCell(null)
    }, 120)
  }, [])

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div role="status" className="chart-empty-state">
        {isEn ? 'Loading heatmap data…' : 'Đang tải dữ liệu bản đồ nhiệt…'}
      </div>
    )
  }

  if (heatmapData.length === 0) {
    return (
      <div role="status" className="chart-empty-state">
        {isEn ? 'Insufficient data to generate heatmap.' : 'Chưa đủ dữ liệu để lập bản đồ nhiệt.'}
      </div>
    )
  }

  const activeCell = hoveredCell?.cell
  const activeTier = activeCell ? getHeatTier(activeCell.medianPriceMillion, maxPrice, isEn) : null

  return (
    <div
      className="ward-heatmap-container"
      role="region"
      aria-label={isEn ? 'Rental price heatmap by ward and property type' : 'Biểu đồ bản đồ nhiệt giá thuê theo phường và loại hình'}
      onMouseLeave={() => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
        setHoveredCell(null)
      }}
    >
      {/* 1. Live Interactive Inspector Ribbon - Stable Fixed Height */}
      <div className={`heatmap-inspector-ribbon ${activeCell ? 'active' : ''}`} aria-live="polite">
        {activeCell ? (
          <div className="inspector-content">
            <div className="inspector-primary">
              <span className="inspector-badge-icon">📍</span>
              <div className="inspector-titles">
                <strong>{isEn ? `${activeCell.wardName} Ward` : `Phường ${activeCell.wardName}`}</strong>
                <span className="inspector-category-badge">{translateCategory(activeCell.category, isEn)}</span>
              </div>
            </div>

            <div className="inspector-metrics">
              <div className="inspector-metric">
                <span className="inspector-label">{isEn ? 'Median Rent:' : 'Giá trung vị:'}</span>
                <span className="inspector-val">
                  <strong>{activeCell.medianPriceMillion.toFixed(2)}</strong> {isEn ? 'M VND/mo' : 'tr/tháng'}
                </span>
              </div>

              <div className="inspector-metric">
                <span className="inspector-label">{isEn ? 'Sample Size:' : 'Khảo sát:'}</span>
                <span className="inspector-val">
                  <strong>{activeCell.count.toLocaleString(isEn ? 'en-US' : 'vi-VN')}</strong> {isEn ? 'listings' : 'tin'}
                </span>
              </div>

              <div className="inspector-metric">
                <span className="inspector-label">{isEn ? 'Heat Level:' : 'Mức nhiệt:'}</span>
                <span className={`inspector-tier-pill ${activeTier?.className}`}>
                  {activeTier?.tag} ({Math.round(hoveredCell.intensity * 100)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="inspector-placeholder">
            <span className="inspector-hint-icon">💡</span>
            <span>
              {isEn
                ? 'Hover or use Tab key on cells to inspect median rent, listing volume, and tier by ward.'
                : 'Rê chuột hoặc dùng phím Tab vào từng ô để xem chi tiết mức giá trung vị, số tin và phân khúc theo phường.'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Scrollable Heatmap Table Matrix */}
      <div className="heatmap-scroll-hint" aria-hidden="true">
        <span>{isEn ? '⟷ Scroll horizontally to view categories' : '⟷ Vuốt ngang để xem các loại hình'}</span>
      </div>
      <div
        className="price-heatmap-scroll"
        tabIndex={0}
        role="region"
        aria-label={isEn ? 'Rental price heatmap matrix' : 'Bảng ma trận giá thuê nhiệt'}
      >
        <table className="price-heatmap" role="grid">
          <thead>
            <tr>
              <th scope="col" className="heatmap-corner-header">
                {isEn ? 'Area / Ward' : 'Khu vực / Phường'}
              </th>
              {categories.map((category) => (
                <th
                  key={category}
                  scope="col"
                  className={`heatmap-col-header ${hoveredCell?.category === category ? 'col-highlight' : ''}`}
                >
                  {translateCategory(category, isEn)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wards.map((ward, rowIdx) => {
              const isRowActive = hoveredCell?.wardName === ward

              return (
                <tr key={ward} className={isRowActive ? 'row-highlight' : ''}>
                  <th
                    scope="row"
                    className={`heatmap-row-header ${isRowActive ? 'row-active' : ''}`}
                  >
                    {ward}
                  </th>
                  {categories.map((category, colIdx) => {
                    const cell = heatmapData.find(
                      (item) => item.wardName === ward && item.category === category
                    )
                    const intensity = cell ? Math.max(0.12, cell.medianPriceMillion / maxPrice) : 0
                    const isCellHovered = isRowActive && hoveredCell?.category === category
                    const tooltipId = `heatmap-cell-tip-${chartId}-${rowIdx}-${colIdx}`
                    const tier = cell ? getHeatTier(cell.medianPriceMillion, maxPrice, isEn) : null

                    // Determine tooltip placement: top half opens downwards, bottom half opens upwards
                    const isLowerHalf = rowIdx >= Math.floor(wards.length / 2)
                    const isRightEdge = colIdx >= categories.length - 1

                    return (
                      <td
                        key={category}
                        className={`heatmap-td ${isCellHovered ? 'cell-active' : ''}`}
                        onMouseEnter={() =>
                          handleCellEnter({ wardName: ward, category, cell, intensity })
                        }
                        onMouseLeave={handleCellLeave}
                      >
                        {cell ? (
                          <div
                            className={`price-heatmap-cell ${isCellHovered ? 'hovered' : ''}`}
                            tabIndex={0}
                            role="gridcell"
                            aria-label={
                              isEn
                                ? `${ward} Ward, ${translateCategory(category, true)}: median rent ${cell.medianPriceMillion.toFixed(2)} million VND/month, ${cell.count} listings`
                                : `Phường ${ward}, ${category}: giá trung vị ${cell.medianPriceMillion.toFixed(2)} triệu đồng mỗi tháng, ${cell.count} tin đăng`
                            }
                            aria-describedby={tooltipId}
                            onFocus={() =>
                              handleCellEnter({ wardName: ward, category, cell, intensity })
                            }
                            onBlur={handleCellLeave}
                          >
                            <span
                              className="price-heatmap-fill"
                              style={{ opacity: intensity }}
                              aria-hidden="true"
                            />
                            <strong>
                              {cell.medianPriceMillion.toFixed(1)} {isEn ? 'M' : 'tr'}
                            </strong>
                            <small>
                              {cell.count.toLocaleString(isEn ? 'en-US' : 'vi-VN')} {isEn ? 'listings' : 'tin'}
                            </small>

                            {/* Accessible Popover / Tooltip on cell */}
                            <div
                              className={`price-heatmap-tooltip ${isLowerHalf ? 'pos-top' : 'pos-bottom'} ${isRightEdge ? 'pos-right-edge' : ''}`}
                              id={tooltipId}
                              role="tooltip"
                            >
                              <div className="tooltip-header">
                                <span className="tooltip-ward">
                                  {isEn ? `${ward} Ward` : `Phường ${ward}`}
                                </span>
                                <span className="tooltip-cat-badge">
                                  {translateCategory(category, isEn)}
                                </span>
                              </div>

                              <div className="tooltip-body">
                                <div className="tooltip-row-price">
                                  <span className="tooltip-price-label">
                                    {isEn ? 'Median Price' : 'Giá trung vị'}
                                  </span>
                                  <span className="tooltip-price-num">
                                    <strong>{cell.medianPriceMillion.toFixed(2)}</strong> {isEn ? 'M VND/mo' : 'triệu/tháng'}
                                  </span>
                                </div>
                                <div className="tooltip-row">
                                  <span>{isEn ? 'Sample size:' : 'Số tin khảo sát:'}</span>
                                  <strong>
                                    {cell.count.toLocaleString(isEn ? 'en-US' : 'vi-VN')} {isEn ? 'listings' : 'tin'}
                                  </strong>
                                </div>
                                <div className="tooltip-row">
                                  <span>{isEn ? 'Tier:' : 'Phân khúc:'}</span>
                                  <strong className={`tooltip-tier-text ${tier?.className}`}>
                                    {tier?.tag}
                                  </strong>
                                </div>
                                <div className="tooltip-intensity-bar">
                                  <div
                                    className="tooltip-intensity-fill"
                                    style={{ width: `${Math.min(100, Math.round(intensity * 100))}%` }}
                                  />
                                </div>
                                <div className="tooltip-intensity-label">
                                  <span>{isEn ? 'Market Heat' : 'Mức nhiệt thị trường'}</span>
                                  <span>{Math.round(intensity * 100)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span
                            className="price-heatmap-empty"
                            aria-label={
                              isEn
                                ? `No data for ${ward} type ${translateCategory(category, true)}`
                                : `Không có dữ liệu cho ${ward} loại ${category}`
                            }
                          >
                            —
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Heatmap Legend & Summary Footnote */}
      <div className="heatmap-footer">
        <div className="heatmap-legend">
          <span className="legend-label">{isEn ? 'Price Heat:' : 'Mức nhiệt giá:'}</span>
          <span className="legend-step legend-low">{isEn ? 'Low (0 M)' : 'Thấp (0 tr)'}</span>
          <div className="heatmap-legend-bar" aria-hidden="true">
            <span className="legend-gradient" />
          </div>
          <span className="legend-step legend-high">
            {isEn ? `Highest (${maxPrice.toFixed(1)} M/mo)` : `Cao nhất (${maxPrice.toFixed(1)} tr/tháng)`}
          </span>
        </div>
        <div className="heatmap-footnote">
          <span>
            {isEn
              ? '* Cleaned data from gold.rental_room, median calculated excluding outliers.'
              : '* Dữ liệu làm sạch từ kho gold.rental_room, tính theo trung vị loại trừ ngoại lệ.'}
          </span>
        </div>
      </div>
    </div>
  )
}
