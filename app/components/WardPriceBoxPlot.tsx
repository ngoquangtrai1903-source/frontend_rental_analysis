import type { PriceBoxPlot } from '@/lib/goldQueryService'

function formatPrice(value: number): string {
  return `${value.toFixed(2)} triệu`
}

export default function WardPriceBoxPlot({ wards, maxPrice }: { wards: PriceBoxPlot[]; maxPrice: number }) {
  return (
    <div className="box-plot" role="group" aria-label="Phân bố giá thuê theo phường, đơn vị triệu đồng mỗi tháng">
      <div className="box-plot-rows">
        {wards.map((item, index) => {
          const tooltipId = `box-plot-tooltip-${index}`
          const description = `${item.wardName}: ${item.count.toLocaleString('vi-VN')} tin; thấp nhất ${formatPrice(item.min)}, Q1 ${formatPrice(item.q1)}, trung vị ${formatPrice(item.median)}, Q3 ${formatPrice(item.q3)}, cao nhất ${formatPrice(item.max)} mỗi tháng.`

          return (
            <div
              className="box-plot-row"
              key={item.wardName}
              tabIndex={0}
              aria-label={description}
              aria-describedby={tooltipId}
            >
              <span className="box-plot-ward">{item.wardName}</span>
              <span className="box-plot-track" aria-hidden="true">
                <span className="box-plot-whisker" style={{ left: `${(item.min / maxPrice) * 100}%`, width: `${((item.max - item.min) / maxPrice) * 100}%` }} />
                <span className="box-plot-cap box-plot-cap-start" style={{ left: `${(item.min / maxPrice) * 100}%` }} />
                <span className="box-plot-box" style={{ left: `${(item.q1 / maxPrice) * 100}%`, width: `${((item.q3 - item.q1) / maxPrice) * 100}%` }} />
                <span className="box-plot-median" style={{ left: `${(item.median / maxPrice) * 100}%` }} />
                <span className="box-plot-cap box-plot-cap-end" style={{ left: `${(item.max / maxPrice) * 100}%` }} />
              </span>
              <span className="box-plot-count">{item.count.toLocaleString('vi-VN')} tin</span>
              <span className="box-plot-tooltip" id={tooltipId} role="tooltip">
                <strong>{item.wardName}</strong>
                <span>{item.count.toLocaleString('vi-VN')} tin đăng hợp lệ</span>
                <span>Thấp nhất: {formatPrice(item.min)}/tháng</span>
                <span>Q1: {formatPrice(item.q1)} · Trung vị: {formatPrice(item.median)}</span>
                <span>Q3: {formatPrice(item.q3)} · Cao nhất: {formatPrice(item.max)}</span>
              </span>
            </div>
          )
        })}
      </div>
      <div className="box-plot-axis">
        <span>0 tr</span><span>{(maxPrice / 2).toFixed(0)} tr</span><span>{maxPrice} tr/tháng</span>
      </div>
      <div className="box-plot-legend"><i /> Q1–Q3 <span className="box-plot-legend-median" /> Trung vị</div>
    </div>
  )
}
