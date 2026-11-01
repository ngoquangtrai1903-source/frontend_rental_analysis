'use client'

import React, { useState } from 'react'

interface ColumnMeta {
  key: string
  label: string
  labelEn: string
}

interface SpearmanHeatmapProps {
  columns: ColumnMeta[]
  matrix: number[][]
  lang?: 'vi' | 'en'
}

/**
 * Maps correlation [-1, 1] to RdBu_r palette:
 * -1: #b2182b (Deep Red)
 *  0: #ffffff (White)
 * +1: #2166ac (Deep Blue)
 */
function getRdBuColor(val: number): { bg: string; text: string } {
  if (isNaN(val)) return { bg: '#f1f5f9', text: '#94a3b8' }
  const clamped = Math.max(-1, Math.min(1, val))

  if (clamped >= 0) {
    // White (255, 255, 255) to Blue (33, 102, 172)
    const t = clamped
    const r = Math.round(255 - t * (255 - 33))
    const g = Math.round(255 - t * (255 - 102))
    const b = Math.round(255 - t * (255 - 172))
    return {
      bg: `rgb(${r}, ${g}, ${b})`,
      text: t > 0.45 ? '#ffffff' : '#0f172a'
    }
  } else {
    // White (255, 255, 255) to Red (178, 24, 43)
    const t = Math.abs(clamped)
    const r = Math.round(255 - t * (255 - 178))
    const g = Math.round(255 - t * (255 - 24))
    const b = Math.round(255 - t * (255 - 43))
    return {
      bg: `rgb(${r}, ${g}, ${b})`,
      text: t > 0.45 ? '#ffffff' : '#0f172a'
    }
  }
}

