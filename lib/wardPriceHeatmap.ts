import type { FeatureCollection, Point as GeoJSONPoint } from 'geojson'
import type { MapRentalPoint } from './goldQueryService'

export interface WardPriceSummary {
  wardName: string
  listingCount: number
  averagePriceVnd: number
  medianPriceVnd: number
}

export interface WardPriceFeatureProperties {
  ward_name: string
  listing_count: number
  average_price_vnd: number
  median_price_vnd: number
  heatmap_weight: number
}

export interface WardPriceHeatmap {
  data: FeatureCollection<GeoJSONPoint, WardPriceFeatureProperties>
  wards: WardPriceSummary[]
}

const MIN_VALID_PRICE = 500_000
const MAX_VALID_PRICE = 60_000_000

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export function buildWardPriceHeatmap(points: MapRentalPoint[]): WardPriceHeatmap {
  const validPoints = points.filter((point) =>
    Boolean(
      point.ward_name?.trim() &&
      point.price_vnd !== null &&
      point.price_vnd >= MIN_VALID_PRICE &&
      point.price_vnd <= MAX_VALID_PRICE &&
      Number.isFinite(point.longitude) &&
      Number.isFinite(point.latitude)
    )
  )
  const pricesByWard = new Map<string, number[]>()

  for (const point of validPoints) {
    const wardName = point.ward_name!.trim()
    const prices = pricesByWard.get(wardName) ?? []
    prices.push(point.price_vnd!)
    pricesByWard.set(wardName, prices)
  }

  const wards = [...pricesByWard.entries()]
    .map(([wardName, prices]) => ({
      wardName,
      listingCount: prices.length,
      averagePriceVnd: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      medianPriceVnd: median(prices)
    }))
    .sort((a, b) => a.wardName.localeCompare(b.wardName, 'vi'))
  const wardByName = new Map(wards.map((ward) => [ward.wardName, ward]))

  return {
    data: {
      type: 'FeatureCollection',
      features: validPoints.map((point) => {
        const ward = wardByName.get(point.ward_name!.trim())!
        const normalizedPriceWeight = Math.min(1, Math.max(0.15, ward.averagePriceVnd / 20_000_000))

        return {
          type: 'Feature',
          id: point.list_id,
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          },
          properties: {
            ward_name: ward.wardName,
            listing_count: ward.listingCount,
            average_price_vnd: Math.round(ward.averagePriceVnd),
            median_price_vnd: Math.round(ward.medianPriceVnd),
            heatmap_weight: normalizedPriceWeight / ward.listingCount
          }
        }
      })
    },
    wards
  }
}
