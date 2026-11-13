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
  const [error, setError] = useState(false)

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
    setError(false)
    setExplanation(null)
    setRawText(null)
    try {
      const isEvent = overrideData && (typeof overrideData !== 'object' || 'nativeEvent' in overrideData || 'target' in overrideData)
      const dataToSend = (!overrideData || isEvent) ? summaryData : overrideData

      const res = await fetch('/api/ai/explain-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartId,
          chartTitle,
          summaryData: dataToSend,
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
      setError(true)
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
    <div className="chart-ai-wrapper" style={{ marginTop: '14px', borderTop: '1px dashed var(--line, #e2e8f0)', paddingTop: '10px' }}>
      {!isOpen && (
        <button
          type="button"
          className="chart-ai-toggle-btn"
          onClick={() => void handleFetchInsight()}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={13} className="spin" />
              <span>{isEn ? 'Analyzing...' : 'Đang phân tích...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={13} className="ai-btn-sparkle" />
              <span>{isEn ? 'Read chart' : 'Đọc biểu đồ'}</span>
            </>
          )}
        </button>
      )}

      {isOpen && (
        <div className="chart-ai-explainer-card">
          {/* Header Row */}
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="ai-bot-icon">
                <Bot size={14} />
              </div>
              <strong className="ai-title">
                {isEn ? 'Chart summary' : 'Tóm tắt biểu đồ'}
              </strong>
              <span
                className={isLive ? 'ai-pill-live' : 'ai-pill-ready'}
                title={provider}
              >
                {isLive ? (
                  <>
                    <span className="ai-live-dot" />
                    {'AI'}
                  </>
                ) : (
                  isEn ? 'Data summary' : 'Tóm tắt dữ liệu'
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
              >
                <RotateCcw size={12} className={loading ? 'spin' : ''} />
                <span>{isEn ? 'Refresh' : 'Làm mới'}</span>
              </button>

              <button
                type="button"
                className="ai-action-btn ai-collapse-btn"
                onClick={() => setIsOpen(false)}
                title={isEn ? 'Collapse' : 'Thu gọn'}
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="ai-loading">
              <Loader2 size={18} className="spin" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '12px' }}>
                {isEn
                  ? 'Reading chart data…'
                  : 'Đang đọc dữ liệu biểu đồ…'}
              </div>
            </div>
          )}

          {/* Live LLM Raw Response (Formatted Markdown) */}
          {!loading && error && (
            <p role="alert">{isEn ? 'Could not load the summary. Select Refresh to try again.' : 'Chưa tải được tóm tắt. Bấm Làm mới để thử lại.'}</p>
          )}
          {!loading && rawText && (
            <div className="ai-raw-content">
              {rawText.split('\n').map((line, idx) => {
                const trimmed = line.trim()
                if (!trimmed) return null

                // Headings ## or ###
                if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                  const heading = trimmed.replace(/^#+\s*/, '')
                  return (
                    <h4 key={idx}>
                      {heading}
                    </h4>
                  )
                }

                // Bullets * or -
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  const itemText = trimmed.slice(2)
                  const parts = itemText.split(/(\*\*.*?\*\*)/g)
                  return (
                    <div key={idx} className="ai-bullet-item">
                      <span className="ai-bullet-dot">•</span>
                      <div style={{ flex: 1 }}>
                        {parts.map((p, pIdx) =>
                          p.startsWith('**') && p.endsWith('**') ? (
                            <strong key={pIdx}>{p.slice(2, -2)}</strong>
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
                  <p key={idx}>
                    {parts.map((p, pIdx) =>
                      p.startsWith('**') && p.endsWith('**') ? (
                        <strong key={pIdx}>{p.slice(2, -2)}</strong>
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
            <div className="ai-structured-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {explanation.overview && (
                <div className="ai-overview">
                  {explanation.overview}
                </div>
              )}

              {explanation.insights && explanation.insights.length > 0 && (
                <ul className="ai-insight-list" style={{ margin: '4px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {explanation.insights.map((ins, idx) => {
                    const parts = ins.split(/(\*\*.*?\*\*)/g)
                    return (
                      <li key={idx}>
                        {parts.map((p, pIdx) => {
                          if (p.startsWith('**') && p.endsWith('**')) {
                            return <strong key={pIdx}>{p.slice(2, -2)}</strong>
                          }
                          return p
                        })}
                      </li>
                    )
                  })}
                </ul>
              )}

              {explanation.recommendation && (
                <div className="ai-takeaway">
                  <strong>{isEn ? 'Note:' : 'Lưu ý:'}</strong>{' '}
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
