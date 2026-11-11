const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const Module = require('node:module')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const loadTs = require('./load-ts.cjs')
const places = loadTs('lib/locationPlaces.ts')
const googleMaps = loadTs('lib/googleMaps.ts')

const modules = new Map([
  [path.resolve(__dirname, '../lib/locationPlaces'), places],
  [path.resolve(__dirname, '../lib/googleMaps'), googleMaps]
])
const originalLoad = Module._load
let GoogleMapsActions
let MapMarkerPopup
try {
  Module._load = function (request, parent, isMain) {
    if (request.startsWith('.') && parent?.filename) {
      const resolved = path.resolve(path.dirname(parent.filename), request)
      if (modules.has(resolved)) return modules.get(resolved)
    }
    return originalLoad.call(this, request, parent, isMain)
  }
  GoogleMapsActions = loadTs('app/components/GoogleMapsActions.tsx').default
  modules.set(path.resolve(__dirname, '../app/components/GoogleMapsActions'), { __esModule: true, default: GoogleMapsActions })
  MapMarkerPopup = loadTs('app/components/MapMarkerPopup.tsx').default
} finally {
  Module._load = originalLoad
}

test('nearby place names distinguish beaches and university campuses', () => {
  assert.equal(places.getNearestBeachName('MyKhe'), 'Mỹ Khê')
  assert.equal(places.getNearestBeachName('XuanThieu'), 'Xuân Thiều')
  assert.equal(places.getNearestBeachName('BaiBut_BaiRang'), 'Bãi Bụt - Bãi Rạng')
  assert.equal(places.getNearestUniversityName('DTU_HK'), 'Đại học Duy Tân (Cơ sở Hòa Khánh)')
  assert.equal(places.getNearestUniversityName('DTU_NVL'), 'Đại học Duy Tân (Nguyễn Văn Linh)')
  assert.equal(places.getNearestUniversityName('DUT', true), 'Da Nang University of Science & Technology')
})

test('nearby names keep unrecognized database values and handle absent values', () => {
  assert.equal(places.getNearestBeachName('Bãi biển mới'), 'Bãi biển mới')
  assert.equal(places.getNearestUniversityName('NEW_UNI'), 'NEW_UNI')
  assert.equal(places.getNearestUniversityName('  DUT  '), 'Đại học Bách Khoa (Đà Nẵng)')
  assert.equal(places.getNearestBeachName(null), 'Chưa có thông tin')
  assert.equal(places.getNearestUniversityName('', true), 'Not available')
  assert.equal(places.getNearestBeachName('__proto__'), '__proto__')
})

test('Google Maps opens the listing location and leaves route origin and travel mode selectable', () => {
  const links = googleMaps.buildGoogleMapsLinks({ latitude: 16.061234, longitude: 108.221234 })
  const search = new URL(links.search)
  const directions = new URL(links.directions)
  assert.equal(search.origin, 'https://www.google.com')
  assert.equal(search.pathname, '/maps/search/')
  assert.equal(search.searchParams.get('api'), '1')
  assert.equal(search.searchParams.get('query'), '16.061234,108.221234')
  assert.equal(directions.pathname, '/maps/dir/')
  assert.equal(directions.searchParams.get('api'), '1')
  assert.equal(directions.searchParams.get('destination'), '16.061234,108.221234')
  assert.equal(directions.searchParams.has('origin'), false)
  assert.equal(directions.searchParams.has('travelmode'), false)
  assert.ok(googleMaps.buildGoogleMapsLinks({ latitude: 0, longitude: 0 }))
})

test('invalid coordinates do not produce navigation links', () => {
  for (const latitude of [null, undefined, NaN, Infinity, -91, 91, '16.06']) {
    assert.equal(googleMaps.buildGoogleMapsLinks({ latitude, longitude: 108.22 }), null)
  }
  for (const longitude of [null, undefined, NaN, Infinity, -181, 181]) {
    assert.equal(googleMaps.buildGoogleMapsLinks({ latitude: 16.06, longitude }), null)
  }
  assert.equal(renderToStaticMarkup(React.createElement(GoogleMapsActions, { latitude: null, longitude: 108.22 })), '')
})

test('popup displays names, distances and separate navigation actions in both languages', () => {
  const point = {
    list_id: 'listing-1', latitude: 16.061, longitude: 108.22,
    category_name: 'Phòng trọ', ward_name: 'Hòa Khánh', price_vnd: 3000000,
    size_m2: 25, flood_risk_label: 0, nearest_beach_code: 'XuanThieu',
    nearest_uni_code: 'DTU_HK', dist_to_beach: 1.2, dist_to_nearest_uni: 0.8
  }
  for (const lang of ['vi', 'en']) {
    const html = renderToStaticMarkup(React.createElement(MapMarkerPopup, { point, lang, onSelectDetails: () => {} }))
    assert.ok(html.includes('Xuân Thiều'))
    assert.ok(html.includes(places.getNearestUniversityName('DTU_HK', lang === 'en')))
    assert.ok(html.includes('1.2 km'))
    assert.ok(html.includes('0.8 km'))
    assert.ok(html.includes(lang === 'vi' ? 'Mở Google Maps' : 'Open Google Maps'))
    assert.ok(html.includes(lang === 'vi' ? 'Chỉ đường' : 'Directions'))
    assert.equal((html.match(/target="_blank"/g) || []).length, 2)
    assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 2)
  }
})
