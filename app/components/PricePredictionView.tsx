'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Sparkles,
  Calculator,
  Building2,
  DoorClosed,
  MapPin,
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
  Check,
  Navigation,
  Lightbulb,
  Activity
} from 'lucide-react'

// Standard Ward list for Da Nang (11 wards)
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

// Standard Furnishing Status options (clean, consumer-friendly)
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

// 12 Standard Da Nang Beach options
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

// 11 Da Nang Ward geographic profiles with real urban context
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
    preferredUnis: ['UTE', 'DAU', 'DTU_NVL'],
    defaultUni: 'UTE',
    preferredBeaches: ['ThanhBinh', 'PhamVanDong'],
    defaultBeach: 'ThanhBinh',
    hint: 'Phía tây Thanh Khê, gần sân bay Đà Nẵng & trục Điện Biên Phủ'
  },
  'Sơn Trà': {
    group: 'coastal',
    groupName: 'Quận Ven biển',
    defaultDistCbd: 3.2,
    rangeDistCbd: [1.5, 6.0],
    defaultDistBeach: 0.8,
    rangeDistBeach: [0.1, 2.5],
    defaultDistUni: 3.0,
    rangeDistUni: [1.0, 5.5],
    preferredUnis: ['DUE', 'DTU_NVL', 'VNUK'],
    defaultUni: 'DUE',
    preferredBeaches: ['PhamVanDong', 'MyKhe', 'TienSa', 'BaiBut_BaiRang'],
    defaultBeach: 'PhamVanDong',
    hint: 'Khu du lịch & căn hộ ven biển nổi tiếng, bán đảo Sơn Trà & bãi tắm Phạm Văn Đồng'
  },
  'An Hải': {
    group: 'coastal',
    groupName: 'Quận Sơn Trà (Bờ Đông)',
    defaultDistCbd: 2.2,
    rangeDistCbd: [1.0, 4.0],
    defaultDistBeach: 1.2,
    rangeDistBeach: [0.4, 2.8],
    defaultDistUni: 2.6,
    rangeDistUni: [1.0, 4.5],
    preferredUnis: ['DUE', 'DTU_NVL', 'VNUK'],
    defaultUni: 'DUE',
    preferredBeaches: ['PhamVanDong', 'MyKhe'],
    defaultBeach: 'PhamVanDong',
    hint: 'Khu vực cầu Rồng, cầu Sông Hàn phía bờ Đông, giao thông thuận tiện qua trung tâm'
  },
  'Ngũ Hành Sơn': {
    group: 'coastal',
    groupName: 'Quận Du lịch & Giáo dục',
    defaultDistCbd: 6.5,
    rangeDistCbd: [4.0, 10.0],
    defaultDistBeach: 0.9,
    rangeDistBeach: [0.2, 3.0],
    defaultDistUni: 2.0,
    rangeDistUni: [0.5, 4.5],
    preferredUnis: ['DUE', 'FPTU', 'VKU', 'SMP'],
    defaultUni: 'DUE',
    preferredBeaches: ['MyKhe', 'BacMyAn', 'NonNuoc', 'SonThuy', 'TanTra'],
    defaultBeach: 'MyKhe',
    hint: 'Cụm resort, căn hộ bãi biển Mỹ Khê - Non Nước, làng đại học phía Nam (FPT, VKU, DUE)'
  },
  'Hòa Cường': {
    group: 'central',
    groupName: 'Quận Hải Châu (Phía Nam)',
    defaultDistCbd: 2.8,
    rangeDistCbd: [1.5, 4.5],
    defaultDistBeach: 3.5,
    rangeDistBeach: [2.0, 5.5],
    defaultDistUni: 0.8,
    rangeDistUni: [0.2, 2.5],
    preferredUnis: ['DAU', 'UDA', 'DUE', 'DTU_NVL'],
    defaultUni: 'DAU',
    preferredBeaches: ['MyKhe', 'PhamVanDong', 'BacMyAn'],
    defaultBeach: 'MyKhe',
    hint: 'Tập trung các trường ĐH Kiến Trúc, Đông Á, chợ đầu mối Hòa Cường & công viên Châu Á'
  },
  'Cẩm Lệ': {
    group: 'central',
    groupName: 'Quận Cửa ngõ Phía Nam',
    defaultDistCbd: 5.5,
    rangeDistCbd: [3.5, 8.5],
    defaultDistBeach: 5.8,
    rangeDistBeach: [3.5, 8.5],
    defaultDistUni: 2.2,
    rangeDistUni: [0.5, 4.0],
    preferredUnis: ['DAU', 'UDA', 'DUE', 'UTE'],
    defaultUni: 'DAU',
    preferredBeaches: ['MyKhe', 'ThanhBinh', 'BacMyAn'],
    defaultBeach: 'MyKhe',
    hint: 'Khu dân cư đang phát triển nhanh, cửa ngõ kết nối nam thành phố & QL1A'
  },
  'Hòa Xuân': {
    group: 'southeast',
    groupName: 'Khu Đô thị Mới Sinh Thái',
    defaultDistCbd: 7.2,
    rangeDistCbd: [5.0, 11.0],
    defaultDistBeach: 5.5,
    rangeDistBeach: [3.5, 8.0],
    defaultDistUni: 3.5,
    rangeDistUni: [1.5, 6.0],
    preferredUnis: ['DUE', 'VKU', 'FPTU', 'DAU'],
    defaultUni: 'DUE',
    preferredBeaches: ['BacMyAn', 'NonNuoc', 'MyKhe'],
    defaultBeach: 'BacMyAn',
    hint: 'Khu đô thị sinh thái ven sông Cẩm Lệ, gần sân vận động Hòa Xuân & làng ĐH Nam Đà Nẵng'
  },
  'Hòa Khánh': {
    group: 'north',
    groupName: 'Khu Đô thị & Công nghiệp Bắc',
    defaultDistCbd: 8.5,
    rangeDistCbd: [6.0, 13.0],
    defaultDistBeach: 2.0,
    rangeDistBeach: [0.5, 5.0],
    defaultDistUni: 0.8,
    rangeDistUni: [0.2, 2.5],
    preferredUnis: ['DUT', 'UED', 'DTU_HK'],
    defaultUni: 'DUT',
    preferredBeaches: ['XuanThieu', 'NamO', 'ThanhBinh'],
    defaultBeach: 'XuanThieu',
    hint: 'Làng đại học công nghệ phía Bắc (ĐH Bách Khoa, Sư Phạm, Duy Tân HK), biển Xuân Thiều'
  },
  'Liên Chiểu': {
    group: 'north',
    groupName: 'Quận Cửa ngõ Tây Bắc',
    defaultDistCbd: 9.5,
    rangeDistCbd: [6.5, 15.0],
    defaultDistBeach: 1.8,
    rangeDistBeach: [0.3, 4.5],
    defaultDistUni: 1.5,
    rangeDistUni: [0.3, 3.5],
    preferredUnis: ['DUT', 'UED', 'DTU_HK'],
    defaultUni: 'DUT',
    preferredBeaches: ['XuanThieu', 'NamO', 'LangVan'],
    defaultBeach: 'XuanThieu',
    hint: 'Khu công nghiệp Liên Chiểu, gần đèo Hải Vân, vịnh Kim Liên & bãi biển Nam Ô'
  }
}

