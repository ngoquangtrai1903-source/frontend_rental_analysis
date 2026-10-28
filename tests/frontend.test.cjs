const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const loadTs = require('./load-ts.cjs')
const { toCsv, fetchAllRecords } = loadTs('lib/csv.ts')
const { default: DashboardHelp } = loadTs('app/components/DashboardHelp.tsx')
const { default: DashboardCharts } = loadTs('app/components/DashboardCharts.tsx')
const { default: WardPriceBoxPlot } = loadTs('app/components/WardPriceBoxPlot.tsx')
const { default: WardPriceHeatmapChart } = loadTs('app/components/WardPriceHeatmapChart.tsx')
const { clusterMapPoints } = loadTs('lib/mapClustering.ts')
const { buildWardPriceHeatmap } = loadTs('lib/wardPriceHeatmap.ts')
const { useFilterStore } = loadTs('app/store/filterStore.ts')

test('CSV preserves commas, quotes, newlines, nulls and Vietnamese', () => {
  assert.equal(toCsv([['Đà Nẵng, VN', 'a"b', 'a\nb', null, 123]]), '\uFEFF"Đà Nẵng, VN","a""b","a\nb","","123"')
  assert.equal(toCsv([['=1+1', -12]]), '\uFEFF"\'=1+1","-12"')
})

test('export loads every page and retains filters and sort', async () => {
  let calls = 0
  const rows = await fetchAllRecords('ward_name=X&start_date=2026-01-01&end_date=2026-02-01&sortBy=price_vnd&ascending=true', async url => {
    const p = new URL(url, 'http://localhost').searchParams
    assert.equal(p.get('ward_name'), 'X')
    assert.equal(p.get('start_date'), '2026-01-01')
    assert.equal(p.get('end_date'), '2026-02-01')
    assert.equal(p.get('sortBy'), 'price_vnd')
    assert.equal(p.get('ascending'), 'true')
    assert.equal(p.get('mode'), 'records')
    assert.equal(p.get('pageSize'), '500')
    calls++
    assert.equal(p.get('page'), String(calls))
    return Response.json({ data: calls === 1 ? Array.from({ length: 500 }, (_, id) => id) : [500], count: 501 })
  })
  assert.equal(calls, 2)
  assert.equal(rows.length, 501)
  assert.equal(rows[500], 500)
})

test('export handles empty results, failed API and missing pages', async () => {
  assert.deepEqual(await fetchAllRecords('', async () => Response.json({ data: [], count: 0 })), [])
  await assert.rejects(fetchAllRecords('', async () => new Response(null, { status: 500 })), /500/)
  await assert.rejects(fetchAllRecords('', async () => Response.json({ data: [], count: 2 })), /thiếu trang/)
  await assert.rejects(fetchAllRecords('', async () => Response.json({ data: null, count: 1 })), /không hợp lệ/)
})

test('filter updates preserve other conditions and reset clears them', () => {
  useFilterStore.getState().reset()
  useFilterStore.getState().setFilter('wardFilter', 'Hải Châu')
  useFilterStore.getState().setFilter('reqBalcony', true)
  assert.equal(useFilterStore.getState().wardFilter, 'Hải Châu')
  assert.equal(useFilterStore.getState().reqBalcony, true)
  useFilterStore.getState().reset()
  assert.equal(useFilterStore.getState().wardFilter, '')
  assert.equal(useFilterStore.getState().reqBalcony, false)
})

test('Help renders all five tabs and opens only the current guide', () => {
  const tabs = ['Tổng quan', 'Vị trí & khu vực', 'Tiện ích', 'Rủi ro ngập lụt', 'Phân tích nâng cao']
  for (const activeNav of tabs) {
    const html = renderToStaticMarkup(React.createElement(DashboardHelp, { activeNav }))
    const escaped = activeNav.replaceAll('&', '&amp;')
    assert.ok(html.includes(`<details open=""><summary>${escaped}</summary>`))
    assert.equal((html.match(/<details open="">/g) || []).length, 1)
    assert.equal((html.match(/<summary>/g) || []).length, 7)
    assert.ok(html.includes('Bộ lọc và tìm kiếm'))
    assert.ok(html.includes('Xuất CSV'))
  }
})

