import { NextResponse } from 'next/server'
import { fetchGoldPriceDistribution } from '@/lib/goldQueryService'

export async function GET() {
  try {
    const distribution = await fetchGoldPriceDistribution()
    return NextResponse.json(distribution)
  } catch (error: any) {
    console.error('Supabase gold price distribution error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