export const UNI_LABELS: Record<string, string> = {
  DUT: 'ĐH Bách Khoa Đà Nẵng (DUT)',
  UED: 'ĐH Sư Phạm Đà Nẵng (UED)',
  DUE: 'ĐH Kinh Tế Đà Nẵng (DUE)',
  UFLS: 'ĐH Ngoại Ngữ Đà Nẵng (UFLS)',
  UTE: 'ĐH Sư Phạm Kỹ Thuật (UTE)',
  VKU: 'ĐH CNTT & TT Việt - Hàn (VKU)',
  VNUK: 'Viện Nghiên Cứu & Đào Tạo Việt - Anh (VNUK)',
  DAU: 'ĐH Kiến Trúc Đà Nẵng (DAU)',
  DTU_HK: 'ĐH Duy Tân (Cơ sở Hòa Khánh)',
  DTU_NVL: 'ĐH Duy Tân (Nguyễn Văn Linh)',
  FPTU: 'ĐH FPT Đà Nẵng (Ngũ Hành Sơn)',
  UDA: 'ĐH Đông Á (Hòa Cường)',
  SMP: 'Khoa Y Dược - ĐH Đà Nẵng (SMP)',
  UPES3: 'ĐH Thể Dục Thể Thao Đà Nẵng',
  PU: 'Học Viện Chính Trị Khu Vực III',
  UPU: 'Học Viện Chính Trị Khu Vực III'
}

export const FEATURE_NAMES_MAP: Record<string, string> = {
  size_m2: 'Diện tích (m²)',
  rooms: 'Số phòng ngủ',
  dist_to_cbd: 'Khoảng cách tới trung tâm (CBD)',
  dist_to_beach: 'Khoảng cách tới biển',
  dist_to_nearest_uni: 'Khoảng cách tới ĐH gần nhất',
  furnishing_status: 'Tình trạng nội thất',
  ward_name: 'Khu vực / Phường',
  has_balcony: 'Ban công',
  has_elevator: 'Thang máy',
  has_window: 'Cửa sổ đón sáng',
  nearest_beach_code: 'Bãi biển lân cận',
  nearest_uni_code: 'Trường ĐH lân cận'
}

export function translateFurnishing(status: string, isEn = false): string {
  if (!isEn) return status
  if (status.includes('Không')) return 'Unfurnished'
  if (status.includes('cơ bản')) return 'Semi-furnished'
  if (status.includes('Đầy đủ')) return 'Fully furnished'
  if (status.includes('cao cấp')) return 'Luxury furnishing'
  return status
}

export interface ContributionItem {
  feature?: string
  label: string
  value: string | number
  pct_effect: string
  vnd_effect: number
  direction: 'tăng giá' | 'giảm giá' | 'trung lập' | string
  shap_log?: number
}

export interface PredictionResult {
  predicted_price_vnd?: number
  price_million_vnd: number
  property_type?: 'room' | 'apartment' | string
  range_estimate?:
    | {
        low: number
        high: number
        low_vnd?: number
        high_vnd?: number
        confidence_interval?: string
      }
    | [number, number]
    | string
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
  const predObj = typeof data.prediction === 'object' && data.prediction !== null ? data.prediction : {}

