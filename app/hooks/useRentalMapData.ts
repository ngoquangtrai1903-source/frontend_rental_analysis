'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { MapRentalPoint } from '@/lib/goldQueryService'

export interface MapDataStats {
  total: number
  avgPriceMillion: number
  avgPpm2: number
  apartmentCount: number
  roomCount: number
  safeFloodCount: number
  lowPriceCount: number // < 3.5m
  midPriceCount: number // 3.5 - 7m
  highPriceCount: number // 7 - 12m
  luxuryPriceCount: number // > 12m
}

export interface MapViewportBounds {
  north: number
  south: number
  east: number
  west: number
}

export const INITIAL_MAP_VIEWPORT: MapViewportBounds = {
  north: 16.14,
  south: 15.98,
  east: 108.34,
  west: 108.10
}

const MAP_POINT_LIMIT = 1500

function toViewportQuery(bounds: MapViewportBounds) {
  const roundDown = (value: number) => Math.floor(value * 100) / 100
  const roundUp = (value: number) => Math.ceil(value * 100) / 100
  return new URLSearchParams({
    min_latitude: String(roundDown(bounds.south)),
    max_latitude: String(roundUp(bounds.north)),
    min_longitude: String(roundDown(bounds.west)),
    max_longitude: String(roundUp(bounds.east))
  }).toString()
}

export function useRentalMapData(
  filterQueryString: string = '',
  viewport: MapViewportBounds = INITIAL_MAP_VIEWPORT
) {
  const viewportQuery = toViewportQuery(viewport)
  const query = useQuery({
    queryKey: ['rental-map', filterQueryString, viewportQuery],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams(filterQueryString)
      new URLSearchParams(viewportQuery).forEach((value, key) => params.set(key, value))
      params.set('mode', 'map')
      params.set('limit', String(MAP_POINT_LIMIT))
      const res = await fetch(`/api/gold-query?${params.toString()}`, { signal })
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu toạ độ (${res.status})`)
      }
      const json: { points?: MapRentalPoint[]; total?: number; error?: string; message?: string } = await res.json()
      if (
        !Array.isArray(json.points) ||
        typeof json.total !== 'number' ||
        !Number.isSafeInteger(json.total) ||
        json.total < json.points.length
      ) {
        throw new Error(json.message || json.error || 'Dữ liệu toạ độ trả về không hợp lệ')
      }
      return { points: json.points, total: json.total }
    }
  })
  const points = query.data?.points ?? []
  const totalCount = query.data?.total ?? 0

  // Calculated statistics from all matching points
  const stats = useMemo<MapDataStats>(() => {
    if (points.length === 0) {
      return {
        total: 0,
        avgPriceMillion: 0,
        avgPpm2: 0,
        apartmentCount: 0,
        roomCount: 0,
        safeFloodCount: 0,
        lowPriceCount: 0,
        midPriceCount: 0,
        highPriceCount: 0,
        luxuryPriceCount: 0
      }
    }

    const validPrices = points.filter((p) => p.price_vnd && p.price_vnd > 0)
    const sumPrice = validPrices.reduce((acc, curr) => acc + (curr.price_vnd || 0), 0)
    const sumPpm2 = validPrices.reduce((acc, curr) => acc + (curr.price_per_m2_vnd || 0), 0)

    let aptCount = 0
    let safeCount = 0
    let lowCount = 0
    let midCount = 0
    let highCount = 0
    let luxCount = 0

    points.forEach((p) => {
      if (p.category_name?.includes('Căn hộ')) aptCount++
      if (p.flood_risk_label === 0) safeCount++

      const price = p.price_vnd || 0
      if (price > 0 && price < 3500000) lowCount++
      else if (price >= 3500000 && price < 7000000) midCount++
      else if (price >= 7000000 && price < 12000000) highCount++
      else if (price >= 12000000) luxCount++
    })

    return {
      total: points.length,
      avgPriceMillion: validPrices.length > 0 ? Number(((sumPrice / validPrices.length) / 1000000).toFixed(2)) : 0,
      avgPpm2: validPrices.length > 0 ? Math.round(sumPpm2 / validPrices.length) : 0,
      apartmentCount: aptCount,
      roomCount: points.length - aptCount,
      safeFloodCount: safeCount,
      lowPriceCount: lowCount,
      midPriceCount: midCount,
      highPriceCount: highCount,
      luxuryPriceCount: luxCount
    }
  }, [points])

  return {
    points,
    loading: query.isLoading,
    totalCount,
    error: query.error instanceof Error ? query.error.message : null,
    stats,
    refetch: query.refetch
  }
}
export default useRentalMapData
