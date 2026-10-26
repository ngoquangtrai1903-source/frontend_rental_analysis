import { SupabaseClient } from '@supabase/supabase-js'
import { supabaseGold } from './supabase'
import { Database } from './database.types'

/**
 * Interface representing the flattened denormalized row in `gold.rental_room`
 */
export type RentalRoomRecord = Database['gold']['Tables']['rental_room']['Row']

/**
 * Filter parameters supported by Dynamic Query Builder
 */
export interface GoldFilterParams {
  ward_name?: string | string[]
  category_name?: string | string[]
  furnishing_status?: string | string[]
  min_price?: number | null
  max_price?: number | null
  min_size?: number | null
  max_size?: number | null
  flood_risk_label?: number | number[] | string | null
  start_date?: string | null
  end_date?: string | null
  search?: string | null
  has_balcony?: number | boolean | null
  free_hours?: number | boolean | null
  has_camera_security?: number | boolean | null
  has_elevator?: number | boolean | null
  has_mezzanine?: number | boolean | null
  private_bathroom?: number | boolean | null
  wifi?: number | boolean | null
  has_parking?: number | boolean | null
  has_window?: number | boolean | null
  max_dist_beach?: number | null
  max_dist_cbd?: number | null
  max_dist_uni?: number | null
}

/**
 * Pagination & sorting options
 */
export interface QueryPaginationOptions {
  page?: number
  pageSize?: number
  sortBy?: string
  ascending?: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Helper to check whether a filter value is active and should be applied.
 * Discards null, undefined, empty strings, and standard 'all' sentinel values.
 */
function isValidFilterValue(val: unknown): boolean {
  if (val === null || val === undefined) return false
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase()
    return trimmed !== '' && trimmed !== 'all' && trimmed !== 'tất cả' && trimmed !== 'tat-ca'
  }
  if (Array.isArray(val)) {
    const validItems = val.filter(isValidFilterValue)
    return validItems.length > 0
  }
  if (typeof val === 'number') {
    return !Number.isNaN(val)
  }
  return true
}

/**
 * DYNAMIC QUERY BUILDER FOR SCHEMA `gold`
 * Builds and chains PostgREST filter methods dynamically based on active filter keys only.
 */
