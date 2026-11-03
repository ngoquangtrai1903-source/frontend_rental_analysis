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
          <span className="eyebrow">
            {isEn ? 'STATISTICAL MODELING & MARKET TRENDS' : 'MÔ HÌNH THỐNG KÊ & XU HƯỚNG THỊ TRƯỜNG'}
          </span>
          <h2>
            {isEn
              ? 'Advanced Analytics — Da Nang Rental Market'
              : 'Phân Tích Nâng Cao — Thị Trường Cho Thuê Đà Nẵng'}
          </h2>
          <p>
            {isEn
              ? 'Real-time rental market trends from Supabase Gold Data Warehouse with AI insights.'
              : 'Trực quan hóa thời gian thực các xu hướng thị trường từ kho dữ liệu Supabase Gold, tích hợp trợ lý phân tích thông minh.'}
          </p>
        </div>
        <span className="analysis-status">
          <span className="live-dot" /> {isEn ? 'Supabase Gold Connected' : 'Kết nối Supabase Gold'}
        </span>
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
              {isEn ? 'Cleaned Sample Size' : 'Quy mô mẫu sau làm sạch'}
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
                (Med {data.histPrice.room.median}{isEn ? 'M' : 'tr'})
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
                (Med {data.histPrice.apt.median}{isEn ? 'M' : 'tr'})
              </small>
            </div>
          </div>

          <div className="card" style={{ padding: '12px 16px', background: 'var(--surface-card)' }}>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
              {isEn ? 'Citywide Median Unit Price' : 'Median đơn giá toàn TP'}
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
          <span><strong>{isEn ? 'Price & Size' : 'Giá thuê & Diện tích'}</strong></span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'location'}
          className={`analysis-section-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={16} />
          <span><strong>{isEn ? 'Area & Location' : 'Khu vực & Vị trí'}</strong></span>
        </button>

        <button
          type="button"
          aria-pressed={activeTab === 'matrix'}
          className={`analysis-section-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Layers size={16} />
          <span><strong>{isEn ? 'Furnishing & Correlation' : 'Nội thất & Tương quan'}</strong></span>
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
              ? 'Querying Supabase Gold data warehouse & computing market analytics…'
              : 'Đang truy vấn kho dữ liệu Supabase Gold & tổng hợp chỉ số phân tích…'}
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
                  <span className="eyebrow">
                    {isEn ? 'FREQUENCY & MEDIAN DISTRIBUTION' : 'PHÂN PHỐI TẦN SUẤT & TRUNG VỊ'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Rental Price Distribution by Property Category'
                      : 'Phân Phối Giá Thuê Theo Loại Hình'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? '(Solid line = Median, Dashed line = Mean)'
                      : '(Đường liền = Median trung vị, Đường đứt = Mean trung bình)'}
                  </p>
                </div>
                <HistPriceByCategoryChart data={data.histPrice} lang={lang} />
                <ChartAIExplainer
                  chartId="3.1"
                  chartTitle={isEn ? 'Rental Price Distribution by Property Category' : 'Phân phối giá thuê theo loại hình'}
                  summaryData={data.histPrice}
                  lang={lang}
                />
              </div>

              {/* SCATTER: DIỆN TÍCH VS GIÁ THUÊ + HỒI QUY */}
              <div className="card" style={{ padding: '24px', background: 'var(--surface-card)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <span className="eyebrow">
                    {isEn ? 'SIZE CORRELATION & PRICE SENSITIVITY' : 'TƯƠNG QUAN DIỆN TÍCH & ĐỘ NHẠY GIÁ'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn ? 'Property Size vs Monthly Rent' : 'Diện Tích vs Giá Thuê'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Linear regression and Pearson correlation coefficient (r) for each property category.'
                      : 'Đường hồi quy tuyến tính và hệ số tương quan Pearson (r) cho từng loại hình BĐS.'}
                  </p>
                </div>
                <ScatterSizePriceChart data={data.scatterSizePrice} lang={lang} />
                <ChartAIExplainer
                  chartId="3.4"
                  chartTitle={isEn ? 'Property Size vs Monthly Rent' : 'Diện tích vs Giá thuê'}
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
                  <span className="eyebrow">
                    {isEn ? 'UNIT PRICE DISTRIBUTION BY WARD' : 'PHÂN PHỐI ĐƠN GIÁ THEO KHU VỰC'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Unit Rent by Ward (Sorted by Median, n ≥ 30)'
                      : 'Giá Thuê/m² Theo Phường (Sắp xếp theo Median)'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Wards with sample size ≥ 30; red dashed line marks citywide median.'
                      : 'Chỉ bao gồm các phường có tối thiểu 30 tin đăng; đường nét đứt đỏ là mức trung vị toàn thành phố.'}
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
                  <span className="eyebrow">
                    {isEn ? 'SPATIAL DISTANCE DECAY TO HOTSPOTS' : 'QUY LUẬT SUY GIẢM THEO KHOẢNG CÁCH'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Spatial Decay: Distance to Hotspots vs Unit Price/m²'
                      : 'Ảnh Hưởng Của Vị Trí Đến Giá/m²'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? '4 Hotspots: CBD, Beach, Airport, and Nearest University Hub (r coefficient indicated).'
                      : 'Lưới 4 điểm nóng: Trung tâm CBD, Bãi biển, Sân bay Quốc tế và Cụm Đại học (kèm hệ số tương quan r).'}
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
                  <span className="eyebrow">
                    {isEn ? 'FURNISHING LEVERAGE & CAPEX' : 'ĐÒN BẨY NỘI THẤT & CHI PHÍ ĐẦU TƯ'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn
                      ? 'Unit Price/m² by Furnishing Level & Property Category'
                      : 'Giá/m² Theo Tình Trạng Nội Thất và Loại Hình'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Box plot distribution across 5 furnishing tiers (including Unspecified).'
                      : 'Phân bố hộp IQR qua 5 mức trang bị nội thất (bao gồm cả phân nhóm Không xác định).'}
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
                  <span className="eyebrow">
                    {isEn ? 'SPEARMAN MULTIVARIATE CORRELATION MATRIX' : 'MA TRẬN TƯƠNG QUAN ĐA BIẾN SPEARMAN'}
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '17px' }}>
                    {isEn ? 'Spearman Rank Correlation Matrix' : 'Ma Trận Tương Quan Spearman'}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '11px' }}>
                    {isEn
                      ? 'Comprehensive 18×18 rank correlation across price, size, distance metrics, and 9 property amenities.'
                      : 'Ma trận tương quan phi tham số 18×18 giữa đơn giá, diện tích, các cự ly không gian và 9 tiện ích phòng.'}
                  </p>
                </div>
                <SpearmanCorrelationHeatmap
                  columns={data.corrHeatmap.columns}
                  matrix={data.corrHeatmap.matrix}
                  lang={lang}
                />
                <ChartAIExplainer
                  chartId="3.9"
                  chartTitle={isEn ? 'Spearman Rank Correlation Matrix' : 'Ma trận tương quan Spearman'}
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
