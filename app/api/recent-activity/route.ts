import { NextResponse } from 'next/server'
import { fetchFilteredRentalRooms } from '@/lib/goldQueryService'

export async function GET() {
  try {
    const result = await fetchFilteredRentalRooms({}, { page: 1, pageSize: 10, sortBy: 'posted_date', ascending: false })
    const activities = result.data.map(row => ({
      ward: row.ward_name || 'Đà Nẵng',
      priceRange: row.price_vnd ? `${(row.price_vnd / 1000000).toFixed(1)} tr` : 'Thỏa thuận',
      sizeRange: row.size_m2 ? `${Math.round(row.size_m2)} m²` : 'N/A',
      risk: row.flood_risk_label === 0 ? 'Thấp' : row.flood_risk_label === 1 ? 'Trung bình' : 'Cao',
      time: row.posted_date ? row.posted_date.slice(0, 10) : 'Gần đây'
    }))

    return NextResponse.json(activities)
  } catch (error: any) {
    console.error('Supabase gold recent activity error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
