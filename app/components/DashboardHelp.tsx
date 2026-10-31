'use client'

interface GuideItem {
  id: string
  title: string
  steps: string[]
}

const guidesVi: GuideItem[] = [
  {
    id: 'overview',
    title: 'Tổng quan',
    steps: [
      'Xem số tin, giá thuê và diện tích trung bình để nắm thị trường trong phạm vi bộ lọc.',
      'Chuyển giữa Tổng quan, Thị trường và Nguồn cung để xem các góc nhìn phân tích. Đọc biểu đồ cùng số lượng tin trong mẫu.',
      'Dùng bảng tin đăng để xem kết quả cụ thể, đổi thứ tự sắp xếp và chuyển trang.'
    ]
  },
  {
    id: 'location',
    title: 'Vị trí & khu vực',
    steps: [
      'Bản đồ tải dữ liệu theo khung nhìn hiện tại, hiển thị tối đa 1.500 tọa độ mỗi lượt và gom điểm gần nhau thành cụm. Bấm cụm để phóng to, hoặc kéo bản đồ để tải khu vực khác.',
      'Bật lớp Giá thuê theo phường trong menu Lớp bản đồ. Rê chuột lên vùng nhiệt để xem giá trung bình, trung vị và số tin có tọa độ trong dữ liệu đang tải.',
      'Bấm điểm đã phóng to để xem thông tin của tin đăng.',
      'Kết hợp bộ lọc khu vực và giá để thu hẹp phạm vi tìm kiếm.',
      'Số điểm trên bản đồ có thể ít hơn số tin trong bảng nếu tin thiếu tọa độ hợp lệ.'
    ]
  },
  {
    id: 'amenities',
    title: 'Tiện ích',
    steps: [
      'So sánh giá của nhóm có và không có từng tiện ích, như ban công, thang máy hoặc chỗ để xe.',
      'Thử các tiện ích trong bộ mô phỏng định giá để tham khảo mức giá gợi ý.',
      'Chênh lệch giá giữa hai nhóm không chứng minh riêng tiện ích đó làm tăng giá; vị trí và diện tích cũng có ảnh hưởng.'
    ]
  },
  {
    id: 'floodRisk',
    title: 'Rủi ro ngập lụt',
    steps: [
      'Xem phân bố mức rủi ro và các thông tin ngập lịch sử để so sánh khu vực.',
      'Dùng bộ lọc Rủi ro ngập để chọn mức thấp, trung bình hoặc cao.',
      'Dữ liệu lịch sử không phải dự báo ngập hiện tại. Nên kiểm tra thực địa trước khi quyết định thuê.'
    ]
  },
  {
    id: 'analytics',
    title: 'Phân tích nâng cao',
    steps: [
      'Trong box plot giá thuê, rê chuột hoặc dùng phím Tab để xem số tin, giá thấp nhất, Q1, trung vị, Q3 và giá cao nhất theo từng phường.',
      'Trong bản đồ nhiệt giá thuê (nhóm Khu vực & vị trí), rê chuột hoặc dùng phím Tab vào từng ô để xem chi tiết giá trung vị, số tin và phân khúc theo phường và loại hình.',
      'So sánh giá theo khoảng cách tới các điểm quan tâm và theo mức nội thất.',
      'Dùng ma trận cơ hội và gợi ý chiến lược để tham khảo, đối chiếu với nguồn cung và giá của khu vực.',
      'Điểm xếp hạng và ước tính hoàn vốn phụ thuộc dữ liệu, giả định đang sử dụng; không phải cam kết lợi nhuận.'
    ]
  }
]

const guidesEn: GuideItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    steps: [
      'Review listing counts, average rents, and sizes to grasp market conditions within current filter parameters.',
      'Switch between Overview, Market, and Supply perspectives. Compare charts with sample size counts.',
      'Use the listings data table to inspect individual properties, adjust sorting orders, and paginate.'
    ]
  },
  {
    id: 'location',
    title: 'Location & Area',
    steps: [
      'The map loads data based on current viewport bounds (up to 1,500 coordinates per query) and clusters nearby points. Click clusters to zoom in, or drag the map to explore other districts.',
      'Enable the Ward Rental Price layer in the Map Layers menu. Hover over heatmap zones to view average rent, median price, and coordinate coverage.',
      'Click individual property pins to view price, size, and address details.',
      'Combine ward and price filters to narrow down geographic focus areas.',
      'Map points count may be lower than table listings if certain records lack valid geographic coordinates.'
    ]
  },
  {
    id: 'amenities',
    title: 'Amenities',
    steps: [
      'Compare rental premiums across properties with and without key amenities like elevator, balcony, or private parking.',
      'Use the amenity price simulation calculator to estimate rental value premiums.',
      'Price differences reflect market correlation and are influenced by location and property size.'
    ]
  },
  {
    id: 'floodRisk',
    title: 'Flood Risk',
    steps: [
      'Examine flood risk distributions and historical inundation records to evaluate area safety.',
      'Apply the Flood Risk filter to filter by Low, Medium, or High risk categories.',
      'Historical inundation maps serve as strategic references; on-site inspection is recommended before leasing.'
    ]
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    steps: [
      'In the rental price box plot, hover or press Tab to view listing count, minimum, Q1, median, Q3, and maximum prices by ward.',
      'In the ward price heatmap, inspect median prices, sample volume, and property category breakdown.',
      'Evaluate price variations relative to proximity to key hotspots and furnishing grades.',
      'Leverage investment opportunity matrices and strategic recommendations for market insights.',
      'Investment scores and payback estimations depend on current sample assumptions and do not guarantee returns.'
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
