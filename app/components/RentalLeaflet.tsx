'use client'

import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import type { MapRentalPoint } from '@/lib/goldQueryService'
import { clusterMapPoints } from '@/lib/mapClustering'
export interface MapViewportBounds {
  north: number
  south: number
  east: number
  west: number
}

function getViewportBounds(map: LeafletMap): MapViewportBounds {
  const bounds = map.getBounds()
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest()
  }
}

function ViewportReporter({
  onViewportChange,
  onZoomChange
}: {
  onViewportChange: (bounds: MapViewportBounds) => void
  onZoomChange: (zoom: number) => void
}) {
  const map = useMapEvents({
    moveend: (event) => onViewportChange(getViewportBounds(event.target)),
    zoomend: (event) => onZoomChange(event.target.getZoom())
  })

  useEffect(() => {
    onViewportChange(getViewportBounds(map))
    onZoomChange(map.getZoom())
  }, [map, onViewportChange, onZoomChange])

  return null
}

/**
 * Leaflet creates its panes in an effect. React 19 can commit children in the
 * same pass as MapContainer, so defer layers one frame until the map DOM is
 * fully mounted. This prevents Leaflet's `appendChild` race during Fast Refresh.
 */
function MapReadyLayers({
  points,
  onSelectPoint,
  onViewportChange,
  onZoomChange
}: {
  points: MapRentalPoint[]
  onSelectPoint: (point: MapRentalPoint | null) => void
  onViewportChange: (bounds: MapViewportBounds) => void
  onZoomChange: (zoom: number) => void
}) {
  const map = useMap()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let frame = 0
    frame = window.requestAnimationFrame(() => setReady(Boolean(map.getContainer()?.parentElement)))
    return () => window.cancelAnimationFrame(frame)
  }, [map])

  if (!ready) return null

  return <>
    <TileLayer {...({
      attribution: '&copy; OpenStreetMap contributors',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    } as any)} />
    <ViewportReporter onViewportChange={onViewportChange} onZoomChange={onZoomChange} />
    <RentalMarkers points={points} zoom={map.getZoom()} onSelectPoint={onSelectPoint} />
  </>
}

function RentalMarkers({
  points,
  zoom,
  onSelectPoint
}: {
  points: MapRentalPoint[]
  zoom: number
  onSelectPoint: (point: MapRentalPoint | null) => void
}) {
  const map = useMap()
  const clusters = useMemo(() => clusterMapPoints(points, zoom), [points, zoom])

  return clusters.map((cluster) => {
    const isCluster = cluster.points.length > 1
    const point = cluster.points[0]

    return (
      <CircleMarker {...({
        key: cluster.id,
        center: [cluster.latitude, cluster.longitude],
        radius: isCluster ? Math.min(28, 14 + Math.log2(cluster.points.length) * 2) : 6,
        pathOptions: {
          color: '#fff',
          fillColor: isCluster ? '#3078f0' : point.flood_risk_label === 0 ? '#10b981' : '#ef4444',
          fillOpacity: 0.85,
          weight: 2
        },
        eventHandlers: {
          click: () => {
            if (isCluster) {
              map.setView(
                [cluster.latitude, cluster.longitude],
                Math.min(18, map.getZoom() + 2),
                { animate: true }
              )
            } else {
              onSelectPoint(point)
            }
          }
        }
      } as any)}>
        <Popup>
          {isCluster ? (
            <strong>{cluster.points.length.toLocaleString('vi-VN')} tin đăng · bấm để phóng to</strong>
          ) : (
            <>
              <strong>{point.category_name || 'Tin cho thuê'}</strong>
              <br />
              {point.ward_name || 'Đà Nẵng'}
              <br />
              {point.price_vnd?.toLocaleString('vi-VN')} đ/tháng
            </>
          )}
        </Popup>
      </CircleMarker>
    )
  })
}

export default function RentalLeaflet({
  points,
  onSelectPoint,
  onViewportChange
}: {
  points: MapRentalPoint[]
  onSelectPoint: (point: MapRentalPoint | null) => void
  onViewportChange: (bounds: MapViewportBounds) => void
}) {
  const [zoom, setZoom] = useState(12)

  return (
    <MapContainer {...({
      center: [16.061, 108.22],
      zoom: 12,
      scrollWheelZoom: true,
      maxBounds: [[15.5, 107.5], [16.5, 108.7]],
      maxBoundsViscosity: 1,
      style: { height: 'min(650px, 70vh)', minHeight: 360, width: '100%', borderRadius: 14 }
    } as any)}>
      <MapReadyLayers
        points={points}
        onSelectPoint={onSelectPoint}
        onViewportChange={onViewportChange}
        onZoomChange={setZoom}
      />
    </MapContainer>
  )
}