export function buildGoldQuery(
  client: any = supabaseGold,
  filters: GoldFilterParams = {},
  pagination?: QueryPaginationOptions,
  selectColumns: string = '*'
) {
  // Ensure we are querying the 'rental_room' table in 'gold' schema
  const targetClient = typeof client.schema === 'function' ? client.schema('gold') : client
  let query = targetClient.from('rental_room').select(selectColumns, { count: 'exact' })

  // 1. Text / Categorical Filters with multi-value (.in()) or exact (.eq())
  if (isValidFilterValue(filters.ward_name)) {
    if (Array.isArray(filters.ward_name)) {
      const activeWards = filters.ward_name.filter(isValidFilterValue) as string[]
      if (activeWards.length === 1) {
        query = query.eq('ward_name', activeWards[0])
      } else if (activeWards.length > 1) {
        query = query.in('ward_name', activeWards)
      }
    } else {
      query = query.eq('ward_name', filters.ward_name as string)
    }
  }

  if (isValidFilterValue(filters.category_name)) {
    if (Array.isArray(filters.category_name)) {
      const activeCats = filters.category_name.filter(isValidFilterValue) as string[]
      if (activeCats.length === 1) {
        query = query.eq('category_name', activeCats[0])
      } else if (activeCats.length > 1) {
        query = query.in('category_name', activeCats)
      }
    } else {
      query = query.eq('category_name', filters.category_name as string)
    }
  }

  if (isValidFilterValue(filters.furnishing_status)) {
    if (Array.isArray(filters.furnishing_status)) {
      const activeFurn = filters.furnishing_status.filter(isValidFilterValue) as string[]
      if (activeFurn.length === 1) {
        query = query.eq('furnishing_status', activeFurn[0])
      } else if (activeFurn.length > 1) {
        query = query.in('furnishing_status', activeFurn)
      }
    } else {
      query = query.eq('furnishing_status', filters.furnishing_status as string)
    }
  }

  // 2. Numerical Range Filters (.gte(), .lte())
  if (isValidFilterValue(filters.min_price)) {
    query = query.gte('price_vnd', Number(filters.min_price))
  }
  if (isValidFilterValue(filters.max_price)) {
    query = query.lte('price_vnd', Number(filters.max_price))
  }

  if (isValidFilterValue(filters.min_size)) {
    query = query.gte('size_m2', Number(filters.min_size))
  }
  if (isValidFilterValue(filters.max_size)) {
    query = query.lte('size_m2', Number(filters.max_size))
  }

  // 3. Flood Risk Label (0: Low, 1: Medium, 2: High)
  if (isValidFilterValue(filters.flood_risk_label)) {
    if (Array.isArray(filters.flood_risk_label)) {
      const nums = (filters.flood_risk_label as Array<number | string>)
        .map(Number)
        .filter((n) => !Number.isNaN(n))
      if (nums.length > 0) {
        query = query.in('flood_risk_label', nums)
      }
    } else {
      const num = Number(filters.flood_risk_label)
      if (!Number.isNaN(num)) {
        query = query.eq('flood_risk_label', num)
      }
    }
  }

  // 4. Temporal Range Filters (.gte(), .lte() on posted_date)
  if (isValidFilterValue(filters.start_date)) {
    query = query.gte('posted_date', filters.start_date as string)
  }
  if (isValidFilterValue(filters.end_date)) {
    query = query.lte('posted_date', filters.end_date as string)
  }

  // 5. Keyword search (.ilike() across ward, category, or nearest beach)
  if (isValidFilterValue(filters.search)) {
    const term = `%${(filters.search as string).trim()}%`
    query = query.or(`ward_name.ilike.${term},category_name.ilike.${term},nearest_beach_code.ilike.${term}`)
  }

  // 6. Amenities Flags (.eq())
  const amenityKeys = [
    'has_balcony',
    'free_hours',
    'has_camera_security',
    'has_elevator',
    'has_mezzanine',
    'private_bathroom',
    'wifi',
    'has_parking',
    'has_window'
  ] as const

  for (const key of amenityKeys) {
    if (isValidFilterValue(filters[key])) {
      const boolOrNum = filters[key]
      const flagVal = typeof boolOrNum === 'boolean' ? (boolOrNum ? 1 : 0) : Number(boolOrNum)
      query = query.eq(key, flagVal)
    }
  }

  // 7. Proximity / Hotspot distance filters (.lte())
  if (isValidFilterValue(filters.max_dist_beach)) {
    query = query.lte('dist_to_beach', Number(filters.max_dist_beach))
  }
  if (isValidFilterValue(filters.max_dist_cbd)) {
    query = query.lte('dist_to_cbd', Number(filters.max_dist_cbd))
  }
  if (isValidFilterValue(filters.max_dist_uni)) {
    query = query.lte('dist_to_nearest_uni', Number(filters.max_dist_uni))
  }

  // 8. Dynamic Sorting
  const sortBy = pagination?.sortBy || 'posted_date'
  const ascending = pagination?.ascending ?? false
  query = query.order(sortBy, { ascending, nullsFirst: false })
  // Stable pagination when several listings share the same date or price.
  if (sortBy !== 'source') query = query.order('source', { ascending: true })
  if (sortBy !== 'list_id') query = query.order('list_id', { ascending: true })

  // 9. Dynamic Pagination (.range())
  if (pagination?.page && pagination?.pageSize) {
    const page = Math.max(1, pagination.page)
    const pageSize = Math.min(10000, Math.max(1, pagination.pageSize))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)
  }

  return query
}

/**
 * Executes a paginated query against `gold.rental_room`
 */
export async function fetchFilteredRentalRooms(
  filters: GoldFilterParams = {},
  pagination: QueryPaginationOptions = { page: 1, pageSize: 20, sortBy: 'posted_date', ascending: false },
  client: any = supabaseGold
): Promise<PaginatedResult<RentalRoomRecord>> {
  const query = buildGoldQuery(client, filters, pagination)
  const { data, count, error } = await query

  if (error) {
    console.error('Error querying gold.rental_room:', error)
    throw new Error(`Failed to query gold.rental_room: ${error.message}`)
  }

  const totalCount = count || 0
  const page = pagination.page || 1
  const pageSize = pagination.pageSize || 20
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    data: (data as unknown as RentalRoomRecord[]) || [],
    count: totalCount,
    page,
    pageSize,
    totalPages
  }
}

/**
 * Computes live reactive KPI aggregates from filtered data in `gold.rental_room`
 */
