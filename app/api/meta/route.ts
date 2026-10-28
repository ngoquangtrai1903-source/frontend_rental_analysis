import { NextResponse } from 'next/server'

const DEFAULT_METADATA = {
  ward_values: [
    'An Hải',
    'An Khê',
    'Cẩm Lệ',
    'Hải Châu',
    'Hòa Cường',
    'Hòa Khánh',
    'Hòa Xuân',
    'Liên Chiểu',
    'Ngũ Hành Sơn',
    'Sơn Trà',
    'Thanh Khê'
  ],
  nearest_beach_code_values: [
    'BacMyAn',
    'BaiBac',
    'BaiBut_BaiRang',
    'LangVan',
    'MyKhe',
    'NamO',
    'NonNuoc',
    'PhamVanDong',
    'SonThuy',
    'ThanhBinh',
    'TienSa',
    'XuanThieu'
  ],
  nearest_beach_display_values: [
    'Bắc Mỹ An',
    'Bãi Bắc',
    'Bãi Bụt - Bãi Rạng',
    'Làng Vân',
    'Mỹ Khê',
    'Nam Ô',
    'Non Nước',
    'Phạm Văn Đồng',
    'Sơn Thủy',
    'Thanh Bình',
    'Tiên Sa',
    'Xuân Thiều'
  ],
  nearest_uni_code_values: [
    'DAU',
    'DTU_HK',
    'DTU_NVL',
    'DUE',
    'DUT',
    'FPTU',
    'SMP',
    'UDA',
    'UED',
    'UFLS',
    'UPES3',
    'UPU',
    'UTE',
    'VKU',
    'VNUK'
  ],
  furnishing_status_values: [
    'Không nội thất',
    'Nội thất cơ bản',
    'Đầy đủ nội thất',
    'Nội thất cao cấp'
  ],
  model_info: {
    model_name: 'CatBoost Regressor / ExtraTrees',
    framework: 'FastAPI + SHAP TreeExplainer',
    version: '2026.1-prod',
    r2_score: 0.884,
    mae_million: 0.28,
    target: 'log(price_vnd) / price_million_vnd'
  },
  global_feature_importance: [
    { feature: 'size_m2', label: 'Diện tích căn phòng', importance: 0.42 },
    { feature: 'dist_to_cbd', label: 'Khoảng cách tới trung tâm', importance: 0.18 },
    { feature: 'dist_to_beach', label: 'Khoảng cách tới biển', importance: 0.12 },
    { feature: 'furnishing_status', label: 'Tình trạng nội thất', importance: 0.10 },
    { feature: 'dist_to_nearest_uni', label: 'Khoảng cách tới ĐH', importance: 0.08 },
    { feature: 'has_elevator', label: 'Thang máy', importance: 0.04 },
    { feature: 'has_balcony', label: 'Ban công', importance: 0.03 },
    { feature: 'has_window', label: 'Cửa sổ', importance: 0.03 }
  ]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const backendUrl = searchParams.get('backend_url') || process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000'

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const response = await fetch(`${backendUrl}/meta`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-store'
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        ...data,
        is_backend_online: true,
        backend_url: backendUrl
      })
    }
  } catch (err: any) {
    // Backend offline or timeout - provide fallback metadata so frontend doesn't crash
  }

  return NextResponse.json({
    ...DEFAULT_METADATA,
    is_backend_online: false,
    backend_url: backendUrl,
    message: 'Backend FastAPI chưa khởi động hoặc chưa phản hồi. Đang sử dụng metadata mặc định.'
  })
}
