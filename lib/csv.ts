export function toCsv(rows: unknown[][]): string {
  return '\uFEFF' + rows.map(row => row.map(value => {
    let text = value == null ? '' : String(value)
    if (typeof value === 'string' && /^[=+@\-\t\r]/.test(text)) text = "'" + text
    return '"' + text.replace(/"/g, '""') + '"'
  }).join(',')).join('\r\n')
}

export async function fetchAllRecords<T>(query: string, request: typeof fetch = fetch): Promise<T[]> {
  const params = new URLSearchParams(query)
  params.set('mode', 'records')
  params.set('pageSize', '500')
  const rows: T[] = []
  let count = Infinity
  for (let page = 1; rows.length < count; page++) {
    params.set('page', String(page))
    const response = await request(`/api/gold-query?${params}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`Không thể xuất CSV (${response.status})`)
    const result = await response.json()
    if (!Array.isArray(result.data) || !Number.isSafeInteger(result.count) || result.count < 0) throw new Error('Dữ liệu xuất không hợp lệ')
    count = result.count
    if (!result.data.length && rows.length < count) throw new Error('Dữ liệu thay đổi hoặc thiếu trang; vui lòng xuất lại')
    rows.push(...result.data)
  }
  return rows
}
