import { NextResponse } from 'next/server'
import { fetchGoldKpiMetrics } from '@/lib/goldQueryService'

export async function GET() {
  try {
    const kpi = await fetchGoldKpiMetrics()
    return NextResponse.json(kpi)
  } catch (error: any) {
    console.error('Supabase gold KPI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