test('charts explain when filtered data is insufficient', () => {
  const html = renderToStaticMarkup(React.createElement(DashboardCharts, {
    trend: [],
    distribution: [],
    total: 0
  }))
  assert.ok(html.includes('Không có dữ liệu trong khoảng thời gian đã chọn.'))
  assert.ok(html.includes('Chưa đủ dữ liệu để phân loại khoảng giá.'))
})

test('ward rental box plot exposes full price details on hover and keyboard focus', () => {
  const html = renderToStaticMarkup(React.createElement(WardPriceBoxPlot, {
    wards: [{
      wardName: 'Hải Châu',
      count: 1250,
      min: 1.2,
      q1: 2.5,
      median: 3.8,
      q3: 5.1,
      max: 9.4
    }],
    maxPrice: 10
  }))
  assert.ok(html.includes('tabindex="0"'))
  assert.ok(html.includes('aria-describedby="box-plot-tooltip-0"'))
  assert.ok(html.includes('role="tooltip"'))
  assert.ok(html.includes('1.250 tin đăng hợp lệ'))
  assert.ok(html.includes('Thấp nhất: 1.20 triệu/tháng'))
  assert.ok(html.includes('Q1: 2.50 triệu'))
  assert.ok(html.includes('Trung vị: 3.80 triệu'))
  assert.ok(html.includes('Q3: 5.10 triệu'))
  assert.ok(html.includes('Cao nhất: 9.40 triệu'))
})

test('ward price heatmap chart exposes price and category details on hover and keyboard focus', () => {
  const html = renderToStaticMarkup(React.createElement(WardPriceHeatmapChart, {
    heatmapData: [{
      wardName: 'Hải Châu',
      category: 'Căn hộ/Chung cư',
      count: 45,
      medianPriceMillion: 5.5
    }],
    wards: ['Hải Châu'],
    categories: ['Căn hộ/Chung cư'],
    maxPrice: 10
  }))
  assert.ok(html.includes('tabindex="0"'))
  assert.ok(html.includes('role="tooltip"'))
  assert.ok(html.includes('role="grid"'))
  assert.ok(html.includes('5.50'))
  assert.ok(html.includes('45 tin'))
  assert.ok(html.includes('Căn hộ/Chung cư'))
  assert.ok(html.includes('Hải Châu'))
  assert.ok(html.includes('Phân khúc:'))
  assert.ok(html.includes('Mức nhiệt'))
})

test('map points cluster at low zoom and separate when zoomed in', () => {
  const points = [
    { list_id: 'one', latitude: 16.061, longitude: 108.22 },
    { list_id: 'two', latitude: 16.062, longitude: 108.221 },
    { list_id: 'three', latitude: 16.2, longitude: 108.4 }
  ]

  const zoomedOut = clusterMapPoints(points, 12)
  assert.equal(zoomedOut.length, 2)
  assert.equal(zoomedOut.find((cluster) => cluster.points.length === 2)?.points.length, 2)
  assert.equal(clusterMapPoints(points, 16).length, 3)
})

test('ward price heatmap aggregates valid rents and weights each ward by average price', () => {
  const room = (id, ward, price, longitude) => ({
    list_id: id,
    ward_name: ward,
    price_vnd: price,
    latitude: 16.06,
    longitude
  })
  const result = buildWardPriceHeatmap([
    room('one', 'Hải Châu', 2_000_000, 108.21),
    room('two', 'Hải Châu', 4_000_000, 108.22),
    room('three', 'Sơn Trà', 10_000_000, 108.25),
    room('missing-ward', null, 3_000_000, 108.23),
    room('invalid-price', 'Hải Châu', 100_000, 108.24)
  ])
  assert.deepEqual(result.wards, [
    { wardName: 'Hải Châu', listingCount: 2, averagePriceVnd: 3_000_000, medianPriceVnd: 3_000_000 },
    { wardName: 'Sơn Trà', listingCount: 1, averagePriceVnd: 10_000_000, medianPriceVnd: 10_000_000 }
  ])
  assert.equal(result.data.features.length, 3)
  assert.equal(result.data.features[0].properties.heatmap_weight, 0.075)
  assert.equal(result.data.features[1].properties.heatmap_weight, 0.075)
  assert.equal(result.data.features[2].properties.heatmap_weight, 0.5)
  assert.equal(result.data.features[0].properties.median_price_vnd, 3_000_000)
})
