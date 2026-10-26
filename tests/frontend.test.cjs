const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const loadTs = require('./load-ts.cjs')
const { toCsv, fetchAllRecords } = loadTs('lib/csv.ts')
const { default: DashboardHelp } = loadTs('app/components/DashboardHelp.tsx')
const { default: DashboardCharts } = loadTs('app/components/DashboardCharts.tsx')
const { clusterMapPoints } = loadTs('lib/mapClustering.ts')
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
