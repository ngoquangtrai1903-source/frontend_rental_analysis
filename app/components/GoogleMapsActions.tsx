'use client'

import { MapPin, Navigation } from 'lucide-react'
import { buildGoogleMapsLinks, type MapCoordinates } from '../../lib/googleMaps'

interface GoogleMapsActionsProps extends MapCoordinates {
  lang?: 'vi' | 'en'
}

export default function GoogleMapsActions({ latitude, longitude, lang = 'vi' }: GoogleMapsActionsProps) {
  const isEn = lang === 'en'
  const links = buildGoogleMapsLinks({ latitude, longitude })
  if (!links) return null

  return (
    <div className="google-maps-actions">
      <a className="google-maps-link" href={links.search} target="_blank" rel="noopener noreferrer">
        <MapPin size={14} aria-hidden="true" />
        {isEn ? 'Open Google Maps' : 'Mở Google Maps'}
      </a>
      <a className="google-maps-link" href={links.directions} target="_blank" rel="noopener noreferrer">
        <Navigation size={14} aria-hidden="true" />
        {isEn ? 'Directions' : 'Chỉ đường'}
      </a>
    </div>
  )
}
