import type { MapRentalPoint } from './goldQueryService'

export interface MapPointCluster {
  id: string
  latitude: number
  longitude: number
  points: MapRentalPoint[]
}

const CLUSTER_PIXEL_SIZE = 48

function project(point: MapRentalPoint, zoom: number) {
  const scale = 256 * 2 ** zoom
  const sinLatitude = Math.sin((point.latitude * Math.PI) / 180)
  return {
    x: ((point.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale
  }
}

export function clusterMapPoints(points: MapRentalPoint[], zoom: number): MapPointCluster[] {
  if (zoom >= 15) {
    return points.map((point) => ({
      id: point.list_id,
      latitude: point.latitude,
      longitude: point.longitude,
      points: [point]
    }))
  }

  const pixels = points.map((point) => project(point, zoom))
  const cellBuckets = new Map<string, number[]>()
  const parents = points.map((_, index) => index)
  const findRoot = (index: number): number => {
    if (parents[index] !== index) parents[index] = findRoot(parents[index])
    return parents[index]
  }
  const merge = (left: number, right: number) => {
    const leftRoot = findRoot(left)
    const rightRoot = findRoot(right)
    if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot
  }
  const maxDistanceSquared = CLUSTER_PIXEL_SIZE ** 2

  pixels.forEach((pixel, index) => {
    const cellX = Math.floor(pixel.x / CLUSTER_PIXEL_SIZE)
    const cellY = Math.floor(pixel.y / CLUSTER_PIXEL_SIZE)
    for (let x = cellX - 1; x <= cellX + 1; x++) {
      for (let y = cellY - 1; y <= cellY + 1; y++) {
        for (const neighbor of cellBuckets.get(`${x}:${y}`) ?? []) {
          const dx = pixel.x - pixels[neighbor].x
          const dy = pixel.y - pixels[neighbor].y
          if (dx * dx + dy * dy <= maxDistanceSquared) merge(index, neighbor)
        }
      }
    }
    const key = `${cellX}:${cellY}`
    const bucket = cellBuckets.get(key)
    if (bucket) bucket.push(index)
    else cellBuckets.set(key, [index])
  })

  const groups = new Map<number, MapRentalPoint[]>()
  points.forEach((point, index) => {
    const root = findRoot(index)
    const group = groups.get(root)
    if (group) group.push(point)
    else groups.set(root, [point])
  })

  return Array.from(groups, ([root, group]) => ({
    id: points[root].list_id,
    latitude: group.reduce((sum, point) => sum + point.latitude, 0) / group.length,
    longitude: group.reduce((sum, point) => sum + point.longitude, 0) / group.length,
    points: group
  }))
}
