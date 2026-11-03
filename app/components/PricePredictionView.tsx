'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Calculator,
  Building2,
  MapPin,
  Compass,
  GraduationCap,
  Waves,
  Armchair,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  TrendingUp,
  TrendingDown,
  Info,
  Maximize2,
  Layers,
  Check,
  HelpCircle,
  Server,
  ArrowRight,
  ShieldCheck,
  Activity,
  Lightbulb,
  Navigation
} from 'lucide-react'

// Standard Ward list for Da Nang (11 wards according to requirement)
export const STANDARD_WARDS = [
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
]

// Standard Furnishing Status options
export const STANDARD_FURNISHING = [
  'Không nội thất',
  'Nội thất cơ bản',
  'Đầy đủ nội thất',
  'Nội thất cao cấp'
]

export interface BeachOption {
  code: string
  label: string
}

// 12 Standard Da Nang Beach options with Vietnamese label and backend code mapping
export const STANDARD_BEACHES: BeachOption[] = [
  { label: 'Bắc Mỹ An', code: 'BacMyAn' },
  { label: 'Bãi Bắc', code: 'BaiBac' },
  { label: 'Bãi Bụt - Bãi Rạng', code: 'BaiBut_BaiRang' },
  { label: 'Làng Vân', code: 'LangVan' },
  { label: 'Mỹ Khê', code: 'MyKhe' },
  { label: 'Nam Ô', code: 'NamO' },
  { label: 'Non Nước', code: 'NonNuoc' },
  { label: 'Phạm Văn Đồng', code: 'PhamVanDong' },
  { label: 'Sơn Thủy', code: 'SonThuy' },
  { label: 'Tân Trà', code: 'TanTra' },
  { label: 'Thanh Bình', code: 'ThanhBinh' },
  { label: 'Tiên Sa', code: 'TienSa' },
  { label: 'Xuân Thiều', code: 'XuanThieu' }
]

export const BEACH_CODE_TO_LABEL: Record<string, string> = {
  BacMyAn: 'Bắc Mỹ An',
  BaiBac: 'Bãi Bắc',
  BaiBut_BaiRang: 'Bãi Bụt - Bãi Rạng',
  LangVan: 'Làng Vân',
  MyKhe: 'Mỹ Khê',
  NamO: 'Nam Ô',
  NonNuoc: 'Non Nước',
  PhamVanDong: 'Phạm Văn Đồng',
  SonThuy: 'Sơn Thủy',
  TanTra: 'Tân Trà',
  ThanhBinh: 'Thanh Bình',
  TienSa: 'Tiên Sa',
  XuanThieu: 'Xuân Thiều'
}

export const BEACH_LABEL_TO_CODE: Record<string, string> = {
  'Bắc Mỹ An': 'BacMyAn',
  'Bãi Bắc': 'BaiBac',
  'Bãi Bụt - Bãi Rạng': 'BaiBut_BaiRang',
  'Làng Vân': 'LangVan',
  'Mỹ Khê': 'MyKhe',
  'Nam Ô': 'NamO',
  'Non Nước': 'NonNuoc',
  'Phạm Văn Đồng': 'PhamVanDong',
  'Sơn Thủy': 'SonThuy',
  'Tân Trà': 'TanTra',
  'Thanh Bình': 'ThanhBinh',
  'Tiên Sa': 'TienSa',
  'Xuân Thiều': 'XuanThieu'
}

export interface WardGeoProfile {
  group: 'central' | 'coastal' | 'north' | 'southeast'
  groupName: string
  defaultDistCbd: number
  rangeDistCbd: [number, number]
  defaultDistBeach: number
  rangeDistBeach: [number, number]
  defaultDistUni: number
  rangeDistUni: [number, number]
  preferredUnis: string[]
  defaultUni: string
  preferredBeaches: string[]
  defaultBeach: string
  hint: string
}

// 11 Da Nang Ward geographic profiles with real urban context and preferred hotspots
export const WARD_PROFILES: Record<string, WardGeoProfile> = {
  'Hải Châu': {
    group: 'central',
    groupName: 'Quận Trung tâm (CBD)',
    defaultDistCbd: 1.0,
    rangeDistCbd: [0.3, 4.0],
    defaultDistBeach: 2.8,
    rangeDistBeach: [1.5, 5.0],
    defaultDistUni: 1.2,
    rangeDistUni: [0.3, 3.5],
    preferredUnis: ['DTU_NVL', 'DAU', 'UDA', 'DUE', 'VNUK'],
    defaultUni: 'DTU_NVL',
    preferredBeaches: ['PhamVanDong', 'MyKhe', 'ThanhBinh'],
    defaultBeach: 'PhamVanDong',
    hint: 'Trung tâm hành chính & thương mại Đà Nẵng, giáp Cầu Rồng / sông Hàn'
  },
  'Thanh Khê': {
    group: 'central',
    groupName: 'Quận Trung tâm',
    defaultDistCbd: 2.5,
    rangeDistCbd: [1.0, 4.5],
    defaultDistBeach: 1.5,
    rangeDistBeach: [0.3, 3.5],
    defaultDistUni: 1.0,
    rangeDistUni: [0.3, 3.0],
    preferredUnis: ['UTE', 'DTU_NVL', 'DUE', 'DAU'],
    defaultUni: 'UTE',
    preferredBeaches: ['ThanhBinh', 'PhamVanDong', 'MyKhe'],
    defaultBeach: 'ThanhBinh',
    hint: 'Khu dân cư sầm uất, gần ga Đà Nẵng, ĐH Sư Phạm Kỹ Thuật & biển Thanh Bình'
  },
  'An Khê': {
    group: 'central',
    groupName: 'Quận Thanh Khê (Phía Tây)',
    defaultDistCbd: 3.8,
    rangeDistCbd: [2.0, 5.0],
    defaultDistBeach: 2.5,
    rangeDistBeach: [1.0, 4.5],
    defaultDistUni: 1.8,
    rangeDistUni: [0.5, 4.0],
    preferredUnis: ['UTE', 'DTU_NVL', 'DUE'],
    defaultUni: 'UTE',
    preferredBeaches: ['ThanhBinh', 'PhamVanDong'],
    defaultBeach: 'ThanhBinh',
    hint: 'Phía Tây quận Thanh Khê, gần sân bay Đà Nẵng & trục Điện Biên Phủ'
  },
  'Hòa Cường': {
    group: 'central',
    groupName: 'Cụm Làng ĐH Trung tâm (Hải Châu Nam)',
    defaultDistCbd: 2.2,
    rangeDistCbd: [1.5, 4.0],
    defaultDistBeach: 3.5,
    rangeDistBeach: [2.0, 5.0],
    defaultDistUni: 0.8,
    rangeDistUni: [0.2, 2.5],
    preferredUnis: ['DAU', 'UDA', 'UFLS', 'DTU_NVL', 'DUE'],
    defaultUni: 'DAU',
    preferredBeaches: ['MyKhe', 'BacMyAn'],
    defaultBeach: 'MyKhe',
    hint: 'Cụm trường ĐH lớn: Kiến Trúc (DAU), Đông Á (UDA), Ngoại Ngữ'
  },
  'Cẩm Lệ': {
    group: 'central',
    groupName: 'Quận Cẩm Lệ (Phía Nam TT)',
    defaultDistCbd: 4.5,
    rangeDistCbd: [2.5, 6.5],
    defaultDistBeach: 6.0,
    rangeDistBeach: [4.0, 8.5],
    defaultDistUni: 2.0,
    rangeDistUni: [0.5, 4.0],
    preferredUnis: ['DAU', 'UDA', 'DUE', 'SMP'],
    defaultUni: 'DAU',
    preferredBeaches: ['MyKhe', 'BacMyAn', 'ThanhBinh'],
    defaultBeach: 'MyKhe',
    hint: 'Khu vực phía Nam trung tâm, gần cầu Cẩm Lệ, chợ Cẩm Lệ & ĐH Kiến Trúc'
  },
  'An Hải': {
    group: 'coastal',
    groupName: 'Phường Ven Biển / Du Lịch (Sơn Trà)',
    defaultDistCbd: 1.8,
    rangeDistCbd: [1.0, 3.5],
    defaultDistBeach: 0.8,
    rangeDistBeach: [0.2, 2.0],
    defaultDistUni: 2.2,
    rangeDistUni: [0.8, 4.0],
    preferredUnis: ['DUE', 'VNUK', 'DTU_NVL'],
    defaultUni: 'DUE',
    preferredBeaches: ['PhamVanDong', 'MyKhe', 'TienSa'],
    defaultBeach: 'PhamVanDong',
    hint: 'Khu du lịch & khách sạn biển Phạm Văn Đồng, ven sông Hàn gần Cầu Rồng'
  },
  'Sơn Trà': {
    group: 'coastal',
    groupName: 'Quận Ven Biển / Bán Đảo Sơn Trà',
    defaultDistCbd: 3.5,
    rangeDistCbd: [2.0, 6.0],
    defaultDistBeach: 0.6,
    rangeDistBeach: [0.1, 2.0],
    defaultDistUni: 3.0,
    rangeDistUni: [1.0, 5.0],
    preferredUnis: ['DUE', 'VNUK', 'DTU_NVL'],
    defaultUni: 'DUE',
    preferredBeaches: ['MyKhe', 'PhamVanDong', 'TienSa', 'BaiBac', 'BaiBut_BaiRang'],
    defaultBeach: 'MyKhe',
    hint: 'Bờ biển du lịch Mỹ Khê / Phạm Văn Đồng & bán đảo Sơn Trà'
  },
  'Hòa Khánh': {
    group: 'north',
    groupName: 'Khu Vực Phía Bắc / Cụm ĐH Bách Khoa',
    defaultDistCbd: 8.5,
    rangeDistCbd: [5.0, 12.0],
    defaultDistBeach: 2.0,
    rangeDistBeach: [0.5, 4.5],
    defaultDistUni: 0.5,
    rangeDistUni: [0.1, 2.5],
    preferredUnis: ['DUT', 'UED', 'DTU_HK'],
    defaultUni: 'DUT',
    preferredBeaches: ['XuanThieu', 'NamO', 'ThanhBinh'],
    defaultBeach: 'XuanThieu',
    hint: 'Thủ phủ phòng trọ sinh viên: gần ĐH Bách Khoa (DUT), ĐH Sư Phạm (UED)'
  },
  'Liên Chiểu': {
    group: 'north',
    groupName: 'Quận Phía Bắc (Cửa ngõ Tây Bắc)',
    defaultDistCbd: 9.5,
    rangeDistCbd: [5.0, 14.0],
    defaultDistBeach: 1.5,
    rangeDistBeach: [0.3, 5.0],
    defaultDistUni: 1.0,
    rangeDistUni: [0.2, 3.5],
    preferredUnis: ['DUT', 'UED', 'DTU_HK'],
    defaultUni: 'DUT',
    preferredBeaches: ['XuanThieu', 'NamO', 'LangVan', 'ThanhBinh'],
    defaultBeach: 'NamO',
    hint: 'Gần vịnh Đà Nẵng, bãi tắm Xuân Thiều, Nam Ô & ĐH Bách Khoa'
  },
  'Ngũ Hành Sơn': {
    group: 'southeast',
    groupName: 'Khu Vực Phía Đông Nam / ĐH Kinh Tế & FPT',
    defaultDistCbd: 6.5,
    rangeDistCbd: [4.0, 10.0],
    defaultDistBeach: 1.0,
    rangeDistBeach: [0.2, 3.0],
    defaultDistUni: 1.2,
    rangeDistUni: [0.3, 4.0],
    preferredUnis: ['DUE', 'FPTU', 'VKU', 'SMP'],
    defaultUni: 'DUE',
    preferredBeaches: ['BacMyAn', 'NonNuoc', 'SonThuy', 'TanTra', 'MyKhe'],
    defaultBeach: 'BacMyAn',
    hint: 'Cụm ĐH Kinh Tế (DUE), ĐH FPT, ĐH Việt-Hàn (VKU) & bãi biển Non Nước'
  },
  'Hòa Xuân': {
    group: 'southeast',
    groupName: 'Khu Đô Thị Nam Cẩm Lệ / Hòa Xuân',
    defaultDistCbd: 6.8,
    rangeDistCbd: [4.5, 9.5],
    defaultDistBeach: 6.0,
    rangeDistBeach: [3.5, 8.5],
    defaultDistUni: 2.8,
    rangeDistUni: [1.0, 5.5],
    preferredUnis: ['DUE', 'SMP', 'VKU', 'FPTU', 'DAU'],
    defaultUni: 'DUE',
    preferredBeaches: ['BacMyAn', 'SonThuy', 'NonNuoc'],
    defaultBeach: 'BacMyAn',
    hint: 'Khu đô thị sinh thái Nam Cầu Cẩm Lệ, kết nối thuận lợi sang Ngũ Hành Sơn'
  }
}