  // 1. Extract price in Million VND
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
  } else if (typeof data.predicted_price === 'number') {
    priceMillion = data.predicted_price > 1000 ? Number((data.predicted_price / 1e6).toFixed(2)) : data.predicted_price
  } else if (typeof predObj.price === 'number') {
    priceMillion = predObj.price > 1000 ? Number((predObj.price / 1e6).toFixed(2)) : predObj.price
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

  // 3. Extract range estimate
  let rangeEstimate = predObj.range_estimate || data.range_estimate
  if (rangeEstimate && typeof rangeEstimate === 'object') {
    const rawRange = rangeEstimate
    if (rawRange.low !== undefined && rawRange.high !== undefined) {
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

  // 4. Feature contributions
  const rawExplanation = data.explanation || data.shap_explanation || {}
  const rawContributions =
    rawExplanation.contributions ||
    data.contributions ||
    data.shap_values ||
    data.feature_contributions ||
    []

  const contributions: ContributionItem[] = Array.isArray(rawContributions)
    ? rawContributions.map((c: any) => {
        const rawLabel = c.label || c.feature_name || c.feature || 'Thuộc tính'
        const label = FEATURE_NAMES_MAP[c.feature] || rawLabel
        const value = c.value !== undefined ? c.value : '-'
        const vnd_effect = typeof c.vnd_effect === 'number' ? Math.round(c.vnd_effect) : Math.round(parseFloat(c.vnd_effect) || 0)
        let pct_effect = ''
        if (typeof c.pct_effect === 'number') {
          pct_effect = `${c.pct_effect >= 0 ? '+' : ''}${c.pct_effect.toFixed(1)}%`
        } else if (c.pct_effect !== undefined) {
          pct_effect = String(c.pct_effect)
        } else {
          pct_effect = `${vnd_effect >= 0 ? '+' : ''}${((vnd_effect / (priceVnd || 3000000)) * 100).toFixed(1)}%`
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
    3000000

  return {
    ...data,
    property_type: data.property_type || (data.input?.rooms ? 'apartment' : 'room'),
    price_million_vnd: priceMillion,
    predicted_price_vnd: priceVnd,
    range_estimate: rangeEstimate,
    explanation: {
      base_value_vnd,
      base_value_million: Number((base_value_vnd / 1000000).toFixed(2)),
      contributions
    },
    model_metadata: {
      model_name:
        data.property_type === 'apartment' || data.input?.rooms
          ? 'Hệ Thống Định Giá Căn Hộ / Chung Cư Đà Nẵng'
          : 'Hệ Thống Định Giá Phòng Trọ Đà Nẵng'
    }
  }
}

export interface PricePredictionViewProps {
  lang?: 'vi' | 'en'
}

export default function PricePredictionView({ lang = 'vi' }: PricePredictionViewProps = {}) {
  const isEn = lang === 'en'

  // 1. Property Type Mode: 'room' (Phòng trọ) vs 'apartment' (Căn hộ / Chung cư)
  const [propertyType, setPropertyType] = useState<'room' | 'apartment'>('room')
  // Strictly 1, 2, or 3 for apartment rooms
  const [rooms, setRooms] = useState<number>(1)

  // Backend connection state
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null)
  const [checkingBackend, setCheckingBackend] = useState(false)

  // Dynamic Options loaded from GET /meta
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
    return WARD_PROFILES[wardName] || null
  }, [wardName])

  // Hard input validation rules (Min/Max based on Da Nang reality)
  const sizeError = useMemo(() => {
    if (sizeM2 <= 0) {
      return isEn ? 'Property size must be greater than 0 m².' : 'Diện tích phải lớn hơn 0 m².'
    }
    if (propertyType === 'apartment') {
      if (sizeM2 < 20) {
        return isEn ? 'Minimum apartment size is 20 m².' : 'Diện tích căn hộ/chung cư tối thiểu thường từ 20 m².'
      }
      if (sizeM2 > 200) {
        return isEn ? 'Maximum recommended apartment size is 200 m².' : 'Diện tích căn hộ khuyến nghị tối đa 200 m².'
      }
    } else {
      if (sizeM2 < 5) {
        return isEn ? 'Minimum room size is 5 m².' : 'Diện tích phòng tối thiểu phải từ 5 m².'
      }
      if (sizeM2 > 80) {
        return isEn ? 'Maximum recommended room size is 80 m².' : 'Diện tích phòng trọ tối đa khuyến nghị 80 m².'
      }
    }
    return null
  }, [sizeM2, propertyType, isEn])

  const cbdError = useMemo(() => {
    if (distToCbd < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToCbd > 20)
      return isEn
        ? 'Distance exceeds geographic bounds in Da Nang (max ~20km).'
        : 'Khoảng cách vượt quá giới hạn địa lý thực tế tại Đà Nẵng (tối đa ~20km).'
    return null
  }, [distToCbd, isEn])

  const beachError = useMemo(() => {
    if (distToBeach < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToBeach > 12)
      return isEn
        ? 'Distance exceeds coastal bounds in Da Nang (max ~12km).'
        : 'Khoảng cách vượt quá giới hạn bờ biển Đà Nẵng (tối đa ~12km).'
    return null
  }, [distToBeach, isEn])

  const uniError = useMemo(() => {
    if (distToUni < 0) return isEn ? 'Distance cannot be negative.' : 'Khoảng cách không thể là số âm.'
    if (distToUni > 10)
      return isEn
        ? 'Distance to university exceeds realistic radius in Da Nang (max ~10km).'
        : 'Khoảng cách tới trường ĐH vượt quá bán kính thực tế tại Đà Nẵng (tối đa ~10km).'
    return null
  }, [distToUni, isEn])

  const hasHardErrors = Boolean(sizeError || cbdError || beachError || uniError)

  // Smart warnings based on Da Nang geography
  const cbdWarning = useMemo(() => {
    if (!currentWardProfile || cbdError) return null
    const [min, max] = currentWardProfile.rangeDistCbd
    if (distToCbd < min || distToCbd > max) {
      return isEn
        ? `Typical CBD distance for ${wardName} is ${min} - ${max} km.`
        : `Khoảng cách tới trung tâm thực tế của ${wardName} thường từ ${min} - ${max} km.`
    }
    return null
  }, [currentWardProfile, distToCbd, cbdError, wardName, isEn])

  const beachWarning = useMemo(() => {
    if (!currentWardProfile || beachError) return null
    const [min, max] = currentWardProfile.rangeDistBeach
    if (distToBeach < min || distToBeach > max) {
      return isEn
        ? `Typical beach distance for ${wardName} is ${min} - ${max} km.`
        : `Cự ly ra biển tại ${wardName} thường nằm trong khoảng ${min} - ${max} km.`
    }
    return null
  }, [currentWardProfile, distToBeach, beachError, wardName, isEn])

  const uniWarning = useMemo(() => {
    if (!currentWardProfile || uniError) return null
    if (currentWardProfile.group === 'north') {
      const southUnis = ['FPTU', 'VKU', 'SMP']
      if (southUnis.includes(nearestUniCode)) {
        return `Gợi ý: Cụm ${wardName} gần ĐH Bách Khoa (DUT), ĐH Sư Phạm (UED) hơn so với ${UNI_LABELS[nearestUniCode] || nearestUniCode}.`
      }
    } else if (currentWardProfile.group === 'southeast' || currentWardProfile.group === 'coastal') {
      const northUnis = ['DUT', 'UED', 'DTU_HK']
      if (northUnis.includes(nearestUniCode)) {
        return `Gợi ý: Khu vực ${wardName} gần ĐH Kinh Tế (DUE), ĐH FPT (FPTU), ĐH Việt-Hàn (VKU) hơn.`
      }
    } else if (currentWardProfile.group === 'central') {
      const farUnis = ['DUT', 'UED', 'FPTU', 'VKU']
      if (farUnis.includes(nearestUniCode)) {
        return `Gợi ý: Cụm trung tâm thường gần các trường: ĐH Duy Tân (NVL), ĐH Kiến Trúc (DAU), Đông Á (UDA), ĐH Kinh Tế (DUE), UTE.`
      }
    }
    return null
  }, [currentWardProfile, nearestUniCode, uniError, wardName])

  const beachCrossWarning = useMemo(() => {
    if (!currentWardProfile || beachError) return null
    const northBeaches = ['XuanThieu', 'NamO', 'LangVan']
    const coastalSouthBeaches = ['MyKhe', 'BacMyAn', 'NonNuoc', 'SonThuy', 'TanTra']
    if (currentWardProfile.group === 'north' && coastalSouthBeaches.includes(nearestBeachCode)) {
      return `Gợi ý: Khu vực ${wardName} gần biển Xuân Thiều, Nam Ô hoặc Thanh Bình hơn so với ${BEACH_CODE_TO_LABEL[nearestBeachCode] || nearestBeachCode}.`
    }
    if ((currentWardProfile.group === 'coastal' || currentWardProfile.group === 'southeast') && northBeaches.includes(nearestBeachCode)) {
      return `Gợi ý: Khu vực ${wardName} giáp trực tiếp biển Mỹ Khê, Phạm Văn Đồng hoặc Bắc Mỹ An.`
    }
    return null
  }, [currentWardProfile, nearestBeachCode, beachError, wardName])

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
      setSmartNotice(
        isEn
          ? `Auto-filled spatial benchmarks for ${newWard}`
          : `Đã tự động gợi ý khoảng cách chuẩn cho ${newWard}`
      )
    }
  }

  // Load Metadata dynamically according to target propertyType
  const fetchMetadata = async (targetType = propertyType) => {
    setCheckingBackend(true)
    try {
      const res = await fetch(`/api/meta?property_type=${targetType}`)
      if (res.ok) {
        const data = await res.json()

        // 1. Ward options
        if (data.ward_values && Array.isArray(data.ward_values) && data.ward_values.length > 0) {
          setWardOptions(data.ward_values)
        }

        // 2. Beach options
        if (data.nearest_beach_code_values && Array.isArray(data.nearest_beach_code_values)) {
          const parsedBeachOptions: BeachOption[] = data.nearest_beach_code_values.map((item: any) => {
            if (typeof item === 'object' && item.code && item.label) return item
            const val = String(item).trim()
            if (BEACH_CODE_TO_LABEL[val]) return { code: val, label: BEACH_CODE_TO_LABEL[val] }
            if (BEACH_LABEL_TO_CODE[val]) return { code: BEACH_LABEL_TO_CODE[val], label: val }
            return { code: val, label: val }
          })
          setBeachOptions(parsedBeachOptions.length > 0 ? parsedBeachOptions : STANDARD_BEACHES)
        }

        // 3. Uni options
        if (data.nearest_uni_code_values && Array.isArray(data.nearest_uni_code_values)) {
          setUniCodeOptions(data.nearest_uni_code_values)
        }

        // 4. Furnishing options
        const rawFurnishing = data.furnishing_status_values || data.furnishing_values
        if (rawFurnishing && Array.isArray(rawFurnishing)) {
          const filtered = rawFurnishing
            .map((f: string) => (f.includes('Không xác định') ? null : f))
            .filter(Boolean) as string[]
          setFurnishingOptions(filtered.length > 0 ? filtered : STANDARD_FURNISHING)
        }

        setIsBackendOnline(data.is_backend_online ?? false)
      } else {
        setIsBackendOnline(false)
      }
    } catch (err) {
      console.warn('Failed to fetch metadata:', err)
      setIsBackendOnline(false)
    } finally {
      setCheckingBackend(false)
    }
  }

  useEffect(() => {
    fetchMetadata(propertyType)
  }, [])

  // Property Type Switcher Handler
  const handlePropertyTypeChange = (newType: 'room' | 'apartment') => {
    if (newType === propertyType) return
    setPropertyType(newType)
    setErrorMsg(null)
    setPrediction(null)

    if (newType === 'apartment') {
      if (sizeM2 < 30) setSizeM2(55)
      setRooms(1) // strictly default to 1 room
      setHasElevator(1) // apartments normally have elevators
      setSmartNotice(
        isEn
          ? 'Switched to Apartment / Condo valuation mode'
          : 'Đã chuyển sang chế độ Định giá Căn hộ / Chung cư'
      )
    } else {
      if (sizeM2 > 50) setSizeM2(25)
      setHasElevator(0)
      setSmartNotice(
        isEn
          ? 'Switched to Rental Room valuation mode'
          : 'Đã chuyển sang chế độ Định giá Phòng trọ'
      )
    }

    fetchMetadata(newType)
  }

  // Sample Presets for 1-Click Testing
  const handleApplyPreset = (presetKey: string) => {
    setErrorMsg(null)
    if (propertyType === 'apartment') {
      if (presetKey === 'apt1') {
        setSizeM2(45)
        setRooms(1) // 1 room
        setDistToCbd(3.2)
        setDistToBeach(0.8)
        setDistToUni(2.5)
        setHasBalcony(1)
        setHasElevator(1)
        setHasWindow(1)
        setFurnishingStatus('Đầy đủ nội thất')
        setWardName(wardOptions.includes('Sơn Trà') ? 'Sơn Trà' : 'An Hải')
        setNearestBeachCode('MyKhe')
        setNearestUniCode('DUE')
        setSmartNotice(
          isEn
            ? 'Applied 1-Bed Beach Apartment preset'
            : 'Đã áp dụng mẫu Căn hộ 1PN Biển (45m², 1 phòng)'
        )
      } else if (presetKey === 'apt2') {
        setSizeM2(72)
        setRooms(2) // 2 rooms
        setDistToCbd(1.2)
        setDistToBeach(2.5)
        setDistToUni(1.0)
        setHasBalcony(1)
        setHasElevator(1)
        setHasWindow(1)
        setFurnishingStatus('Đầy đủ nội thất')
        setWardName(wardOptions.includes('Hải Châu') ? 'Hải Châu' : 'Hòa Cường')
        setNearestBeachCode('PhamVanDong')
        setNearestUniCode('DTU_NVL')
        setSmartNotice(
          isEn
            ? 'Applied 2-Bed Family Apartment preset'
            : 'Đã áp dụng mẫu Căn hộ 2PN TT Hải Châu (72m², 2 phòng)'
        )
      } else if (presetKey === 'apt3') {
        setSizeM2(115)
        setRooms(3) // 3 rooms
        setDistToCbd(2.0)
        setDistToBeach(0.5)
        setDistToUni(2.8)
        setHasBalcony(1)
        setHasElevator(1)
        setHasWindow(1)
        setFurnishingStatus('Nội thất cao cấp')
        setWardName(wardOptions.includes('Ngũ Hành Sơn') ? 'Ngũ Hành Sơn' : 'Sơn Trà')
        setNearestBeachCode('BacMyAn')
        setNearestUniCode('DUE')
        setSmartNotice(
          isEn
            ? 'Applied 3-Bed Luxury Condo preset'
            : 'Đã áp dụng mẫu Căn hộ 3PN Cao cấp Biển (115m², 3 phòng)'
        )
      }
    } else {
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
        setSmartNotice(
          isEn
            ? 'Applied PolyTech Student Room preset'
            : 'Đã áp dụng mẫu SV Bách Khoa (18m²)'
        )
      } else if (presetKey === 'studio') {
        setSizeM2(32)
        setDistToCbd(3.2)
        setDistToBeach(0.6)
        setDistToUni(3.0)
        setHasBalcony(1)
        setHasElevator(0)
        setHasWindow(1)
        setFurnishingStatus('Đầy đủ nội thất')
        setWardName(wardOptions.includes('Sơn Trà') ? 'Sơn Trà' : 'Ngũ Hành Sơn')
        setNearestBeachCode('PhamVanDong')
        setNearestUniCode('DUE')
        setSmartNotice(
          isEn
            ? 'Applied Beach Studio preset'
            : 'Đã áp dụng mẫu Studio Biển (32m²)'
        )
      } else if (presetKey === 'luxury') {
        setSizeM2(48)
        setDistToCbd(1.0)
        setDistToBeach(2.8)
        setDistToUni(1.2)
        setHasBalcony(1)
        setHasElevator(1)
        setHasWindow(1)
        setFurnishingStatus('Nội thất cao cấp')
        setWardName(wardOptions.includes('Hải Châu') ? 'Hải Châu' : 'Hòa Cường')
        setNearestBeachCode('PhamVanDong')
        setNearestUniCode('DTU_NVL')
        setSmartNotice(
          isEn
            ? 'Applied Hai Chau VIP Room preset'
            : 'Đã áp dụng mẫu Phòng VIP TT Hải Châu (48m²)'
        )
      }
    }
  }

  // Handle Predict Submission
  const handlePredict = async (e?: React.FormEvent, forceSimulation = false) => {
    if (e) e.preventDefault()

    if (hasHardErrors) {
      setErrorMsg(
        sizeError ||
          cbdError ||
          beachError ||
          uniError ||
          (isEn
            ? 'Please correct invalid values before predicting.'
            : 'Vui lòng kiểm tra và điều chỉnh các thông số hợp lệ.')
      )
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const payload: any = {
      property_type: propertyType,
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

    // Only send rooms when in apartment mode (strictly 1, 2, or 3)
    if (propertyType === 'apartment') {
      payload.rooms = Math.min(3, Math.max(1, Math.round(rooms || 1)))
    }

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data.error || `Lỗi máy chủ (${res.status})`)
      }

      const normalized = normalizePredictionResponse(data)
      if (!normalized.price_million_vnd && !normalized.predicted_price_vnd) {
        throw new Error(
          data.detail ||
            data.message ||
            (isEn
              ? 'Backend response does not match expected structure.'
              : 'Dữ liệu phản hồi từ Backend không đúng cấu trúc giá dự đoán.')
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
          (isEn
            ? 'Unable to connect to backend server. You can click "Run UI simulation" below.'
            : 'Không thể kết nối đến Backend tại cổng 8000. Bạn có thể bấm nút "Mô phỏng thử nghiệm" bên dưới để kiểm tra.')
      )
    } finally {
      setLoading(false)
    }
  }

  // Formatting helpers strictly standardized to Vietnamese Currency (vi-VN)
  const formatMoney = (amount?: number | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return isEn ? '0 VND' : '0 đ'
    return Math.round(amount).toLocaleString('vi-VN') + (isEn ? ' VND' : ' đ')
  }

  const formatVndDelta = (amount?: number | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return isEn ? '0 VND' : '0 đ'
    const rounded = Math.round(amount)
    const formatted = Math.abs(rounded).toLocaleString('vi-VN') + (isEn ? ' VND' : ' đ')
    if (rounded > 0) return `+${formatted}`
    if (rounded < 0) return `-${formatted}`
    return formatted
  }

  const formatPriceMillion = (val: any) => {
    if (val === undefined || val === null) return '0.00'
    const num = typeof val === 'number' ? val : parseFloat(val)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  const formatContributionValue = (val: string | number) => {
    if (typeof val !== 'string') return String(val)
    for (const [code, label] of Object.entries(BEACH_CODE_TO_LABEL)) {
      if (val.includes(code)) return val.replace(code, label)
    }
    return val
  }

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

  const maxVndEffect = useMemo(() => {
    if (contributionsList.length === 0) return 500000
    return Math.max(...contributionsList.map((c) => Math.abs(c.vnd_effect || 0)), 100000)
  }, [contributionsList])

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
          {propertyType === 'apartment' ? <Building2 size={24} /> : <Sparkles size={24} />}
        </div>
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={13} style={{ color: '#3078f0' }} />
            {isEn ? 'AI RENTAL VALUATION & SHAP ANALYSIS' : 'HỆ THỐNG ĐỊNH GIÁ BẤT ĐỘNG SẢN & PHÂN TÍCH TÁC ĐỘNG GIÁ'}
          </span>
          <h2 style={{ fontSize: '23px', margin: '6px 0 4px' }}>
            {propertyType === 'apartment'
              ? isEn
                ? 'Apartment & Condominium Rental Valuation'
                : 'Định Giá Căn Hộ / Chung Cư & Phân Tích Yếu Tố Tác Động'
              : isEn
                ? 'Rental Room Valuation & Feature Impact Analysis'
                : 'Định Giá Thuê Phòng Trọ & Phân Tích Yếu Tố Tác Động'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {propertyType === 'apartment'
              ? isEn
                ? 'Accurate valuation for 1-3 room serviced apartments and condominiums in Da Nang.'
                : 'Ước tính giá thuê căn hộ, chung cư (1, 2, 3 phòng ngủ) tại Đà Nẵng, bóc tách mức độ tác động của từng đặc trưng.'
              : isEn
                ? 'Real-time rental room valuation based on spatial, location, and amenity parameters in Da Nang.'
                : 'Ước tính giá thuê phòng trọ thời gian thực dựa trên vị trí địa lý, tiện ích và các điểm quy chiếu tại Đà Nẵng.'}
          </p>
        </div>

        {/* Backend Online/Offline Pill */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div className={`predict-status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendOnline ? '#10b981' : '#f59e0b',
                boxShadow: isBackendOnline ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            />
            <span>
              {isBackendOnline ? 'Hệ thống Online (Cổng 8000)' : isEn ? 'Backend Disconnected' : 'Chưa kết nối Backend'}
            </span>
            <button
              onClick={() => fetchMetadata(propertyType)}
              title={isEn ? 'Check connection' : 'Kiểm tra lại kết nối'}
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
              <h3>{isEn ? 'Property Specifications' : 'Thông Số Bất Động Sản'}</h3>
              <p>
                {isEn
                  ? 'Select property type and enter specifications or choose a quick sample'
                  : 'Chọn loại hình và nhập thông tin để dự đoán giá'}
              </p>
            </div>
            <button
              onClick={() => {
                if (propertyType === 'apartment') {
                  setSizeM2(55)
                  setRooms(1)
                  setDistToCbd(2.5)
                  setDistToBeach(1.2)
                  setDistToUni(1.5)
                  setHasBalcony(1)
                  setHasElevator(1)
                  setHasWindow(1)
                  setFurnishingStatus('Đầy đủ nội thất')
                  setWardName('Sơn Trà')
                  setNearestBeachCode('MyKhe')
                  setNearestUniCode('DUE')
                } else {
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
                }
                setErrorMsg(null)
                setSmartNotice(null)
              }}
              className="clear-filter"
              title={isEn ? 'Reset to default form' : 'Đặt lại form mặc định'}
            >
              <RotateCcw size={13} /> {isEn ? 'Reset' : 'Đặt lại'}
            </button>
          </div>

          {/* 1. PROPERTY TYPE MODE SWITCHER: 🏠 Phòng trọ vs 🏢 Căn hộ / Chung cư */}
          <div className="property-mode-selector">
            <button
              type="button"
              className={`property-mode-btn ${propertyType === 'room' ? 'active' : ''}`}
              onClick={() => handlePropertyTypeChange('room')}
            >
              <div className="property-mode-icon">
                <DoorClosed size={18} />
              </div>
              <div className="mode-btn-content">
                <span className="mode-btn-title">🏠 {isEn ? 'Rental Room' : 'Phòng trọ'}</span>
                <span className="mode-btn-sub">
                  {isEn ? 'Individual rooms, students & workers' : 'Phòng độc lập, trọ sinh viên & người đi làm'}
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`property-mode-btn ${propertyType === 'apartment' ? 'active' : ''}`}
              onClick={() => handlePropertyTypeChange('apartment')}
            >
              <div className="property-mode-icon">
                <Building2 size={18} />
              </div>
              <div className="mode-btn-content">
                <span className="mode-btn-title">🏢 {isEn ? 'Apartment / Condo' : 'Căn hộ / Chung cư'}</span>
                <span className="mode-btn-sub">
                  {isEn ? 'Serviced condos & family flats (1-3 rooms)' : 'Căn hộ dịch vụ, chung cư gia đình '}
                </span>
              </div>
            </button>
          </div>

          {/* Quick Presets Bar */}
          <div className="preset-bar">
            <span className="preset-title">{isEn ? 'Presets:' : 'Mẫu nhanh:'}</span>
            {propertyType === 'apartment' ? (
              <>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('apt1')}
                >
                  🏢 {isEn ? '1-Bed Beach Apt (45m²)' : 'Căn 1PN Biển (45m², 1 phòng)'}
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('apt2')}
                >
                  👨‍👩‍👧 {isEn ? '2-Bed Family Apt (72m²)' : 'Căn 2PN TT Hải Châu (72m², 2 phòng)'}
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('apt3')}
                >
                  🌟 {isEn ? '3-Bed Luxury Condo (115m²)' : 'Căn 3PN Cao cấp (115m², 3 phòng)'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('student')}
                >
                  🎓 {isEn ? 'PolyTech Student (18m²)' : 'SV Bách Khoa (18m²)'}
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('studio')}
                >
                  🏖️ {isEn ? 'Beach Studio (32m²)' : 'Studio Biển (32m²)'}
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset('luxury')}
                >
                  🏙️ {isEn ? 'Hai Chau VIP Room (48m²)' : 'Phòng VIP Hải Châu (48m²)'}
                </button>
              </>
            )}
          </div>

          <form onSubmit={handlePredict}>
            {/* GROUP 1: Physical Size, Rooms & Location Metrics */}
            <div className="form-group-title">
              <Maximize2 size={13} style={{ color: 'var(--blue)' }} />
              {propertyType === 'apartment'
                ? isEn
                  ? '1. Size, Rooms & Commute Distances'
                  : '1. Diện tích, Số phòng ngủ & Cự ly di chuyển'
                : isEn
                  ? '1. Size & Commute Distances'
                  : '1. Diện tích & Khoảng cách di chuyển'}
            </div>

            {/* ONLY FOR APARTMENT: Dropdown/Select strictly allowing 1, 2, or 3 rooms */}
            {propertyType === 'apartment' && (
              <div className="form-field" style={{ marginBottom: '14px' }}>
                <label>
                  <span>{isEn ? 'Number of Bedrooms / Rooms' : 'Số phòng ngủ / Không gian'}</span>
                  <span className="unit">{isEn ? '(Select 1, 2, or 3)' : '(Chỉ nhận 1, 2 hoặc 3 phòng)'}</span>
                </label>
                <div className="rooms-select-wrapper">
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(parseInt(e.target.value, 10))}
                    className="rooms-select"
                  >
                    <option value={1}>{isEn ? '1 Bedroom (Studio / 1-Room)' : '1 Phòng (Studio / 1 Phòng ngủ)'}</option>
                    <option value={2}>{isEn ? '2 Bedrooms (Family / 2-Rooms)' : '2 Phòng (Gia đình / 2 Phòng ngủ)'}</option>
                    <option value={3}>{isEn ? '3 Bedrooms (Spacious / 3-Rooms)' : '3 Phòng (Rộng rãi / 3 Phòng ngủ)'}</option>
                  </select>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-field">
                <label>
                  <span>
                    {propertyType === 'apartment'
                      ? isEn
                        ? 'Apartment size'
                        : 'Diện tích căn hộ'
                      : isEn
                        ? 'Room size'
                        : 'Diện tích phòng'}
                  </span>
                  <span className="unit">{propertyType === 'apartment' ? '(20 - 200 m²)' : '(5 - 80 m²)'}</span>
                </label>
                <div className="form-input-wrap">
                  <input
                    type="number"
                    step="0.5"
                    min={propertyType === 'apartment' ? 20 : 5}
                    max={propertyType === 'apartment' ? 200 : 80}
                    required
                    value={sizeM2}
                    onChange={(e) => setSizeM2(parseFloat(e.target.value) || 0)}
                    className={`form-input ${sizeError ? 'input-error' : ''}`}
                    placeholder={propertyType === 'apartment' ? 'VD: 55' : 'VD: 25'}
                  />
                </div>
                {sizeError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>{sizeError}</span>
                  </div>
                )}
                <div className="quick-chips">
                  {(propertyType === 'apartment' ? [45, 65, 85, 120] : [18, 25, 35, 50]).map((val) => (
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
                  <span>{isEn ? 'Distance to CBD' : 'Khoảng cách tới trung tâm'}</span>
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
                    placeholder="VD: 3.5"
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
                    placeholder="VD: 2.0"
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
                    placeholder="VD: 1.2"
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

            {/* GROUP 2: Geographic Ward & Anchors */}
            <div className="form-group-title">
              <MapPin size={13} style={{ color: 'var(--blue)' }} />
              {isEn ? '2. Location & Nearby Anchors' : '2. Khu vực & Điểm quy chiếu lân cận'}
            </div>

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
                  title={isEn ? 'Close notice' : 'Đóng thông báo'}
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-field" style={{ marginBottom: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <label style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  {isEn ? 'Ward / Area (Da Nang)' : 'Phường / Xã (Đà Nẵng)'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className={`smart-toggle-btn ${enableSmartDefaults ? 'active' : ''}`}
                    onClick={() => setEnableSmartDefaults(!enableSmartDefaults)}
                    title={
                      isEn
                        ? 'Toggle auto-suggest distance & location anchors'
                        : 'Bật/Tắt tự động gợi ý khoảng cách & địa điểm khi đổi phường'
                    }
                  >
                    <Lightbulb size={11} />
                    {enableSmartDefaults ? (isEn ? 'Hints: ON' : 'Gợi ý: BẬT') : isEn ? 'Hints: OFF' : 'Gợi ý: TẮT'}
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
                  className="form-select"
                >
                  {beachOptions.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.label}
                    </option>
                  ))}
                </select>
                {beachCrossWarning && (
                  <div className="field-warning-text" style={{ marginTop: '5px' }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{beachCrossWarning}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label style={{ whiteSpace: 'nowrap' }}>{isEn ? 'Nearest university' : 'Trường ĐH gần nhất'}</label>
                <select
                  value={nearestUniCode}
                  onChange={(e) => setNearestUniCode(e.target.value)}
                  className="form-select"
                >
                  {uniCodeOptions.map((u) => (
                    <option key={u} value={u}>
                      {UNI_LABELS[u] || u}
                    </option>
                  ))}
                </select>
                {uniWarning && (
                  <div className="field-warning-text" style={{ marginTop: '5px' }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{uniWarning}</span>
                  </div>
                )}
              </div>
            </div>

            {/* GROUP 3: Furnishing & Amenities */}
            <div className="form-group-title">
              <Armchair size={13} style={{ color: 'var(--blue)' }} />
              {isEn ? '3. Furnishing & Amenities' : '3. Nội thất & Tiện nghi đi kèm'}
            </div>

            <div className="form-field" style={{ marginBottom: '14px' }}>
              <label>{isEn ? 'Furnishing status' : 'Tình trạng nội thất'}</label>
              <select
                value={furnishingStatus}
                onChange={(e) => setFurnishingStatus(e.target.value)}
                className="form-select"
              >
                {furnishingOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Amenities Checkboxes */}
            <div className="amenities-grid">
              <div
                className={`checkbox-card ${hasBalcony ? 'checked' : ''}`}
                onClick={() => setHasBalcony(hasBalcony ? 0 : 1)}
              >
                <div className="icon-box">
                  <Check size={14} style={{ opacity: hasBalcony ? 1 : 0 }} />
                </div>
                <div className="label-box">
                  <strong>{isEn ? 'Balcony' : 'Ban công'}</strong>
                  <small>{isEn ? 'Outdoor open space' : 'Khu vực ban công riêng'}</small>
                </div>
              </div>

              <div
                className={`checkbox-card ${hasElevator ? 'checked' : ''}`}
                onClick={() => setHasElevator(hasElevator ? 0 : 1)}
              >
                <div className="icon-box">
                  <Check size={14} style={{ opacity: hasElevator ? 1 : 0 }} />
                </div>
                <div className="label-box">
                  <strong>{isEn ? 'Elevator' : 'Thang máy'}</strong>
                  <small>{isEn ? 'Building elevator' : 'Thang máy di chuyển'}</small>
                </div>
              </div>

              <div
                className={`checkbox-card ${hasWindow ? 'checked' : ''}`}
                onClick={() => setHasWindow(hasWindow ? 0 : 1)}
              >
                <div className="icon-box">
                  <Check size={14} style={{ opacity: hasWindow ? 1 : 0 }} />
                </div>
                <div className="label-box">
                  <strong>{isEn ? 'Window' : 'Cửa sổ'}</strong>
                  <small>{isEn ? 'Sunlight & ventilation' : 'Đón gió & ánh sáng'}</small>
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
                      {isEn ? '⚡ Run UI simulation test' : '⚡ Chạy mô phỏng kiểm tra UI ngay'}
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
            >
              {loading ? (
                <>
                  <div className="pulse-spinner" style={{ width: '18px', height: '18px' }} />
                  <span>{isEn ? 'Valuating with AI...' : 'Hệ thống AI đang tính toán định giá...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>
                    {propertyType === 'apartment'
                      ? isEn
                        ? 'Valuate Apartment / Condo Price'
                        : 'Dự đoán giá Căn hộ / Chung cư'
                      : isEn
                        ? 'Valuate Rental Room Price'
                        : 'Dự đoán giá phòng trọ'}
                  </span>
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
            <div className="card predict-empty-card">
              <div className="predict-empty-icon">
                <Calculator size={28} />
              </div>
              <h3 style={{ font: "800 18px 'Manrope', sans-serif", margin: '0 0 8px', color: 'var(--ink)' }}>
                {isEn ? 'Ready for Valuation & SHAP Analysis' : 'Sẵn Sàng Định Giá & Phân Tích Yếu Tố Tác Động'}
              </h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: 'var(--muted)', fontSize: '13px' }}>
                {propertyType === 'apartment'
                  ? isEn
                    ? 'Enter apartment parameters on the left or select a Quick Preset to run valuation.'
                    : 'Điền các thông số căn hộ/chung cư ở cột bên trái hoặc bấm vào một trong các Mẫu nhanh để định giá.'
                  : isEn
                    ? 'Enter property parameters on the left or select a Quick Preset to run valuation.'
                    : 'Điền các thông số căn phòng trọ ở cột bên trái hoặc bấm vào một trong các Mẫu nhanh để định giá.'}
              </p>
            </div>
          )}

          {/* State 2: Loading State */}
          {loading && (
            <div className="card predict-loading-card">
              <div className="pulse-spinner" />
              <h4 style={{ font: "800 16px 'Manrope', sans-serif", margin: '0 0 6px' }}>
                {isEn ? 'Valuating with AI Engine...' : 'Hệ thống AI đang phân tích dữ liệu thị trường...'}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                {isEn
                  ? 'Retrieving market weights and computing feature contributions (SHAP).'
                  : 'Đang bóc tách mức độ tác động của diện tích, vị trí và các tiện nghi đi kèm.'}
              </p>
            </div>
          )}

          {/* State 3: Prediction Results Rendered */}
          {prediction && !loading && (prediction.price_million_vnd !== undefined || prediction.predicted_price_vnd !== undefined) && (
            <>
              {/* Result Hero Display */}
              <div className="result-hero-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--blue)', marginBottom: '4px' }}>
                      {propertyType === 'apartment'
                        ? isEn
                          ? `APARTMENT VALUATION RESULT (${rooms} ROOMS)`
                          : `KẾT QUẢ ĐỊNH GIÁ CĂN HỘ / CHUNG CƯ (${rooms} PHÒNG NGỦ)`
                        : isEn
                          ? 'RENTAL ROOM VALUATION RESULT'
                          : 'KẾT QUẢ ĐỊNH GIÁ PHÒNG TRỌ'}
                    </span>
                    <div className="price-main-display">
                      <span className="price-main-number">{formatPriceMillion(prediction?.price_million_vnd)}</span>
                      <span className="price-main-unit">{isEn ? 'M VND / mo' : 'triệu VND / tháng'}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>
                      {isEn ? 'Equivalent to: ' : 'Tương đương: '}
                      <strong style={{ color: 'var(--ink)' }}>
                        {formatMoney(
                          prediction?.predicted_price_vnd || (prediction?.price_million_vnd || 0) * 1000000
                        )}
                      </strong>
                      <span style={{ margin: '0 8px', color: 'var(--line)' }}>|</span>
                      <span>
                        {isEn ? 'Unit rate: ' : 'Đơn giá: '}
                        <strong style={{ color: 'var(--blue)' }}>
                          {Math.round(
                            ((prediction?.price_million_vnd || 0) * 1000000) / (sizeM2 || 1)
                          ).toLocaleString(isEn ? 'en-US' : 'vi-VN')}{' '}
                          {isEn ? 'VND/m²' : 'đ/m²'}
                        </strong>
                      </span>
                      {propertyType === 'apartment' && (
                        <>
                          <span style={{ margin: '0 8px', color: 'var(--line)' }}>|</span>
                          <span>
                            {isEn ? 'Layout: ' : 'Quy mô: '}
                            <strong style={{ color: '#16a34a' }}>
                              {rooms} {isEn ? 'Bedroom(s)' : 'Phòng ngủ'}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {prediction.is_simulation && (
                    <span className="simulation-pill">
                      {isEn ? 'UI Simulation Mode' : 'Chế độ mô phỏng kiểm tra UI'}
                    </span>
                  )}
                </div>

                {/* Range Estimate */}
                {formattedRange && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>
                        {isEn ? 'Estimated reference range:' : 'Khoảng giá tham khảo ước tính:'}
                      </span>
                      <strong style={{ color: 'var(--ink)' }}>{formattedRange}</strong>
                    </div>
                    <div className="range-indicator">
                      <div className="range-fill" style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Metric Cards for Overview */}
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
                    {formatMoney(
                      prediction.explanation?.base_value_vnd || (propertyType === 'apartment' ? 7500000 : 2850000)
                    )}
                  </strong>
                  <small style={{ fontSize: '10px' }}>
                    {propertyType === 'apartment'
                      ? isEn
                        ? 'Da Nang apartment baseline'
                        : 'Điểm chuẩn căn hộ chung cư ĐN'
                      : isEn
                        ? 'Da Nang room benchmark'
                        : 'Điểm chuẩn phòng trọ Đà Nẵng'}
                  </small>
                </div>

                <div className="card metric-card" style={{ padding: '14px 16px' }}>
                  <span
                    className="metric-tag-positive"
                    style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <TrendingUp size={13} /> {isEn ? 'Total positive impact' : 'Tổng tác động tăng giá'}
                  </span>
                  <strong className="metric-val-positive" style={{ font: "800 18px 'Manrope', sans-serif" }}>
                    +{formatMoney(impactSummary.positiveVnd)}
                  </strong>
                  <small style={{ fontSize: '10px' }}>
                    {isEn ? 'From location & amenity advantages' : 'Từ ưu thế vị trí & tiện ích'}
                  </small>
                </div>

                <div className="card metric-card" style={{ padding: '14px 16px' }}>
                  <span
                    className="metric-tag-negative"
                    style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <TrendingDown size={13} /> {isEn ? 'Total negative impact' : 'Tổng tác động giảm giá'}
                  </span>
                  <strong className="metric-val-negative" style={{ font: "800 18px 'Manrope', sans-serif" }}>
                    -{formatMoney(impactSummary.negativeVnd)}
                  </strong>
                  <small style={{ fontSize: '10px' }}>
                    {isEn ? 'From distance or missing amenities' : 'Do cự ly xa hoặc thiếu tiện ích'}
                  </small>
                </div>
              </div>

              {/* ============================================================= */}
              {/* SHAP DIVERGING HORIZONTAL BAR CHART (WITH 0-AXIS)             */}
              {/* ============================================================= */}
              <div className="card shap-diverging-card">
                <div className="shap-diverging-header">
                  <div className="shap-diverging-title-box">
                    <h3 className="shap-diverging-title">
                      <Sliders size={16} style={{ color: 'var(--blue)' }} />
                      {isEn ? 'Feature Impact Breakdown ' : 'Biểu Đồ Phân Kỳ Tác Động SHAP '}
                    </h3>
                    
                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        shapFilter === 'all'
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-white/50'
                      }`}
                      onClick={() => setShapFilter('all')}
                    >
                      {isEn ? 'All' : 'Tất cả'} <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600">{contributionsList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        shapFilter === 'positive'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      onClick={() => setShapFilter('positive')}
                    >
                      + {isEn ? 'Increase' : 'Tăng giá'}
                    </button>

                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        shapFilter === 'negative'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      onClick={() => setShapFilter('negative')}
                    >
                      - {isEn ? 'Decrease' : 'Giảm giá'}
                    </button>
                  </div>
                  </div>

                </div>

                {/* 3-Column Guide Header */}
                <div className="shap-axis-guide-row">
                  <div className="shap-axis-col-left">
                    {isEn ? 'FEATURE & ACTUAL VALUE' : 'ĐẶC TRƯNG & GIÁ TRỊ THỰC'}
                  </div>
                  <div className="shap-axis-col-center">
                    <span className="axis-label-neg">← {isEn ? 'Decrease' : 'Giảm giá'}</span>
                    <span className="axis-label-zero">{isEn ? '0-Axis' : 'Trục 0'}</span>
                    <span className="axis-label-pos">{isEn ? 'Increase' : 'Tăng giá'} →</span>
                  </div>
                  <div className="shap-axis-col-right">
                    {isEn ? 'IMPACT (VND / %)' : 'ẢNH HƯỞNG (VND / %)'}
                  </div>
                </div>

                {/* 3-Column Diverging Rows */}
                <div className="shap-diverging-list">
                  {filteredContributions.map((item, idx) => {
                    const isPositive =
                      item.direction === 'tăng giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect > 0)
                    const isNegative =
                      item.direction === 'giảm giá' || (typeof item.vnd_effect === 'number' && item.vnd_effect < 0)
                    const absVal = Math.abs(item.vnd_effect || 0)
                    // Half width max 46% of container track
                    const barWidthPct = Math.min(46, Math.max(3, (absVal / maxVndEffect) * 46))

                    return (
                      <div key={idx} className="shap-diverging-row">
                        {/* 1. CỘT TRÁI - ĐẶC TRƯNG & GIÁ TRỊ THỰC */}
                        <div className="shap-col-feature">
                          <strong className="shap-feature-name">{item.label}</strong>
                          <span className="shap-feature-val" title={String(item.value)}>
                            {formatContributionValue(item.value)}
                          </span>
                        </div>

                        {/* 2. CỘT GIỮA - THANH TRỰC QUAN SHAP (CÓ TRỤC 0) */}
                        <div className="shap-col-chart">
                          <div className="shap-diverging-track">
                            {/* Trục 0 mỏng nằm cố định ở giữa */}
                            <div className="shap-zero-line" />

                            {/* TĂNG GIÁ: Thanh nằm BÊN PHẢI Trục 0, màu xanh lá ngọc (#10B981) */}
                            {isPositive && (
                              <div
                                className="shap-diverging-bar positive"
                                style={{ width: `${barWidthPct}%` }}
                                title={`${item.label}: ${formatVndDelta(item.vnd_effect)} (${item.pct_effect})`}
                              />
                            )}

                            {/* GIẢM GIÁ: Thanh nằm BÊN TRÁI Trục 0, màu đỏ/cam (#EF4444) */}
                            {isNegative && (
                              <div
                                className="shap-diverging-bar negative"
                                style={{ width: `${barWidthPct}%` }}
                                title={`${item.label}: ${formatVndDelta(item.vnd_effect)} (${item.pct_effect})`}
                              />
                            )}

                            {!isPositive && !isNegative && (
                              <div className="shap-diverging-dot" />
                            )}
                          </div>
                        </div>

                        {/* 3. CỘT PHẢI - ẢNH HƯỞNG (VND / %) */}
                        <div className="shap-col-impact">
                          <strong
                            className={`shap-impact-money ${
                              isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
                            }`}
                          >
                            {formatVndDelta(item.vnd_effect)}
                          </strong>
                          <span
                            className={`shap-impact-percent ${
                              isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
                            }`}
                          >
                            {String(item.pct_effect)}
                          </span>
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
                      {isEn ? 'Itemized Price Contribution Breakdown Table' : 'Bảng Chi Tiết Tác Động Từng Đặc Trưng'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>
                      {isEn
                        ? 'Cumulative attribution from market baseline to final predicted valuation.'
                        : 'Cộng dồn từng thành phần từ mức giá gốc cơ sở đến mức giá dự đoán cuối cùng.'}
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>{isEn ? 'Factor' : 'Yếu tố'}</th>
                        <th>{isEn ? 'Input Value' : 'Giá trị nhập liệu'}</th>
                        <th>{isEn ? 'Impact' : 'Chiều hướng'}</th>
                        <th>{isEn ? 'Impact Ratio (%)' : 'Tỷ lệ tác động (%)'}</th>
                        <th style={{ textAlign: 'right' }}>{isEn ? 'Monetary Impact (VND)' : 'Ảnh hưởng bằng tiền (VND)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Base Value Row */}
                      <tr className="highlight-base">
                        <td>
                          <strong>{isEn ? 'Market Baseline' : 'Mức giá cơ sở thị trường (Baseline)'}</strong>
                        </td>
                        <td>{isEn ? 'Da Nang benchmark' : 'Điểm chuẩn Đà Nẵng'}</td>
                        <td>
                          <span className="direction-badge neutral">{isEn ? 'Baseline' : 'Cơ sở chuẩn'}</span>
                        </td>
                        <td>0.0%</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {formatMoney(
                            prediction.explanation?.base_value_vnd ||
                              (propertyType === 'apartment' ? 7500000 : 2850000)
                          )}
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
                              <strong>{item.label}</strong>
                            </td>
                            <td>
                              <span className="shap-impact-badge">{formatContributionValue(item.value)}</span>
                            </td>
                            <td>
                              {isPositive && (
                                <span className="direction-badge increase">
                                  <TrendingUp size={11} /> {isEn ? 'Increase' : 'Tăng giá'}
                                </span>
                              )}
                              {isNegative && (
                                <span className="direction-badge decrease">
                                  <TrendingDown size={11} /> {isEn ? 'Decrease' : 'Giảm giá'}
                                </span>
                              )}
                              {!isPositive && !isNegative && (
                                <span className="direction-badge neutral">{isEn ? 'Neutral' : 'Trung lập'}</span>
                              )}
                            </td>
                            <td
                              style={{
                                fontWeight: 600,
                                color: isPositive
                                  ? 'var(--positive-text, #15803d)'
                                  : isNegative
                                    ? 'var(--negative-text, #b91c1c)'
                                    : 'inherit'
                              }}
                            >
                              {String(item.pct_effect)}
                            </td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 800,
                                fontFamily: "'Manrope', 'Inter', sans-serif",
                                color: isPositive
                                  ? '#059669'
                                  : isNegative
                                    ? '#e11d48'
                                    : 'inherit'
                              }}
                            >
                              {formatVndDelta(item.vnd_effect)}
                            </td>
                          </tr>
                        )
                      })}

                      {/* Final Predicted Price Row */}
                      <tr className="highlight-total">
                        <td>
                          <strong style={{ color: 'var(--blue)' }}>
                            {isEn ? 'FINAL PREDICTED RENT' : 'GIÁ DỰ ĐOÁN CUỐI CÙNG'}
                          </strong>
                        </td>
                        <td colSpan={2}>
                          {propertyType === 'apartment'
                            ? isEn
                              ? 'Apartment / Condominium AI Valuation'
                              : 'Định Giá Căn Hộ / Chung Cư Đà Nẵng'
                            : isEn
                              ? 'Rental Room AI Valuation'
                              : 'Định Giá Phòng Trọ Đà Nẵng'}
                        </td>
                        <td style={{ color: 'var(--blue)', fontWeight: 800 }}>
                          {formatPriceMillion(prediction?.price_million_vnd)} {isEn ? 'M VND / mo' : 'triệu/tháng'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: 'var(--blue)',
                            font: "800 15px 'Manrope', sans-serif"
                          }}
                        >
                          {formatMoney(
                            prediction?.predicted_price_vnd || (prediction?.price_million_vnd || 0) * 1000000
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="predict-info-banner">
                  <Info size={15} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                  <span>
                    {isEn
                      ? 'Attribution formula: Predicted Price = Market Baseline + Σ(Feature Impacts). Each factor explains why the property is priced above or below market average based on Da Nang market data.'
                      : 'Công thức phân tích đóng góp: Giá dự đoán = Giá cơ sở + ∑(Tác động từng yếu tố). Mỗi đặc trưng giải thích rõ tại sao bất động sản có giá cao hơn hay thấp hơn mặt bằng chung.'}
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
