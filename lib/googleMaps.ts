export interface MapCoordinates {
  latitude: number | null | undefined
  longitude: number | null | undefined
}

export function buildGoogleMapsLinks({ latitude, longitude }: MapCoordinates) {
  if (
    typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
    typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180
  ) return null

  const coordinates = latitude + ',' + longitude
  const search = new URL('https://www.google.com/maps/search/')
  search.searchParams.set('api', '1')
  search.searchParams.set('query', coordinates)

  const directions = new URL('https://www.google.com/maps/dir/')
  directions.searchParams.set('api', '1')
  directions.searchParams.set('destination', coordinates)

  return { search: search.toString(), directions: directions.toString() }
}