// Dictionary of University names for user clarity
export const UNI_LABELS: Record<string, string> = {
  DUT: 'DUT - ĐH Bách Khoa (Đà Nẵng)',
  DUE: 'DUE - ĐH Kinh Tế (Đà Nẵng)',
  UED: 'UED - ĐH Sư Phạm (Đà Nẵng)',
  UFLS: 'UFLS - ĐH Ngoại Ngữ (Đà Nẵng)',
  UTE: 'UTE - ĐH Sư Phạm Kỹ Thuật (Đà Nẵng)',
  VKU: 'VKU - ĐH CNTT & Truyền Thông Việt - Hàn',
  VNUK: 'VNUK - Viện NC & Đào Tạo Việt - Anh',
  DAU: 'DAU - ĐH Kiến Trúc Đà Nẵng',
  DTU_HK: 'DTU_HK - ĐH Duy Tân (Cơ sở Hòa Khánh)',
  DTU_NVL: 'DTU_NVL - ĐH Duy Tân (Nguyễn Văn Linh)',
  FPTU: 'FPTU - ĐH FPT Đà Nẵng (Ngũ Hành Sơn)',
  UDA: 'UDA - ĐH Đông Á (Hải Châu)',
  SMP: 'SMP - Khoa Y Dược (ĐH Đà Nẵng)',
  UPES3: 'UPES3 - ĐH Thể Dục Thể Thao Đà Nẵng',
  PU: 'Học Viện Chính Trị Khu Vực III',
  UPU: 'UPU - Học Viện Chính Trị Khu Vực III'
}

export interface ContributionItem {
  feature?: string
  label: string
  value: string | number
  pct_effect: string | number
  vnd_effect: number
  direction: 'tăng giá' | 'giảm giá' | 'trung lập' | string
  shap_log?: number
}

export interface PredictionResult {
  predicted_price_vnd?: number
  price_million_vnd: number
  range_estimate?: {
    low: number
    high: number
    low_vnd?: number
    high_vnd?: number
    confidence_interval?: string
  } | [number, number] | string
  explanation?: {
    base_value_vnd?: number
    base_value_million?: number
    contributions: ContributionItem[]
  }
  model_metadata?: {
    model_name?: string
    explainer?: string
    features_used?: number
  }
  is_simulation?: boolean
}

export function normalizePredictionResponse(raw: any): PredictionResult {
  const data = raw?.data || raw?.result || raw || {}
  const predObj = (typeof data.prediction === 'object' && data.prediction !== null) ? data.prediction : {}

  // 1. Extract price in Million VND (supports nested data.prediction and root level)
  let priceMillion = 0
  if (typeof predObj.price_million_vnd === 'number') {
    priceMillion = predObj.price_million_vnd
  } else if (typeof data.price_million_vnd === 'number') {
    priceMillion = data.price_million_vnd
  } else if (typeof predObj.price_million_vnd === 'string') {
    priceMillion = parseFloat(predObj.price_million_vnd) || 0
  } else if (typeof data.price_million_vnd === 'string') {
    priceMillion = parseFloat(data.price_million_vnd) || 0
  } else if (typeof predObj.price_vnd === 'number') {
    priceMillion = Number((predObj.price_vnd / 1e6).toFixed(2))
  } else if (typeof data.predicted_price_vnd === 'number') {
    priceMillion = Number((data.predicted_price_vnd / 1e6).toFixed(2))
  } else if (typeof data.price_vnd === 'number') {
    priceMillion = Number((data.price_vnd / 1e6).toFixed(2))
  } else if (typeof data.predicted_price_million === 'number') {
    priceMillion = data.predicted_price_million
  } else if (typeof data.predicted_price_million === 'string') {
    priceMillion = parseFloat(data.predicted_price_million) || 0
  } else if (typeof data.price_million === 'number') {
    priceMillion = data.price_million
  } else if (typeof data.predicted_price === 'number') {
    priceMillion = data.predicted_price > 1000 ? Number((data.predicted_price / 1e6).toFixed(2)) : data.predicted_price
  } else if (typeof data.prediction === 'number') {
    priceMillion = data.prediction > 1000 ? Number((data.prediction / 1e6).toFixed(2)) : data.prediction
  } else if (typeof data.price === 'number') {
    priceMillion = data.price > 1000 ? Number((data.price / 1e6).toFixed(2)) : data.price
  }

  // 2. Extract price in VND
  let priceVnd = 0
  if (typeof predObj.price_vnd === 'number') {
    priceVnd = Math.round(predObj.price_vnd)
  } else if (typeof data.predicted_price_vnd === 'number') {
    priceVnd = Math.round(data.predicted_price_vnd)
  } else if (typeof data.price_vnd === 'number') {
    priceVnd = Math.round(data.price_vnd)
  } else if (priceMillion > 0) {
    priceVnd = Math.round(priceMillion * 1e6)
  }

  // 3. Range estimate (handles VND range like in main.py)
  const rawRange = predObj.range_estimate || data.range_estimate || data.range || data.price_range
  let rangeEstimate: any = null
  if (rawRange) {
    if (typeof rawRange === 'object' && rawRange.low !== undefined && rawRange.high !== undefined) {
      const isVnd = rawRange.low > 1000
      const lowMillion = isVnd ? Number((rawRange.low / 1e6).toFixed(2)) : Number(rawRange.low)
      const highMillion = isVnd ? Number((rawRange.high / 1e6).toFixed(2)) : Number(rawRange.high)
      rangeEstimate = {
        low: lowMillion,
        high: highMillion,
        low_vnd: isVnd ? Math.round(rawRange.low) : Math.round(lowMillion * 1e6),
        high_vnd: isVnd ? Math.round(rawRange.high) : Math.round(highMillion * 1e6),
        confidence_interval: rawRange.note || 'Khoảng ước lượng'
      }
    } else {
      rangeEstimate = rawRange
    }
  } else if (priceMillion > 0) {
    const low = Number((priceMillion * 0.92).toFixed(2))
    const high = Number((priceMillion * 1.08).toFixed(2))
    rangeEstimate = {
      low,
      high,
      low_vnd: Math.round(low * 1e6),
      high_vnd: Math.round(high * 1e6),
      confidence_interval: 'Khoảng ước lượng'
    }
  }

  // 4. Explanation & contributions
  const rawExplanation = data.explanation || data.shap_explanation || {}
  const rawContributions =
    rawExplanation.contributions ||
    data.contributions ||
    data.shap_values ||
    data.feature_contributions ||
    []

  const contributions: ContributionItem[] = Array.isArray(rawContributions)
    ? rawContributions.map((c: any) => {
        const label = c.label || c.feature_name || c.feature || 'Thuộc tính'
        const value = c.value !== undefined ? c.value : '-'
        const vnd_effect = typeof c.vnd_effect === 'number' ? Math.round(c.vnd_effect) : Math.round(parseFloat(c.vnd_effect) || 0)
        let pct_effect = ''
        if (typeof c.pct_effect === 'number') {
          pct_effect = `${c.pct_effect >= 0 ? '+' : ''}${c.pct_effect.toFixed(1)}%`
        } else if (c.pct_effect !== undefined) {
          pct_effect = String(c.pct_effect)
        } else {
          pct_effect = `${vnd_effect >= 0 ? '+' : ''}${((vnd_effect / (priceVnd || 2850000)) * 100).toFixed(1)}%`
        }
        let direction = c.direction
        if (!direction) {
          direction = vnd_effect > 0 ? 'tăng giá' : vnd_effect < 0 ? 'giảm giá' : 'trung lập'
        }
        return {
          feature: c.feature,
          label,
          value,
          pct_effect,
          vnd_effect,
          direction,
          shap_log: typeof c.shap_log === 'number' ? c.shap_log : undefined
        }
      })
    : []

  const base_value_vnd =
    rawExplanation.base_value_vnd ||
    data.base_value_vnd ||
    rawExplanation.base_price ||
    data.base_price ||
    2850000

  return {
    ...data,
    price_million_vnd: priceMillion,
    predicted_price_vnd: priceVnd,
    range_estimate: rangeEstimate,
    explanation: {
      base_value_vnd,
      base_value_million: Number((base_value_vnd / 1000000).toFixed(2)),
      contributions
    },
    model_metadata: data.model_metadata || {
      model_name: data.model_name || 'FastAPI Machine Learning'
    }
  }
}

