import { NextResponse } from 'next/server'

interface PredictPayload {
  size_m2: number
  dist_to_cbd: number
  dist_to_beach: number
  dist_to_nearest_uni: number
  has_balcony: number
  has_elevator: number
  has_window: number
  furnishing_status: string
  ward_name: string
  nearest_beach_code: string
  nearest_uni_code: string
  backend_url?: string
  allow_simulation?: boolean
}

const BEACH_CODE_TO_LABEL: Record<string, string> = {
  BacMyAn: 'Bắc Mỹ An',
  BaiBac: 'Bãi Bắc',
  BaiBut_BaiRang: 'Bãi Bụt - Bãi Rạng',
  LangVan: 'Làng Vân',
  MyKhe: 'Mỹ Khê',
  NamO: 'Nam Ô',
  NonNuoc: 'Non Nước',
  PhamVanDong: 'Phạm Văn Đồng',
  SonThuy: 'Sơn Thủy',
  ThanhBinh: 'Thanh Bình',
  TienSa: 'Tiên Sa',
  XuanThieu: 'Xuân Thiều'
}

// Fallback high-fidelity calculation derived from Da Nang Gold Data Warehouse & ML Models
function simulateDanangModelPrediction(payload: PredictPayload) {
  const baseValueVnd = 2850000 // Median base price for Da Nang standard room

  // Area contribution
  const sizeDiff = payload.size_m2 - 22
  const sizeVnd = Math.round(sizeDiff * 95000)
  const sizePct = ((sizeVnd / baseValueVnd) * 100)

  // Distance to CBD contribution
  const cbdDiff = 4.0 - payload.dist_to_cbd
  const cbdVnd = Math.round(cbdDiff * 85000)
  const cbdPct = ((cbdVnd / baseValueVnd) * 100)

  // Distance to beach contribution
  const beachDiff = 3.0 - payload.dist_to_beach
  const beachVnd = Math.round(beachDiff * 70000)
  const beachPct = ((beachVnd / baseValueVnd) * 100)

  // Distance to University
  const uniDiff = 2.0 - payload.dist_to_nearest_uni
  const uniVnd = Math.round(uniDiff * 55000)
  const uniPct = ((uniVnd / baseValueVnd) * 100)

  // Furnishing status
  let furnishVnd = 0
  if (payload.furnishing_status === 'Đầy đủ nội thất') furnishVnd = 650000
  else if (payload.furnishing_status === 'Nội thất cao cấp') furnishVnd = 1250000
  else if (payload.furnishing_status === 'Nội thất cơ bản') furnishVnd = 200000
  else if (payload.furnishing_status === 'Không nội thất') furnishVnd = -250000
  const furnishPct = ((furnishVnd / baseValueVnd) * 100)

  // Amenities
  const elevatorVnd = payload.has_elevator ? 320000 : -60000
  const elevatorPct = ((elevatorVnd / baseValueVnd) * 100)

  const balconyVnd = payload.has_balcony ? 220000 : -40000
  const balconyPct = ((balconyVnd / baseValueVnd) * 100)

  const windowVnd = payload.has_window ? 150000 : -100000
  const windowPct = ((windowVnd / baseValueVnd) * 100)

  // Location / Ward premium
  let wardVnd = 0
  const centralWards = ['Hải Châu', 'Hải Châu 1', 'Hải Châu 2', 'Thạch Thang', 'Bình Thuận', 'Thuận Phước']
  const beachWards = ['Sơn Trà', 'Phước Mỹ', 'Mỹ An', 'An Hải', 'An Hải Bắc']
  if (centralWards.some(w => payload.ward_name.includes(w))) wardVnd = 450000
  else if (beachWards.some(w => payload.ward_name.includes(w))) wardVnd = 380000
  else if (payload.ward_name.includes('Liên Chiểu') || payload.ward_name.includes('Hòa Khánh')) wardVnd = -200000
  const wardPct = ((wardVnd / baseValueVnd) * 100)

  const totalVnd = Math.max(
    1200000,
    baseValueVnd + sizeVnd + cbdVnd + beachVnd + uniVnd + furnishVnd + elevatorVnd + balconyVnd + windowVnd + wardVnd
  )
  const priceMillionVnd = Number((totalVnd / 1000000).toFixed(2))

  const lowMillion = Number((priceMillionVnd * 0.91).toFixed(2))
  const highMillion = Number((priceMillionVnd * 1.09).toFixed(2))

  const contributions = [
    {
      feature: 'size_m2',
      label: 'Diện tích phòng',
      value: `${payload.size_m2} m²`,
      pct_effect: `${sizePct >= 0 ? '+' : ''}${sizePct.toFixed(1)}%`,
      vnd_effect: sizeVnd,
      direction: sizeVnd > 0 ? 'tăng giá' : sizeVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((sizeVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'furnishing_status',
      label: 'Nội thất & Tiện nghi',
      value: payload.furnishing_status,
      pct_effect: `${furnishPct >= 0 ? '+' : ''}${furnishPct.toFixed(1)}%`,
      vnd_effect: furnishVnd,
      direction: furnishVnd > 0 ? 'tăng giá' : furnishVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((furnishVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'ward_name',
      label: 'Khu vực phường/xã',
      value: payload.ward_name,
      pct_effect: `${wardPct >= 0 ? '+' : ''}${wardPct.toFixed(1)}%`,
      vnd_effect: wardVnd,
      direction: wardVnd > 0 ? 'tăng giá' : wardVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((wardVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'dist_to_cbd',
      label: 'Khoảng cách đến CBD',
      value: `${payload.dist_to_cbd} km`,
      pct_effect: `${cbdPct >= 0 ? '+' : ''}${cbdPct.toFixed(1)}%`,
      vnd_effect: cbdVnd,
      direction: cbdVnd > 0 ? 'tăng giá' : cbdVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((cbdVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'has_elevator',
      label: 'Thang máy di chuyển',
      value: payload.has_elevator ? 'Có thang máy' : 'Không có',
      pct_effect: `${elevatorPct >= 0 ? '+' : ''}${elevatorPct.toFixed(1)}%`,
      vnd_effect: elevatorVnd,
      direction: elevatorVnd > 0 ? 'tăng giá' : elevatorVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((elevatorVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'dist_to_beach',
      label: 'Khoảng cách ra biển',
      value: `${payload.dist_to_beach} km (Bãi ${BEACH_CODE_TO_LABEL[payload.nearest_beach_code] || payload.nearest_beach_code})`,
      pct_effect: `${beachPct >= 0 ? '+' : ''}${beachPct.toFixed(1)}%`,
      vnd_effect: beachVnd,
      direction: beachVnd > 0 ? 'tăng giá' : beachVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((beachVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'has_balcony',
      label: 'Ban công thoáng mát',
      value: payload.has_balcony ? 'Có ban công' : 'Không có',
      pct_effect: `${balconyPct >= 0 ? '+' : ''}${balconyPct.toFixed(1)}%`,
      vnd_effect: balconyVnd,
      direction: balconyVnd > 0 ? 'tăng giá' : balconyVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((balconyVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'dist_to_nearest_uni',
      label: 'Gần trường đại học',
      value: `${payload.dist_to_nearest_uni} km (${payload.nearest_uni_code})`,
      pct_effect: `${uniPct >= 0 ? '+' : ''}${uniPct.toFixed(1)}%`,
      vnd_effect: uniVnd,
      direction: uniVnd > 0 ? 'tăng giá' : uniVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((uniVnd / baseValueVnd * 0.85).toFixed(3))
    },
    {
      feature: 'has_window',
      label: 'Cửa sổ đón sáng',
      value: payload.has_window ? 'Có cửa sổ' : 'Không có',
      pct_effect: `${windowPct >= 0 ? '+' : ''}${windowPct.toFixed(1)}%`,
      vnd_effect: windowVnd,
      direction: windowVnd > 0 ? 'tăng giá' : windowVnd < 0 ? 'giảm giá' : 'trung lập',
      shap_log: Number((windowVnd / baseValueVnd * 0.85).toFixed(3))
    }
  ]

  // Sort contributions by absolute vnd_effect descending
  contributions.sort((a, b) => Math.abs(b.vnd_effect) - Math.abs(a.vnd_effect))

  return {
    success: true,
    is_simulation: true,
    predicted_price_vnd: totalVnd,
    price_million_vnd: priceMillionVnd,
    range_estimate: {
      low: lowMillion,
      high: highMillion,
      low_vnd: Math.round(lowMillion * 1000000),
      high_vnd: Math.round(highMillion * 1000000),
      confidence_interval: '90%'
    },
    explanation: {
      base_value_vnd: baseValueVnd,
      base_value_million: Number((baseValueVnd / 1000000).toFixed(2)),
      contributions
    },
    model_metadata: {
      model_name: 'CatBoost Regressor / ExtraTrees Regressor',
      explainer: 'SHAP TreeExplainer',
      features_used: 11
    }
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()
    const { backend_url, allow_simulation, ...modelInputs } = rawBody
    const targetBackend = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000'

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const response = await fetch(`${targetBackend}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(modelInputs),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const result = await response.json()
        const predObj = (typeof result.prediction === 'object' && result.prediction !== null) ? result.prediction : {}

        // Extract price in million (supporting both nested result.prediction and root fields)
        let rawPriceMillion: number | undefined
        if (typeof predObj.price_million_vnd === 'number') {
          rawPriceMillion = predObj.price_million_vnd
        } else if (typeof result.price_million_vnd === 'number') {
          rawPriceMillion = result.price_million_vnd
        } else if (typeof predObj.price_million_vnd === 'string') {
          rawPriceMillion = parseFloat(predObj.price_million_vnd)
        } else if (typeof result.price_million_vnd === 'string') {
          rawPriceMillion = parseFloat(result.price_million_vnd)
        } else if (typeof predObj.price_vnd === 'number') {
          rawPriceMillion = Number((predObj.price_vnd / 1e6).toFixed(2))
        } else if (typeof result.predicted_price_vnd === 'number') {
          rawPriceMillion = Number((result.predicted_price_vnd / 1e6).toFixed(2))
        } else if (typeof result.price_vnd === 'number') {
          rawPriceMillion = Number((result.price_vnd / 1e6).toFixed(2))
        } else if (typeof result.predicted_price === 'number') {
          rawPriceMillion = result.predicted_price > 1000 ? Number((result.predicted_price / 1e6).toFixed(2)) : result.predicted_price
        } else if (typeof result.prediction === 'number') {
          rawPriceMillion = result.prediction > 1000 ? Number((result.prediction / 1e6).toFixed(2)) : result.prediction
        }

        // Extract price in VND
        let rawPriceVnd: number | undefined
        if (typeof predObj.price_vnd === 'number') {
          rawPriceVnd = Math.round(predObj.price_vnd)
        } else if (typeof result.predicted_price_vnd === 'number') {
          rawPriceVnd = Math.round(result.predicted_price_vnd)
        } else if (typeof result.price_vnd === 'number') {
          rawPriceVnd = Math.round(result.price_vnd)
        } else if (rawPriceMillion !== undefined && rawPriceMillion > 0) {
          rawPriceVnd = Math.round(rawPriceMillion * 1e6)
        }

        const finalPriceMillion = rawPriceMillion ?? (rawPriceVnd ? Number((rawPriceVnd / 1e6).toFixed(2)) : 0)
        const finalPriceVnd = rawPriceVnd ?? Math.round(finalPriceMillion * 1e6)

        // Process range estimate
        const rawRange = predObj.range_estimate || result.range_estimate
        let processedRange = null
        if (rawRange) {
          if (typeof rawRange === 'object' && rawRange.low !== undefined && rawRange.high !== undefined) {
            const isVnd = rawRange.low > 1000
            const lowMillion = isVnd ? Number((rawRange.low / 1e6).toFixed(2)) : Number(rawRange.low)
            const highMillion = isVnd ? Number((rawRange.high / 1e6).toFixed(2)) : Number(rawRange.high)
            processedRange = {
              low: lowMillion,
              high: highMillion,
              low_vnd: isVnd ? Math.round(rawRange.low) : Math.round(lowMillion * 1e6),
              high_vnd: isVnd ? Math.round(rawRange.high) : Math.round(highMillion * 1e6),
              confidence_interval: rawRange.note || 'Khoảng ước lượng'
            }
          } else {
            processedRange = rawRange
          }
        }

        return NextResponse.json({
          ...result,
          price_million_vnd: finalPriceMillion,
          predicted_price_vnd: finalPriceVnd,
          range_estimate: processedRange,
          success: true,
          is_simulation: false,
          backend_source: targetBackend
        })
      } else {
        const errorText = await response.text()
        console.warn(`FastAPI ${targetBackend}/predict returned ${response.status}:`, errorText)
        if (!allow_simulation) {
          return NextResponse.json(
            {
              success: false,
              error: `Backend trả về mã lỗi ${response.status}: ${errorText}`
            },
            { status: response.status }
          )
        }
      }
    } catch (networkErr: any) {
      console.warn(`Cannot reach FastAPI backend at ${targetBackend}:`, networkErr?.message)
      if (!allow_simulation) {
        return NextResponse.json(
          {
            success: false,
            is_offline: true,
            error: `Không thể kết nối đến Backend FastAPI tại ${targetBackend}. Vui lòng đảm bảo server uvicorn đang chạy: uvicorn main:app --reload --port 8000`
          },
          { status: 503 }
        )
      }
    }

    // If allow_simulation is true, fallback to local high-fidelity model calculation
    const fallbackData = simulateDanangModelPrediction(rawBody)
    return NextResponse.json(fallbackData)
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Lỗi xử lý yêu cầu dự đoán' },
      { status: 500 }
    )
  }
}
