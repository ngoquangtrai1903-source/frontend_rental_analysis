import { NextResponse } from 'next/server'
import { fetchGoldWardStats } from '@/lib/goldQueryService'

export async function GET() {
  try {
    const wards = await fetchGoldWardStats({}, 5)
    return NextResponse.json(wards)
  } catch (error: any) {
    console.error('Supabase gold wards error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