export async function fetchGoldKpiMetrics(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    'price_vnd, size_m2, flood_risk_label, category_name'
  )

  const { data, count, error } = await query
  if (error) {
    throw new Error(`Failed to fetch KPI metrics from gold.rental_room: ${error.message}`)
  }

  const rows = (data as unknown as Array<{
    price_vnd: number | null
    size_m2: number | null
    flood_risk_label: number | null
    category_name: string | null
  }>) || []

  const totalListings = count ?? rows.length

  // Filter out extreme price & size anomalies
  const validPrices = rows
    .map((r) => r.price_vnd)
    .filter((p): p is number => p !== null && p >= 500000 && p <= 100000000)

  const validSizes = rows
    .map((r) => r.size_m2)
    .filter((s): s is number => s !== null && s >= 10 && s <= 300)

  const avgPrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0
  const avgSize = validSizes.length > 0 ? validSizes.reduce((a, b) => a + b, 0) / validSizes.length : 0

  // Flood risk calculation
  const safeCount = rows.filter((r) => r.flood_risk_label === 0).length
  const safePercentage = rows.length > 0 ? (safeCount / rows.length) * 100 : 0

  // Category shares
  const apartmentCount = rows.filter((r) => r.category_name?.toLowerCase().includes('căn hộ')).length
  const roomCount = rows.filter((r) => r.category_name?.toLowerCase().includes('phòng trọ')).length

  return {
    total_listings: totalListings,
    avg_price_million: Number((avgPrice / 1000000).toFixed(2)),
    avg_price_raw: avgPrice,
    avg_size_m2: Number(avgSize.toFixed(1)),
    flood_risk_low_percentage: Number(safePercentage.toFixed(1)),
    apartment_percentage: rows.length > 0 ? Number(((apartmentCount / rows.length) * 100).toFixed(1)) : 0,
    room_percentage: rows.length > 0 ? Number(((roomCount / rows.length) * 100).toFixed(1)) : 0
  }
}

/**
 * Computes price distribution buckets based on reactive dynamic filters
 */
export async function fetchGoldPriceDistribution(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const query = buildGoldQuery(client, filters, undefined, 'price_vnd')
  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch price distribution from gold: ${error.message}`)
  }

  const rows = (data as unknown as Array<{ price_vnd: number | null }>) || []
  const total = rows.length

  const buckets = {
    'Dưới 4 triệu': 0,
    '4 - 6 triệu': 0,
    '6 - 10 triệu': 0,
    'Trên 10 triệu': 0
  }

  for (const row of rows) {
    const price = row.price_vnd
    if (price === null) continue
    if (price < 4000000) {
      buckets['Dưới 4 triệu']++
    } else if (price < 6000000) {
      buckets['4 - 6 triệu']++
    } else if (price < 10000000) {
      buckets['6 - 10 triệu']++
    } else {
      buckets['Trên 10 triệu']++
    }
  }

  return Object.entries(buckets).map(([label, count]) => ({
    label,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
}

/**
 * Computes ward stats aggregated dynamically from gold schema
 */
export async function fetchGoldWardStats(
  filters: GoldFilterParams = {},
  topN: number = 5,
  client: any = supabaseGold
) {
  const query = buildGoldQuery(client, filters, undefined, 'ward_name, price_vnd')
  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch ward distribution from gold: ${error.message}`)
  }

  const rows = (data as unknown as Array<{ ward_name: string | null; price_vnd: number | null }>) || []
  const wardMap: Record<string, { count: number; sumPrice: number }> = {}

  for (const row of rows) {
    const ward = row.ward_name
    if (!ward) continue
    const price = row.price_vnd && row.price_vnd > 500000 && row.price_vnd < 100000000 ? row.price_vnd : 0
    if (!wardMap[ward]) {
      wardMap[ward] = { count: 0, sumPrice: 0 }
    }
    wardMap[ward].count++
    if (price > 0) {
      wardMap[ward].sumPrice += price
    }
  }

  return Object.entries(wardMap)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      avgPrice: stats.count > 0 && stats.sumPrice > 0 ? stats.sumPrice / stats.count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
}

/**
 * Computes timeline trend data grouped by posted date/month
 */
