---
agent: devin-local
session: emerald-chance
created: 2026-10-20T08:58:49Z
---
# Dashboard Thống Kê Bất Động Sản Đà Nẵng - Full Implementation

Implement full dashboard thống kê bất động sản Đà Nẵng với Next.js + shadcn/ui, bao gồm 7 phases từ MVP đến mobile optimization, và cấu hình RLS cho bảo mật.

# Dashboard Thống Kê Bất Động Sản Đà Nẵng - Full Implementation

## Phân Tích Bảng Gold.rental_room

### Tổng quan Pipeline
- **silver**: 4,679 bản ghi (dữ liệu thô)
- **gold**: 3,238 bản ghi (dữ liệu đã làm sạch, làm phong phú)
- Tỷ lệ làm sạch: ~69% (giảm từ 4,679 → 3,238 bản ghi)

### Đặc điểm dữ liệu
Bảng `gold.rental_room` là data warehouse cuối cùng với các đặc điểm:
- **Composite Primary Key**: `source` + `list_id`
- **30 columns** với 4 nhóm thông tin chính:
  1. **Thông tin cơ bản**: source, list_id, posted_date, price_vnd, size_m2, price_per_m2_vnd
  2. **Thông tin nội thất**: furnishing_status, rooms, category_name
  3. **Vị trí & Địa lý**: latitude, longitude, ward_name, các khoảng cách (cbd, beach, airport, uni)
  4. **Tiện ích & Rủi ro**: 10+ trường tiện ích, flooded_2022/2025, flood_risk_label

---

## Tech Stack

### Frontend
- **Next.js 14+** (App Router) với TypeScript
- **Tailwind CSS** cho styling
- **shadcn/ui** cho UI components
- **React Query (TanStack Query)** cho data fetching
- **Zustand** cho state management

### Charting & Visualization
- **Recharts** cho biểu đồ cơ bản (bar, line, pie, scatter)
- **Leaflet + React-Leaflet** cho bản đồ
- **D3.js** cho biểu đồ nâng cao (parallel coordinates, violin plot - nếu cần)

### Utilities
- **date-fns** cho date manipulation
- **clsx** và **tailwind-merge** cho class names
- **lucide-react** cho icons

---

## Implementation Plan

### Phase 0: Setup & Security (BẮT BUỘC)

#### 0.1 Cấu hình RLS cho gold.rental_room
**Enable RLS**:
```sql
ALTER TABLE "gold"."rental_room" ENABLE ROW LEVEL SECURITY;
```

**Create Policies**:
1. **Policy cho authenticated users** (đọc-only):
```sql
CREATE POLICY "Authenticated users can view rental rooms"
ON "gold"."rental_room"
FOR SELECT
TO authenticated
USING (true);
```

2. **Policy cho anon users** (đọc-only - nếu cần public access):
```sql
CREATE POLICY "Anonymous users can view rental rooms"
ON "gold"."rental_room"
FOR SELECT
TO anon
USING (true);
```

3. **Policy cho admin** (full access - nếu cần):
```sql
CREATE POLICY "Admins can do everything"
ON "gold"."rental_room"
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

#### 0.2 Setup Next.js Project
```bash
npx create-next-app@latest rental-dashboard --typescript --tailwind --app
cd rental-dashboard
npm install @supabase/supabase-js @tanstack/react-query zustand recharts leaflet react-leaflet date-fns clsx tailwind-merge lucide-react
npm install -D @types/leaflet
```

#### 0.3 Setup shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card select slider checkbox badge dialog sheet dropdown-menu
```

#### 0.4 Cấu hình Supabase Client
- Tạo `lib/supabase/client.ts` cho browser client
- Tạo `lib/supabase/server.ts` cho server client
- Tạo `lib/supabase/types.ts` cho TypeScript types

#### 0.5 Setup Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

### Phase 1: Tổng Quan Thị Trường (Overview)

