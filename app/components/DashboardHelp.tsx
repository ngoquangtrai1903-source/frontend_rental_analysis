'use client'

interface GuideItem {
  id: string
  title: string
  steps: string[]
}

const guidesVi: GuideItem[] = [
  {
    "id": "overview",
    "title": "Tổng quan",
    "steps": [
      "Xem số tin, giá thuê và diện tích trong bộ lọc hiện tại.",
      "Xem biến động giá theo thời gian và so sánh các khu vực.",
      "Sắp xếp, chuyển trang hoặc xuất danh sách tin đăng."
    ]
  },
  {
    "id": "location",
    "title": "Vị trí & khu vực",
    "steps": [
      "Bấm cụm trên bản đồ để phóng to, rồi chọn một tin để xem chi tiết.",
      "Dùng bộ lọc khu vực và giá để thu hẹp kết quả.",
      "Chọn Chỉ đường để mở vị trí trên Google Maps. Tin thiếu tọa độ sẽ không xuất hiện trên bản đồ."
    ]
  },
  {
    "id": "amenities",
    "title": "Tiện ích",
    "steps": [
      "So sánh giá thuê trung bình giữa nhóm có và không có từng tiện ích.",
      "Chọn Căn hộ hoặc Phòng trọ để xem riêng từng loại.",
      "Chênh lệch giá còn phụ thuộc vị trí, diện tích và nội thất."
    ]
  },
  {
    "id": "floodRisk",
    "title": "Rủi ro ngập lụt",
    "steps": [
      "So sánh mức rủi ro theo phường và ghi nhận ngập năm 2022, 2025.",
      "Dữ liệu lịch sử không phải dự báo hiện tại. Hãy kiểm tra thêm tại nơi định thuê."
    ]
  },
  {
    "id": "analytics",
    "title": "Phân tích nâng cao",
    "steps": [
      "Chọn nhóm Giá thuê & diện tích, Khu vực & vị trí hoặc Nội thất & tương quan.",
      "Rê chuột lên biểu đồ để xem số liệu; các ô có hỗ trợ bàn phím có thể chọn bằng Tab.",
      "Bấm Đọc biểu đồ để xem tóm tắt. Tương quan không chứng minh quan hệ nhân quả."
    ]
  }
]

const guidesEn: GuideItem[] = [
  {
    "id": "overview",
    "title": "Overview",
    "steps": [
      "Review listing counts, rents and sizes within your filters.",
      "Compare rents over time and across areas.",
      "Sort, page through or export the listings."
    ]
  },
  {
    "id": "location",
    "title": "Location & Area",
    "steps": [
      "Click a cluster to zoom in, then select a listing for details.",
      "Use area and price filters to narrow the results.",
      "Choose Directions to open Google Maps. Listings without coordinates are not shown on the map."
    ]
  },
  {
    "id": "amenities",
    "title": "Amenities",
    "steps": [
      "Compare average rents with and without each amenity.",
      "Select Apartments or Rental rooms to compare one property type.",
      "Price differences also reflect location, size and furnishing."
    ]
  },
  {
    "id": "floodRisk",
    "title": "Flood Risk",
    "steps": [
      "Compare risk by ward and recorded floods in 2022 and 2025.",
      "Historical data is not a current forecast. Check the property before renting."
    ]
  },
  {
    "id": "analytics",
    "title": "Advanced Analytics",
    "steps": [
      "Choose Price & Size, Area & Location, or Furnishing & Correlation.",
      "Hover over charts for details; use Tab for cells with keyboard support.",
      "Select Read chart for a summary. Correlation does not establish causation."
    ]
  }
]

const navMapViToEn: Record<string, string> = {
  'Tổng quan': 'Overview',
  'Vị trí & khu vực': 'Location & Area',
  'Tiện ích': 'Amenities',
  'Rủi ro ngập lụt': 'Flood Risk',
  'Phân tích nâng cao': 'Advanced Analytics',
  'Dự đoán giá AI': 'AI Price Prediction'
}

