'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, Copy, Check, RotateCcw, ChevronDown, ChevronUp, Bot } from 'lucide-react'

interface ChartAIExplainerProps {
  chartId: string
  chartTitle: string
  summaryData: any
  lang?: 'vi' | 'en'
}

interface AIExplanationData {
  overview?: string
  insights?: string[]
  recommendation?: string
}

export default function ChartAIExplainer({
  chartId,
  chartTitle,
  summaryData,
  lang = 'vi'
}: ChartAIExplainerProps) {
  const isEn = lang === 'en'
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<AIExplanationData | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [provider, setProvider] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Re-fetch in new language if already open when language toggles
  const prevLangRef = useRef(lang)
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang
      if (isOpen) {
        void handleFetchInsight()
      }
    }
  }, [lang, isOpen])

  // Re-fetch with new metrics when user applies filters while already open
  const prevSummaryRef = useRef(summaryData)
  useEffect(() => {
    if (prevSummaryRef.current !== summaryData) {
      prevSummaryRef.current = summaryData
      if (isOpen) {
        void handleFetchInsight(summaryData)
      }
    }
  }, [summaryData, isOpen])

  const handleFetchInsight = async (overrideData?: any) => {
    setLoading(true)
    setIsOpen(true)
    try {
      const res = await fetch('/api/ai/explain-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartId,
          chartTitle,
          summaryData: overrideData || summaryData,
          lang
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const json = await res.json()
      if (json.rawContent) {
        setRawText(json.rawContent)
        setExplanation(null)
      } else if (json.data) {
        setExplanation(json.data)
        setRawText(null)
      }
      setIsLive(Boolean(json.isLive))
      setProvider(json.provider || '')
    } catch (err) {
      console.error('Failed to get AI insight:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    let textToCopy = ''
    if (rawText) {
      textToCopy = rawText
    } else if (explanation) {
      textToCopy = `${explanation.overview}\n\n` +
        (explanation.insights || []).map((ins) => `• ${ins.replace(/\*\*/g, '')}`).join('\n') +
        `\n\nKhuyến nghị: ${explanation.recommendation}`
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ marginTop: '14px', borderTop: '1px dashed var(--line, #e2e8f0)', paddingTop: '10px' }}>
      {!isOpen && (
        <button
          type="button"
          onClick={handleFetchInsight}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #c7d2fe',
            background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
            color: '#4338ca',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(67, 56, 202, 0.06)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e0e7ff'
            e.currentTarget.style.borderColor = '#818cf8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)'
            e.currentTarget.style.borderColor = '#c7d2fe'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={13} className="spin" />
              <span>{isEn ? 'Analyzing...' : 'Đang phân tích...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={13} color="#6366f1" />
              <span>{isEn ? 'Explain with AI' : 'Giải thích biểu đồ bằng AI'}</span>
            </>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className="chart-ai-explainer-card"
          style={{
            borderRadius: '10px',
            padding: '14px 16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--ink, #1e293b)'
          }}
        >
          {/* Header Row */}
          <div
            className="ai-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              paddingBottom: '8px',
              marginBottom: '10px',
              borderBottom: '1px solid #e0e7ff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '5px',
                  background: '#6366f1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={14} />
              </div>
              <strong className="ai-title" style={{ color: '#3730a3', fontSize: '13px' }}>
                {isEn ? 'AI Market Insights' : 'Nhận định thị trường từ AI'}
              </strong>
              <span
                className={isLive ? 'ai-pill-live' : 'ai-pill-ready'}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isLive ? '#dcfce7' : '#f1f5f9',
                  color: isLive ? '#15803d' : '#64748b',
                  border: isLive ? '1px solid #86efac' : '1px solid #e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={provider}
              >
                {isLive ? (
                  <>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    {provider || 'Live LLM'}
                  </>
                ) : (
                  isEn ? 'Ready for API' : 'Sẵn sàng kết nối API'
                )}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="ai-action-btn"
                onClick={handleCopy}
                disabled={loading}
                title={isEn ? 'Copy insight' : 'Sao chép nhận xét'}
                style={{
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                <span>{copied ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
              </button>

              <button
                type="button"
                className="ai-action-btn"
                onClick={() => void handleFetchInsight()}
                disabled={loading}
                title={isEn ? 'Re-generate' : 'Phân tích lại'}
                style={{
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={12} className={loading ? 'spin' : ''} />
                <span>{isEn ? 'Refresh' : 'Làm mới'}</span>
              </button>

              <button
                type="button"
                className="ai-action-btn"
                onClick={() => setIsOpen(false)}
                title={isEn ? 'Collapse' : 'Thu gọn'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '3px 4px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#6366f1' }}>
              <Loader2 size={18} className="spin" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '12px' }}>
                {isEn
                  ? 'AI is analyzing rental market trends from this chart…'
                  : 'AI đang phân tích xu hướng thị trường từ biểu đồ…'}
              </div>
            </div>
          )}

          {/* Live LLM Raw Response (Formatted Markdown) */}
          {!loading && rawText && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#1e293b', lineHeight: 1.6 }}>
              {rawText.split('\n').map((line, idx) => {
                const trimmed = line.trim()
                if (!trimmed) return null

                // Headings ## or ###
                if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                  const heading = trimmed.replace(/^#+\s*/, '')
                  return (
                    <h4 key={idx} style={{ margin: '8px 0 2px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      {heading}
                    </h4>
                  )
                }

                // Bullets * or -
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  const itemText = trimmed.slice(2)
                  const parts = itemText.split(/(\*\*.*?\*\*)/g)
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', paddingLeft: '8px' }}>
                      <span style={{ color: '#6366f1', marginTop: '1px', fontSize: '14px', lineHeight: 1 }}>•</span>
                      <div style={{ flex: 1 }}>
                        {parts.map((p, pIdx) =>
                          p.startsWith('**') && p.endsWith('**') ? (
                            <strong key={pIdx} style={{ color: '#0f172a' }}>{p.slice(2, -2)}</strong>
                          ) : (
                            <span key={pIdx}>{p}</span>
                          )
                        )}
                      </div>
                    </div>
                  )
                }

                // Paragraph with **bold**
                const parts = trimmed.split(/(\*\*.*?\*\*)/g)
                return (
                  <p key={idx} style={{ margin: 0 }}>
                    {parts.map((p, pIdx) =>
                      p.startsWith('**') && p.endsWith('**') ? (
                        <strong key={pIdx} style={{ color: '#0f172a' }}>{p.slice(2, -2)}</strong>
                      ) : (
                        <span key={pIdx}>{p}</span>
                      )
                    )}
                  </p>
                )
              })}
            </div>
          )}

          {/* Structured Insight Display */}
          {!loading && explanation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {explanation.overview && (
                <div style={{ fontWeight: 600, color: 'var(--ink, #334155)', fontSize: '12.5px' }}>
                  {explanation.overview}
                </div>
              )}

              {explanation.insights && explanation.insights.length > 0 && (
                <ul style={{ margin: '4px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {explanation.insights.map((ins, idx) => {
                    // Quick parse bold **text** to HTML
                    const parts = ins.split(/(\*\*.*?\*\*)/g)
                    return (
                      <li key={idx} style={{ fontSize: '12px', color: 'var(--ink, #334155)' }}>
                        {parts.map((p, pIdx) => {
                          if (p.startsWith('**') && p.endsWith('**')) {
                            return <strong key={pIdx} style={{ color: 'var(--ink, #0f172a)' }}>{p.slice(2, -2)}</strong>
                          }
                          return p
                        })}
                      </li>
                    )
                  })}
                </ul>
              )}

              {explanation.recommendation && (
                <div
                  className="ai-takeaway"
                  style={{
                    marginTop: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#eef2ff',
                    borderLeft: '3px solid #6366f1',
                    fontSize: '11.5px',
                    color: '#3730a3'
                  }}
                >
                  <strong>💡 {isEn ? 'Strategic Takeaway:' : 'Khuyến nghị chiến lược:'}</strong>{' '}
                  {explanation.recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
