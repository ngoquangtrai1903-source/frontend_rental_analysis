'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapRentalPoint } from '@/lib/goldQueryService'

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

export function useRentalMapData(filterQueryString: string = '') {
  const [points, setPoints] = useState<MapRentalPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchMapData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/gold-query?mode=map${filterQueryString ? `&${filterQueryString}` : ''}`
      const res = await fetch(url, { signal })
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu toạ độ (${res.status})`)
      }
      const json: { points?: MapRentalPoint[]; total?: number; error?: string; message?: string } = await res.json()
      if (!Array.isArray(json.points)) {
        throw new Error(json.message || json.error || 'Dữ liệu toạ độ trả về không hợp lệ')
      }
      const pts = json.points
      setPoints(pts)
      setTotalCount(json.total ?? pts.length)
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        console.error('useRentalMapData error:', err)
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu toạ độ')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [filterQueryString])

  useEffect(() => {
    const controller = new AbortController()
    void fetchMapData(controller.signal)
    return () => controller.abort()
  }, [fetchMapData])

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
    loading,
    totalCount,
    error,
    stats,
    refetch: fetchMapData
  }
}
export default useRentalMapData
