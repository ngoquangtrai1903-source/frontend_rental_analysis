'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import MapboxMap, { Layer, Marker, NavigationControl, Source, type LayerProps, type MapRef } from 'react-map-gl/mapbox'
import type { FeatureCollection, Point as GeoJSONPoint } from 'geojson'
import type { GeoJSONSource, MapLayerMouseEvent } from 'mapbox-gl'
import { Layers, MapPin, Maximize2, Minus, Plus, ShieldAlert, Sparkles } from 'lucide-react'
import { MapRentalPoint } from '@/lib/goldQueryService'
import { DA_NANG_DISTRICTS_GEOJSON, DA_NANG_FLOOD_ZONES_GEOJSON } from '@/app/data/daNangGeoJson'
import MapMarkerPopup, { getPriceTierTheme } from './MapMarkerPopup'

interface RentalMapboxProps {
  points: MapRentalPoint[]
  loading?: boolean
  selectedPoint: MapRentalPoint | null
  onSelectPoint: (point: MapRentalPoint | null) => void
}

interface ListingFeatureProperties {
  list_id: string
  price_vnd: number
  price_label: string
}

const DA_NANG_CENTER = { longitude: 108.22, latitude: 16.061 }
const clusterLayer: LayerProps = {
  id: 'rental-clusters',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#60a5fa', 25, '#3b82f6', 100, '#1d4ed8'],
    'circle-radius': ['step', ['get', 'point_count'], 18, 25, 23, 100, 29],
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 2
  }
}

const clusterCountLayer: LayerProps = {
  id: 'rental-cluster-count',
  type: 'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  },
  paint: { 'text-color': '#fff' }
}

const unclusteredLayer: LayerProps = {
  id: 'rental-unclustered',
  type: 'circle',
  maxzoom: 14,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'price_vnd'], 3500000], '#10b981',
      ['<', ['get', 'price_vnd'], 7000000], '#2563eb',
      ['<', ['get', 'price_vnd'], 12000000], '#8b5cf6',
      '#ef4444'
    ],
    'circle-radius': 6,
    'circle-stroke-color': '#fff',
    'circle-stroke-width': 1.5
  }
}

const districtFillLayer: LayerProps = {
  id: 'district-fill',
  type: 'fill',
  paint: {
    'fill-color': ['coalesce', ['get', 'color'], '#3b82f6'],
    'fill-opacity': 0.08
  }
}

const districtOutlineLayer: LayerProps = {
  id: 'district-outline',
  type: 'line',
  paint: {
    'line-color': ['coalesce', ['get', 'color'], '#3b82f6'],
    'line-width': 2,
    'line-dasharray': [2, 2]
  }
}

const districtLabelLayer: LayerProps = {
  id: 'district-label',
  type: 'symbol',
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 11,
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
  },
  paint: {
    'text-color': '#1e293b',
    'text-halo-color': '#fff',
    'text-halo-width': 1.5
  }
}

const floodFillLayer: LayerProps = {
  id: 'flood-fill',
  type: 'fill',
  paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.22 }
}

const floodOutlineLayer: LayerProps = {
  id: 'flood-outline',
  type: 'line',
  paint: { 'line-color': '#dc2626', 'line-width': 2.5, 'line-dasharray': [2, 2] }
}

function formatBadgePrice(priceVnd: number | null): string {
  if (!priceVnd || priceVnd <= 0) return 'Thỏa thuận'
  const million = priceVnd / 1_000_000
  return `${million >= 10 ? million.toFixed(0) : million.toFixed(1)} tr`
}

function createListingsGeoJson(points: MapRentalPoint[]): FeatureCollection<GeoJSONPoint, ListingFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      id: point.list_id,
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      },
      properties: {
        list_id: point.list_id,
        price_vnd: point.price_vnd ?? 0,
        price_label: formatBadgePrice(point.price_vnd)
      }
    }))
  }
}

function isInsideBounds(
  point: MapRentalPoint,
  bounds: readonly [west: number, south: number, east: number, north: number]
): boolean {
  const [west, south, east, north] = bounds
  return point.longitude >= west && point.longitude <= east && point.latitude >= south && point.latitude <= north
}