export interface PricePredictionViewProps {
  lang?: 'vi' | 'en'
}

export const UNI_LABELS_EN: Record<string, string> = {
  DUT: 'DUT - Da Nang Univ. of Science & Technology',
  UED: 'UED - Da Nang Univ. of Education',
  DUE: 'DUE - Univ. of Economics (Da Nang)',
  UFLS: 'UFLS - Univ. of Foreign Languages',
  UTE: 'UTE - Univ. of Technology & Education',
  VKU: 'VKU - Vietnam-Korea IT University',
  VNUK: 'VNUK - VN-UK Institute for Research & Exec.',
  DAU: 'DAU - Da Nang Architecture University',
  DTU_HK: 'DTU_HK - Duy Tan Univ. (Hoa Khanh)',
  DTU_NVL: 'DTU_NVL - Duy Tan Univ. (Nguyen Van Linh)',
  FPTU: 'FPTU - FPT University Da Nang',
  UDA: 'UDA - Dong A University (Hai Chau)',
  SMP: 'SMP - School of Medicine & Pharmacy',
  UPES3: 'UPES3 - Univ. of Sports & Physical Education',
  PU: 'Regional Academy of Politics III',
  UPU: 'UPU - Regional Academy of Politics III'
}

export const WARD_GEO_PROFILES_EN: Record<string, { groupName: string; hint: string }> = {
  'Hải Châu': {
    groupName: 'Central District (CBD)',
    hint: 'Administrative & commercial center of Da Nang, adjacent to Dragon Bridge / Han River'
  },
  'Thanh Khê': {
    groupName: 'Central District',
    hint: 'Vibrant residential area, near Da Nang station, Tech Univ. & Thanh Binh beach'
  },
  'An Khê': {
    groupName: 'Thanh Khe District (West)',
    hint: 'Western Thanh Khe, near Da Nang airport & Dien Bien Phu artery'
  },
  'Hòa Cường': {
    groupName: 'Central Campus Cluster (South Hai Chau)',
    hint: 'Major university cluster: Architecture (DAU), Dong A (UDA), Foreign Lang.'
  },
  'Cẩm Lệ': {
    groupName: 'Cam Le District (South of Center)',
    hint: 'South of center, near Cam Le bridge, market & Architecture Univ.'
  },
  'An Hải': {
    groupName: 'Coastal / Tourism Ward (Son Tra)',
    hint: 'Pham Van Dong beach hotel & tourism zone, along Han River near Dragon Bridge'
  },
  'Sơn Trà': {
    groupName: 'Coastal / Son Tra Peninsula District',
    hint: 'My Khe / Pham Van Dong tourist coastline & Son Tra peninsula'
  },
  'Hòa Khánh': {
    groupName: 'Northern Area / PolyTech Univ. Cluster',
    hint: 'Student rental hub: near PolyTech Univ. (DUT), Pedagogical Univ. (UED)'
  },
  'Liên Chiểu': {
    groupName: 'Northern District (Northwest Gateway)',
    hint: 'Near Da Nang Bay, Xuan Thieu beach, Nam O & PolyTech Univ.'
  },
  'Ngũ Hành Sơn': {
    groupName: 'Southeastern Area / Economics Univ. & FPT',
    hint: 'Economics Univ. (DUE), FPT Univ., VKU & Non Nuoc beach'
  },
  'Hòa Xuân': {
    groupName: 'South Cam Le Eco-Urban / Hoa Xuan',
    hint: 'Eco-urban zone South of Cam Le bridge, convenient link to Ngu Hanh Son'
  }
}

export function translateFeatureLabel(label: string, isEn = false): string {
  if (!isEn || !label) return label
  const l = label.toLowerCase()
  if (l.includes('diện tích')) return 'Room Size'
  if (l.includes('nội thất')) return 'Furnishing & Interior'
  if (l.includes('khu vực') || l.includes('phường')) return 'Ward / District'
  if (l.includes('khoảng cách đến cbd') || l.includes('cbd')) return 'Distance to CBD'
  if (l.includes('thang máy')) return 'Elevator'
  if (l.includes('biển')) return 'Distance to Beach'
  if (l.includes('ban công')) return 'Balcony'
  if (l.includes('đại học') || l.includes('trường')) return 'Distance to University'
  if (l.includes('cửa sổ')) return 'Window'
  if (l.includes('bãi biển')) return 'Nearest Beach'
  if (l.includes('thuộc tính')) return 'Feature'
  return label
}

export function translateFurnishing(status: string, isEn = false): string {
  if (!isEn) return status
  if (status.includes('Không')) return 'Unfurnished'
  if (status.includes('cơ bản')) return 'Semi-furnished'
  if (status.includes('Đầy đủ')) return 'Fully furnished'
  if (status.includes('cao cấp')) return 'Luxury furnishing'
  return status
}

