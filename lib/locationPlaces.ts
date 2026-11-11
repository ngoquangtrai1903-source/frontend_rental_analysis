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

function getPlaceName(code: string | null | undefined, labels: Record<string, string>, isEn: boolean): string {
  const value = code?.trim()
  if (!value) return isEn ? 'Not available' : 'Chưa có thông tin'
  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
}

export function getNearestBeachName(code: string | null | undefined, isEn = false): string {
  return getPlaceName(code, BEACH_CODE_TO_LABEL, isEn)
}

export function getNearestUniversityName(code: string | null | undefined, isEn = false): string {
  return getPlaceName(code, isEn ? UNI_LABELS_EN : UNI_LABELS, isEn)
    .replace(/^[A-Z0-9_]+ - /, '')
    .replace(/^ĐH /, 'Đại học ')
    .replace(/^Viện NC & Đào Tạo/, 'Viện Nghiên cứu & Đào tạo')
    .replace(/Univ\./g, 'University')
}
