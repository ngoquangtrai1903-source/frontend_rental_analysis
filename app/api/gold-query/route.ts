import { NextRequest, NextResponse } from 'next/server'
import {
  fetchFilteredRentalRooms,
  fetchGoldKpiMetrics,
  fetchGoldPriceDistribution,
  fetchGoldWardStats,
  fetchGoldTrendData,
  fetchGoldMapCoordinates,
  fetchGoldHotspotDecay,
  fetchGoldAmenityPricing,
  fetchGoldInvestmentMatrixData,
  fetchGoldFurnishingComparison,
  fetchGoldFloodRiskAudit,
  fetchGoldBaselines,
  GoldFilterParams,
  QueryPaginationOptions
} from '@/lib/goldQueryService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('mode') || 'dashboard'

    // Parse filters from URL search params
    const filters: GoldFilterParams = {}

    const ward = searchParams.get('ward') || searchParams.get('ward_name')
    if (ward) filters.ward_name = ward.includes(',') ? ward.split(',') : ward

    const category = searchParams.get('category') || searchParams.get('category_name')
    if (category) filters.category_name = category.includes(',') ? category.split(',') : category

    const furnishing = searchParams.get('furnishing') || searchParams.get('furnishing_status')
    if (furnishing) filters.furnishing_status = furnishing.includes(',') ? furnishing.split(',') : furnishing

    const minPrice = searchParams.get('min_price')
    if (minPrice) filters.min_price = Number(minPrice)

    const maxPrice = searchParams.get('max_price')
    if (maxPrice) filters.max_price = Number(maxPrice)

    const minSize = searchParams.get('min_size')
    if (minSize) filters.min_size = Number(minSize)

    const maxSize = searchParams.get('max_size')
    if (maxSize) filters.max_size = Number(maxSize)

    const floodRisk = searchParams.get('flood_risk_label')
    if (floodRisk !== null && floodRisk !== '') filters.flood_risk_label = Number(floodRisk)

    const search = searchParams.get('search')
    if (search) filters.search = search

    const startDate = searchParams.get('start_date')
    if (startDate) filters.start_date = startDate

    const endDate = searchParams.get('end_date')
    if (endDate) filters.end_date = endDate

    const maxDistBeach = searchParams.get('max_dist_beach')
    if (maxDistBeach) filters.max_dist_beach = Number(maxDistBeach)

    const maxDistCbd = searchParams.get('max_dist_cbd')
    if (maxDistCbd) filters.max_dist_cbd = Number(maxDistCbd)

    const maxDistUni = searchParams.get('max_dist_uni')
    if (maxDistUni) filters.max_dist_uni = Number(maxDistUni)

    const mapBounds = ['min_latitude', 'max_latitude', 'min_longitude', 'max_longitude'] as const
    const suppliedMapBounds = mapBounds.map((key) => searchParams.has(key))
    if (suppliedMapBounds.some(Boolean) && !suppliedMapBounds.every(Boolean)) {
      return NextResponse.json({ error: 'Incomplete map viewport bounds' }, { status: 400 })
    }
    if (suppliedMapBounds.every(Boolean)) {
      const bounds = Object.fromEntries(
        mapBounds.map((key) => [key, Number(searchParams.get(key))])
      ) as Record<(typeof mapBounds)[number], number>
      if (
        !Object.values(bounds).every(Number.isFinite) ||
        bounds.min_latitude < 15.5 ||
        bounds.max_latitude > 16.5 ||
        bounds.min_longitude < 107.5 ||
        bounds.max_longitude > 108.7 ||
        bounds.min_latitude >= bounds.max_latitude ||
        bounds.min_longitude >= bounds.max_longitude
      ) {
        return NextResponse.json({ error: 'Invalid map viewport bounds' }, { status: 400 })
      }
      Object.assign(filters, bounds)
    }

    // Amenity filters
    const amenities = [
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

    for (const a of amenities) {
      const val = searchParams.get(a)
      if (val !== null && val !== '') {
        filters[a] = Number(val)
      }
    }

    // Pagination & sorting
    const pagination: QueryPaginationOptions = {
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
      sortBy: searchParams.get('sortBy') || 'posted_date',
      ascending: searchParams.get('ascending') === 'true'
    }

    if (mode === 'records') {
      const result = await fetchFilteredRentalRooms(filters, pagination)
      return NextResponse.json(result)
    }

    if (mode === 'kpi') {
      const kpi = await fetchGoldKpiMetrics(filters)
      return NextResponse.json(kpi)
    }

    if (mode === 'distribution') {
      const dist = await fetchGoldPriceDistribution(filters)
      return NextResponse.json(dist)
    }

    if (mode === 'wards') {
      const wards = await fetchGoldWardStats(filters)
      return NextResponse.json(wards)
    }

    if (mode === 'trend') {
      const trend = await fetchGoldTrendData(filters)
      return NextResponse.json(trend)
    }

    // Mode: Map coordinates for Location & Area tab
    if (mode === 'map' || mode === 'coordinates') {
      const requestedLimit = searchParams.get('limit')
      const limit = requestedLimit ? Number(requestedLimit) : undefined
      if (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1)) {
        return NextResponse.json({ error: 'Invalid map result limit' }, { status: 400 })
      }
      const coordinates = await fetchGoldMapCoordinates(filters, limit)
      return NextResponse.json({
        total: coordinates.total,
        points: coordinates.points
      })
    }

    // Mode: Hotspots distance decay
    if (mode === 'hotspots') {
      const hotspotType = (searchParams.get('hotspot') as any) || 'beach'
      const decay = await fetchGoldHotspotDecay(hotspotType, filters)
      return NextResponse.json(decay)
    }

    // Mode: Amenity lift pricing
    if (mode === 'amenities') {
      const amenityPricing = await fetchGoldAmenityPricing(filters)
      return NextResponse.json(amenityPricing)
    }

    // Mode: Investment opportunity matrix
    if (mode === 'investment') {
      const matrix = await fetchGoldInvestmentMatrixData(filters)
      return NextResponse.json(matrix)
    }

    // Mode: Flood risk audit and analysis
    if (mode === 'flood_risk') {
      const floodAudit = await fetchGoldFloodRiskAudit(filters)
      return NextResponse.json(floodAudit)
    }

    // Mode: Dynamic baselines
    if (mode === 'baselines') {
      const baselines = await fetchGoldBaselines()
      return NextResponse.json(baselines)
    }

    // Mode: All-in-one advanced analytics
    if (mode === 'analytics_all') {
      const hotspotType = (searchParams.get('hotspot') as any) || 'beach'
      const [hotspotDecay, amenityPricing, investmentMatrix, furnishingStats, kpi] = await Promise.all([
        fetchGoldHotspotDecay(hotspotType, filters),
        fetchGoldAmenityPricing(filters),
        fetchGoldInvestmentMatrixData(filters),
        fetchGoldFurnishingComparison(filters),
        fetchGoldKpiMetrics(filters)
      ])

      return NextResponse.json({
        kpi,
        hotspotDecay,
        amenityPricing,
        investmentMatrix,
        furnishingStats
      })
    }

    // Default: 'dashboard' mode fetches full analytical dashboard packet
    const [kpi, wards, priceDistribution, trend, paginatedRecords] = await Promise.all([
      fetchGoldKpiMetrics(filters),
      fetchGoldWardStats(filters),
      fetchGoldPriceDistribution(filters),
      fetchGoldTrendData(filters),
      fetchFilteredRentalRooms(filters, pagination)
    ])

    return NextResponse.json({
      kpi,
      wards,
      priceDistribution,
      trend,
      records: paginatedRecords
    })
  } catch (error: any) {
    console.error('Error in /api/gold-query:', error)
    return NextResponse.json(
      { error: 'Failed to process dynamic query', message: error?.message || String(error) },
      { status: 500 }
    )
  }
}