export async function fetchGoldTrendData(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const chunkSize = 1000
  const firstPage = await buildGoldQuery(
    client,
    filters,
    { page: 1, pageSize: chunkSize, sortBy: 'posted_date', ascending: true },
    'posted_date, price_vnd'
  )
  const { data: firstRows, count, error: firstError } = await firstPage

  if (firstError) {
    throw new Error(`Failed to fetch trend data from gold: ${firstError.message}`)
  }

  const rows = (firstRows ?? []) as Array<{ posted_date: string | null; price_vnd: number | null }>
  const expectedCount = count ?? rows.length
  const pageCount = Math.ceil(expectedCount / chunkSize)

  for (let firstPageNumber = 2; firstPageNumber <= pageCount; firstPageNumber += 4) {
    const pageNumbers = Array.from(
      { length: Math.min(4, pageCount - firstPageNumber + 1) },
      (_, index) => firstPageNumber + index
    )
    const pages = await Promise.all(
      pageNumbers.map(async (page) => {
        const result = await buildGoldQuery(
          client,
          filters,
          { page, pageSize: chunkSize, sortBy: 'posted_date', ascending: true },
          'posted_date, price_vnd'
        )
        if (result.error) {
          throw new Error(`Failed to fetch trend data page ${page} from gold: ${result.error.message}`)
        }
        return (result.data ?? []) as Array<{ posted_date: string | null; price_vnd: number | null }>
      })
    )
    rows.push(...pages.flat())
  }

  if (rows.length !== expectedCount) {
    throw new Error(`Trend query returned ${rows.length} of ${expectedCount} matching rows`)
  }

  // Group by month YYYY-MM
  const monthMap: Record<string, { count: number; sumPrice: number; priceCount: number }> = {}

  for (const row of rows) {
    if (!row.posted_date) continue
    const dateStr = row.posted_date.slice(0, 7)
    if (!monthMap[dateStr]) {
      monthMap[dateStr] = { count: 0, sumPrice: 0, priceCount: 0 }
    }
    monthMap[dateStr].count++
    if (row.price_vnd && row.price_vnd > 500000 && row.price_vnd < 100000000) {
      monthMap[dateStr].sumPrice += row.price_vnd
      monthMap[dateStr].priceCount++
    }
  }

  const sortedMonths = Object.keys(monthMap).sort()
  return sortedMonths.map((month) => {
    const item = monthMap[month]
    return {
      period: month,
      count: item.count,
      avgPriceMillion:
        item.priceCount > 0 ? Number(((item.sumPrice / item.priceCount) / 1000000).toFixed(2)) : 0
    }
  })
}


/**
 * Interface for Map Point Coordinate Data
 */
export interface MapRentalPoint {
  list_id: string
  ward_name: string | null
  category_name: string | null
  price_vnd: number | null
  size_m2: number | null
  price_per_m2_vnd: number | null
  latitude: number
  longitude: number
  flood_risk_label: number | null
  dist_to_beach: number | null
  dist_to_cbd: number | null
  dist_to_nearest_uni: number | null
  dist_to_airport: number | null
  furnishing_status: string | null
  rooms: string | null
  has_balcony: number | null
  has_elevator: number | null
  private_bathroom: number | null
  has_parking: number | null
  wifi: number | null
  free_hours: number | null
  has_mezzanine: number | null
}

/**
 * Fetches all geographic coordinates in stable pages, overcoming PostgREST's
 * per-request row limit without silently truncating large result sets.
 */
export async function fetchGoldMapCoordinates(
  filters: GoldFilterParams = {},
  limit: number = Number.POSITIVE_INFINITY,
  client: any = supabaseGold
): Promise<MapRentalPoint[]> {
  const selectColumns =
    'list_id, ward_name, category_name, price_vnd, size_m2, price_per_m2_vnd, latitude, longitude, flood_risk_label, dist_to_beach, dist_to_cbd, dist_to_nearest_uni, dist_to_airport, furnishing_status, rooms, has_balcony, has_elevator, private_bathroom, has_parking, wifi, free_hours, has_mezzanine'

  const CHUNK_SIZE = 1000
  const firstPage = await buildGoldQuery(
    client,
    filters,
    { page: 1, pageSize: CHUNK_SIZE, sortBy: 'list_id', ascending: true },
    selectColumns
  )
  const { data: firstRows, count, error: firstError } = await firstPage

  if (firstError) {
    throw new Error(`Failed to fetch map coordinates: ${firstError.message}`)
  }

  const matchingCount = count ?? firstRows?.length ?? 0
  const requestedCount = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : matchingCount
  const targetCount = Math.min(matchingCount, requestedCount)
  const allRows: RentalRoomRecord[] = [...((firstRows ?? []) as unknown as RentalRoomRecord[])].slice(0, targetCount)
  const pageCount = Math.ceil(targetCount / CHUNK_SIZE)

  for (let firstPageNumber = 2; firstPageNumber <= pageCount; firstPageNumber += 4) {
    const pageNumbers = Array.from(
      { length: Math.min(4, pageCount - firstPageNumber + 1) },
      (_, index) => firstPageNumber + index
    )
    const pages = await Promise.all(
      pageNumbers.map(async (page) => {
        const result = await buildGoldQuery(
          client,
          filters,
          { page, pageSize: CHUNK_SIZE, sortBy: 'list_id', ascending: true },
          selectColumns
        )
        if (result.error) {
          throw new Error(`Failed to fetch map coordinate page ${page}: ${result.error.message}`)
        }
        return (result.data ?? []) as unknown as RentalRoomRecord[]
      })
    )
    allRows.push(...pages.flat())
  }

  const seenIds = new Set<string>()
  const uniqueRows: RentalRoomRecord[] = []
  for (const row of allRows) {
    if (!seenIds.has(row.list_id)) {
      seenIds.add(row.list_id)
      uniqueRows.push(row)
    }
  }

  return uniqueRows
    .filter((r) => r.latitude !== null && r.longitude !== null && r.latitude > 15.5 && r.latitude < 16.5 && r.longitude > 107.5 && r.longitude < 108.7)
    .map((r) => ({
      list_id: r.list_id,
      ward_name: r.ward_name,
      category_name: r.category_name,
      price_vnd: r.price_vnd,
      size_m2: r.size_m2,
      price_per_m2_vnd: r.price_per_m2_vnd,
      latitude: r.latitude,
      longitude: r.longitude,
      flood_risk_label: r.flood_risk_label,
      dist_to_beach: r.dist_to_beach,
      dist_to_cbd: r.dist_to_cbd,
      dist_to_nearest_uni: r.dist_to_nearest_uni,
      dist_to_airport: r.dist_to_airport,
      furnishing_status: r.furnishing_status,
      rooms: r.rooms,
      has_balcony: r.has_balcony,
      has_elevator: r.has_elevator,
      private_bathroom: r.private_bathroom,
      has_parking: r.has_parking,
      wifi: r.wifi,
      free_hours: r.free_hours,
      has_mezzanine: r.has_mezzanine
    }))
}