export default function DashboardHelp({ activeNav, lang = 'vi' }: { activeNav: string; lang?: 'vi' | 'en' }) {
  const isEn = lang === 'en'
  const guides = isEn ? guidesEn : guidesVi
  const currentNavLabel = isEn ? (navMapViToEn[activeNav] || activeNav) : activeNav

  return (
    <div className="dashboard-help">
      <p>
        {isEn ? 'You are viewing ' : 'Bạn đang xem '}
        <strong>{currentNavLabel}</strong>. {isEn ? 'Open topics below to view documentation.' : 'Mở từng mục bên dưới để xem hướng dẫn.'}
      </p>
      {guides.map((guide) => {
        const isOpen = isEn
          ? (guide.title === activeNav || guide.title === currentNavLabel || navMapViToEn[activeNav] === guide.title)
          : (guide.title === activeNav)
        return (
          <details key={guide.title} open={isOpen}>
            <summary>{guide.title}</summary>
            <ul>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </details>
        )
      })}
      <details>
        <summary>{isEn ? 'Filters and Search' : 'Bộ lọc và tìm kiếm'}</summary>
        <ul>
          {isEn ? (
            <>
              <li>Click Filters at the top of the page. Filter conditions are combined and shared across all dashboard tabs.</li>
              <li>Filter by ward, category, furnishing, price range, area size, and flood risk level. Toggle amenities to retain only qualifying listings.</li>
              <li>Posted date filters by listing timestamp. You can filter by start date, end date, or leave either open.</li>
              <li>Search across wards and property categories via the global search bar.</li>
              <li>If no results appear, clear filters or use the Reset button to revert all conditions including dates.</li>
            </>
          ) : (
            <>
              <li>Bấm Bộ lọc ở đầu trang. Các điều kiện được kết hợp với nhau và dùng chung khi chuyển tab.</li>
              <li>Chọn khu vực, loại hình, nội thất, giá, diện tích và mức rủi ro. Tích tiện ích để chỉ giữ tin có tiện ích đó.</li>
              <li>Ngày đăng từ / đến lọc theo ngày đăng tin. Có thể chỉ chọn một đầu khoảng; ngày bắt đầu không được sau ngày kết thúc.</li>
              <li>Tìm kiếm theo khu vực hoặc loại hình. Đợi dữ liệu tải xong sau khi thay đổi điều kiện.</li>
              <li>Nếu không có kết quả, bỏ bớt điều kiện hoặc dùng nút xóa bộ lọc để đặt lại tất cả, kể cả ngày đăng.</li>
            </>
          )}
        </ul>
      </details>
      <details>
        <summary>{isEn ? 'Export CSV, Data Updates & Account' : 'Xuất CSV, cập nhật dữ liệu và tài khoản'}</summary>
        <ul>
          {isEn ? (
            <>
              <li>CSV export downloads all matching records matching active filters across all pages, not just the currently viewed page.</li>
              <li>Click the bell icon to inspect latest sync status, refresh errors, and the Refresh Now button.</li>
              <li>In Settings, enable auto-refresh to periodically pull fresh data every 60 seconds after initial load.</li>
              <li>Open the account menu to sign in with Google or sign out. Re-authenticate if your session expires.</li>
            </>
          ) : (
            <>
              <li>Xuất CSV tải toàn bộ kết quả theo bộ lọc lúc bấm xuất, không chỉ trang đang xem. Chờ thông báo số tin đã xuất hoặc lỗi.</li>
              <li>Mở chuông thông báo để xem lần tải tổng quan thành công gần nhất, lỗi tải và nút Làm mới ngay. Đây không phải thời điểm nguồn tin được thu thập.</li>
              <li>Trong Cài đặt, bật tự động làm mới để tải lại tổng quan sau 60 giây tính từ khi tải xong. Chế độ tối và lựa chọn này được lưu trên trình duyệt nếu bộ nhớ được cho phép.</li>
              <li>Mở menu tài khoản để đăng nhập Google hoặc đăng xuất. Nếu phiên kết thúc hoặc đăng nhập lỗi, dùng nút Đăng nhập lại trong thông báo.</li>
            </>
          )}
        </ul>
      </details>
    </div>
  )
}