export default function SpearmanCorrelationHeatmap({
  columns,
  matrix,
  lang = 'vi'
}: SpearmanHeatmapProps) {
  const isEn = lang === 'en'
  const [hoveredCell, setHoveredCell] = useState<{
    rowIdx: number
    colIdx: number
    val: number
  } | null>(null)

  if (!matrix || matrix.length === 0) {
    return (
      <div className="chart-empty-state">
        {isEn ? 'Insufficient data to compute correlation matrix.' : 'Chưa đủ dữ liệu để tính ma trận tương quan.'}
      </div>
    )
  }

  const getInterpretation = (val: number) => {
    const abs = Math.abs(val)
    if (abs >= 0.7) return isEn ? 'Very Strong Correlation' : 'Tương quan rất mạnh'
    if (abs >= 0.4) return isEn ? 'Moderate Correlation' : 'Tương quan mức độ vừa'
    if (abs >= 0.2) return isEn ? 'Weak Correlation' : 'Tương quan yếu'
    return isEn ? 'Negligible / No Correlation' : 'Không có tương quan đáng kể'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Legend & Color Scale Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
          padding: '8px 14px',
          background: 'var(--surface-subtle, #f8fafc)',
          borderRadius: '8px',
          border: '1px solid var(--line, #e2e8f0)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>{isEn ? 'Spearman Rank ρ:' : 'Hệ số tương quan hạng Spearman (ρ):'}</span>
          <div
            style={{
              width: '160px',
              height: '12px',
              borderRadius: '3px',
              background: 'linear-gradient(to right, #b2182b, #ffffff, #2166ac)',
              border: '1px solid #cbd5e1'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
            {isEn ? '-1.00 (Inverse) → 0.00 → +1.00 (Direct)' : '-1.00 (Nghịch) → 0.00 → +1.00 (Thuận)'}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)' }}>
          {isEn ? 'Pairwise Spearman complete observations' : 'Tính trên từng cặp quan sát đầy đủ (Pairwise Complete)'}
        </div>
      </div>

      {/* Heatmap Table Container */}
      <div
        style={{
          overflowX: 'auto',
          maxWidth: '100%',
          border: '1px solid var(--line, #e2e8f0)',
          borderRadius: '8px',
          background: 'var(--surface-card, #ffffff)'
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            fontSize: '10px',
            fontFamily: 'Manrope, sans-serif',
            width: '100%',
            minWidth: '850px'
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: 'var(--surface-subtle, #f8fafc)',
                  padding: '8px',
                  borderBottom: '1px solid #cbd5e1',
                  borderRight: '1px solid #cbd5e1',
                  textAlign: 'left',
                  fontSize: '10px',
                  color: 'var(--muted, #64748b)'
                }}
              >
                Features ({columns.length})
              </th>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  style={{
                    padding: '6px 2px',
                    borderBottom: '1px solid #cbd5e1',
                    borderRight: '1px solid #f1f5f9',
                    textAlign: 'center',
                    background: hoveredCell?.colIdx === i ? '#e0f2fe' : 'var(--surface-subtle, #f8fafc)',
                    color: hoveredCell?.colIdx === i ? '#0369a1' : 'var(--ink, #1e293b)',
                    fontWeight: 700,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    height: '80px',
                    whiteSpace: 'nowrap'
                  }}
                  title={isEn ? c.labelEn : c.label}
                >
                  {isEn ? c.labelEn : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowCol, rIdx) => (
              <tr key={rowCol.key}>
                {/* Row Header */}
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    background: hoveredCell?.rowIdx === rIdx ? '#e0f2fe' : 'var(--surface-subtle, #f8fafc)',
                    color: hoveredCell?.rowIdx === rIdx ? '#0369a1' : 'var(--ink, #1e293b)',
                    padding: '5px 8px',
                    fontWeight: 600,
                    borderBottom: '1px solid #f1f5f9',
                    borderRight: '1px solid #cbd5e1',
                    whiteSpace: 'nowrap',
                    fontSize: '11px'
                  }}
                >
                  {isEn ? rowCol.labelEn : rowCol.label}
                </td>

                {/* Cells */}
                {columns.map((colCol, cIdx) => {
                  const val = matrix[rIdx]?.[cIdx] ?? 0
                  const color = getRdBuColor(val)
                  const isHovered = hoveredCell?.rowIdx === rIdx && hoveredCell?.colIdx === cIdx
                  const isCross = hoveredCell?.rowIdx === rIdx || hoveredCell?.colIdx === cIdx

                  return (
                    <td
                      key={colCol.key}
                      onMouseEnter={() => setHoveredCell({ rowIdx: rIdx, colIdx: cIdx, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        padding: '4px 1px',
                        textAlign: 'center',
                        background: color.bg,
                        color: color.text,
                        fontWeight: rIdx === cIdx ? 800 : Math.abs(val) >= 0.4 ? 700 : 500,
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        borderRight: '1px solid rgba(0,0,0,0.05)',
                        outline: isHovered ? '2px solid #0f172a' : isCross ? '1px dashed #94a3b8' : 'none',
                        zIndex: isHovered ? 1 : 0,
                        cursor: 'pointer',
                        transition: 'outline 0.05s ease'
                      }}
                      title={`${rowCol.label} × ${colCol.label}: ${val.toFixed(2)}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hover Info Banner - Fixed Height Bar (0px Layout Shift) */}
      <div
        style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: hoveredCell ? 'var(--surface-subtle, #f8fafc)' : 'rgba(241, 245, 249, 0.6)',
          border: hoveredCell ? '1px solid #bfdbfe' : '1px dashed #cbd5e1',
          fontSize: '12px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.15s ease'
        }}
      >
        {hoveredCell ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div>
              <strong>
                {isEn ? columns[hoveredCell.rowIdx].labelEn : columns[hoveredCell.rowIdx].label}
              </strong>{' '}
              ×{' '}
              <strong>
                {isEn ? columns[hoveredCell.colIdx].labelEn : columns[hoveredCell.colIdx].label}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>
                Spearman ρ ={' '}
                <strong style={{ fontSize: '14px', color: hoveredCell.val >= 0 ? '#1d4ed8' : '#b91c1c' }}>
                  {hoveredCell.val.toFixed(2)}
                </strong>
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: Math.abs(hoveredCell.val) >= 0.4 ? '#e0e7ff' : '#f1f5f9',
                  color: Math.abs(hoveredCell.val) >= 0.4 ? '#4338ca' : '#475569',
                  fontWeight: 600,
                  fontSize: '11px'
                }}
              >
                {getInterpretation(hoveredCell.val)}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>
              {isEn
                ? 'Hover over any matrix cell to view Spearman rank correlation ρ and interpretation...'
                : 'Rê chuột vào bất kỳ ô nào trên ma trận để xem hệ số tương quan Spearman ρ và mức độ ảnh hưởng...'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