#### 1.1 KPI Cards Component
**File**: `components/dashboard/kpi-cards.tsx`
- Tổng số phòng: `COUNT(*)`
- Giá trung bình: `AVG(price_vnd)`
- Diện tích trung bình: `AVG(size_m2)`
- Giá/m² trung bình: `AVG(price_per_m2_vnd)`

**Implementation**:
- Fetch data với React Query
- Display với Card component từ shadcn/ui
- Format numbers với Vietnamese locale

#### 1.2 Price Distribution Charts
**File**: `components/dashboard/price-distribution.tsx`
- **Histogram**: Phân bố giá (bucket: 1M, 2M, 3M, ... 10M+)
- **Box plot**: Giá theo category_name
- **Violin plot**: Giá/m² theo khoảng giá

**Implementation**:
- Use Recharts BarChart cho histogram
- Use Recharts BoxPlot (custom component) hoặc scatter plot
- Query: Group by price ranges

#### 1.3 Time Trend Charts
**File**: `components/dashboard/time-trends.tsx`
- **Line chart**: Số lượng đăng tin theo tháng
- **Line chart**: Giá trung bình theo tháng
- **Area chart**: Tổng giá trị thị trường

**Implementation**:
- Parse posted_date thành month/year
- Group by month
- Use Recharts LineChart và AreaChart

---

### Phase 2: Phân Tích Theo Khu Vực (Location Analysis)

#### 2.1 Interactive Map
**File**: `components/dashboard/location-map.tsx`
- Heatmap theo giá
- Markers với popup
- Filter theo giá, tiện ích

**Implementation**:
- Use Leaflet + React-Leaflet
- Use Leaflet.heat cho heatmap
- Custom marker components
- Map filters integration

#### 2.2 Ward Analysis
**File**: `components/dashboard/ward-analysis.tsx`
- Bar chart: Top 10 phường nhiều phòng nhất
- Bar chart: Top 10 phường giá cao nhất
- Scatter plot: Số lượng vs Giá trung bình

**Implementation**:
- Group by ward_name
- Calculate aggregates
- Use Recharts BarChart và ScatterChart

#### 2.3 Distance Analysis
**File**: `components/dashboard/distance-analysis.tsx`
- Scatter plot: Giá vs Khoảng cách đến CBD
- Scatter plot: Giá vs Khoảng cách đến biển
- Scatter plot: Giá vs Khoảng cách đến sân bay
- Scatter plot: Giá vs Khoảng cách đến trường đại học

**Implementation**:
- Use Recharts ScatterChart
- Add trend lines (linear regression)
- Correlation coefficient display

#### 2.4 Choropleth Map
**File**: `components/dashboard/choropleth-map.tsx`
- Bản đồ phường theo giá trung bình
- Bản đồ phường theo số lượng phòng

**Implementation**:
- Need GeoJSON data for Đà Nẵng wards
- Use Leaflet choropleth
- Color scale (d3-scale-chromatic)

---

### Phase 3: Phân Tích Tiện Ích (Amenities Analysis)

#### 3.1 Amenities Overview
**File**: `components/dashboard/amenities-overview.tsx`
- Stacked bar chart: % phòng có từng tiện ích
- Radar chart: Điểm tiện ích trung bình theo khu vực

**Implementation**:
- Calculate % for each amenity (has_balcony, has_camera_security, etc.)
- Use Recharts BarChart (stacked)
- Use custom Radar chart (Recharts không có native, dùng custom SVG hoặc D3)

#### 3.2 Amenities vs Price
**File**: `components/dashboard/amenities-price.tsx`
- Box plot: Giá theo từng tiện ích
- Heatmap: Correlation giữa tiện ích và giá
- Violin plot: Phân bố giá theo số lượng tiện ích

**Implementation**:
- Group by each amenity
- Calculate price distribution
- Use Recharts with custom components

#### 3.3 Furnishing Analysis
**File**: `components/dashboard/furnishing-analysis.tsx`
- Pie chart: Phân bố furnishing_status
- Bar chart: Giá trung bình theo furnishing_status
- Box plot: Giá theo rooms

**Implementation**:
- Group by furnishing_status
- Use Recharts PieChart
- Use Recharts BarChart

