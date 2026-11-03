import { buildGoldQuery, GoldFilterParams } from './goldQueryService'
import { supabaseGold } from './supabase'

export interface BoxPlotStats {
  count: number
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
}

export interface PresentationAnalyticsData {
  summary: {
    totalRaw: number
    totalCleaned: number
    roomCount: number
    aptCount: number
    cityMedianPpm2: number
  }

  // 3.1 Histogram giá + mean/median, tách theo loại hình
  histPrice: {
    room: {
      count: number
      mean: number
      median: number
      color: string
    }
    apt: {
      count: number
      mean: number
      median: number
      color: string
    }
    bins: Array<{
      range: string
      binStart: number
      binEnd: number
      binMid: number
      roomCount: number
      aptCount: number
      roomDensity: number
      aptDensity: number
    }>
  }

  // 3.3 Boxplot giá/m2 theo phường (sắp theo median, len >= 30)
  boxWardPpm2: {
    cityMedian: number
    wards: Array<{
      wardName: string
      count: number
      min: number
      q1: number
      median: number
      q3: number
      max: number
    }>
  }

  // 3.4 Scatter: diện tích vs giá
  scatterSizePrice: {
    room: {
      count: number
      r: number
      slope: number
      intercept: number
      color: string
      points: Array<{ x: number; y: number; ward: string }>
    }
    apt: {
      count: number
      r: number
      slope: number
      intercept: number
      color: string
      points: Array<{ x: number; y: number; ward: string }>
    }
  }

  // 3.5 Tình trạng nội thất x loại hình (box giá/m2)
  boxFurnishingCategory: Array<{
    status: string
    room: BoxPlotStats | null
    apt: BoxPlotStats | null
  }>

  // 3.6 Vị trí: khoảng cách -> giá/m2 (4 scatter + hồi quy)
  scatterLocation: {
    cbd: LocationScatterItem
    beach: LocationScatterItem
    airport: LocationScatterItem
    uni: LocationScatterItem
  }

  // 3.9 Heatmap tương quan (Spearman)
  corrHeatmap: {
    columns: Array<{ key: string; label: string; labelEn: string }>
    matrix: number[][]
  }
}

export interface LocationScatterItem {
  key: string
  title: string
  titleEn: string
  r: number
  slope: number
  intercept: number
  xMin: number
  xMax: number
  points: Array<{ x: number; y: number; category: string }>
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function calcBoxPlot(arr: number[]): BoxPlotStats | null {
  if (!arr || arr.length === 0) return null
  const s = [...arr].sort((a, b) => a - b)
  const q1 = percentile(s, 0.25)
  const median = percentile(s, 0.5)
  const q3 = percentile(s, 0.75)
  const iqr = q3 - q1
  const minWhisker = Math.max(s[0], q1 - 1.5 * iqr)
  const maxWhisker = Math.min(s[s.length - 1], q3 + 1.5 * iqr)
  const sum = s.reduce((a, b) => a + b, 0)
  return {
    count: s.length,
    min: Number(minWhisker.toFixed(1)),
    q1: Number(q1.toFixed(1)),
    median: Number(median.toFixed(1)),
    q3: Number(q3.toFixed(1)),
    max: Number(maxWhisker.toFixed(1)),
    mean: Number((sum / s.length).toFixed(1))
  }
}

function pearson(x: number[], y: number[]): number {
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0
  for (let i = 0; i < x.length; i++) {
    const xi = x[i], yi = y[i]
    if (isNaN(xi) || isNaN(yi) || xi == null || yi == null) continue
    n++
    sx += xi
    sy += yi
    sxx += xi * xi
    syy += yi * yi
    sxy += xi * yi
  }
  if (n < 2) return 0
  const num = n * sxy - sx * sy
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy))
  return den === 0 ? 0 : Number((num / den).toFixed(2))
}

function linearRegression(x: number[], y: number[]) {
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0
  for (let i = 0; i < x.length; i++) {
    const xi = x[i], yi = y[i]
    if (isNaN(xi) || isNaN(yi) || xi == null || yi == null) continue
    n++
    sx += xi
    sy += yi
    sxx += xi * xi
    sxy += xi * yi
  }
  if (n < 2 || (n * sxx - sx * sx) === 0) {
    return { slope: 0, intercept: 0 }
  }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const intercept = (sy - slope * sx) / n
  return { slope: Number(slope.toFixed(4)), intercept: Number(intercept.toFixed(2)) }
}