export default function RentalMapbox({
  points,
  loading = false,
  selectedPoint,
  onSelectPoint
}: RentalMapboxProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const mapRef = useRef<MapRef>(null)
  const [showPropertyPins, setShowPropertyPins] = useState(true)
  const [showDistricts, setShowDistricts] = useState(true)
  const [showFloodZones, setShowFloodZones] = useState(true)
  const [clustering, setClustering] = useState(true)
  const [layerMenuOpen, setLayerMenuOpen] = useState(false)
  const [activePopupPoint, setActivePopupPoint] = useState<MapRentalPoint | null>(null)
  const [zoom, setZoom] = useState(12)
  const [bounds, setBounds] = useState<readonly [number, number, number, number] | null>(null)

  const listingsGeoJson = useMemo(
    () => createListingsGeoJson(showPropertyPins ? points : []),
    [points, showPropertyPins]
  )
  const sourceId = `rental-listings-${clustering ? 'clustered' : 'plain'}`
  const pointById = useMemo(
    () => new globalThis.Map(points.map((point) => [point.list_id, point])),
    [points]
  )
  const detailedMarkers = useMemo(() => {
    if (!showPropertyPins || zoom < 14 || !bounds) return []
    return points.filter((point) => isInsideBounds(point, bounds))
  }, [bounds, points, showPropertyPins, zoom])

  const updateViewport = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const mapBounds = map.getBounds()
    setZoom(map.getZoom())
    if (mapBounds) {
      setBounds([
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth()
      ])
    }
  }, [])

  const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap()
    if (!map || !showPropertyPins) return

    const features = event.features ?? map.queryRenderedFeatures(event.point, {
      layers: zoom < 14 ? ['rental-clusters', 'rental-unclustered'] : ['rental-clusters']
    })
    const feature = features[0]
    if (!feature) {
      setActivePopupPoint(null)
      return
    }

    const properties = feature.properties
    if (properties?.cluster && clustering) {
      const source = map.getSource(sourceId) as GeoJSONSource | undefined
      if (!source) return
      source.getClusterExpansionZoom(Number(properties.cluster_id), (error, clusterZoom) => {
        if (error) {
          console.error('Failed to expand Mapbox marker cluster:', error)
          return
        }
        const coordinates = (feature.geometry as GeoJSONPoint).coordinates as [number, number]
        map.easeTo({ center: coordinates, zoom: clusterZoom })
      })
      return
    }

    const point = properties?.list_id ? pointById.get(String(properties.list_id)) : null
    if (point) {
      setActivePopupPoint(point)
      onSelectPoint(point)
    }
  }, [clustering, onSelectPoint, pointById, showPropertyPins, sourceId, zoom])

  const resetOverview = useCallback(() => {
    if (points.length === 0) {
      mapRef.current?.flyTo({ center: [DA_NANG_CENTER.longitude, DA_NANG_CENTER.latitude], zoom: 12, duration: 700 })
      return
    }
    const longitudes = points.map((point) => point.longitude)
    const latitudes = points.map((point) => point.latitude)
    mapRef.current?.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)]
      ],
      { padding: 48, maxZoom: 14, duration: 700 }
    )
  }, [points])

  if (!token) {
    return (
      <div role="alert" style={{ alignItems: 'center', background: '#fff', border: '1px solid #f3d6a1', borderRadius: 14, color: '#7c4a03', display: 'flex', minHeight: 300, padding: 24 }}>
        <div>
          <strong>Chưa cấu hình Mapbox Access Token</strong>
          <p style={{ lineHeight: 1.6, margin: '8px 0 0' }}>
            Thêm <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> vào <code>.env.local</code> và tải lại ứng dụng để sử dụng bản đồ Mapbox.
          </p>
        </div>
      </div>
    )
  }

  const toggleStyle = {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    fontSize: 12,
    fontWeight: 600,
    justifyContent: 'space-between',
    gap: 12
  } as const

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 4px 20px #00000014', height: 650, overflow: 'hidden', position: 'relative', width: '100%' }}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{ ...DA_NANG_CENTER, zoom: 12 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onLoad={updateViewport}
        onMoveEnd={updateViewport}
        interactiveLayerIds={showPropertyPins ? ['rental-clusters', 'rental-unclustered'] : []}
        onClick={handleMapClick}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        {showPropertyPins && (
          <Source
            key={sourceId}
            id={sourceId}
            type="geojson"
            data={listingsGeoJson}
            cluster={clustering}
            clusterRadius={48}
            clusterMaxZoom={13}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredLayer} />
          </Source>
        )}

        {showDistricts && (
          <Source id="district-boundaries" type="geojson" data={DA_NANG_DISTRICTS_GEOJSON}>
            <Layer {...districtFillLayer} />
            <Layer {...districtOutlineLayer} />
            <Layer {...districtLabelLayer} />
          </Source>
        )}

        {showFloodZones && (
          <Source id="historical-flood-zones" type="geojson" data={DA_NANG_FLOOD_ZONES_GEOJSON}>
            <Layer {...floodFillLayer} />
            <Layer {...floodOutlineLayer} />
          </Source>
        )}

        {detailedMarkers.map((point) => {
          const theme = getPriceTierTheme(point.price_vnd)
          return (
            <Marker
              key={point.list_id}
              longitude={point.longitude}
              latitude={point.latitude}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation()
                setActivePopupPoint(point)
                onSelectPoint(point)
              }}
            >
              <button
                type="button"
                aria-label={`${formatBadgePrice(point.price_vnd)} tại ${point.ward_name || 'Đà Nẵng'}`}
                onMouseEnter={() => setActivePopupPoint(point)}
                style={{
                  background: '#fff',
                  border: `1.5px solid ${theme.color}`,
                  borderRadius: 999,
                  boxShadow: '0 2px 8px #0f172a40',
                  color: theme.color,
                  cursor: 'pointer',
                  font: '700 11px DM Sans, sans-serif',
                  padding: '3px 8px',
                  whiteSpace: 'nowrap'
                }}
              >
                {formatBadgePrice(point.price_vnd)}
              </button>
            </Marker>
          )
        })}

        <NavigationControl position="bottom-right" showCompass={false} />
      </MapboxMap>

      <div style={{ left: 16, position: 'absolute', top: 16, zIndex: 2 }}>
        <button
          type="button"
          aria-expanded={layerMenuOpen}
          onClick={() => setLayerMenuOpen((open) => !open)}
          style={{ alignItems: 'center', background: '#fff', border: '1px solid #dbe3ef', borderRadius: 9, boxShadow: '0 3px 10px #0f172a26', cursor: 'pointer', display: 'flex', fontSize: 12, fontWeight: 700, gap: 8, padding: '9px 12px' }}
        >
          <Layers size={15} color="#3078f0" /> Lớp bản đồ
          <span style={{ background: '#eaf1ff', borderRadius: 99, color: '#3078f0', fontSize: 10, padding: '2px 7px' }}>
            {[showPropertyPins, showDistricts, showFloodZones].filter(Boolean).length} bật
          </span>
        </button>

        {layerMenuOpen && (
          <div style={{ background: '#fff', border: '1px solid #dbe3ef', borderRadius: 11, boxShadow: '0 12px 28px #0f172a2e', display: 'grid', gap: 12, marginTop: 8, padding: 13, width: 280 }}>
            <strong style={{ color: '#64748b', fontSize: 10, letterSpacing: '.5px' }}>BẬT / TẮT LỚP BẢN ĐỒ</strong>
            <label style={toggleStyle}>
              <span style={{ alignItems: 'center', display: 'flex', gap: 7 }}><MapPin size={14} color="#3078f0" /> Tin cho thuê ({points.length.toLocaleString('vi-VN')})</span>
              <input type="checkbox" checked={showPropertyPins} onChange={(event) => setShowPropertyPins(event.target.checked)} />
            </label>
            <label style={toggleStyle}>
              <span style={{ alignItems: 'center', display: 'flex', gap: 7 }}><Layers size={14} color="#3b82f6" /> Ranh giới Quận/Huyện*</span>
              <input type="checkbox" checked={showDistricts} onChange={(event) => setShowDistricts(event.target.checked)} />
            </label>
            <label style={toggleStyle}>
              <span style={{ alignItems: 'center', display: 'flex', gap: 7 }}><ShieldAlert size={14} color="#ef4444" /> Vùng ngập lịch sử</span>
              <input type="checkbox" checked={showFloodZones} onChange={(event) => setShowFloodZones(event.target.checked)} />
            </label>
            <label style={{ ...toggleStyle, borderTop: '1px solid #eef2f7', paddingTop: 10 }}>
              <span style={{ alignItems: 'center', display: 'flex', gap: 7 }}><Sparkles size={14} color="#8b5cf6" /> Native clustering</span>
              <input type="checkbox" checked={clustering} onChange={(event) => setClustering(event.target.checked)} />
            </label>
            <small style={{ color: '#64748b', lineHeight: 1.4 }}>
              * GeoJSON hiện có là ranh giới Quận/Huyện dạng xấp xỉ, chưa phải ranh giới Phường chính thức.
            </small>
          </div>
        )}
      </div>

      <div style={{ alignItems: 'center', display: 'flex', gap: 7, position: 'absolute', right: 16, top: 16, zIndex: 2 }}>
        <button type="button" aria-label="Thu nhỏ bản đồ" onClick={() => mapRef.current?.zoomOut()} style={controlButtonStyle}><Minus size={15} /></button>
        <button type="button" aria-label="Phóng to bản đồ" onClick={() => mapRef.current?.zoomIn()} style={controlButtonStyle}><Plus size={15} /></button>
        <button type="button" onClick={resetOverview} style={{ ...controlButtonStyle, color: '#3078f0', fontSize: 11, fontWeight: 700, gap: 6, padding: '8px 10px' }}>
          <Maximize2 size={13} /> Toàn cảnh
        </button>
      </div>

      {(loading || points.length > 0) && (
        <div style={{ background: '#fff', borderRadius: 7, boxShadow: '0 2px 8px #0f172a26', color: '#334155', fontSize: 11, fontWeight: 700, left: 16, padding: '7px 10px', position: 'absolute', top: 68, zIndex: 2 }}>
          {loading ? 'Đang tải tọa độ...' : `${points.length.toLocaleString('vi-VN')} vị trí · ${detailedMarkers.length.toLocaleString('vi-VN')} marker chi tiết trong khung nhìn`}
        </div>
      )}

      {activePopupPoint && (
        <div style={{ bottom: 18, maxWidth: 'calc(100% - 36px)', position: 'absolute', right: 18, zIndex: 2 }}>
          <MapMarkerPopup
            point={activePopupPoint}
            onClose={() => setActivePopupPoint(null)}
            onSelectDetails={(point) => {
              setActivePopupPoint(null)
              onSelectPoint(point)
            }}
          />
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #dbe3ef', borderRadius: 9, bottom: 16, color: '#334155', display: 'grid', fontSize: 10, gap: 5, left: 16, padding: '9px 11px', pointerEvents: 'none', position: 'absolute', zIndex: 2 }}>
        <strong style={{ color: '#64748b', fontSize: 9 }}>GIÁ THUÊ / THÁNG</strong>
        {[
          ['#10b981', 'Dưới 3,5 triệu'],
          ['#2563eb', '3,5 – 7 triệu'],
          ['#8b5cf6', '7 – 12 triệu'],
          ['#ef4444', 'Trên 12 triệu']
        ].map(([color, label]) => (
          <span key={label} style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
            <i style={{ background: color, borderRadius: '50%', height: 8, width: 8 }} />{label}
          </span>
        ))}
      </div>
    </div>
  )
}

const controlButtonStyle = {
  alignItems: 'center',
  background: '#fff',
  border: '1px solid #dbe3ef',
  borderRadius: 8,
  boxShadow: '0 3px 10px #0f172a26',
  color: '#334155',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  minHeight: 34,
  minWidth: 34
} as const