#### 3.4 Amenities Matrix
**File**: `components/dashboard/amenities-matrix.tsx`
- Heatmap: Tần suất cặp tiện ích
- Cluster analysis: Phân nhóm theo pattern

**Implementation**:
- Calculate co-occurrence matrix
- Use Recharts Heatmap (custom)
- Simple K-means clustering (k=3-5)

---

### Phase 4: Phân Tích Rủi Ro Ngập Lụt (Flood Risk Analysis)

#### 4.1 Flood Risk Overview
**File**: `components/dashboard/flood-overview.tsx`
- Pie chart: % flooded_2022
- Pie chart: % flooded_2025
- Donut chart: Phân bố flood_risk_label

**Implementation**:
- Count flooded vs non-flooded
- Use Recharts PieChart
- Color coding: Green (0), Yellow (1), Red (2)

#### 4.2 Flood Risk by Location
**File**: `components/dashboard/flood-location.tsx`
- Choropleth map: Bản đồ phường theo % bị ngập
- Bar chart: Top 10 phường rủi ro cao nhất
- Scatter plot: Giá vs Rủi ro

**Implementation**:
- Group by ward_name
- Calculate flood percentage
- Use Leaflet choropleth
- Use Recharts

#### 4.3 Flood Risk vs Price
**File**: `components/dashboard/flood-price.tsx`
- Box plot: Giá theo flood_risk_label
- Violin plot: Phân bố giá theo flooded_2022/2025
- Correlation matrix

**Implementation**:
- Group by flood_risk_label
- Calculate price distribution
- Statistical correlation analysis

#### 4.4 Flood Trend Comparison
**File**: `components/dashboard/flood-trend.tsx`
- Comparison: 2022 vs 2025
- Waterfall chart: Thay đổi rủi ro theo phường

**Implementation**:
- Compare flooded_2022 vs flooded_2025
- Calculate delta
- Use Recharts BarChart (grouped)

---

### Phase 5: Phân Tích Cao Cấp (Advanced Analytics)

#### 5.1 Multivariate Analysis
**File**: `components/dashboard/multivariate.tsx`
- Parallel coordinates plot
- 3D Scatter plot

**Implementation**:
- Use D3.js cho parallel coordinates
- Use Recharts với 3D projection hoặc custom Three.js
- Dimensions: Price, Size, Distance, Flood Risk

#### 5.2 Clustering
**File**: `components/dashboard/clustering.tsx`
- K-means clustering
- Scatter plot với cluster labels
- Profile mỗi cluster

**Implementation**:
- Simple K-means algorithm (k=3-5)
- Features: price, size, distances, amenities score
- Use Recharts ScatterChart với color by cluster
- Table hiển thị cluster profiles

#### 5.3 Price Elasticity
**File**: `components/dashboard/price-elasticity.tsx`
- Line chart: Giá/m² theo diện tích
- Regression: Price ~ Size + Distance + Amenities + Flood Risk

**Implementation**:
- Bin by size_m2
- Calculate average price_per_m2 per bin
- Use Recharts LineChart
- Simple linear regression (vanilla JS)

#### 5.4 Outlier Detection
**File**: `components/dashboard/outliers.tsx`
- Box plot: Phát hiện giá bất thường
- Scatter plot: Outliers trên map
- Table: Danh sách outlier

**Implementation**:
- Use IQR method: Q1 - 1.5*IQR, Q3 + 1.5*IQR
- Flag outliers
- Display on map with different color
- Table with detailed info

---

### Phase 6: Tính Năng Tương Tác (Interactive Features)

#### 6.1 Filter Component
**File**: `components/dashboard/filters.tsx`
- Price slider (min-max)
- Size slider (min-max)
- Ward multi-select
- Amenities checkboxes (10+)
- Flood risk dropdown
- Category multi-select

**Implementation**:
- Use shadcn/ui components (Slider, Select, Checkbox)
- Zustand store cho filter state
- React Query với filter parameters

