import { NextResponse } from 'next/server'

const DEFAULT_ROOM_METADATA = {
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
    model_name: 'CatBoostRegressor (Dự đoán giá phòng trọ)',
    framework: 'FastAPI + SHAP TreeExplainer',
    version: '2026.1-prod',
    r2_score: 0.884,
    mae_million: 0.28,
    target: 'log(price_vnd) / price_million_vnd',
    property_type: 'room'
  },
  global_feature_importance: [
    { feature: 'size_m2', label: 'Diện tích căn phòng', importance: 0.42 },
    { feature: 'dist_to_cbd', label: 'Khoảng cách trung tâm (CBD)', importance: 0.18 },
    { feature: 'dist_to_beach', label: 'Khoảng cách tới biển', importance: 0.12 },
    { feature: 'furnishing_status', label: 'Nội thất', importance: 0.11 },
    { feature: 'ward_name', label: 'Khu vực / Phường', importance: 0.08 },
    { feature: 'has_elevator', label: 'Thang máy', importance: 0.04 },
    { feature: 'has_balcony', label: 'Ban công', importance: 0.03 },
    { feature: 'dist_to_nearest_uni', label: 'Khoảng cách ĐH gần nhất', importance: 0.02 }
  ]
}

const DEFAULT_APARTMENT_METADATA = {
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
    model_name: 'HistGradientBoostingRegressor (Căn hộ / Chung cư)',
    framework: 'FastAPI + SHAP PermutationExplainer',
    version: '2026.1-prod',
    r2_score: 0.862,
    mae_million: 0.72,
    target: 'log(price_vnd) / price_million_vnd',
    property_type: 'apartment'
  },
  global_feature_importance: [
    { feature: 'size_m2', label: 'Diện tích (m²)', importance: 0.36 },
    { feature: 'rooms', label: 'Số phòng ngủ / Không gian', importance: 0.24 },
    { feature: 'dist_to_beach', label: 'Khoảng cách tới biển (km)', importance: 0.14 },
    { feature: 'dist_to_cbd', label: 'Khoảng cách tới trung tâm (km)', importance: 0.11 },
    { feature: 'furnishing_status', label: 'Tình trạng nội thất', importance: 0.07 },
    { feature: 'has_elevator', label: 'Thang máy', importance: 0.04 },
    { feature: 'has_balcony', label: 'Ban công', importance: 0.02 },
    { feature: 'dist_to_nearest_uni', label: 'Khoảng cách tới ĐH', importance: 0.02 }
  ]
}

// Candidates to connect (IPv4 127.0.0.1 is prioritized over localhost to prevent Windows Node.js IPv6 ::1 lookup failure)
function getBackendUrls(): string[] {
  const envUrl = process.env.FASTAPI_BACKEND_URL
  const urls: string[] = []
  if (envUrl) urls.push(envUrl.replace(/\/$/, ''))
  urls.push('http://127.0.0.1:8000')
  urls.push('http://localhost:8000')
  return Array.from(new Set(urls))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const requestedType = searchParams.get('property_type')
  const propertyType = (requestedType === 'apartment' || requestedType === 'canho' || requestedType === 'căn hộ')
    ? 'apartment'
    : 'room'

  const candidateUrls = getBackendUrls()

  for (const backendUrl of candidateUrls) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)

      const targetEndpoint = `${backendUrl}/meta?property_type=${propertyType}`
      const response = await fetch(targetEndpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
        cache: 'no-store'
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        console.log(`[Next.js API] Connected to FastAPI backend: ${targetEndpoint}`)
        return NextResponse.json({
          ...data,
          property_type: propertyType,
          backend_source: backendUrl,
          is_backend_online: true
        })
      }
    } catch {
      // Try next candidate
    }
  }

  console.warn(`[Next.js API] FastAPI backend unreachable at ${candidateUrls.join(', ')}. Using default fallback metadata.`)
  const fallback = propertyType === 'apartment' ? DEFAULT_APARTMENT_METADATA : DEFAULT_ROOM_METADATA
  return NextResponse.json({
    ...fallback,
    property_type: propertyType,
    is_backend_online: false,
    message: 'Backend FastAPI chưa khởi động hoặc chưa phản hồi. Đang sử dụng metadata mặc định.'
  })
}
