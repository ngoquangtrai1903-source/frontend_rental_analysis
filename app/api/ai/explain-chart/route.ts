import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * Resolves an environment variable from process.env, with automatic dynamic
 * fallback to reading .env.local / .env from disk so developer updates take effect immediately.
 */
function resolveEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key]
  try {
    const candidates = ['.env.local', '.env']
    for (const file of candidates) {
      const p = path.resolve(process.cwd(), file)
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8')
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx !== -1) {
            const k = trimmed.slice(0, eqIdx).trim()
            const v = trimmed.slice(eqIdx + 1).trim()
            if (k === key && v) return v
          }
        }
      }
    }
  } catch {
    // Ignore fallback errors
  }
  return undefined
}

interface ExplainChartRequest {
  chartId: string
  chartTitle: string
  summaryData: any
  lang?: 'vi' | 'en'
}

// Summarize only the statistics supplied by the current chart.
function generateFallbackExplanation(
  chartId: string,
  chartTitle: string,
  summary: any,
  lang: 'vi' | 'en' = 'vi'
) {
  const isEn = lang === 'en'
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(isEn ? 'en-US' : 'vi-VN', { maximumFractionDigits: 2 })
    : '—'
  const insights: string[] = []

  if (chartId === '3.1' || chartId === '3.4') {
    for (const [key, label] of [['room', isEn ? 'Rental rooms' : 'Phòng trọ'], ['apt', isEn ? 'Apartments' : 'Căn hộ']]) {
      const group = summary?.[key]
      if (!group || group.count < 1) continue
      insights.push(chartId === '3.1'
        ? isEn
          ? `${label}: median ${number(group.median)}M, mean ${number(group.mean)}M VND/month (${number(group.count)} listings).`
          : `${label}: trung vị ${number(group.median)} triệu, trung bình ${number(group.mean)} triệu/tháng (${number(group.count)} tin).`
        : isEn
          ? `${label}: size–rent correlation r = ${number(group.r)} (${number(group.count)} listings).`
          : `${label}: tương quan diện tích–giá thuê r = ${number(group.r)} (${number(group.count)} tin).`)
    }
  } else if (chartId === '3.3') {
    const wards = Array.isArray(summary?.wards)
      ? [...summary.wards].filter((ward: any) => Number.isFinite(ward.median)).sort((a: any, b: any) => b.median - a.median)
      : []
    for (const ward of wards.length > 1 ? [wards[0], wards[wards.length - 1]] : wards) {
      insights.push(isEn
        ? `${ward.wardName}: median ${number(ward.median)}k VND/m² (${number(ward.count)} listings).`
        : `${ward.wardName}: trung vị ${number(ward.median)} nghìn đ/m² (${number(ward.count)} tin).`)
    }
    if (wards.length) insights.push(isEn
      ? `Median across the filtered sample: ${number(summary.cityMedian)}k VND/m².`
      : `Trung vị của mẫu đang lọc: ${number(summary.cityMedian)} nghìn đ/m².`)
  } else if (chartId === '3.5' && Array.isArray(summary)) {
    const names: Record<string, string> = { 'Không nội thất': 'Unfurnished', 'Nội thất cơ bản': 'Basic', 'Đầy đủ nội thất': 'Fully furnished', 'Nội thất cao cấp': 'Premium', 'Không xác định': 'Unspecified' }
    for (const group of summary) {
      const values = [['room', isEn ? 'rooms' : 'phòng trọ'], ['apt', isEn ? 'apartments' : 'căn hộ']]
        .filter(([key]) => group[key]?.count > 0)
        .map(([key, label]) => `${label} ${number(group[key].median)}`)
      if (values.length) insights.push(`${isEn ? names[group.status] || group.status : group.status}: ${values.join(' · ')} ${isEn ? 'k VND/m² (median)' : 'nghìn đ/m² (trung vị)'}.`)
    }
  } else if (chartId === '3.6') {
    for (const [key, label] of [['cbd', isEn ? 'Centre' : 'Trung tâm'], ['beach', isEn ? 'Beach' : 'Biển'], ['airport', isEn ? 'Airport' : 'Sân bay'], ['uni', isEn ? 'University' : 'Đại học']]) {
      const group = summary?.[key]
      if (group?.points?.length > 1) insights.push(`${label}: r = ${number(group.r)}.`)
    }
  } else if (chartId === '3.9' && Array.isArray(summary?.matrixSample)) {
    let strongest: { row: number; col: number; value: number } | undefined
    summary.matrixSample.forEach((row: number[], rowIndex: number) => row.forEach((value, colIndex) => {
      if (colIndex > rowIndex && Number.isFinite(value) && (!strongest || Math.abs(value) > Math.abs(strongest.value))) {
        strongest = { row: rowIndex, col: colIndex, value }
      }
    }))
    if (strongest) {
      const { row, col, value } = strongest
      insights.push(`${summary.columns?.[row] ?? row} / ${summary.columns?.[col] ?? col}: r = ${number(value)}.`)
      insights.push(isEn ? 'Largest absolute correlation in the supplied summary.' : 'Cặp có tương quan lớn nhất theo trị tuyệt đối trong phần dữ liệu tóm tắt.')
    }
  }

  return {
    overview: insights.length
      ? (isEn ? 'Based on the current chart and filters.' : 'Theo biểu đồ và bộ lọc hiện tại.')
      : (isEn ? 'Not enough data to summarize this chart.' : 'Chưa đủ dữ liệu để tóm tắt biểu đồ.'),
    insights,
    recommendation: insights.length && ['3.4', '3.5', '3.6', '3.9'].includes(chartId)
      ? (isEn ? 'These comparisons show associations, not cause and effect.' : 'So sánh này thể hiện mối liên hệ, không chứng minh quan hệ nhân quả.')
      : undefined
  }
}


