const { test } = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')
const loadTs = require('./load-ts.cjs')

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === './supabase' && parent?.filename.endsWith('lib\\goldQueryService.ts')) {
    return { supabaseGold: {} }
  }
  return originalLoad.call(this, request, parent, isMain)
}
const { buildGoldQuery, fetchGoldMapCoordinates, fetchGoldRentalPriceInsights, fetchGoldTrendData, fetchGoldWardStats } = loadTs('lib/goldQueryService.ts')
Module._load = originalLoad

test('trend fetches every matching page and returns every month', async () => {
  const periods = Array.from({ length: 11 }, (_, index) => {
    const date = new Date(Date.UTC(2024, index, 1))
    return date.toISOString().slice(0, 7)
  })
  const rows = Array.from({ length: 2005 }, (_, index) => ({
    posted_date: `${periods[index % periods.length]}-15`,
    price_vnd: 5_000_000
  })).sort((a, b) => a.posted_date.localeCompare(b.posted_date))
  const requestedRanges = []
  const appliedWardFilters = []
  const client = {
    schema() {
      return this
    },
    from() {
      const query = {
        offset: 0,
        end: 0,
        eq(column, value) {
          appliedWardFilters.push([column, value])
          return this
        },
        order() {
          return this
        },
        range(from, to) {
          this.offset = from
          this.end = to
          requestedRanges.push([from, to])
          return this
        },
        then(resolve, reject) {
          return Promise.resolve({
            data: rows.slice(this.offset, this.end + 1),
            count: rows.length,
            error: null
          }).then(resolve, reject)
        }
      }
      return {
        select() {
          return query
        }
      }
    }
  }

  const trend = await fetchGoldTrendData({ ward_name: 'Hải Châu' }, client)

  assert.deepEqual(requestedRanges, [[0, 999], [1000, 1999], [2000, 2999]])
  assert.equal(appliedWardFilters.length, 3)
  assert.deepEqual(appliedWardFilters, Array(3).fill(['ward_name', 'Hải Châu']))
  assert.equal(trend.length, 11)
  assert.equal(trend[0].period, periods[0])
  assert.equal(trend.at(-1).period, periods.at(-1))
  assert.equal(trend.reduce((sum, month) => sum + month.count, 0), rows.length)
  assert.ok(trend.every((month) => month.avgPriceMillion === 5))
})

test('map query applies viewport bounds in the database query', () => {
  const filters = []
  const query = {
    gte(column, value) {
      filters.push(['gte', column, value])
      return this
    },
    lte(column, value) {
      filters.push(['lte', column, value])
      return this
    },
    order() {
      return this
    },
    range() {
      return this
    }
  }
  const client = {
    schema() { return this },
    from() {
      return {
        select() { return query }
      }
    }
  }

  buildGoldQuery(client, {
    min_latitude: 15.9,
    max_latitude: 16.2,
    min_longitude: 108.0,
    max_longitude: 108.4
  })

  assert.deepEqual(filters, [
    ['gte', 'latitude', 15.9],
    ['lte', 'latitude', 16.2],
    ['gte', 'longitude', 108.0],
    ['lte', 'longitude', 108.4]
  ])
})

test('legacy price sort uses the existing price_vnd column', () => {
  const orderedColumns = []
  const query = {
    order(column) {
      orderedColumns.push(column)
      return this
    },
    range() {
      return this
    }
  }
  const client = {
    schema() { return this },
    from() {
      return {
        select() { return query }
      }
    }
  }

  buildGoldQuery(client, {}, { sortBy: 'price', ascending: true })

  assert.deepEqual(orderedColumns, ['price_vnd', 'source', 'list_id'])
})

test('size sort keeps the complete size_m2 column name', () => {
  const orderedColumns = []
  const query = {
    order(column) { orderedColumns.push(column); return this },
    select() { return this },
    from() { return this }
  }
  buildGoldQuery(query, {}, { sortBy: 'size_m2', ascending: false })
  assert.deepEqual(orderedColumns, ['size_m2', 'source', 'list_id'])
})