function rankArray(arr: number[]): number[] {
  const indexed = arr.map((v, i) => ({ v, i })).filter((item) => item.v != null && !isNaN(item.v))
  indexed.sort((a, b) => a.v - b.v)
  const ranks = new Array(arr.length).fill(NaN)
  let i = 0
  while (i < indexed.length) {
    let j = i
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++
    const avgRank = 1 + (i + j - 1) / 2
    for (let k = i; k < j; k++) ranks[indexed[k].i] = avgRank
    i = j
  }
  return ranks
}

function spearman(x: number[], y: number[]): number {
  const validPairs: [number, number][] = []
  for (let i = 0; i < x.length; i++) {
    if (x[i] != null && !isNaN(x[i]) && y[i] != null && !isNaN(y[i])) {
      validPairs.push([x[i], y[i]])
    }
  }
  if (validPairs.length < 2) return 0
  const rx = rankArray(validPairs.map((p) => p[0]))
  const ry = rankArray(validPairs.map((p) => p[1]))
  return pearson(rx, ry)
}

export async function fetchPresentationAnalytics(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
): Promise<PresentationAnalyticsData> {
  const selectColumns = [
    'list_id',
    'posted_date',
    'price_vnd',
    'size_m2',
    'price_per_m2_vnd',
    'furnishing_status',
    'rooms',
    'category_name',
    'ward_name',
    'dist_to_cbd',
    'dist_to_beach',
    'dist_to_airport',
    'dist_to_nearest_uni',
    'has_balcony',
    'free_hours',
    'has_camera_security',
    'has_elevator',
    'has_mezzanine',
    'private_bathroom',
    'wifi',
    'has_parking',
    'has_window'
  ].join(',')

  const chunkSize = 1000
  const firstPageQuery = await buildGoldQuery(
    client,
    filters,
    { page: 1, pageSize: chunkSize, sortBy: 'posted_date', ascending: true },
    selectColumns
  )
  const { data: firstRows, count, error: firstError } = await firstPageQuery
  if (firstError) {
    throw new Error(`Failed to fetch presentation data: ${firstError.message}`)
  }

  const rawRows: any[] = [...(firstRows ?? [])]
  const totalCount = count ?? rawRows.length
  const totalPages = Math.ceil(totalCount / chunkSize)

  if (totalPages > 1) {
    const pagePromises = []
    for (let p = 2; p <= totalPages; p++) {
      pagePromises.push(
        buildGoldQuery(
          client,
          filters,
          { page: p, pageSize: chunkSize, sortBy: 'posted_date', ascending: true },
          selectColumns
        )
      )
    }
    const results = await Promise.all(pagePromises)
    for (const res of results) {
      if (res.data) rawRows.push(...res.data)
    }
  }

  // 1. Data cleaning strictly mirroring user's Python code:
  // df = raw.drop_duplicates("list_id").copy()
  // df = df[df.price_vnd.between(5e5, 6e7) & df.size_m2.between(8, 300)].copy()
  // df["price_m"] = df.price_vnd / 1e6
  // df["ppm2_k"] = df.price_per_m2_vnd / 1e3
  // df = df[df.ppm2_k.between(10, 1000)]
  const seenListIds = new Set<string>()
  const cleaned: any[] = []

  const FURN_ORD: Record<string, number> = {
    'Không nội thất': 0,
    'Nội thất cơ bản': 1,
    'Đầy đủ nội thất': 2,
    'Nội thất cao cấp': 3
  }

  for (const r of rawRows) {
    if (!r.list_id || seenListIds.has(r.list_id)) continue
    seenListIds.add(r.list_id)

    if (r.price_vnd == null || r.size_m2 == null || r.price_per_m2_vnd == null) continue
    if (r.price_vnd < 500_000 || r.price_vnd > 60_000_000) continue
    if (r.size_m2 < 8 || r.size_m2 > 300) continue

    const ppm2_k = r.price_per_m2_vnd / 1_000
    if (ppm2_k < 10 || ppm2_k > 1_000) continue

    let roomsParsed = NaN
    if (r.rooms) {
      const match = String(r.rooms).match(/\d+/)
      if (match) roomsParsed = parseInt(match[0], 10)
    }

    const furnishingLevel =
      r.furnishing_status && r.furnishing_status in FURN_ORD ? FURN_ORD[r.furnishing_status] : NaN

    cleaned.push({
      ...r,
      price_m: r.price_vnd / 1_000_000,
      ppm2_k,
      roomsParsed,
      furnishingLevel
    })
  }

  // Color constants
  const C_ROOM = '#E07B39'
  const C_APT = '#2E6F9E'

  const roomListings = cleaned.filter((r) => r.category_name?.includes('Phòng trọ'))
  const aptListings = cleaned.filter((r) => r.category_name?.includes('Căn hộ'))

  // -------------------------------------------------------------
  // Chart 3.1: Histogram phân phối giá thuê theo loại hình
  // -------------------------------------------------------------
  const roomPrices = roomListings.map((r) => r.price_m).sort((a, b) => a - b)
  const aptPrices = aptListings.map((r) => r.price_m).sort((a, b) => a - b)

  const roomMean = roomPrices.length > 0 ? roomPrices.reduce((a, b) => a + b, 0) / roomPrices.length : 0
  const roomMedian = percentile(roomPrices, 0.5)

  const aptMean = aptPrices.length > 0 ? aptPrices.reduce((a, b) => a + b, 0) / aptPrices.length : 0
  const aptMedian = percentile(aptPrices, 0.5)

  // 40 bins from 0 to 40 million VND
  const BIN_COUNT = 40
  const MAX_HIST_PRICE = 40
  const binWidth = MAX_HIST_PRICE / BIN_COUNT
  const histBins = Array.from({ length: BIN_COUNT }, (_, i) => {
    const start = i * binWidth
    const end = start + binWidth
    const mid = (start + end) / 2
    return {
      range: `${start.toFixed(1)}–${end.toFixed(1)}M`,
      binStart: Number(start.toFixed(1)),
      binEnd: Number(end.toFixed(1)),
      binMid: Number(mid.toFixed(1)),
      roomCount: 0,
      aptCount: 0,
      roomDensity: 0,
      aptDensity: 0
    }
  })

  for (const p of roomPrices) {
    const idx = Math.min(BIN_COUNT - 1, Math.floor(p / binWidth))
    if (idx >= 0 && idx < BIN_COUNT) histBins[idx].roomCount++
  }
  for (const p of aptPrices) {
    const idx = Math.min(BIN_COUNT - 1, Math.floor(p / binWidth))
    if (idx >= 0 && idx < BIN_COUNT) histBins[idx].aptCount++
  }

  const roomTotal = roomPrices.length || 1
  const aptTotal = aptPrices.length || 1
  for (const b of histBins) {
    b.roomDensity = Number((b.roomCount / (roomTotal * binWidth)).toFixed(4))
    b.aptDensity = Number((b.aptCount / (aptTotal * binWidth)).toFixed(4))
  }

  // -------------------------------------------------------------
  // Chart 3.3: Boxplot giá/m2 theo phường (sắp theo median, len >= 30)
  // -------------------------------------------------------------
  const allPpm2 = cleaned.map((r) => r.ppm2_k).sort((a, b) => a - b)
  const cityMedianPpm2 = percentile(allPpm2, 0.5)

  const wardMap = new Map<string, number[]>()
  for (const r of cleaned) {
    if (!r.ward_name) continue
    if (!wardMap.has(r.ward_name)) wardMap.set(r.ward_name, [])
    wardMap.get(r.ward_name)!.push(r.ppm2_k)
  }

  const wardBoxList: Array<{
    wardName: string
    count: number
    min: number
    q1: number
    median: number
    q3: number
    max: number
  }> = []

  for (const [wardName, list] of wardMap.entries()) {
    if (list.length >= 30) {
      const stats = calcBoxPlot(list)
      if (stats) {
        wardBoxList.push({
          wardName,
          count: stats.count,
          min: stats.min,
          q1: stats.q1,
          median: stats.median,
          q3: stats.q3,
          max: stats.max
        })
      }
    }
  }
  // Order by median descending
  wardBoxList.sort((a, b) => b.median - a.median)

  // -------------------------------------------------------------
  // Chart 3.4: Scatter: diện tích vs giá + hồi quy
  // -------------------------------------------------------------
  const roomSizes = roomListings.map((r) => r.size_m2)
  const roomPrcs = roomListings.map((r) => r.price_m)
  const roomR = pearson(roomSizes, roomPrcs)
  const roomReg = linearRegression(roomSizes, roomPrcs)

  const aptSizes = aptListings.map((r) => r.size_m2)
  const aptPrcs = aptListings.map((r) => r.price_m)
  const aptR = pearson(aptSizes, aptPrcs)
  const aptReg = linearRegression(aptSizes, aptPrcs)

  // Sample points for smooth UI performance (subsample up to 400 per category if larger)
  const samplePoints = (arr: any[], limit: number = 350) => {
    const valid = arr.filter((r) => r.size_m2 <= 150 && r.price_m <= 40)
    if (valid.length <= limit) {
      return valid.map((r) => ({ x: Number(r.size_m2.toFixed(1)), y: Number(r.price_m.toFixed(2)), ward: r.ward_name || '' }))
    }
    const step = valid.length / limit
    const sampled = []
    for (let i = 0; i < limit; i++) {
      const idx = Math.floor(i * step)
      const r = valid[idx]
      sampled.push({ x: Number(r.size_m2.toFixed(1)), y: Number(r.price_m.toFixed(2)), ward: r.ward_name || '' })
    }
    return sampled
  }

  // -------------------------------------------------------------
  // Chart 3.5: Tình trạng nội thất x loại hình (box giá/m2)
  // -------------------------------------------------------------
  const ordf = ['Không nội thất', 'Nội thất cơ bản', 'Đầy đủ nội thất', 'Nội thất cao cấp', 'Không xác định']
  const boxFurnishingCategory = ordf.map((status) => {
    const roomsInStatus = cleaned
      .filter((r) => r.furnishing_status === status && r.category_name?.includes('Phòng trọ'))
      .map((r) => r.ppm2_k)
    const aptsInStatus = cleaned
      .filter((r) => r.furnishing_status === status && r.category_name?.includes('Căn hộ'))
      .map((r) => r.ppm2_k)

    return {
      status,
      room: calcBoxPlot(roomsInStatus),
      apt: calcBoxPlot(aptsInStatus)
    }
  })

  // -------------------------------------------------------------
  // Chart 3.6: Vị trí: khoảng cách -> giá/m2 (4 scatter + hồi quy)
  // -------------------------------------------------------------
  const buildLocationScatter = (colKey: string, titleVi: string, titleEn: string): LocationScatterItem => {
    const valid = cleaned.filter((r) => r[colKey] != null && !isNaN(r[colKey]) && r.ppm2_k != null)
    const sortedDist = valid.map((r) => r[colKey]).sort((a, b) => a - b)
    const q99 = percentile(sortedDist, 0.99)
    const filtered = valid.filter((r) => r[colKey] <= q99)

    const xVals = filtered.map((r) => r[colKey])
    const yVals = filtered.map((r) => r.ppm2_k)
    const r = pearson(xVals, yVals)
    const reg = linearRegression(xVals, yVals)

    const step = Math.max(1, Math.floor(filtered.length / 300))
    const points = []
    for (let i = 0; i < filtered.length; i += step) {
      const row = filtered[i]
      points.push({
        x: Number(row[colKey].toFixed(2)),
        y: Number(row.ppm2_k.toFixed(1)),
        category: row.category_name?.includes('Căn hộ') ? 'Căn hộ/Chung cư' : 'Phòng trọ'
      })
    }

    return {
      key: colKey,
      title: titleVi,
      titleEn,
      r,
      slope: reg.slope,
      intercept: reg.intercept,
      xMin: 0,
      xMax: Number(q99.toFixed(1)),
      points
    }
  }

  const scatterLocation = {
    cbd: buildLocationScatter('dist_to_cbd', 'Đến trung tâm (km)', 'Distance to CBD (km)'),
    beach: buildLocationScatter('dist_to_beach', 'Đến biển (km)', 'Distance to Beach (km)'),
    airport: buildLocationScatter('dist_to_airport', 'Đến sân bay (km)', 'Distance to Airport (km)'),
    uni: buildLocationScatter('dist_to_nearest_uni', 'Đến ĐH gần nhất (km)', 'Distance to Nearest University (km)')
  }

  // -------------------------------------------------------------
  // Chart 3.9: Heatmap tương quan (Spearman)
  // -------------------------------------------------------------
  const am = {
    has_balcony: { vi: 'Ban công', en: 'Balcony' },
    free_hours: { vi: 'Giờ tự do', en: '24/7 Access' },
    has_camera_security: { vi: 'Camera', en: 'Security Cam' },
    has_elevator: { vi: 'Thang máy', en: 'Elevator' },
    has_mezzanine: { vi: 'Gác lửng', en: 'Mezzanine' },
    private_bathroom: { vi: 'WC riêng', en: 'Private Bath' },
    wifi: { vi: 'Wifi', en: 'High-speed Wifi' },
    has_parking: { vi: 'Chỗ đậu xe', en: 'Parking' },
    has_window: { vi: 'Cửa sổ', en: 'Window' }
  }

  const heatmapColumns = [
    { key: 'price_m', label: 'Giá thuê (tr)', labelEn: 'Price (M)' },
    { key: 'size_m2', label: 'Diện tích (m²)', labelEn: 'Size (m²)' },
    { key: 'ppm2_k', label: 'Giá/m² (k)', labelEn: 'Price/m² (k)' },
    { key: 'furnishingLevel', label: 'Cấp nội thất', labelEn: 'Furnishing' },
    { key: 'roomsParsed', label: 'Số phòng', labelEn: 'Rooms' },
    { key: 'dist_to_cbd', label: 'Đến CBD', labelEn: 'Dist to CBD' },
    { key: 'dist_to_beach', label: 'Đến biển', labelEn: 'Dist to Beach' },
    { key: 'dist_to_airport', label: 'Đến sân bay', labelEn: 'Dist to Airport' },
    { key: 'dist_to_nearest_uni', label: 'Đến ĐH', labelEn: 'Dist to Uni' },
    ...Object.entries(am).map(([k, v]) => ({ key: k, label: v.vi, labelEn: v.en }))
  ]

  // Pre-extract numeric column arrays
  const colVectors = heatmapColumns.map((col) => cleaned.map((r) => (r[col.key] != null ? Number(r[col.key]) : NaN)))

  // Compute 18x18 symmetric Spearman matrix
  const matrix: number[][] = []
  for (let i = 0; i < heatmapColumns.length; i++) {
    const row: number[] = []
    for (let j = 0; j < heatmapColumns.length; j++) {
      if (i === j) {
        row.push(1.0)
      } else if (j < i) {
        row.push(matrix[j][i])
      } else {
        const val = spearman(colVectors[i], colVectors[j])
        row.push(val)
      }
    }
    matrix.push(row)
  }

  return {
    summary: {
      totalRaw: rawRows.length,
      totalCleaned: cleaned.length,
      roomCount: roomListings.length,
      aptCount: aptListings.length,
      cityMedianPpm2: Number(cityMedianPpm2.toFixed(1))
    },
    histPrice: {
      room: {
        count: roomPrices.length,
        mean: Number(roomMean.toFixed(2)),
        median: Number(roomMedian.toFixed(2)),
        color: C_ROOM
      },
      apt: {
        count: aptPrices.length,
        mean: Number(aptMean.toFixed(2)),
        median: Number(aptMedian.toFixed(2)),
        color: C_APT
      },
      bins: histBins
    },
    boxWardPpm2: {
      cityMedian: Number(cityMedianPpm2.toFixed(1)),
      wards: wardBoxList
    },
    scatterSizePrice: {
      room: {
        count: roomListings.length,
        r: roomR,
        slope: roomReg.slope,
        intercept: roomReg.intercept,
        color: C_ROOM,
        points: samplePoints(roomListings)
      },
      apt: {
        count: aptListings.length,
        r: aptR,
        slope: aptReg.slope,
        intercept: aptReg.intercept,
        color: C_APT,
        points: samplePoints(aptListings)
      }
    },
    boxFurnishingCategory,
    scatterLocation,
    corrHeatmap: {
      columns: heatmapColumns,
      matrix
    }
  }
}