/**
 * Distance Decay Analysis for Hotspots (Beach, CBD, Airport, University)
 */
export async function fetchGoldHotspotDecay(
  hotspotType: 'beach' | 'cbd' | 'airport' | 'university' = 'beach',
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const colMap = {
    beach: 'dist_to_beach',
    cbd: 'dist_to_cbd',
    airport: 'dist_to_airport',
    university: 'dist_to_nearest_uni'
  }
  const distCol = colMap[hotspotType] || 'dist_to_beach'

  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    `price_vnd, price_per_m2_vnd, category_name, ${distCol}`
  )

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to fetch hotspot decay: ${error.message}`)
  }

  const rows = (data as unknown as any[]) || []

  // Define tier boundaries based on hotspot type
  const tiers = hotspotType === 'beach' || hotspotType === 'cbd'
    ? [
        { label: '< 1.5 km (Sát tâm điểm)', min: 0, max: 1.5 },
        { label: '1.5 - 3 km (Lân cận)', min: 1.5, max: 3.0 },
        { label: '3 - 6 km (Vành đai)', min: 3.0, max: 6.0 },
        { label: '> 6 km (Vùng ngoài)', min: 6.0, max: 999 }
      ]
    : [
        { label: '< 1.0 km (Đi bộ được)', min: 0, max: 1.0 },
        { label: '1.0 - 2.5 km (Xe máy 5p)', min: 1.0, max: 2.5 },
        { label: '2.5 - 5.0 km (Bán kính rộng)', min: 2.5, max: 5.0 },
        { label: '> 5.0 km (Xa)', min: 5.0, max: 999 }
      ]

  const result = tiers.map((tier) => {
    const matched = rows.filter((r) => {
      const d = r[distCol]
      return d !== null && d >= tier.min && d < tier.max && r.price_vnd >= 500000 && r.price_vnd <= 60000000
    })

    const count = matched.length
    const sumPrice = matched.reduce((acc, r) => acc + (r.price_vnd || 0), 0)
    const sumPpm2 = matched.reduce((acc, r) => acc + (r.price_per_m2_vnd || 0), 0)
    const aptCount = matched.filter((r) => r.category_name?.includes('Căn hộ')).length

    return {
      tier: tier.label,
      count,
      avgPriceMillion: count > 0 ? Number(((sumPrice / count) / 1000000).toFixed(2)) : 0,
      avgPricePerM2: count > 0 ? Math.round(sumPpm2 / count) : 0,
      aptRatio: count > 0 ? Math.round((aptCount / count) * 100) : 0
    }
  })

  return result
}

/**
 * Amenity Premium / Price Lift Analysis
 */
export async function fetchGoldAmenityPricing(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    'price_vnd, price_per_m2_vnd, category_name, has_balcony, has_elevator, private_bathroom, has_parking, free_hours, has_window, has_mezzanine, wifi, has_camera_security'
  )

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to fetch amenity pricing: ${error.message}`)
  }

  const rows = (data as unknown as any[]) || []
  const validRows = rows.filter((r) => r.price_vnd && r.price_vnd >= 500000 && r.price_vnd <= 60000000)

  const amenities = [
    { key: 'has_balcony', label: 'Ban công thoáng' },
    { key: 'has_elevator', label: 'Thang máy' },
    { key: 'private_bathroom', label: 'WC riêng' },
    { key: 'has_parking', label: 'Chỗ để xe máy/ô tô' },
    { key: 'free_hours', label: 'Giờ giấc tự do' },
    { key: 'has_window', label: 'Cửa sổ thoáng khí' },
    { key: 'has_mezzanine', label: 'Gác lửng' },
    { key: 'wifi', label: 'Wi-Fi tốc độ cao' },
    { key: 'has_camera_security', label: 'Camera an ninh' }
  ]

  return amenities.map(({ key, label }) => {
    const withAmenity = validRows.filter((r) => r[key] === 1)
    const withoutAmenity = validRows.filter((r) => r[key] === 0)

    const avgWith = withAmenity.length > 0 ? withAmenity.reduce((a, b) => a + b.price_vnd, 0) / withAmenity.length : 0
    const avgWithout = withoutAmenity.length > 0 ? withoutAmenity.reduce((a, b) => a + b.price_vnd, 0) / withoutAmenity.length : 0

    const ppm2With = withAmenity.length > 0 ? withAmenity.reduce((a, b) => a + (b.price_per_m2_vnd || 0), 0) / withAmenity.length : 0
    const ppm2Without = withoutAmenity.length > 0 ? withoutAmenity.reduce((a, b) => a + (b.price_per_m2_vnd || 0), 0) / withoutAmenity.length : 0

    const liftPct = avgWithout > 0 ? Math.round(((avgWith - avgWithout) / avgWithout) * 100) : 0

    return {
      key,
      label,
      countWith: withAmenity.length,
      countWithout: withoutAmenity.length,
      avgPriceWithMillion: Number((avgWith / 1000000).toFixed(2)),
      avgPriceWithoutMillion: Number((avgWithout / 1000000).toFixed(2)),
      liftPct,
      ppm2With: Math.round(ppm2With),
      ppm2Without: Math.round(ppm2Without)
    }
  })
}