test('ward stats returns every ward sorted by listing count by default', async () => {
  const rows = [
    { ward_name: 'Sơn Trà', price_vnd: 5_000_000 },
    { ward_name: 'Hải Châu', price_vnd: 6_000_000 },
    { ward_name: 'Hải Châu', price_vnd: 7_000_000 },
    { ward_name: 'Cẩm Lệ', price_vnd: 4_000_000 }
  ]
  const client = {
    schema() { return this },
    from() {
      const query = { order() { return this }, then(resolve, reject) { return Promise.resolve({ data: rows, error: null }).then(resolve, reject) } }
      return { select() { return query } }
    }
  }
  const result = await fetchGoldWardStats({}, undefined, client)
  assert.deepEqual(result.map((ward) => ward.name), ['Hải Châu', 'Cẩm Lệ', 'Sơn Trà'])
})

test('rental price insights summarize filtered prices, categories, and valid scatter points', async () => {
  const rows = [
    { ward_name: 'Hải Châu', category_name: 'Căn hộ/Chung cư', price_vnd: 2_000_000, size_m2: 20 },
    { ward_name: 'Hải Châu', category_name: 'Căn hộ/Chung cư', price_vnd: 3_000_000, size_m2: 30 },
    { ward_name: 'Hải Châu', category_name: 'Căn hộ/Chung cư', price_vnd: 4_000_000, size_m2: 40 },
    { ward_name: 'Hải Châu', category_name: 'Căn hộ/Chung cư', price_vnd: 5_000_000, size_m2: 50 },
    { ward_name: 'Hải Châu', category_name: 'Căn hộ/Chung cư', price_vnd: 6_000_000, size_m2: 60 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 3_000_000, size_m2: 25 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 4_000_000, size_m2: 35 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 5_000_000, size_m2: 45 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 7_000_000, size_m2: 55 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 8_000_000, size_m2: 65 },
    { ward_name: 'Sơn Trà', category_name: 'Phòng trọ', price_vnd: 100_000_000, size_m2: 20 }
  ]
  const appliedFilters = []
  const client = {
    schema() { return this },
    from() {
      const query = {
        offset: 0,
        end: 999,
        selectedWard: null,
        eq(column, value) { appliedFilters.push([column, value]); this.selectedWard = value; return this },
        order() { return this },
        range(from, to) { this.offset = from; this.end = to; return this },
        then(resolve, reject) {
          const matchingRows = this.selectedWard
            ? rows.filter((row) => row.ward_name === this.selectedWard)
            : rows
          return Promise.resolve({
            data: matchingRows.slice(this.offset, this.end + 1),
            count: matchingRows.length,
            error: null
          }).then(resolve, reject)
        }
      }
      return { select() { return query } }
    }
  }

  const result = await fetchGoldRentalPriceInsights({ ward_name: 'Hải Châu' }, client)

  assert.deepEqual(appliedFilters, [['ward_name', 'Hải Châu']])
  assert.equal(result.boxPlot.length, 1)
  assert.deepEqual(result.boxPlot[0], {
    wardName: 'Hải Châu',
    count: 5,
    min: 2,
    q1: 3,
    median: 4,
    q3: 5,
    max: 6
  })
  assert.deepEqual(result.heatmap, [{
    wardName: 'Hải Châu',
    category: 'Căn hộ/Chung cư',
    count: 5,
    medianPriceMillion: 4
  }])
  assert.equal(result.scatter.length, 5)
  assert.equal(result.histogram.reduce((count, bin) => count + bin.count, 0), 5)
})

test('map coordinate limit caps fetched rows without losing matching total', async () => {
  const rows = Array.from({ length: 2500 }, (_, index) => ({
    list_id: String(index).padStart(4, '0'),
    latitude: 16.061,
    longitude: 108.22
  }))
  const requestedRanges = []
  const client = {
    schema() { return this },
    from() {
      const query = {
        offset: 0,
        end: 0,
        order() { return this },
        range(from, to) {
          this.offset = from
          this.end = to
          requestedRanges.push([from, to])
          return this
        },
        then(resolve, reject) {
          return Promise.resolve({
            data: rows.slice(this.offset, this.end + 1),
            count: rows.length,
            error: null
          }).then(resolve, reject)
        }
      }
      return { select() { return query } }
    }
  }

  const result = await fetchGoldMapCoordinates({}, 1500, client)

  assert.deepEqual(requestedRanges, [[0, 999], [1000, 1499]])
  assert.equal(result.points.length, 1500)
  assert.equal(result.total, 2500)
})