export default function PricePredictionView({ lang = 'vi' }: PricePredictionViewProps = {}) {
  const isEn = lang === 'en'
  // Backend connection & metadata states
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null)
  const [checkingBackend, setCheckingBackend] = useState(false)

  // Options loaded from GET /meta
  const [wardOptions, setWardOptions] = useState<string[]>(STANDARD_WARDS)
  const [beachOptions, setBeachOptions] = useState<BeachOption[]>(STANDARD_BEACHES)
  const [uniCodeOptions, setUniCodeOptions] = useState<string[]>([
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
  ])
  const [furnishingOptions, setFurnishingOptions] = useState<string[]>(STANDARD_FURNISHING)

  const [modelInfo, setModelInfo] = useState<{
    model_name?: string
    version?: string
    r2_score?: number
    mae_million?: number
  } | null>(null)

  // Form input states
  const [sizeM2, setSizeM2] = useState<number>(25)
  const [distToCbd, setDistToCbd] = useState<number>(3.5)
  const [distToBeach, setDistToBeach] = useState<number>(2.0)
  const [distToUni, setDistToUni] = useState<number>(1.2)
  const [hasBalcony, setHasBalcony] = useState<number>(1)
  const [hasElevator, setHasElevator] = useState<number>(0)
  const [hasWindow, setHasWindow] = useState<number>(1)
  const [furnishingStatus, setFurnishingStatus] = useState<string>('Đầy đủ nội thất')
  const [wardName, setWardName] = useState<string>('Hải Châu')
  const [nearestBeachCode, setNearestBeachCode] = useState<string>('PhamVanDong')
  const [nearestUniCode, setNearestUniCode] = useState<string>('DTU_NVL')

  // Smart defaults & geographical logic state
  const [enableSmartDefaults, setEnableSmartDefaults] = useState<boolean>(true)
  const [smartNotice, setSmartNotice] = useState<string | null>(null)

  // Execution & Output states
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [shapFilter, setShapFilter] = useState<'all' | 'positive' | 'negative'>('all')

  // Current selected ward profile
  const currentWardProfile = useMemo(() => {
    const p = WARD_PROFILES[wardName] || null
    if (!p) return null
    if (isEn && WARD_GEO_PROFILES_EN[wardName]) {
      return {
        ...p,
        groupName: WARD_GEO_PROFILES_EN[wardName].groupName,
        hint: WARD_GEO_PROFILES_EN[wardName].hint
      }
    }
    return p
  }, [wardName, isEn])

  // Hard input validation rules (Min/Max based on Da Nang reality)
  const sizeError = useMemo(() => {
    if (sizeM2 <= 0) return isEn ? 'Room size must be greater than 0 m².' : 'Diện tích phòng trọ phải lớn hơn 0 m².'
    if (sizeM2 < 5) return isEn ? 'Minimum room size is 5 m².' : 'Diện tích phòng tối thiểu phải từ 5 m².'
    if (sizeM2 > 80) return isEn ? 'Maximum recommended room size is 80 m².' : 'Diện tích phòng trọ tối đa khuyến nghị 80 m² (vượt quá chuẩn phòng trọ phổ biến).'
    return null
  }, [sizeM2, isEn])

  const cbdError = useMemo(() => {
    if (distToCbd < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToCbd > 20) return isEn ? 'Distance exceeds geographic bounds in Da Nang (max ~20km).' : 'Khoảng cách vượt quá giới hạn địa lý thực tế tại Đà Nẵng (tối đa ~20km).'
    return null
  }, [distToCbd, isEn])

  const beachError = useMemo(() => {
    if (distToBeach < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToBeach > 12) return isEn ? 'Distance to beach exceeds Da Nang bounds (max ~12km).' : 'Khoảng cách tới biển vượt quá giới hạn địa lý Đà Nẵng (tối đa ~12km).'
    return null
  }, [distToBeach, isEn])

  const uniError = useMemo(() => {
    if (distToUni < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToUni > 10) return isEn ? 'Distance to university exceeds practical bounds in Da Nang (max ~10km).' : 'Khoảng cách tới trường ĐH vượt quá giới hạn thực tế tại Đà Nẵng (tối đa ~10km).'
    return null
  }, [distToUni, isEn])

  const hasHardErrors = Boolean(sizeError || cbdError || beachError || uniError)

  // Soft Warnings (Cảnh báo mềm & gợi ý tương quan Phường/Xã)
  const cbdWarning = useMemo(() => {
    if (cbdError || !currentWardProfile) return null
    if (currentWardProfile.group === 'central' && distToCbd > 6.0) {
      return `Lưu ý: Phường ${wardName} thuộc khu vực trung tâm, khoảng cách tới CBD thường chỉ từ 0.5 - 4.5km (tối đa ~6km).`
    }
    if (currentWardProfile.group === 'north' && distToCbd < 3.0) {
      return `Lưu ý: Khu vực ${wardName} thuộc cửa ngõ Tây Bắc, khoảng cách tới trung tâm (CBD) thường từ 5.0 - 12.0km.`
    }
    return null
  }, [cbdError, currentWardProfile, distToCbd, wardName])

  const beachWarning = useMemo(() => {
    if (beachError || !currentWardProfile) return null
    if (currentWardProfile.group === 'coastal' && distToBeach > 3.0) {
      return `Lưu ý: Phường ${wardName} nằm ven biển, cự ly ra bãi tắm thông thường chỉ 0.1 - 2.0km.`
    }
    return null
  }, [beachError, currentWardProfile, distToBeach, wardName])

  const beachChoiceWarning = useMemo(() => {
    if (!currentWardProfile) return null
    if (currentWardProfile.group === 'coastal') {
      const farNorthOrWest = ['XuanThieu', 'NamO', 'LangVan']
      if (farNorthOrWest.includes(nearestBeachCode)) {
        return `Gợi ý: Khu vực ${wardName} gần bãi Mỹ Khê, Phạm Văn Đồng hoặc Tiên Sa hơn.`
      }
    } else if (currentWardProfile.group === 'north') {
      const southBeaches = ['NonNuoc', 'TanTra', 'BacMyAn', 'SonThuy']
      if (southBeaches.includes(nearestBeachCode)) {
        return `Gợi ý: Khu vực Hòa Khánh/Liên Chiểu gần bãi Xuân Thiều, Nam Ô hoặc Thanh Bình hơn.`
      }
    } else if (currentWardProfile.group === 'southeast') {
      const northBeaches = ['XuanThieu', 'NamO', 'LangVan', 'ThanhBinh']
      if (northBeaches.includes(nearestBeachCode)) {
        return `Gợi ý: Phía Ngũ Hành Sơn giáp các bãi tắm: Bắc Mỹ An, Non Nước, Sơn Thủy, Tân Trà.`
      }
    }
    return null
  }, [currentWardProfile, nearestBeachCode, wardName])

  const uniWarning = useMemo(() => {
    if (!currentWardProfile) return null
    if (currentWardProfile.group === 'north') {
      const southUnis = ['FPTU', 'VKU', 'SMP']
      if (southUnis.includes(nearestUniCode)) {
        return `Gợi ý: Cụm ${wardName} gần ĐH Bách Khoa (DUT), ĐH Sư Phạm (UED) hoặc Duy Tân HK hơn so với ${UNI_LABELS[nearestUniCode] || nearestUniCode}.`
      }
    } else if (currentWardProfile.group === 'southeast') {
      const northUnis = ['DUT', 'UED', 'DTU_HK']
      if (northUnis.includes(nearestUniCode)) {
        return `Gợi ý: Khu vực Ngũ Hành Sơn / Hòa Xuân gần ĐH Kinh Tế (DUE), ĐH FPT (FPTU), ĐH Việt-Hàn (VKU) hơn.`
      }
    } else if (currentWardProfile.group === 'central') {
      const farUnis = ['DUT', 'UED', 'FPTU', 'VKU']
      if (farUnis.includes(nearestUniCode)) {
        return `Gợi ý: Cụm trung tâm thường gần: ĐH Duy Tân (NVL), ĐH Kinh Tế (DUE), ĐH Kiến Trúc (DAU), Đông Á (UDA), UTE.`
      }
    }
    return null
  }, [currentWardProfile, nearestUniCode, wardName])

  // Smart defaults handler when ward changes
  const handleWardChange = (newWard: string) => {
    setWardName(newWard)
    if (enableSmartDefaults && WARD_PROFILES[newWard]) {
      const profile = WARD_PROFILES[newWard]
      setDistToCbd(profile.defaultDistCbd)
      setDistToBeach(profile.defaultDistBeach)
      setDistToUni(profile.defaultDistUni)
      if (profile.defaultBeach) setNearestBeachCode(profile.defaultBeach)
      if (profile.defaultUni) setNearestUniCode(profile.defaultUni)
      setSmartNotice(isEn ? `Suggested spatial parameters for ${newWard} (CBD: ${profile.defaultDistCbd}km, Beach: ${profile.defaultDistBeach}km)` : `Đã tự động gợi ý thông số địa lý cho ${newWard} (CBD: ${profile.defaultDistCbd}km, Biển: ${profile.defaultDistBeach}km)`)
    }
  }

  // Quick reset to current ward's profile
  const handleApplyWardProfile = (ward = wardName) => {
    if (WARD_PROFILES[ward]) {
      const profile = WARD_PROFILES[ward]
      setDistToCbd(profile.defaultDistCbd)
      setDistToBeach(profile.defaultDistBeach)
      setDistToUni(profile.defaultDistUni)
      if (profile.defaultBeach) setNearestBeachCode(profile.defaultBeach)
      if (profile.defaultUni) setNearestUniCode(profile.defaultUni)
      setSmartNotice(isEn ? `Applied standard benchmark parameters for ${ward}` : `Đã áp dụng thông số tham chiếu chuẩn cho ${ward}`)
    }
  }

  // 1. Check and Load Metadata on Mount
  const fetchMetadata = async () => {
    setCheckingBackend(true)
    try {
      // Proxy route connects to FastAPI Backend directly
      const res = await fetch('/api/meta')
      if (res.ok) {
        const data = await res.json()

        // 1. Ward options
        if (data.ward_values && Array.isArray(data.ward_values) && data.ward_values.length > 0) {
          setWardOptions(data.ward_values)
        }

        // 2. Beach options with display label mapping
        if (data.nearest_beach_code_values && Array.isArray(data.nearest_beach_code_values)) {
          const parsedBeachOptions: BeachOption[] = data.nearest_beach_code_values.map((item: any) => {
            if (typeof item === 'object' && item.code && item.label) {
              return item
            }
            const val = String(item).trim()
            if (BEACH_CODE_TO_LABEL[val]) {
              return { code: val, label: BEACH_CODE_TO_LABEL[val] }
            }
            if (BEACH_LABEL_TO_CODE[val]) {
              return { code: BEACH_LABEL_TO_CODE[val], label: val }
            }
            return { code: val, label: val }
          })
          setBeachOptions(parsedBeachOptions.length > 0 ? parsedBeachOptions : STANDARD_BEACHES)
        }

        // 3. Uni options
        if (data.nearest_uni_code_values && Array.isArray(data.nearest_uni_code_values)) {
          setUniCodeOptions(data.nearest_uni_code_values)
        }

        // 4. Furnishing options (exclude "Không xác định")
        const rawFurnishing = data.furnishing_values || data.furnishing_status_values
        if (rawFurnishing && Array.isArray(rawFurnishing)) {
          const filtered = rawFurnishing
            .map((f: string) => f.includes('Không xác định') ? null : f)
            .filter(Boolean) as string[]
          setFurnishingOptions(filtered.length > 0 ? filtered : STANDARD_FURNISHING)
        }

        if (data.model || data.model_info) {
          setModelInfo(data.model_info || {
            model_name: data.model,
            r2_score: data.metrics?.cv_r2_log,
            mae_million: data.metrics?.holdout_test?.mae_vnd ? Number((data.metrics.holdout_test.mae_vnd / 1e6).toFixed(2)) : undefined
          })
        }
        setIsBackendOnline(data.is_backend_online ?? false)
      } else {
        setIsBackendOnline(false)
      }
    } catch (err) {
      console.warn('Failed to fetch backend metadata:', err)
      setIsBackendOnline(false)
    } finally {
      setCheckingBackend(false)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  // Sample Presets for 1-Click Testing
  const handleApplyPreset = (presetKey: 'student' | 'studio' | 'luxury') => {
    setErrorMsg(null)
    if (presetKey === 'student') {
      setSizeM2(18)
      setDistToCbd(8.5)
      setDistToBeach(2.0)
      setDistToUni(0.5)
      setHasBalcony(0)
      setHasElevator(0)
      setHasWindow(1)
      setFurnishingStatus('Nội thất cơ bản')
      setWardName(wardOptions.includes('Hòa Khánh') ? 'Hòa Khánh' : wardOptions[0] || 'Liên Chiểu')
      setNearestBeachCode('XuanThieu')
      setNearestUniCode('DUT')
      setSmartNotice(isEn ? 'Applied PolyTech Student preset (Hoa Khanh)' : 'Đã áp dụng mẫu SV Bách Khoa (Hòa Khánh)')
    } else if (presetKey === 'studio') {
      setSizeM2(32)
      setDistToCbd(3.5)
      setDistToBeach(0.6)
      setDistToUni(2.5)
      setHasBalcony(1)
      setHasElevator(1)
      setHasWindow(1)
      setFurnishingStatus('Đầy đủ nội thất')
      setWardName(wardOptions.includes('Sơn Trà') ? 'Sơn Trà' : 'Ngũ Hành Sơn')
      setNearestBeachCode('MyKhe')
      setNearestUniCode('DUE')
      setSmartNotice('Đã áp dụng mẫu Studio Biển (Sơn Trà / Mỹ Khê)')
    } else if (presetKey === 'luxury') {
      setSizeM2(48)
      setDistToCbd(1.0)
      setDistToBeach(2.8)
      setDistToUni(1.2)
      setHasBalcony(1)
      setHasElevator(1)
      setHasWindow(1)
      setFurnishingStatus('Nội thất cao cấp')
      setWardName(wardOptions.includes('Hải Châu') ? 'Hải Châu' : wardOptions[0] || 'Hải Châu')
      setNearestBeachCode('PhamVanDong')
      setNearestUniCode('DTU_NVL')
      setSmartNotice('Đã áp dụng mẫu Căn hộ TT Hải Châu')
    }
  }

  // 2. Predict Price Action
  const handlePredict = async (e?: React.FormEvent, forceSimulation = false) => {
    if (e) e.preventDefault()

    // Validate inputs against Da Nang geographical boundaries
    if (hasHardErrors) {
      setErrorMsg(
        sizeError ||
        cbdError ||
        beachError ||
        uniError ||
        'Vui lòng điều chỉnh lại các thông số hợp lệ theo giới hạn địa lý thực tế tại Đà Nẵng.'
      )
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const payload = {
      size_m2: Number(sizeM2),
      dist_to_cbd: Number(distToCbd),
      dist_to_beach: Number(distToBeach),
      dist_to_nearest_uni: Number(distToUni),
      has_balcony: hasBalcony,
      has_elevator: hasElevator,
      has_window: hasWindow,
      furnishing_status: furnishingStatus,
      ward_name: wardName,
      nearest_beach_code: nearestBeachCode,
      nearest_uni_code: nearestUniCode,
      allow_simulation: forceSimulation || isBackendOnline === false
    }

    try {
      // Direct call via proxy route ensuring complete safety against CORS
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Lỗi máy chủ (${res.status})`)
      }

      // Normalize any variant field names returned by the backend
      const normalized = normalizePredictionResponse(data)
      if (!normalized.price_million_vnd && !normalized.predicted_price_vnd) {
        throw new Error(
          data.detail ||
          data.message ||
          'Dữ liệu phản hồi từ Backend không đúng cấu trúc giá dự đoán.'
        )
      }

      setPrediction(normalized)
      if (normalized.is_simulation) {
        setIsBackendOnline(false)
      } else {
        setIsBackendOnline(true)
      }
    } catch (err: any) {
      console.error('Prediction failed:', err)
      setErrorMsg(
        err?.message ||
        'Không thể kết nối đến Backend FastAPI tại http://localhost:8000. Bạn có thể bấm nút "Mô phỏng thử nghiệm" bên dưới để kiểm tra giao diện.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Formatting helpers
  const formatMoney = (amount?: number) => {
    if (amount === undefined || amount === null) return isEn ? '0 VND' : '0 đ'
    return Math.round(amount).toLocaleString(isEn ? 'en-US' : 'vi-VN') + (isEn ? ' VND' : ' đ')
  }

  const formatPriceMillion = (val: any) => {
    if (val === undefined || val === null) return '0.00'
    const num = typeof val === 'number' ? val : parseFloat(val)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const formatContributionValue = (val: string | number) => {
    if (typeof val !== 'string') return String(val)
    if (isEn) {
      if (val.toLowerCase().includes('đầy đủ nội thất')) return 'Fully furnished'
      if (val.toLowerCase().includes('nội thất cơ bản')) return 'Semi-furnished'
      if (val.toLowerCase().includes('không nội thất')) return 'Unfurnished'
      if (val.toLowerCase().includes('nội thất cao cấp')) return 'Luxury furnishing'
    }
    for (const [code, label] of Object.entries(BEACH_CODE_TO_LABEL)) {
      if (val.includes(code)) {
        return val.replace(code, label)
      }
    }
    return val
  }

  // Parse range estimate safely
  const formattedRange = useMemo(() => {
    if (!prediction?.range_estimate) return null
    const r = prediction.range_estimate
    const unit = isEn ? 'M VND / mo' : 'triệu VND/tháng'
    if (typeof r === 'string') return r
    if (Array.isArray(r)) return `${r[0]} - ${r[1]} ${unit}`
    if (typeof r === 'object' && r.low !== undefined && r.high !== undefined) {
      return `${r.low} - ${r.high} ${unit}`
    }
    return null
  }, [prediction, isEn])

  // Processed contributions for charts
  const contributionsList = useMemo(() => {
    if (!prediction?.explanation?.contributions) return []
    return prediction.explanation.contributions
  }, [prediction])

  const filteredContributions = useMemo(() => {
    if (shapFilter === 'all') return contributionsList
    if (shapFilter === 'positive') {
      return contributionsList.filter(
        (c) => c.direction === 'tăng giá' || (typeof c.vnd_effect === 'number' && c.vnd_effect > 0)
      )
    }
    return contributionsList.filter(
      (c) => c.direction === 'giảm giá' || (typeof c.vnd_effect === 'number' && c.vnd_effect < 0)
    )
  }, [contributionsList, shapFilter])

  // Max absolute VND effect for responsive SVG/CSS bar scaling
  const maxVndEffect = useMemo(() => {
    if (contributionsList.length === 0) return 500000
    const maxVal = Math.max(...contributionsList.map((c) => Math.abs(c.vnd_effect || 0)), 100000)
    return maxVal
  }, [contributionsList])

  // Total Positive & Negative Contributions
  const impactSummary = useMemo(() => {
    let positiveVnd = 0
    let negativeVnd = 0
    contributionsList.forEach((c) => {
      if (c.vnd_effect > 0) positiveVnd += c.vnd_effect
      else if (c.vnd_effect < 0) negativeVnd += Math.abs(c.vnd_effect)
    })
    return { positiveVnd, negativeVnd }
  }, [contributionsList])

  return (
    <div className="workspace-view" style={{ marginTop: '16px' }}>
      {/* Hero Header */}
      <div className="workspace-hero">
        <div className="workspace-hero-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} style={{ color: '#3078f0' }} />
            AI RENTAL VALUATION & SHAP EXPLAINABILITY ENGINE (FASTAPI 2026)
          </span>
          <h2 style={{ fontSize: '23px', margin: '6px 0 4px' }}>
            {isEn ? 'AI Rental Valuation & SHAP Explainability Engine' : 'Triển Khai Model Dự Đoán Giá Phòng Trọ & Giải Thích SHAP'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {isEn ? 'Real-time rental valuation based on 11 spatial, location, and amenity parameters in Da Nang.' : 'Ước tính giá thuê thời gian thực dựa trên 11 thông số không gian và tiện ích tại Đà Nẵng.'}
          </p>
        </div>

        {/* Backend Online/Offline Pill */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div
            className={`predict-status-pill ${isBackendOnline ? 'online' : 'offline'}`}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendOnline ? '#10b981' : '#f59e0b',
                boxShadow: isBackendOnline ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            />
            <span>{isBackendOnline ? 'FastAPI Online (Port 8000)' : (isEn ? 'Backend Disconnected' : 'Backend Chưa Kết Nối')}</span>
            <button
              onClick={() => fetchMetadata()}
              title={isEn ? "Check connection" : "Kiểm tra lại kết nối"}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2px'
              }}
            >
              <RotateCcw size={12} className={checkingBackend ? 'spin-icon' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="predict-layout">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Input Form                                             */}
        {/* =================================================================== */}
        <div className="predict-form-card">
          <div className="predict-form-header">
            <div>
              <h3>{isEn ? 'Property Specifications' : 'Thông Số Căn Phòng Trọ'}</h3>
              <p>{isEn ? 'Enter property parameters or pick a quick preset to predict rent' : 'Nhập thông tin hoặc chọn mẫu thử nghiệm nhanh để dự đoán'}</p>
            </div>
            <button
              onClick={() => {
                setSizeM2(25)
                setDistToCbd(1.0)
                setDistToBeach(2.8)
                setDistToUni(1.2)
                setHasBalcony(1)
                setHasElevator(0)
                setHasWindow(1)
                setFurnishingStatus('Đầy đủ nội thất')
                setWardName('Hải Châu')
                setNearestBeachCode('PhamVanDong')
                setNearestUniCode('DTU_NVL')
                setErrorMsg(null)
                setSmartNotice(null)
              }}
              className="clear-filter"
              title={isEn ? 'Reset to default form' : 'Đặt lại form mặc định'}
            >
              <RotateCcw size={13} /> {isEn ? 'Reset' : 'Đặt lại'}
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="preset-bar">
            <span className="preset-title">{isEn ? 'Presets:' : 'Mẫu nhanh:'}</span>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset('student')}
            >
              {isEn ? '🎓 PolyTech Student (18m²)' : '🎓 SV Bách Khoa (18m²)'}
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset('studio')}
            >
              {isEn ? '🏖️ Beach Studio (32m²)' : '🏖️ Studio Biển (32m²)'}
            </button>
            <button
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset('luxury')}
            >
              {isEn ? '🏙️ Hai Chau CBD Apt' : '🏙️ Căn Hộ TT Hải Châu'}
            </button>
          </div>

          <form onSubmit={handlePredict}>
            {/* GROUP 1: Physical Size & Location Metrics */}
            <div className="form-group-title">
              <Maximize2 size={13} style={{ color: 'var(--blue)' }} />
              {isEn ? '1. Size & Commute Distances' : '1. Diện tích & Khoảng cách di chuyển'}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <span>{isEn ? 'Room size' : 'Diện tích phòng'}</span>
                  <span className="unit">(5 - 80 m²)</span>
                </label>
                <div className="form-input-wrap">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="80"
                    required
                    value={sizeM2}
                    onChange={(e) => setSizeM2(parseFloat(e.target.value) || 0)}
                    className={`form-input ${sizeError ? 'input-error' : ''}`}
                    placeholder={isEn ? "e.g. 25" : "VD: 25"}
                  />
                </div>
                {sizeError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{sizeError}</span>
                  </div>
                )}
                <div className="quick-chips">
                  {[18, 25, 35, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`chip-btn ${sizeM2 === val ? 'active' : ''}`}
                      onClick={() => setSizeM2(val)}
                    >
                      {val} m²
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>
                  <span>{isEn ? 'Distance to CBD' : 'Khoảng cách tới CBD'}</span>
                  <span className="unit">(0 - 20 km)</span>
                </label>
                <div className="form-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    required
                    value={distToCbd}
                    onChange={(e) => setDistToCbd(parseFloat(e.target.value) || 0)}
                    className={`form-input ${cbdError ? 'input-error' : cbdWarning ? 'input-warning' : ''}`}
                    placeholder={isEn ? "e.g. 3.5" : "VD: 3.5"}
                  />
                </div>
                {cbdError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{cbdError}</span>
                  </div>
                )}
                {!cbdError && cbdWarning && (
                  <div className="field-warning-text">
                    <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{cbdWarning}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>
                  <span>{isEn ? 'Distance to beach' : 'Khoảng cách tới biển'}</span>
                  <span className="unit">(0 - 12 km)</span>
                </label>
                <div className="form-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="12"
                    required
                    value={distToBeach}
                    onChange={(e) => setDistToBeach(parseFloat(e.target.value) || 0)}
                    className={`form-input ${beachError ? 'input-error' : beachWarning ? 'input-warning' : ''}`}
                    placeholder={isEn ? "e.g. 2.0" : "VD: 2.0"}
                  />
                </div>
                {beachError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{beachError}</span>
                  </div>
                )}
                {!beachError && beachWarning && (
                  <div className="field-warning-text">
                    <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{beachWarning}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label>
                  <span>{isEn ? 'Distance to university' : 'Cự ly tới ĐH gần nhất'}</span>
                  <span className="unit">(0 - 10 km)</span>
                </label>
                <div className="form-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={distToUni}
                    onChange={(e) => setDistToUni(parseFloat(e.target.value) || 0)}
                    className={`form-input ${uniError ? 'input-error' : ''}`}
                    placeholder={isEn ? "e.g. 1.2" : "VD: 1.2"}
                  />
                </div>
                {uniError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{uniError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* GROUP 2: Geographic Ward & Hotspot Anchor Codes */}
            <div className="form-group-title">
              <MapPin size={13} style={{ color: 'var(--blue)' }} />
              {isEn ? '2. Location & Nearby Anchors' : '2. Khu vực & Điểm quy chiếu lân cận'}
            </div>

            {/* Smart Default Notification Banner */}
            {smartNotice && (
              <div className="smart-default-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Lightbulb size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>{smartNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmartNotice(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    lineHeight: 1
                  }}
                  title={isEn ? "Close notice" : "Đóng thông báo"}
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-field" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                <label style={{ margin: 0, whiteSpace: 'nowrap' }}>{isEn ? 'Ward / Area (Da Nang)' : 'Phường / Xã (Đà Nẵng)'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className={`smart-toggle-btn ${enableSmartDefaults ? 'active' : ''}`}
                    onClick={() => setEnableSmartDefaults(!enableSmartDefaults)}
                    title={isEn ? 'Toggle auto-suggest distance & location anchors' : 'Bật/Tắt tự động gợi ý khoảng cách & địa điểm khi đổi phường'}
                  >
                    <Lightbulb size={11} />
                    {enableSmartDefaults ? (isEn ? 'Hints: ON' : 'Gợi ý: BẬT') : (isEn ? 'Hints: OFF' : 'Gợi ý: TẮT')}
                  </button>
                  <button
                    type="button"
                    className="smart-toggle-btn"
                    onClick={() => handleApplyWardProfile(wardName)}
                    title={isEn ? 'Re-apply suggested values for this ward' : 'Áp dụng lại khoảng cách & địa điểm gợi ý cho phường này'}
                  >
                    <RotateCcw size={10} /> {isEn ? 'Refill' : 'Điền lại'}
                  </button>
                </div>
              </div>
              <select
                value={wardName}
                onChange={(e) => handleWardChange(e.target.value)}
                className="form-select"
              >
                {wardOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {currentWardProfile && (
                <div className="field-smart-badge">
                  <Navigation size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>{currentWardProfile.groupName}:</strong> {currentWardProfile.hint}
                  </span>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label style={{ whiteSpace: 'nowrap' }}>{isEn ? 'Nearest beach' : 'Bãi biển gần nhất'}</label>
                <select
                  value={nearestBeachCode}
                  onChange={(e) => setNearestBeachCode(e.target.value)}
                  className={`form-select ${beachChoiceWarning ? 'input-warning' : ''}`}
                >
                  {beachOptions.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
                {beachChoiceWarning && (
                  <div className="field-warning-text">
                    <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{beachChoiceWarning}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label style={{ whiteSpace: 'nowrap' }}>{isEn ? 'Nearest university' : 'Trường ĐH gần nhất'}</label>
                <select
                  value={nearestUniCode}
                  onChange={(e) => setNearestUniCode(e.target.value)}
                  className={`form-select ${uniWarning ? 'input-warning' : ''}`}
                >
                  {uniCodeOptions.map((u) => (
                    <option key={u} value={u}>
                      {isEn ? (UNI_LABELS_EN[u] || UNI_LABELS[u] || u) : (UNI_LABELS[u] || u)}
                    </option>
                  ))}
                </select>
                {uniWarning && (
                  <div className="field-warning-text">
                    <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{uniWarning}</span>
                  </div>
                )}
              </div>
            </div>

            {/* GROUP 3: Furnishing & Interior Amenities */}
            <div className="form-group-title">
              <Armchair size={13} style={{ color: 'var(--blue)' }} />
              {isEn ? '3. Furnishing & Amenities' : '3. Tình trạng nội thất & Tiện nghi phòng'}
            </div>

            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label style={{ whiteSpace: 'nowrap' }}>{isEn ? 'Furnishing status' : 'Tình trạng nội thất'}</label>
              <select
                value={furnishingStatus}
                onChange={(e) => setFurnishingStatus(e.target.value)}
                className="form-select"
              >
                {furnishingOptions.map((f) => (
                  <option key={f} value={f}>
                    {translateFurnishing(f, isEn)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label style={{ whiteSpace: 'nowrap' }}>{isEn ? 'Included amenities' : 'Tiện ích kèm theo'}</label>
              <div className="checkbox-card-group">
                {/* Balcony */}
                <div
                  className={`checkbox-card ${hasBalcony === 1 ? 'checked' : ''}`}
                  onClick={() => setHasBalcony(hasBalcony === 1 ? 0 : 1)}
                >
                  <div className="icon-box">
                    <Check size={14} style={{ opacity: hasBalcony === 1 ? 1 : 0.3 }} />
                  </div>
                  <div className="label-box">
                    <strong>{isEn ? 'Balcony' : 'Ban công'}</strong>
                    <small>{hasBalcony === 1 ? (isEn ? 'Has balcony' : 'Có ban công') : (isEn ? 'None' : 'Không có')}</small>
                  </div>
                </div>

                {/* Elevator */}
                <div
                  className={`checkbox-card ${hasElevator === 1 ? 'checked' : ''}`}
                  onClick={() => setHasElevator(hasElevator === 1 ? 0 : 1)}
                >
                  <div className="icon-box">
                    <Check size={14} style={{ opacity: hasElevator === 1 ? 1 : 0.3 }} />
                  </div>
                  <div className="label-box">
                    <strong>{isEn ? 'Elevator' : 'Thang máy'}</strong>
                    <small>{hasElevator === 1 ? (isEn ? 'Has elevator' : 'Có thang máy') : (isEn ? 'Walk-up' : 'Đi bộ')}</small>
                  </div>
                </div>

                {/* Window */}
                <div
                  className={`checkbox-card ${hasWindow === 1 ? 'checked' : ''}`}
                  onClick={() => setHasWindow(hasWindow === 1 ? 0 : 1)}
                >
                  <div className="icon-box">
                    <Check size={14} style={{ opacity: hasWindow === 1 ? 1 : 0.3 }} />
                  </div>
                  <div className="label-box">
                    <strong>{isEn ? 'Window' : 'Cửa sổ'}</strong>
                    <small>{hasWindow === 1 ? (isEn ? 'Has window' : 'Có cửa sổ') : (isEn ? 'No window' : 'Phòng kín')}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="predict-error-banner">
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <strong>{isEn ? 'Notice:' : 'Thông báo:'}</strong>
                  <p style={{ margin: '4px 0 0' }}>{errorMsg}</p>
                  {!isBackendOnline && (
                    <button
                      type="button"
                      onClick={() => handlePredict(undefined, true)}
                      className="predict-error-btn"
                    >
                      {isEn ? '⚡ Run UI simulation test (Demo Mode)' : '⚡ Chạy mô phỏng kiểm tra UI ngay (Demo Mode)'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Predict Button */}
            <button
              type="submit"
              disabled={loading || hasHardErrors}
              className="btn-predict"
              title={hasHardErrors ? (isEn ? 'Please correct invalid values before predicting' : 'Vui lòng điều chỉnh lại các trường dữ liệu hợp lệ trước khi dự đoán') : (isEn ? 'Click to predict rental price' : 'Bấm để dự đoán giá phòng')}
            >
              {loading ? (
                <>
                  <div className="pulse-spinner" style={{ width: '18px', height: '18px' }} />
                  <span>{isEn ? 'Computing AI & SHAP model...' : 'Đang tính toán mô hình AI & SHAP...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>{isEn ? 'Predict Rental Price' : 'Dự đoán giá phòng trọ'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Prediction Result & SHAP Visualizations               */}
        {/* =================================================================== */}
        <div>
          {/* State 1: When no prediction has been run yet */}
          {!prediction && !loading && (
            <div
              className="card predict-empty-card"
            >
              <div
                className="predict-empty-icon"
              >
                <Calculator size={28} />
              </div>
              <h3 style={{ font: "800 18px 'Manrope', sans-serif", margin: '0 0 8px', color: 'var(--ink)' }}>
                {isEn ? 'Ready to Value Rent & Visualize SHAP' : 'Sẵn Sàng Dự Đoán Giá Thuê & Trực Quan Hóa SHAP'}
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: 'var(--muted)', fontSize: '13px' }}>
                {isEn ? 'Enter property parameters on the left or select a Quick Preset to activate the valuation model.' : 'Điền các thông số căn phòng trọ ở cột bên trái hoặc bấm vào một trong các Mẫu nhanh để kích hoạt mô hình dự đoán.'}
              </p>
              <button
                type="button"
                onClick={() => handleApplyPreset('studio')}
                className="button primary"
                style={{ margin: '0 auto' }}
              >
                <Sparkles size={15} /> {isEn ? 'Try with Beach Studio preset' : 'Thử ngay với mẫu Studio Biển'}
              </button>
            </div>
          )}

          {/* State 2: While loading */}
          {loading && (
            <div
              className="card predict-loading-card"
            >
              <div
                className="pulse-spinner"
                style={{ width: '38px', height: '38px', margin: '0 auto 18px' }}
              />
              <h3 style={{ font: "800 18px 'Manrope', sans-serif", margin: '0 0 6px' }}>
                {isEn ? 'Analyzing Parameters & Computing SHAP Values...' : 'Đang Phân Tích Thông Số & Tính Toán SHAP Values...'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '12px' }}>
                {isEn ? 'Calling FastAPI Backend (Port 8000), retrieving weights and isolating feature contributions.' : 'Đang gọi API Backend FastAPI (Port 8000), truy xuất trọng số và phân tách đóng góp từng đặc trưng.'}
              </p>
            </div>
          )}

          {/* State 3: Prediction Results Rendered */}
          {prediction && !loading && (prediction.price_million_vnd !== undefined || prediction.predicted_price_vnd !== undefined) && (
            <>
              {/* Result Hero Display */}
              <div className="result-hero-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '4px' }}>
                      {isEn ? 'AI MODEL VALUATION RESULT' : 'KẾT QUẢ ĐỊNH GIÁ MÔ HÌNH AI'}
                    </span>
                    <div className="price-main-display">
                      <span className="price-main-number">
                        {formatPriceMillion(prediction?.price_million_vnd)}
                      </span>
                      <span className="price-main-unit">{isEn ? 'M VND / mo' : 'triệu VND / tháng'}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>
                      {isEn ? 'Equivalent to: ' : 'Tương đương: '}<strong style={{ color: 'var(--ink)' }}>{formatMoney(prediction?.predicted_price_vnd || ((prediction?.price_million_vnd || 0) * 1000000))}</strong>
                      <span style={{ margin: '0 8px', color: 'var(--line)' }}>|</span>
                      <span>{isEn ? 'Unit rate: ' : 'Đơn giá: '}<strong style={{ color: 'var(--blue)' }}>{Math.round(((prediction?.price_million_vnd || 0) * 1000000) / (sizeM2 || 1)).toLocaleString(isEn ? 'en-US' : 'vi-VN')} {isEn ? 'VND/m²' : 'đ/m²'}</strong></span>
                    </div>
                  </div>

                  {prediction.is_simulation && (
                    <span
                      className="simulation-pill"
                    >
                      {isEn ? 'UI Simulation / Demo Mode' : 'Chế độ mô phỏng kiểm tra UI'}
                    </span>
                  )}
                </div>

                {/* Range Estimate */}
                {formattedRange && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
                        {isEn ? 'Estimated confidence range:' : 'Khoảng giá tham khảo ước tính:'}
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>{formattedRange}</strong>
                    </div>
                    <div className="range-indicator">
                      <div className="range-fill" style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Metric Cards for SHAP Overview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '16px'
                }}
              >
                <div className="card metric-card" style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                    {isEn ? 'Market Base Value' : 'Giá cơ sở thị trường (Base)'}
                  </span>
                  <strong style={{ font: "800 18px 'Manrope', sans-serif", color: 'var(--ink)' }}>
                    {formatMoney(prediction.explanation?.base_value_vnd || 2850000)}
                  </strong>
                  <small style={{ fontSize: '10px' }}>{isEn ? 'Da Nang overall benchmark' : 'Điểm chuẩn trung bình toàn Đà Nẵng'}</small>
                </div>

                <div className="card metric-card" style={{ padding: '14px 16px' }}>
                  <span className="metric-tag-positive" style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={13} /> {isEn ? 'Total positive impact' : 'Tổng tác động tăng giá'}
                  </span>
                  <strong className="metric-val-positive" style={{ font: "800 18px 'Manrope', sans-serif" }}>
                    +{formatMoney(impactSummary.positiveVnd)}
                  </strong>
                  <small style={{ fontSize: '10px' }}>{isEn ? 'From location advantages & amenities' : 'Từ các ưu thế vị trí & tiện ích'}</small>
                </div>

                <div className="card metric-card" style={{ padding: '14px 16px' }}>
                  <span className="metric-tag-negative" style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingDown size={13} /> {isEn ? 'Total negative impact' : 'Tổng tác động giảm giá'}
                  </span>
                  <strong className="metric-val-negative" style={{ font: "800 18px 'Manrope', sans-serif" }}>
                    -{formatMoney(impactSummary.negativeVnd)}
                  </strong>
                  <small style={{ fontSize: '10px' }}>{isEn ? 'From distance or missing amenities' : 'Do xa trung tâm hoặc thiếu tiện nghi'}</small>
                </div>
              </div>

              {/* ============================================================= */}
              {/* HORIZONTAL BAR CHART: SHAP Feature Impact                     */}
              {/* ============================================================= */}
              <div className="shap-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ font: "800 16px 'Manrope', sans-serif", margin: '0 0 4px', color: 'var(--ink)' }}>
                      {isEn ? 'SHAP Feature Impact Horizontal Bar Chart' : 'Biểu Đồ Cột Ngang Tác Động SHAP (Feature Impact)'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Real impact of each feature increasing (green) or decreasing (red) rent vs. the baseline.' : 'Mức độ ảnh hưởng thực tế từng yếu tố làm tăng (xanh) hoặc giảm (đỏ) giá thuê so với mức cơ sở.'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="chart-filter-pills" style={{ margin: 0 }}>
                    <button
                      type="button"
                      className={`pill-filter-btn ${shapFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setShapFilter('all')}
                    >
                      {isEn ? `All (${contributionsList.length})` : `Tất cả (${contributionsList.length})`}
                    </button>
                    <button
                      type="button"
                      className={`pill-filter-btn ${shapFilter === 'positive' ? 'active' : ''}`}
                      onClick={() => setShapFilter('positive')}
                    >
                      {isEn ? 'Positive (+)' : 'Tăng giá (+)'}
                    </button>
                    <button
                      type="button"
                      className={`pill-filter-btn ${shapFilter === 'negative' ? 'active' : ''}`}
                      onClick={() => setShapFilter('negative')}
                    >
                      {isEn ? 'Negative (-)' : 'Giảm giá (-)'}
                    </button>
                  </div>
                </div>

                {/* Chart Header Axis */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '190px 1fr 130px',
                    gap: '14px',
                    padding: '14px 0 8px',
                    borderBottom: '1px solid var(--line)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span>{isEn ? 'Feature & Value' : 'Đặc trưng & Giá trị thực'}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ef4444' }}>{isEn ? '← Negative impact' : '← Giảm giá (Chiết khấu)'}</span>
                    <span style={{ color: '#64748b' }}>{isEn ? 'Zero Axis' : 'Trục 0'}</span>
                    <span style={{ color: '#10b981' }}>{isEn ? 'Positive impact →' : 'Tăng giá (Phụ trội) →'}</span>
                  </div>
                  <span style={{ textAlign: 'right' }}>{isEn ? 'Impact (VND / %)' : 'Ảnh hưởng (VND / %)'}</span>
                </div>

                {/* Chart Rows */}
                <div style={{ marginTop: '6px' }}>
                  {filteredContributions.map((item, idx) => {
                    const isPositive =
                      item.direction === 'tăng giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect > 0)
                    const isNegative =
                      item.direction === 'giảm giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect < 0)
                    const absVnd = Math.abs(item.vnd_effect || 0)
                    const barWidthPct = Math.min(100, Math.max(4, (absVnd / maxVndEffect) * 48))

                    return (
                      <div key={idx} className="shap-bar-row">
                        <div className="shap-label-col">
                          <strong>{translateFeatureLabel(item.label, isEn)}</strong>
                          <small>{formatContributionValue(item.value)}</small>
                        </div>

                        {/* Center-zero Diverging Horizontal Bar */}
                        <div className="shap-track-col">
                          <div className="shap-center-axis" />
                          {isPositive && (
                            <div
                              className="shap-bar positive"
                              style={{ width: `${barWidthPct}%` }}
                              title={`${item.label}: +${formatMoney(item.vnd_effect)} (${item.pct_effect})`}
                            />
                          )}
                          {isNegative && (
                            <div
                              className="shap-bar negative"
                              style={{
                                width: `${barWidthPct}%`,
                                marginLeft: `calc(50% - ${barWidthPct}%)`
                              }}
                              title={`${item.label}: ${formatMoney(item.vnd_effect)} (${item.pct_effect})`}
                            />
                          )}
                          {!isPositive && !isNegative && (
                            <div
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#94a3b8',
                                position: 'absolute',
                                left: 'calc(50% - 3px)'
                              }}
                            />
                          )}
                        </div>

                        <div className="shap-stat-col">
                          <strong className={isPositive ? 'positive' : isNegative ? 'negative' : ''}>
                            {item.vnd_effect > 0 ? `+${formatMoney(item.vnd_effect)}` : formatMoney(item.vnd_effect)}
                          </strong>
                          <small>{String(item.pct_effect)}</small>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ============================================================= */}
              {/* BREAKDOWN TABLE: Itemized Contributions                       */}
              {/* ============================================================= */}
              <div className="breakdown-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ font: "800 16px 'Manrope', sans-serif", margin: '0 0 4px', color: 'var(--ink)' }}>
                      {isEn ? 'Itemized Price Contribution Breakdown Table' : 'Bảng Chi Tiết Đóng Góp Giá (Breakdown Table)'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn ? 'Cumulative waterfall sum from base price to final predicted rent.' : 'Cộng dồn từng thành phần từ mức giá gốc cơ sở đến mức giá dự đoán cuối cùng.'}
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>{isEn ? 'Contribution Factor' : 'Yếu tố đóng góp'}</th>
                        <th>{isEn ? 'Input Value' : 'Giá trị nhập liệu'}</th>
                        <th>{isEn ? 'Direction' : 'Chiều hướng'}</th>
                        <th>{isEn ? 'Impact Ratio (%)' : 'Tỷ lệ tác động (%)'}</th>
                        <th style={{ textAlign: 'right' }}>{isEn ? 'Monetary Impact (VND)' : 'Ảnh hưởng bằng tiền (VND)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Base Value Row */}
                      <tr className="highlight-base">
                        <td>
                          <strong>{isEn ? 'Base Room Value' : 'Giá phòng cơ sở (Base Value)'}</strong>
                        </td>
                        <td>{isEn ? 'Da Nang benchmark' : 'Điểm chuẩn Đà Nẵng'}</td>
                        <td>
                          <span className="direction-badge neutral">{isEn ? 'Baseline' : 'Cơ sở chuẩn'}</span>
                        </td>
                        <td>0.0%</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {formatMoney(prediction.explanation?.base_value_vnd || 2850000)}
                        </td>
                      </tr>

                      {/* Contribution Rows */}
                      {contributionsList.map((item, idx) => {
                        const isPositive =
                          item.direction === 'tăng giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect > 0)
                        const isNegative =
                          item.direction === 'giảm giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect < 0)

                        return (
                          <tr key={idx}>
                            <td>
                              <strong>{translateFeatureLabel(item.label, isEn)}</strong>
                            </td>
                            <td>{formatContributionValue(item.value)}</td>
                            <td>
                              {isPositive && (
                                <span className="direction-badge increase">
                                  <TrendingUp size={11} /> {isEn ? 'Positive' : 'Tăng giá'}
                                </span>
                              )}
                              {isNegative && (
                                <span className="direction-badge decrease">
                                  <TrendingDown size={11} /> {isEn ? 'Negative' : 'Giảm giá'}
                                </span>
                              )}
                              {!isPositive && !isNegative && (
                                <span className="direction-badge neutral">{isEn ? 'Neutral' : 'Trung lập'}</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 600, color: isPositive ? 'var(--positive-text, #15803d)' : isNegative ? 'var(--negative-text, #b91c1c)' : 'inherit' }}>
                              {String(item.pct_effect)}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 700,
                                color: isPositive ? 'var(--positive-text, #15803d)' : isNegative ? 'var(--negative-text, #b91c1c)' : 'inherit'
                              }}
                            >
                              {item.vnd_effect > 0 ? `+${formatMoney(item.vnd_effect)}` : formatMoney(item.vnd_effect)}
                            </td>
                          </tr>
                        )
                      })}

                      {/* Final Predicted Price Row */}
                      <tr className="highlight-total">
                        <td>
                          <strong style={{ color: 'var(--blue)' }}>{isEn ? 'FINAL PREDICTED RENT' : 'GIÁ DỰ ĐOÁN CUỐI CÙNG'}</strong>
                        </td>
                        <td colSpan={2}>
                          {prediction?.model_metadata?.model_name || 'Machine Learning (CatBoost / LightGBM)'}
                        </td>
                        <td style={{ color: 'var(--blue)', fontWeight: 800 }}>
                          {formatPriceMillion(prediction?.price_million_vnd)} {isEn ? 'M VND / mo' : 'triệu/tháng'}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--blue)', font: "800 15px 'Manrope', sans-serif" }}>
                          {formatMoney(prediction?.predicted_price_vnd || ((prediction?.price_million_vnd || 0) * 1000000))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="predict-info-banner">
                  <Info size={15} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                  <span>
                    {isEn
                      ? 'SHAP Additive Attribution Formula: Predicted Price = Base Value + Σ(Feature Impact). Each feature is calculated independently to explain why the property is priced above or below the market average, conforming to XAI standards.'
                      : 'Công thức SHAP Additive Attribution: Giá dự đoán = Giá cơ sở + ∑(Ảnh hưởng từng biến). Mỗi đặc trưng giải thích rõ tại sao căn phòng có giá cao hơn hay thấp hơn mặt bằng chung.'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