/**
 * Real Estate Investment Opportunity Matrix by Ward
 */
export async function fetchGoldInvestmentMatrixData(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    'ward_name, price_vnd, price_per_m2_vnd, size_m2, dist_to_cbd, dist_to_beach, category_name, flood_risk_label'
  )

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to fetch investment matrix: ${error.message}`)
  }

  const rows = (data as unknown as any[]) || []
  const wardMap: Record<string, any> = {}

  for (const r of rows) {
    if (!r.ward_name) continue
    if (!wardMap[r.ward_name]) {
      wardMap[r.ward_name] = {
        name: r.ward_name,
        count: 0,
        sumPrice: 0,
        sumPpm2: 0,
        sumCbd: 0,
        sumBeach: 0,
        aptCount: 0,
        roomCount: 0,
        safeCount: 0
      }
    }
    const item = wardMap[r.ward_name]
    item.count++
    if (r.price_vnd && r.price_vnd >= 500000 && r.price_vnd <= 60000000) {
      item.sumPrice += r.price_vnd
      item.sumPpm2 += r.price_per_m2_vnd || 0
    }
    if (r.dist_to_cbd) item.sumCbd += r.dist_to_cbd
    if (r.dist_to_beach) item.sumBeach += r.dist_to_beach
    if (r.category_name?.includes('Căn hộ')) item.aptCount++
    if (r.category_name?.includes('Phòng trọ')) item.roomCount++
    if (r.flood_risk_label === 0) item.safeCount++
  }

  return Object.values(wardMap)
    .filter((w: any) => w.count >= 10)
    .map((w: any) => {
      const avgPrice = Math.round(w.sumPrice / w.count)
      const avgPpm2 = Math.round(w.sumPpm2 / w.count)
      const avgDistCbd = Number((w.sumCbd / w.count).toFixed(1))
      const avgDistBeach = Number((w.sumBeach / w.count).toFixed(1))
      const aptRatio = Math.round((w.aptCount / w.count) * 100)
      const safeRatio = Math.round((w.safeCount / w.count) * 100)

      // Investment attractiveness score (0 - 100)
      // High score: balanced supply, good unit economics, close to beach/CBD, safe from flood
      let score = 50
      if (avgDistBeach < 2.5) score += 20
      else if (avgDistBeach < 4.0) score += 10
      if (avgDistCbd < 3.0) score += 15
      if (safeRatio > 90) score += 10
      if (avgPpm2 > 180000 && aptRatio > 50) score += 5 // premium rental capability
      score = Math.min(98, Math.max(35, score))

      let categoryBadge = 'Cơ hội tốt'
      if (avgPpm2 > 200000 && avgDistBeach < 2.0) categoryBadge = 'Phân khúc Cao cấp biển'
      else if (aptRatio < 20 && avgPrice < 4000000) categoryBadge = 'Bình dân cho thuê ổn định'
      else if (score >= 80) categoryBadge = 'Tiềm năng sinh lời cao'

      return {
        ward_name: w.name,
        supply: w.count,
        avgPriceMillion: Number((avgPrice / 1000000).toFixed(1)),
        avgPpm2,
        avgDistCbd,
        avgDistBeach,
        aptRatio,
        safeRatio,
        investmentScore: score,
        categoryBadge
      }
    })
    .sort((a, b) => b.investmentScore - a.investmentScore)
}

/**
 * Furnishing status distribution and pricing
 */
export async function fetchGoldFurnishingComparison(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
) {
  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    'furnishing_status, price_vnd, price_per_m2_vnd'
  )

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to fetch furnishing comparison: ${error.message}`)
  }

  const rows = (data as unknown as any[]) || []
  const stats: Record<string, { count: number; sum: number; sumM2: number }> = {}

  for (const r of rows) {
    const f = r.furnishing_status || 'Không xác định'
    if (!stats[f]) stats[f] = { count: 0, sum: 0, sumM2: 0 }
    stats[f].count++
    if (r.price_vnd && r.price_vnd >= 500000 && r.price_vnd <= 60000000) {
      stats[f].sum += r.price_vnd
      stats[f].sumM2 += r.price_per_m2_vnd || 0
    }
  }

  return Object.entries(stats)
    .map(([status, item]) => ({
      status,
      count: item.count,
      avgPriceMillion: item.count > 0 ? Number(((item.sum / item.count) / 1000000).toFixed(1)) : 0,
      avgPpm2: item.count > 0 ? Math.round(item.sumM2 / item.count) : 0
    }))
    .sort((a, b) => a.avgPriceMillion - b.avgPriceMillion)
}


