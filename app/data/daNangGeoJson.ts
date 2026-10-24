/**
 * GeoJSON Boundaries for Da Nang City Districts & Historical Flood Zones
 */

// 1. Da Nang Major Districts Approximate Administrative Boundaries (GeoJSON FeatureCollection)
export const DA_NANG_DISTRICTS_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Hải Châu', role: 'CBD & Trung tâm Tài chính', color: '#3b82f6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.205, 16.035],
          [108.232, 16.035],
          [108.228, 16.082],
          [108.212, 16.088],
          [108.200, 16.065],
          [108.205, 16.035]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sơn Trà', role: 'Du lịch Bán đảo & Biển Mỹ Khê', color: '#06b6d4' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.232, 16.040],
          [108.256, 16.045],
          [108.265, 16.085],
          [108.280, 16.120],
          [108.250, 16.140],
          [108.225, 16.095],
          [108.232, 16.040]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Ngũ Hành Sơn', role: 'Khu đô thị Sinh thái & Resort Biển', color: '#10b981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.232, 16.040],
          [108.256, 16.045],
          [108.275, 15.980],
          [108.250, 15.960],
          [108.230, 16.000],
          [108.232, 16.040]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Thanh Khê', role: 'Thương mại Dịch vụ & Ga Đà Nẵng', color: '#f59e0b' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.175, 16.065],
          [108.205, 16.065],
          [108.200, 16.045],
          [108.175, 16.048],
          [108.175, 16.065]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Liên Chiểu', role: 'Cụm Đại học Bách Khoa & Công nghiệp', color: '#8b5cf6' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.130, 16.050],
          [108.175, 16.050],
          [108.175, 16.085],
          [108.140, 16.125],
          [108.115, 16.090],
          [108.130, 16.050]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Cẩm Lệ', role: 'Khu dân cư Mới & Cụm Logistics', color: '#ec4899' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.175, 16.035],
          [108.220, 16.035],
          [108.215, 15.990],
          [108.180, 15.990],
          [108.175, 16.035]
        ]]
      }
    }
  ]
}

// 2. Historical Flood Risk Polygons (Recorded flood points from severe rains in 2022 & 2025)
export const DA_NANG_FLOOD_ZONES_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Vùng trũng Khe Cạn (Thanh Khê)',
        level: 'Ngập sâu lịch sử 1.5 - 2.0m',
        year: '2022 & 2025'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.178, 16.052],
          [108.192, 16.054],
          [108.190, 16.044],
          [108.177, 16.042],
          [108.178, 16.052]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Vùng trũng Hòa Khánh Nam (Cụm KTX Meey)',
        level: 'Ngập sâu 1.0 - 1.8m do thoát nước chậm',
        year: '2022 & 2025'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.140, 16.058],
          [108.158, 16.060],
          [108.156, 16.048],
          [108.138, 16.046],
          [108.140, 16.058]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: 'Vùng ven Sông Cẩm Lệ (Hòa Xuân)',
        level: 'Ngập triều cường kết hợp xả lũ 0.6 - 1.2m',
        year: 'Hàng năm khi bão'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.200, 16.005],
          [108.222, 16.008],
          [108.218, 15.985],
          [108.195, 15.982],
          [108.200, 16.005]
        ]]
      }
    }
  ]
}