export async function POST(req: NextRequest) {
  try {
    const body: ExplainChartRequest = await req.json()
    const { chartId, chartTitle, summaryData, lang = 'vi' } = body
    const isEn = lang === 'en'

    const systemPrompt = isEn
      ? 'Explain this rental chart in plain English. Use at most 100 words: one sentence and up to three short bullets. Use only supplied statistics. Do not invent demand, occupancy, profits or causal explanations. If data is insufficient, say so. Avoid greetings, promotional language and section headings.'
      : 'Giải thích biểu đồ cho thuê bằng tiếng Việt tự nhiên, tối đa 100 từ: một câu tóm tắt và tối đa ba gạch đầu dòng ngắn. Chỉ dùng số liệu được cung cấp. Không suy diễn nhu cầu, tỷ lệ lấp đầy, lợi nhuận hoặc quan hệ nhân quả. Nêu rõ nếu thiếu dữ liệu. Bỏ lời chào, khẩu hiệu và tiêu đề mục.'

    const userPrompt = isEn
      ? `Chart: ${chartTitle} (ID: ${chartId})\nData Summary:\n${JSON.stringify(summaryData, null, 2)}\nPlease answer strictly in English.`
      : `Biểu đồ: ${chartTitle} (Mã: ${chartId})\nDữ liệu thống kê:\n${JSON.stringify(summaryData, null, 2)}\nVui lòng trả lời bằng tiếng Việt.`

    // =========================================================================
    // 0. OPENROUTER API (OPENROUTER_API_KEY - google/gemini-2.5-flash-lite, etc.)
    // =========================================================================
    const openRouterKey = resolveEnv('OPENROUTER_API_KEY')
    if (openRouterKey) {
      try {
        const model = resolveEnv('OPENROUTER_MODEL') || 'google/gemini-2.5-flash-lite'
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openRouterKey}`,
            'HTTP-Referer': resolveEnv('SITE_URL') || 'http://localhost:3000',
            'X-Title': 'RentIQ Da Nang Rental Analysis'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        })

        if (res.ok) {
          const openRouterData = await res.json()
          const content = openRouterData.choices?.[0]?.message?.content
          if (content) {
            return NextResponse.json({
              provider: `OpenRouter · ${model}`,
              rawContent: content,
              isLive: true
            })
          }
        } else {
          const errBody = await res.text()
          console.warn('OpenRouter API returned error:', res.status, errBody)
        }
      } catch (openRouterErr) {
        console.warn('OpenRouter API call failed, trying next provider:', openRouterErr)
      }
    }

    // =========================================================================
    // 1. GOOGLE GEMINI API (GEMINI_API_KEY)
    // =========================================================================
    const geminiKey = resolveEnv('GEMINI_API_KEY')
    if (geminiKey) {
      try {
        const model = resolveEnv('GEMINI_MODEL') || 'gemini-1.5-flash'
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 800
            }
          })
        })

        if (res.ok) {
          const geminiData = await res.json()
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            return NextResponse.json({
              provider: `Google Gemini (${model})`,
              rawContent: text,
              isLive: true
            })
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, trying next provider:', geminiErr)
      }
    }

    // =========================================================================
    // 2. GROQ API (GROQ_API_KEY - Siêu nhanh, miễn phí)
    // =========================================================================
    const groqKey = resolveEnv('GROQ_API_KEY')
    if (groqKey) {
      try {
        const model = resolveEnv('GROQ_MODEL') || 'llama-3.3-70b-versatile'
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        })

        if (res.ok) {
          const groqData = await res.json()
          const content = groqData.choices?.[0]?.message?.content
          if (content) {
            return NextResponse.json({
              provider: `Groq (${model})`,
              rawContent: content,
              isLive: true
            })
          }
        }
      } catch (groqErr) {
        console.warn('Groq API call failed, trying next provider:', groqErr)
      }
    }

    // =========================================================================
    // 3. OPENAI API (OPENAI_API_KEY)
    // =========================================================================
    const openaiKey = resolveEnv('OPENAI_API_KEY')
    if (openaiKey) {
      try {
        const model = resolveEnv('OPENAI_MODEL') || 'gpt-4o-mini'
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 800
          })
        })

        if (res.ok) {
          const openaiData = await res.json()
          const content = openaiData.choices?.[0]?.message?.content
          if (content) {
            return NextResponse.json({
              provider: `OpenAI (${model})`,
              rawContent: content,
              isLive: true
            })
          }
        }
      } catch (openaiErr) {
        console.warn('OpenAI API call failed:', openaiErr)
      }
    }

    // =========================================================================
    // 4. OLLAMA / LOCAL LLM (OLLAMA_BASE_URL - Chạy offline miễn phí)
    // =========================================================================
    const ollamaBaseUrl = resolveEnv('OLLAMA_BASE_URL')
    if (ollamaBaseUrl) {
      try {
        const baseUrl = ollamaBaseUrl.replace(/\/$/, '')
        const model = resolveEnv('OLLAMA_MODEL') || 'llama3.2'
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            stream: false
          })
        })

        if (res.ok) {
          const ollamaData = await res.json()
          const content = ollamaData.message?.content
          if (content) {
            return NextResponse.json({
              provider: `Ollama Local (${model})`,
              rawContent: content,
              isLive: true
            })
          }
        }
      } catch (ollamaErr) {
        console.warn('Ollama call failed:', ollamaErr)
      }
    }

    // =========================================================================
    // 5. LOCAL ANALYTIC ENGINE (FALLBACK TỰ ĐỘNG KHI CHƯA ĐIỀN API KEY)
    // Tính toán số liệu thống kê chính xác trực tiếp từ Supabase Gold
    // =========================================================================
    const fallback = generateFallbackExplanation(chartId, chartTitle, summaryData, lang)

    return NextResponse.json({
      provider: isEn ? 'RentIQ Market Analytics (Local Engine)' : 'Phân tích thị trường RentIQ (Cục bộ)',
      isLive: false,
      data: fallback
    })
  } catch (error: any) {
    console.error('Error in /api/ai/explain-chart:', error)
    return NextResponse.json(
      { error: 'Failed to generate chart explanation', message: error?.message || String(error) },
      { status: 500 }
    )
  }
}