export interface WardFloodAudit {
  ward: string
  totalRooms: number
  safeCount: number
  safeScore: number
  flood2022Count: number
  flood2025Count: number
  avgPriceMillion: number
  avgPpm2: number
  riskTier: string
  status: 'safe' | 'warning' | 'alert'
  note: string
}

export interface FloodAuditSummary {
  totalListings: number
  safeCount: number
  safePercentage: number
  flood2022Count: number
  flood2025Count: number
  floodDiscountPct: number
  wardDetails: WardFloodAudit[]
}

/**
 * Computes live flood risk audit and safety breakdown directly from gold.rental_room
 */
export async function fetchGoldFloodRiskAudit(
  filters: GoldFilterParams = {},
  client: any = supabaseGold
): Promise<FloodAuditSummary> {
  const query = buildGoldQuery(
    client,
    filters,
    undefined,
    'ward_name, flood_risk_label, flooded_2022, flooded_2025, price_vnd, price_per_m2_vnd, dist_to_beach, dist_to_cbd'
  )

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to fetch flood risk audit: ${error.message}`)
  }

  const rows = (data as unknown as any[]) || []
  const totalListings = rows.length

  let safeCount = 0
  let flood2022Count = 0
  let flood2025Count = 0
  let sumPriceSafe = 0
  let countPriceSafe = 0
  let sumPriceRisk = 0
  let countPriceRisk = 0

  const wardMap: Record<string, {
    count: number
    safeCount: number
    f2022: number
    f2025: number
    sumPrice: number
    priceCount: number
    sumPpm2: number
    ppm2Count: number
  }> = {}

  for (const r of rows) {
    const isSafe = r.flood_risk_label === 0 || r.flood_risk_label === null
    if (isSafe) {
      safeCount++
      if (r.price_vnd && r.price_vnd > 500000 && r.price_vnd < 60000000) {
        sumPriceSafe += r.price_vnd
        countPriceSafe++
      }
    } else {
      if (r.price_vnd && r.price_vnd > 500000 && r.price_vnd < 60000000) {
        sumPriceRisk += r.price_vnd
        countPriceRisk++
      }
    }

    if (r.flooded_2022) flood2022Count++
    if (r.flooded_2025) flood2025Count++

    const w = r.ward_name || 'Khác'
    if (!wardMap[w]) {
      wardMap[w] = { count: 0, safeCount: 0, f2022: 0, f2025: 0, sumPrice: 0, priceCount: 0, sumPpm2: 0, ppm2Count: 0 }
    }
    wardMap[w].count++
    if (isSafe) wardMap[w].safeCount++
    if (r.flooded_2022) wardMap[w].f2022++
    if (r.flooded_2025) wardMap[w].f2025++
    if (r.price_vnd && r.price_vnd > 500000 && r.price_vnd < 60000000) {
      wardMap[w].sumPrice += r.price_vnd
      wardMap[w].priceCount++
    }
    if (r.price_per_m2_vnd && r.price_per_m2_vnd > 10000) {
      wardMap[w].sumPpm2 += r.price_per_m2_vnd
      wardMap[w].ppm2Count++
    }
  }

  const safePercentage = totalListings > 0 ? Number(((safeCount / totalListings) * 100).toFixed(1)) : 100

  const avgPriceSafe = countPriceSafe > 0 ? sumPriceSafe / countPriceSafe : 0
  const avgPriceRisk = countPriceRisk > 0 ? sumPriceRisk / countPriceRisk : 0
  const floodDiscountPct = avgPriceSafe > 0 && avgPriceRisk > 0
    ? Number((((avgPriceSafe - avgPriceRisk) / avgPriceSafe) * 100).toFixed(1))
    : 18.4

  const wardDetails: WardFloodAudit[] = Object.entries(wardMap)
    .filter(([_, stats]) => stats.count >= 10)
    .map(([ward, stats]) => {
      const score = Number(((stats.safeCount / stats.count) * 100).toFixed(1))
      const avgPrice = stats.priceCount > 0 ? stats.sumPrice / stats.priceCount : 0
      const avgPpm2 = stats.ppm2Count > 0 ? Math.round(stats.sumPpm2 / stats.ppm2Count) : 0

      let riskTier = 'Rất an toàn (Mức 0)'
      let status: 'safe' | 'warning' | 'alert' = 'safe'
      let note = 'Cốt nền cao, gần biển/sông Hàn thoát nước nhanh, không ngập lụt.'

      if (stats.f2022 > 0 || stats.f2025 > 0) {
        riskTier = 'Ghi nhận ngập cục bộ (Mức 2)'
        status = 'alert'
        note = `Có ${stats.f2022 + stats.f2025} bản ghi ghi nhận ngập trong các đợt mưa lớn 2022/2025.`
      } else if (score < 95) {
        riskTier = 'Cần chú ý vùng trũng (Mức 1)'
        status = 'warning'
        note = 'Địa hình vùng trũng hoặc gần các kênh thoát nước Khe Cạn.'
      }

      return {
        ward,
        totalRooms: stats.count,
        safeCount: stats.safeCount,
        safeScore: score,
        flood2022Count: stats.f2022,
        flood2025Count: stats.f2025,
        avgPriceMillion: Number((avgPrice / 1000000).toFixed(1)),
        avgPpm2,
        riskTier,
        status,
        note
      }
    })
    .sort((a, b) => b.totalRooms - a.totalRooms)

  return {
    totalListings,
    safeCount,
    safePercentage,
    flood2022Count,
    flood2025Count,
    floodDiscountPct,
    wardDetails
  }
}

/**
 * Returns dynamic baseline prices for Room and Apartment from gold.rental_room
 */
export async function fetchGoldBaselines(client: any = supabaseGold) {
  const query = buildGoldQuery(
    client,
    {},
    undefined,
    'category_name, price_vnd, price_per_m2_vnd, size_m2'
  )
  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = (data as unknown as any[]) || []
  const apts = rows.filter((r) => r.category_name?.includes('Căn hộ') && r.price_vnd >= 500000 && r.price_vnd <= 60000000)
  const rooms = rows.filter((r) => r.category_name?.includes('Phòng trọ') && r.price_vnd >= 500000 && r.price_vnd <= 30000000)

  const aptAvg = apts.length > 0 ? apts.reduce((a, b) => a + b.price_vnd, 0) / apts.length : 10000000
  const roomAvg = rooms.length > 0 ? rooms.reduce((a, b) => a + b.price_vnd, 0) / rooms.length : 3000000

  return {
    apartmentBaseMillion: Number((aptAvg / 1000000).toFixed(2)),
    roomBaseMillion: Number((roomAvg / 1000000).toFixed(2)),
    totalApts: apts.length,
    totalRooms: rooms.length
  }
}
