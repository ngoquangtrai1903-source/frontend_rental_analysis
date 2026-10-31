export type Language = 'vi' | 'en'

export const translations = {
  vi: {
    brand: 'RentIQ',
    workspaceTitle: 'Da Nang Market',
    workspaceSub: 'Data Warehouse · gold',
    workspaceInUse: 'Đang sử dụng',
    liveDataBadge: 'LIVE DATA · SCHEMA GOLD (RENTAL_ROOM)',
    filtering: 'Đang lọc...',
    loadingData: 'Đang làm mới dữ liệu theo bộ lọc hiện tại…',
    normalData: 'Dữ liệu đang hoạt động bình thường.',
    neverUpdated: 'Chưa có lần cập nhật thành công.',
    lastUpdated: 'Cập nhật lần cuối:',
    listingsMatching: 'tin đăng phù hợp với bộ lọc hiện tại.',
    refreshNow: 'Làm mới ngay',
    close: 'Đóng',
    closeMenu: 'Đóng menu',
    notSignedIn: 'Chưa đăng nhập',
    googleAccount: 'Tài khoản Google',
    profileSettings: 'Hồ sơ & cài đặt',
    signOut: 'Đăng xuất',
    signInGoogle: 'Đăng nhập bằng Google',
    signingIn: 'Đang chuyển tới Google...',
    reSignIn: 'Đăng nhập lại',
    searchPlaceholder: 'Tìm khu vực, loại hình...',
    notificationsTitle: 'Trạng thái dữ liệu',
    errorLoadingData: 'Không thể tải dữ liệu:',

    // Nav
    nav: {
      overview: 'Tổng quan',
      location: 'Vị trí & khu vực',
      amenities: 'Tiện ích',
      floodRisk: 'Rủi ro ngập lụt',
      analytics: 'Phân tích nâng cao',
      aiPredict: 'Dự đoán giá AI',
      settings: 'Cài đặt',
      help: 'Trợ giúp'
    },

    // Heading Actions
    pageTitle: 'Bảng Điều Khiển Thị Trường Thuê Đà Nẵng',
    pageSubtitle: 'Dữ liệu tổng hợp từ Data Warehouse tầng Gold với cơ chế Dynamic Query Builder.',
    exportCsv: 'Xuất CSV',
    exporting: 'Đang xuất…',
    filterButton: 'Bộ lọc',
    exportSuccess: 'Đã xuất {count} tin theo bộ lọc lúc bấm xuất.',
    exportFail: 'Không thể xuất CSV. Vui lòng thử lại.',

    // Filters
    filter: {
      postedStart: 'Ngày đăng từ',
      postedEnd: 'Ngày đăng đến',
      allHistory: 'Tất cả lịch sử',
      backTo2026: 'Về T1/2026',
      allHistoryTooltip: 'Bỏ mốc tháng 1/2026 để xem toàn bộ dữ liệu lịch sử trước 2026',
      backTo2026Tooltip: 'Khôi phục mốc mặc định từ tháng 1/2026',
      ward: 'Khu vực (Ward)',
      allWards: 'Tất cả khu vực',
      category: 'Loại hình (Category)',
      allCategories: 'Tất cả loại hình',
      furnishing: 'Mức nội thất',
      allFurnishings: 'Tất cả mức',
      priceRange: 'Khoảng giá',
      allPrices: 'Tất cả khoảng giá',
      under3m: 'Dưới 3 triệu (Bình dân / Sinh viên)',
      range3m5m: '3 — 5 triệu (Phổ thông / Người đi làm)',
      range5m8m: '5 — 8 triệu (Trung cấp / Căn hộ mini)',
      range8m15m: '8 — 15 triệu (Cao cấp / 2-3 phòng ngủ)',
      above15m: 'Trên 15 triệu (Biệt thự / Căn hộ hạng sang)',
      sizeRange: 'Diện tích',
      allSizes: 'Tất cả diện tích',
      under20m2: 'Dưới 20 m² (Phòng nhỏ / KTX)',
      range20_35m2: '20 — 35 m² (Studio / 1PN)',
      range35_50m2: '35 — 50 m² (Rộng / 1-2PN)',
      above50m2: 'Trên 50 m² (Căn lớn / Nhà riêng)',
      floodRisk: 'Rủi ro ngập',
      allFloodRisks: 'Tất cả mức rủi ro',
      lowRisk: '🟢 Rủi ro thấp (An toàn)',
      mediumRisk: '🟡 Rủi ro trung bình (Ngập nhẹ cục bộ)',
      highRisk: '🔴 Rủi ro cao (Vùng trũng lịch sử)',
      requiredAmenities: 'Tiện ích bắt buộc',
      elevator: 'Thang máy',
      balcony: 'Ban công',
      privateBath: 'Vệ sinh khép kín',
      parking: 'Chỗ để xe',
      reset: 'Đặt lại bộ lọc',
      collapse: 'Thu gọn'
    },

    // Active Chips
    chips: {
      clearAll: 'Xóa tất cả bộ lọc',
      date: 'Ngày đăng:',
      any: 'bất kỳ',
      ward: 'Khu vực:',
      category: 'Loại hình:',
      furnishing: 'Nội thất:',
      price: 'Giá:',
      size: 'DT:',
      risk: 'Rủi ro:',
      elevator: '🛗 Thang máy',
      balcony: '🌅 Ban công',
      privateBath: '🚿 Vệ sinh khép kín',
      parking: '🛵 Chỗ để xe'
    },

    // KPI Cards
    kpi: {
      totalSupply: 'TỔNG NGUỒN CUNG',
      avgRent: 'GIÁ THUÊ TRUNG BÌNH',
      medianRent: 'GIÁ THUÊ TRUNG VỊ',
      avgSize: 'DIỆN TÍCH TRUNG BÌNH',
      avgPricePerM2: 'ĐƠN GIÁ TRUNG BÌNH',
      listingsValid: 'tin đăng hợp lệ',
      perMonth: 'triệu/tháng',
      squareMeters: 'm²/phòng',
      perSquareMeter: 'triệu/m²',
      realtimeAgg: 'Tổng hợp thời gian thực',
      benchmarkAll: 'Benchmark toàn thành phố'
    },

    // Listings Table
    table: {
      title: 'Dữ liệu Tin Đăng Thuê Bất Động Sản',
      subtitle: 'Truy vấn phân trang trực tiếp từ bảng gold.rental_room theo điều kiện lọc.',
      listingCol: 'Tin đăng',
      locationCol: 'Khu vực & vị trí',
      priceSizeCol: 'Giá & diện tích',
      amenitiesRiskCol: 'Tiện ích & rủi ro',
      postedCol: 'Ngày đăng',
      sortDefault: 'Mặc định (ID)',
      sortPriceAsc: 'Giá: Thấp → Cao',
      sortPriceDesc: 'Giá: Cao → Thấp',
      sortSizeAsc: 'Diện tích: Nhỏ → Lớn',
      sortSizeDesc: 'Diện tích: Lớn → Nhỏ',
      sortDateDesc: 'Ngày đăng: Mới nhất',
      sortDateAsc: 'Ngày đăng: Cũ nhất',
      showing: 'Hiển thị',
      of: 'trên',
      records: 'tin đăng',
      page: 'Trang',
      prev: 'Trước',
      next: 'Sau',
      empty: 'Không có tin đăng nào phù hợp với điều kiện lọc hiện tại.',
      clearToReload: 'Thử xóa bớt bộ lọc để mở rộng kết quả tìm kiếm.',
      hasMap: 'Có tọa độ map'
    },

    // Settings
    settingsModal: {
      workspace: 'WORKSPACE',
      title: 'Cài đặt dashboard',
      subtitle: 'Tùy chỉnh trải nghiệm hiển thị và dữ liệu.',
      appearance: 'Giao diện',
      darkMode: 'Chế độ tối',
      darkModeDesc: 'Giảm độ sáng khi làm việc ban đêm',
      language: 'Ngôn ngữ',
      languageDesc: 'Chuyển đổi giữa Tiếng Việt và English',
      data: 'Dữ liệu',
      autoRefresh: 'Tự động làm mới dữ liệu',
      autoRefreshDesc: 'Làm mới tổng quan sau mỗi 60 giây khi tải xong dữ liệu',
      savedOnBrowser: 'Cài đặt đã lưu trên trình duyệt này',
      sessionOnly: 'Cài đặt chỉ áp dụng trong phiên này; chưa lưu được trên trình duyệt',
      understood: 'Đã hiểu'
    },

    // Help
    helpModal: {
      eyebrow: 'HƯỚNG DẪN',
      title: 'Trợ giúp',
      currentTabPrefix: 'Bạn đang xem',
      currentTabSuffix: 'Mở từng mục bên dưới để xem hướng dẫn.',
      filterSearchTitle: 'Bộ lọc và tìm kiếm',
      exportCsvTitle: 'Xuất CSV'
    },

    // Charts
    charts: {
      trendTitle: 'Xu hướng theo chu kỳ thời gian',
      trendSubtitle: 'Số lượng tin đăng và giá thuê trung bình',
      listingsCount: 'Tin đăng',
      avgPriceLabel: 'Giá TB (triệu VNĐ)',
      trendEmpty: 'Không có dữ liệu trong khoảng thời gian đã chọn.',
      distTitle: 'Phân bố khoảng giá',
      distSubtitle: 'Tỷ trọng tin đăng theo phân khúc',
      distEmpty: 'Chưa đủ dữ liệu để phân loại khoảng giá.',
      distInsight: 'Phân khúc {label} chiếm {percentage}% lượng tin đăng sau khi lọc.',
      listings: 'tin đăng'
    },

    // Common options labels
    categories: {
      apartment: 'Căn hộ/Chung cư',
      room: 'Phòng trọ'
    },
    furnishings: {
      none: 'Không nội thất',
      basic: 'Nội thất cơ bản',
      full: 'Đầy đủ nội thất',
      luxury: 'Nội thất cao cấp'
    },
    risks: {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    }
  },

  en: {
    brand: 'RentIQ',
    workspaceTitle: 'Da Nang Market',
    workspaceSub: 'Data Warehouse · gold',
    workspaceInUse: 'In Use',
    liveDataBadge: 'LIVE DATA · SCHEMA GOLD (RENTAL_ROOM)',
    filtering: 'Filtering...',
    loadingData: 'Refreshing data by current filters…',
    normalData: 'Data is operating normally.',
    neverUpdated: 'No successful update yet.',
    lastUpdated: 'Last updated:',
    listingsMatching: 'listings matching current filters.',
    refreshNow: 'Refresh Now',
    close: 'Close',
    closeMenu: 'Close Menu',
    notSignedIn: 'Not signed in',
    googleAccount: 'Google Account',
    profileSettings: 'Profile & Settings',
    signOut: 'Sign Out',
    signInGoogle: 'Sign in with Google',
    signingIn: 'Redirecting to Google...',
    reSignIn: 'Sign In Again',
    searchPlaceholder: 'Search area, category...',
    notificationsTitle: 'Data Status',
    errorLoadingData: 'Failed to load data:',

    // Nav
    nav: {
      overview: 'Overview',
      location: 'Location & Area',
      amenities: 'Amenities',
      floodRisk: 'Flood Risk',
      analytics: 'Advanced Analytics',
      aiPredict: 'AI Price Prediction',
      settings: 'Settings',
      help: 'Help'
    },

    // Heading Actions
    pageTitle: 'Da Nang Rental Market Dashboard',
    pageSubtitle: 'Aggregated analytics from Gold layer Data Warehouse with Dynamic Query Builder.',
    exportCsv: 'Export CSV',
    exporting: 'Exporting…',
    filterButton: 'Filters',
    exportSuccess: 'Exported {count} listings according to current filters.',
    exportFail: 'Could not export CSV. Please try again.',

    // Filters
    filter: {
      postedStart: 'Posted from',
      postedEnd: 'Posted to',
      allHistory: 'All history',
      backTo2026: 'Reset to Jan 2026',
      allHistoryTooltip: 'Clear Jan 2026 start date to view all historical records prior to 2026',
      backTo2026Tooltip: 'Reset back to default starting from Jan 2026',
      ward: 'Ward',
      allWards: 'All wards',
      category: 'Category',
      allCategories: 'All categories',
      furnishing: 'Furnishing',
      allFurnishings: 'All furnishings',
      priceRange: 'Price Range',
      allPrices: 'All price ranges',
      under3m: 'Under 3M VND (Budget / Student)',
      range3m5m: '3 — 5M VND (Standard / Young pro)',
      range5m8m: '5 — 8M VND (Mid-range / Studio)',
      range8m15m: '8 — 15M VND (Premium / 2-3 BR)',
      above15m: 'Above 15M VND (Luxury / Villa)',
      sizeRange: 'Area Size',
      allSizes: 'All sizes',
      under20m2: 'Under 20 m² (Small / Dorm)',
      range20_35m2: '20 — 35 m² (Studio / 1BR)',
      range35_50m2: '35 — 50 m² (Spacious / 1-2BR)',
      above50m2: 'Above 50 m² (Large / House)',
      floodRisk: 'Flood Risk',
      allFloodRisks: 'All risk levels',
      lowRisk: '🟢 Low Risk (Safe Zone)',
      mediumRisk: '🟡 Medium Risk (Localized flood)',
      highRisk: '🔴 High Risk (Historic lowland)',
      requiredAmenities: 'Required Amenities',
      elevator: 'Elevator',
      balcony: 'Balcony',
      privateBath: 'Private Bathroom',
      parking: 'Parking',
      reset: 'Reset Filters',
      collapse: 'Collapse'
    },

    // Active Chips
    chips: {
      clearAll: 'Clear all filters',
      date: 'Posted:',
      any: 'any',
      ward: 'Ward:',
      category: 'Category:',
      furnishing: 'Furnishing:',
      price: 'Price:',
      size: 'Size:',
      risk: 'Risk:',
      elevator: '🛗 Elevator',
      balcony: '🌅 Balcony',
      privateBath: '🚿 Private Bath',
      parking: '🛵 Parking'
    },

    // KPI Cards
    kpi: {
      totalSupply: 'TOTAL SUPPLY',
      avgRent: 'AVERAGE RENT',
      medianRent: 'MEDIAN RENT',
      avgSize: 'AVERAGE SIZE',
      avgPricePerM2: 'AVG PRICE / M²',
      listingsValid: 'valid listings',
      perMonth: 'M VND/mo',
      squareMeters: 'm²/unit',
      perSquareMeter: 'M VND/m²',
      realtimeAgg: 'Realtime aggregation',
      benchmarkAll: 'Citywide benchmark'
    },

    // Listings Table
    table: {
      title: 'Rental Listings Data',
      subtitle: 'Paginated direct query from gold.rental_room matching filtered conditions.',
      listingCol: 'Listing',
      locationCol: 'Location & Ward',
      priceSizeCol: 'Price & Size',
      amenitiesRiskCol: 'Amenities & Risk',
      postedCol: 'Posted Date',
      sortDefault: 'Default (ID)',
      sortPriceAsc: 'Price: Low → High',
      sortPriceDesc: 'Price: High → Low',
      sortSizeAsc: 'Size: Small → Large',
      sortSizeDesc: 'Size: Large → Small',
      sortDateDesc: 'Date: Newest',
      sortDateAsc: 'Date: Oldest',
      showing: 'Showing',
      of: 'of',
      records: 'listings',
      page: 'Page',
      prev: 'Previous',
      next: 'Next',
      empty: 'No listings match the current filter criteria.',
      clearToReload: 'Try clearing some filters to expand your search results.',
      hasMap: 'Map coordinates'
    },

    // Settings
    settingsModal: {
      workspace: 'WORKSPACE',
      title: 'Dashboard Settings',
      subtitle: 'Customize display preferences and data behavior.',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Reduce brightness for night-time work',
      language: 'Display Language',
      languageDesc: 'Switch between Vietnamese and English',
      data: 'Data',
      autoRefresh: 'Auto-refresh Data',
      autoRefreshDesc: 'Refresh overview every 60 seconds after initial load',
      savedOnBrowser: 'Settings saved on this browser',
      sessionOnly: 'Settings apply to this session only; not saved in browser',
      understood: 'Got It'
    },

    // Help
    helpModal: {
      eyebrow: 'USER GUIDE',
      title: 'Help & Documentation',
      currentTabPrefix: 'You are viewing',
      currentTabSuffix: 'Expand any topic below for detailed instructions.',
      filterSearchTitle: 'Filters and Search',
      exportCsvTitle: 'Export CSV'
    },

    // Charts
    charts: {
      trendTitle: 'Temporal Trends & Cycles',
      trendSubtitle: 'Listing volume and average monthly rental rates',
      listingsCount: 'Listings',
      avgPriceLabel: 'Avg Price (M VND)',
      trendEmpty: 'No data available in the selected period.',
      distTitle: 'Price Range Distribution',
      distSubtitle: 'Listing market share by price tier',
      distEmpty: 'Insufficient data to classify price tiers.',
      distInsight: '{label} segment accounts for {percentage}% of filtered listings.',
      listings: 'listings'
    },

    // Common options labels
    categories: {
      apartment: 'Apartment',
      room: 'Rental Room'
    },
    furnishings: {
      none: 'Unfurnished',
      basic: 'Basic Furnished',
      full: 'Fully Furnished',
      luxury: 'Luxury Furnished'
    },
    risks: {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    }
  }
}

export function formatI18n(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return Object.entries(params).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, String(v)), template)
}
