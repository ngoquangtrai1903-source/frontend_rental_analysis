'use client'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import type { MapRentalPoint } from '@/lib/goldQueryService'

export default function RentalLeaflet({ points, onSelectPoint }: { points: MapRentalPoint[]; onSelectPoint: (point: MapRentalPoint) => void }) {
  return <MapContainer {...({ center: [16.061, 108.22], zoom: 12, scrollWheelZoom: true } as any)} style={{ height: 650, width: '100%', borderRadius: 14 }}>
    <TileLayer {...({ attribution: '&copy; OpenStreetMap contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)} />
    {points.map((point) => <CircleMarker key={point.list_id} {...({ center: [point.latitude, point.longitude], radius: 6, pathOptions: { color: point.flood_risk_label === 0 ? '#10b981' : '#ef4444', fillOpacity: 0.75 }, eventHandlers: { click: () => onSelectPoint(point) } } as any)}><Popup><strong>{point.category_name || 'Tin cho thuê'}</strong><br />{point.ward_name || 'Đà Nẵng'}<br />{point.price_vnd?.toLocaleString('vi-VN')} đ/tháng</Popup></CircleMarker>)}
  </MapContainer>
}
