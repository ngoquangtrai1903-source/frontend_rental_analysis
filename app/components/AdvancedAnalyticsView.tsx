'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  MapPin,
  Layers,
  DollarSign
} from 'lucide-react'
import { PresentationAnalyticsData } from '@/lib/presentationAnalyticsService'
import HistPriceByCategoryChart from './HistPriceByCategoryChart'
import WardPpm2BoxPlotChart from './WardPpm2BoxPlotChart'
import ScatterSizePriceChart from './ScatterSizePriceChart'
import BoxFurnishingCategoryChart from './BoxFurnishingCategoryChart'
import ScatterLocationGridChart from './ScatterLocationGridChart'
import SpearmanCorrelationHeatmap from './SpearmanCorrelationHeatmap'
import ChartAIExplainer from './ChartAIExplainer'

export default function AdvancedAnalyticsView({
  filterQueryString = '',
  lang = 'vi'
}: {
  filterQueryString?: string
  lang?: 'vi' | 'en'
}) {
  const isEn = lang === 'en'
  const [activeTab, setActiveTab] = useState<'dist' | 'location' | 'matrix'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search)
        const sec = params.get('section')
        if (sec === 'location' || sec === 'matrix') return sec
      } catch {
        // Ignore
      }
    }
    return 'dist'
  })

  const query = useQuery({
    queryKey: ['presentation-analytics', filterQueryString],
    queryFn: async ({ signal }) => {
      const url = `/api/gold-query?mode=presentation${filterQueryString ? `&${filterQueryString}` : ''}`
      const res = await fetch(url, { signal })
      if (!res.ok) {
        const response = await res.json().catch(() => ({}))
        throw new Error(
          response.message ||
            response.error ||
            (isEn ? `Server error (${res.status})` : `Lỗi máy chủ (${res.status})`)
        )
      }
      const json: PresentationAnalyticsData = await res.json()
      return json
    }
  })

  const data = query.data
  const loading = query.isLoading

  return (
    <div className="workspace-view">
      {/* Hero Header */}
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <BarChart3 size={22} />
        </div>
        <div>
          <h2>
            {isEn
              ? 'Market analysis'
              : 'Phân tích thị trường'}
          </h2>
        </div>
      </div>

      {/* Overview Stat Badges */}
      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div className="card" style={{ padding: '12px 16px', background: 'var(--surface-card)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
              {isEn ? 'Valid listings' : 'Tin đủ dữ liệu'}
            </span>
            <div style={{ font: "800 20px 'Manrope', sans-serif", color: 'var(--ink)', marginTop: '4px' }}>
              {data.summary.totalCleaned.toLocaleString()}{' '}
              <small style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                / {data.summary.totalRaw.toLocaleString()}
              </small>
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px', background: 'var(--surface-card)' }}>
            <span style={{ fontSize: '11px', color: '#E07B39', fontWeight: 600 }}>
              {isEn ? 'Rental Rooms' : 'Phòng trọ'}
            </span>
            <div style={{ font: "800 20px 'Manrope', sans-serif", color: '#E07B39', marginTop: '4px' }}>
              {data.summary.roomCount.toLocaleString()}{' '}
              <small style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                ({isEn ? 'Median' : 'Trung vị'} {data.histPrice.room.median}{isEn ? 'M' : 'tr'})
              </small>
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px', background: 'var(--surface-card)' }}>
            <span style={{ fontSize: '11px', color: '#2E6F9E', fontWeight: 600 }}>
              {isEn ? 'Apartments' : 'Căn hộ / Chung cư'}
            </span>
            <div style={{ font: "800 20px 'Manrope', sans-serif", color: '#2E6F9E', marginTop: '4px' }}>
              {data.summary.aptCount.toLocaleString()}{' '}
              <small style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                ({isEn ? 'Median' : 'Trung vị'} {data.histPrice.apt.median}{isEn ? 'M' : 'tr'})
              </small>
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px', background: 'var(--surface-card)' }}>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
              {isEn ? 'Median unit price' : 'Đơn giá trung vị'}
            </span>
            <div style={{ font: "800 20px 'Manrope', sans-serif", color: '#dc2626', marginTop: '4px' }}>
              {data.summary.cityMedianPpm2}{' '}
              <small style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                {isEn ? 'k VND/m²' : 'nghìn đ/m²'}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs - Exactly 3 sections, no subtitles */}
      <div
        className="analysis-section-switcher"
        role="group"
        aria-label={isEn ? 'Analysis sections' : 'Nhóm phân tích'}
      >
        <button
          type="button"
          aria-pressed={activeTab === 'dist'}
          className={`analysis-section-tab ${activeTab === 'dist' ? 'active' : ''}`}
          onClick={() => setActiveTab('dist')}
        >
          <DollarSign size={16} />
          <span><strong>{isEn ? 'Price & Size' : 'Giá thuê & diện tích'}</strong></span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'location'}
          className={`analysis-section-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={16} />
          <span><strong>{isEn ? 'Area & Location' : 'Khu vực & vị trí'}</strong></span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'matrix'}
          className={`analysis-section-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Layers size={16} />
          <span><strong>{isEn ? 'Furnishing & Correlation' : 'Nội thất & tương quan'}</strong></span>
        </button>
      </div>

      {query.isError && (
        <div role="alert" className="card data-error-state">
          <span>
            {isEn ? 'Failed to load presentation analytics: ' : 'Không tải được dữ liệu biểu đồ: '}
            {query.error.message}
          </span>
          <button type="button" className="button secondary" onClick={() => void query.refetch()}>
            {isEn ? 'Retry' : 'Thử tải lại'}
          </button>
        </div>
      )}

      {loading && (
        <div role="status" className="chart-empty-state" style={{ minHeight: '300px' }}>
          <div className="pulse-spinner" style={{ width: '28px', height: '28px', marginBottom: '12px' }} />
          <span>
            {isEn
              ? 'Loading charts…'
              : 'Đang tải biểu đồ…'}
          </span>
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          {/* ========================================================= */}
          {/* TAB 1: GIÁ THUÊ & DIỆN TÍCH (PRICE & SIZE) */}
          {/* ========================================================= */}
          {activeTab === 'dist' && (
            <>
              {/* HISTOGRAM PHÂN PHỐI GIÁ THUÊ THEO LOẠI HÌNH */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Rent by property type'
                      : 'Giá thuê theo loại hình'}
                  </h3>
                </div>
                <HistPriceByCategoryChart data={data.histPrice} lang={lang} />
                <ChartAIExplainer
                  chartId="3.1"
                  chartTitle={isEn ? 'Rent by property type' : 'Phân phối giá thuê theo loại hình'}
                  summaryData={data.histPrice}
                  lang={lang}
                />
              </div>

              {/* SCATTER: DIỆN TÍCH VS GIÁ THUÊ + HỒI QUY */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn ? 'Size & rent' : 'Diện tích & giá thuê'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Trend line and Pearson correlation (r) by property type.'
                      : 'Đường xu hướng và hệ số tương quan (r) theo loại hình.'}
                  </p>
                </div>
                <ScatterSizePriceChart data={data.scatterSizePrice} lang={lang} />
                <ChartAIExplainer
                  chartId="3.4"
                  chartTitle={isEn ? 'Size & rent' : 'Diện tích vs Giá thuê'}
                  summaryData={data.scatterSizePrice}
                  lang={lang}
                />
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: KHU VỰC & VỊ TRÍ (AREA & LOCATION) */}
          {/* ========================================================= */}
          {activeTab === 'location' && (
            <>
              {/* BOXPLOT GIÁ/M2 THEO PHƯỜNG (SẮP XẾP THEO MEDIAN) */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Rent per m² by ward'
                      : 'Giá thuê/m² theo phường'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Wards with 30+ listings. Red dashed line: filtered median.'
                      : 'Phường có từ 30 tin. Nét đứt đỏ: trung vị của các tin đã lọc.'}
                  </p>
                </div>
                <WardPpm2BoxPlotChart
                  wards={data.boxWardPpm2.wards}
                  cityMedian={data.boxWardPpm2.cityMedian}
                  lang={lang}
                />
                <ChartAIExplainer
                  chartId="3.3"
                  chartTitle={isEn ? 'Unit Rent by Ward (n ≥ 30)' : 'Giá thuê/m² theo phường (n ≥ 30)'}
                  summaryData={data.boxWardPpm2}
                  lang={lang}
                />
              </div>

              {/* VỊ TRÍ: KHOẢNG CÁCH -> GIÁ/M2 (4 SCATTER + HỒI QUY) */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Location & rent per m²'
                      : 'Vị trí & giá thuê/m²'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Distance to the centre, beach, airport and nearest university.'
                      : 'Khoảng cách đến trung tâm, biển, sân bay và đại học gần nhất.'}
                  </p>
                </div>
                <ScatterLocationGridChart data={data.scatterLocation} lang={lang} />
                <ChartAIExplainer
                  chartId="3.6"
                  chartTitle={isEn ? 'Distance to Hotspots vs Price/m²' : 'Ảnh hưởng của vị trí đến giá/m²'}
                  summaryData={data.scatterLocation}
                  lang={lang}
                />
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 3: NỘI THẤT & TƯƠNG QUAN (FURNISHING & CORRELATION) */}
          {/* ========================================================= */}
          {activeTab === 'matrix' && (
            <>
              {/* TÌNH TRẠNG NỘI THẤT X LOẠI HÌNH (BOX GIÁ/M2) */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Furnishing & rent per m²'
                      : 'Nội thất & giá thuê/m²'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Compare furnishing levels by property type.'
                      : 'So sánh các mức nội thất theo loại hình.'}
                  </p>
                </div>
                <BoxFurnishingCategoryChart data={data.boxFurnishingCategory} lang={lang} />
                <ChartAIExplainer
                  chartId="3.5"
                  chartTitle={isEn ? 'Unit Price by Furnishing Level' : 'Giá/m² theo tình trạng nội thất và loại hình'}
                  summaryData={data.boxFurnishingCategory}
                  lang={lang}
                />
              </div>

              {/* MA TRẬN TƯƠNG QUAN SPEARMAN */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn ? 'Spearman correlation' : 'Tương quan giữa các yếu tố'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Relationships between price, size, location and amenities.'
                      : 'Mối liên hệ giữa giá, diện tích, vị trí và tiện ích (Spearman).'}
                  </p>
                </div>
                <SpearmanCorrelationHeatmap
                  columns={data.corrHeatmap.columns}
                  matrix={data.corrHeatmap.matrix}
                  lang={lang}
                />
                <ChartAIExplainer
                  chartId="3.9"
                  chartTitle={isEn ? 'Spearman correlation' : 'Ma trận tương quan Spearman'}
                  summaryData={{
                    columns: data.corrHeatmap.columns.map((c) => c.label),
                    matrixSample: data.corrHeatmap.matrix.slice(0, 5).map((r) => r.slice(0, 5))
                  }}
                  lang={lang}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