#### 6.2 Search Component
**File**: `components/dashboard/search.tsx`
- Search bar
- Advanced query builder

**Implementation**:
- Use shadcn/ui Input
- Fuse.js cho fuzzy search
- Simple query builder UI

#### 6.3 Room Detail Modal
**File**: `components/dashboard/room-detail.tsx`
- Modal/Drawer với chi tiết
- Mini map
- Compare feature

**Implementation**:
- Use shadcn/ui Dialog hoặc Sheet
- Display all 30 columns
- Mini Leaflet map
- Compare với similar rooms

#### 6.4 Export Features
**File**: `components/dashboard/export.tsx`
- Export CSV
- Export PDF
- Share link

**Implementation**:
- CSV: Generate blob từ filtered data
- PDF: Use jsPDF hoặc html2canvas
- Share: Copy URL with query params

---

### Phase 7: Mobile Optimization

#### 7.1 Responsive Layout
**File**: `app/dashboard/page.tsx`
- Mobile: Card layout
- Tablet: 2-column
- Desktop: Full dashboard

**Implementation**:
- Tailwind responsive classes
- Conditional rendering
- Mobile-first design

#### 7.2 Mobile-Specific Features
**File**: `components/dashboard/mobile-features.tsx`
- Swipe gestures
- Touch-friendly
- Offline mode

**Implementation**:
- Use react-swipeable
- Larger tap targets (min 44px)
- Service Worker với cache strategy

#### 7.3 PWA Setup
**File**: `public/manifest.json`, `app/layout.tsx`
- PWA manifest
- Service worker

**Implementation**:
- next-pwa package
- Register service worker
- Add to home screen capability

---

## File Structure

```
rental-dashboard/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── layout.tsx            # Dashboard layout
│   │   └── loading.tsx           # Loading state
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── price-distribution.tsx
│   │   ├── time-trends.tsx
│   │   ├── location-map.tsx
│   │   ├── ward-analysis.tsx
│   │   ├── distance-analysis.tsx
│   │   ├── choropleth-map.tsx
│   │   ├── amenities-overview.tsx
│   │   ├── amenities-price.tsx
│   │   ├── furnishing-analysis.tsx
│   │   ├── amenities-matrix.tsx
│   │   ├── flood-overview.tsx
│   │   ├── flood-location.tsx
│   │   ├── flood-price.tsx
│   │   ├── flood-trend.tsx
│   │   ├── multivariate.tsx
│   │   ├── clustering.tsx
│   │   ├── price-elasticity.tsx
│   │   ├── outliers.tsx
│   │   ├── filters.tsx
│   │   ├── search.tsx
│   │   ├── room-detail.tsx
│   │   ├── export.tsx
│   │   └── mobile-features.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils.ts                  # Utility functions
├── hooks/
│   ├── use-dashboard.ts          # Dashboard hooks
│   └── use-filters.ts            # Filter hooks
├── store/
│   └── filter-store.ts           # Zustand store
└── types/
    └── dashboard.ts              # TypeScript types
```

---

## Implementation Priority

### Sprint 1: Foundation (Week 1-2)
1. Phase 0: Setup & Security (RLS configuration)
2. Phase 1.1: KPI Cards
3. Phase 1.2: Price Distribution (Histogram + Box plot)
4. Phase 6.1: Basic Filters (Price, Size, Ward)

### Sprint 2: Location Analysis (Week 3-4)
5. Phase 2.1: Interactive Map (Heatmap + Markers)
6. Phase 2.2: Ward Analysis
7. Phase 2.3: Distance Analysis
8. Phase 6.3: Room Detail Modal

### Sprint 3: Amenities & Flood Risk (Week 5-6)
9. Phase 3.1-3.3: Amenities Analysis
10. Phase 4.1-4.3: Flood Risk Analysis
11. Phase 6.2: Search Feature
12. Phase 6.4: Export CSV

### Sprint 4: Advanced Features (Week 7-8)
13. Phase 5.2: Clustering
14. Phase 5.4: Outlier Detection
15. Phase 2.4: Choropleth Map (nếu có GeoJSON)
16. Phase 5.3: Price Elasticity

### Sprint 5: Advanced Analytics (Week 9-10)
17. Phase 5.1: Multivariate Analysis (Parallel coordinates)
18. Phase 3.4: Amenities Matrix
19. Phase 4.4: Flood Trend Comparison
20. Phase 6.4: Export PDF

### Sprint 6: Mobile & Polish (Week 11-12)
21. Phase 7.1: Responsive Layout
22. Phase 7.2: Mobile-Specific Features
23. Phase 7.3: PWA Setup
24. Performance optimization & Testing

---

## Database Queries (Reference)

### KPI Query
```sql
SELECT 
    COUNT(*) as total_rooms,
    AVG(price_vnd) as avg_price,
    AVG(size_m2) as avg_size,
    AVG(price_per_m2_vnd) as avg_price_per_m2
FROM gold.rental_room;
```

### Price Distribution Query
```sql
SELECT 
    FLOOR(price_vnd / 1000000) as price_bucket_million,
    COUNT(*) as count
FROM gold.rental_room
WHERE price_vnd IS NOT NULL
GROUP BY price_bucket_million
ORDER BY price_bucket_million;
```

### Ward Analysis Query
```sql
SELECT 
    ward_name,
    COUNT(*) as room_count,
    AVG(price_vnd) as avg_price,
    AVG(price_per_m2_vnd) as avg_price_per_m2
FROM gold.rental_room
WHERE ward_name IS NOT NULL
GROUP BY ward_name
ORDER BY room_count DESC
LIMIT 10;
```

### Amenities Percentage Query
```sql
SELECT 
    SUM(CASE WHEN has_balcony = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as has_balcony_pct,
    SUM(CASE WHEN has_camera_security = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as has_camera_security_pct,
    SUM(CASE WHEN has_elevator = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as has_elevator_pct,
    SUM(CASE WHEN wifi = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as wifi_pct,
    SUM(CASE WHEN has_parking = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as has_parking_pct
FROM gold.rental_room;
```

### Flood Risk Query
```sql
SELECT 
    SUM(CASE WHEN flooded_2022 = true THEN 1 ELSE 0 END) as flooded_2022_count,
    SUM(CASE WHEN flooded_2025 = true THEN 1 ELSE 0 END) as flooded_2025_count,
    SUM(CASE WHEN flood_risk_label = 0 THEN 1 ELSE 0 END) as risk_low,
    SUM(CASE WHEN flood_risk_label = 1 THEN 1 ELSE 0 END) as risk_medium,
    SUM(CASE WHEN flood_risk_label = 2 THEN 1 ELSE 0 END) as risk_high
FROM gold.rental_room;
```

---

## Success Metrics

1. **Performance**: LCP < 2.5s, FID < 100ms, CLS < 0.1
2. **Data freshness**: Auto-refresh mỗi 24h
3. **User engagement**: Average session > 5 minutes
4. **Mobile responsiveness**: 100% mobile-friendly
5. **Accessibility**: WCAG AA compliant

---

## Risks & Mitigations

### Risk 1: GeoJSON data cho Đà Nẵng wards
- **Mitigation**: Tìm GeoJSON từ open sources hoặc generate từ OSM
- **Fallback**: Skip choropleth map, use bar chart thay thế

### Risk 2: Performance với 3,238 records
- **Mitigation**: Server-side filtering, pagination, virtualization
- **Caching**: React Query với cache strategy

### Risk 3: Complex charts (violin, parallel coordinates)
- **Mitigation**: Use D3.js hoặc Recharts custom components
- **Fallback**: Replace với simpler charts nếu quá phức tạp

### Risk 4: Mobile performance
- **Mitigation**: Lazy loading, code splitting, service worker
- **Testing**: Test trên real devices

---

## Next Steps After Approval

1. Execute RLS configuration (Phase 0.1)
2. Initialize Next.js project with required dependencies
3. Setup shadcn/ui and configure Supabase client
4. Create base folder structure
5. Start Sprint 1 implementation
