const guides = [
  {
    title: 'Tổng quan',
    steps: [
      'Xem số tin, giá thuê và diện tích trung bình để nắm thị trường trong phạm vi bộ lọc.',
      'Chuyển giữa Tổng quan, Thị trường và Nguồn cung để xem các góc nhìn phân tích. Đọc biểu đồ cùng số lượng tin trong mẫu.',
      'Dùng bảng tin đăng để xem kết quả cụ thể, đổi thứ tự sắp xếp và chuyển trang.'
    ]
  },
  {
    title: 'Vị trí & khu vực',
    steps: [
      'Kéo bản đồ và phóng to để xem phân bố tin đăng. Bấm điểm trên bản đồ để xem thông tin của tin.',
      'Kết hợp bộ lọc khu vực, giá và cự ly để thu hẹp phạm vi tìm kiếm.',
      'Số điểm trên bản đồ có thể ít hơn số tin trong bảng nếu tin thiếu tọa độ hợp lệ.'
    ]
  },
  {
    title: 'Tiện ích',
    steps: [
      'So sánh giá của nhóm có và không có từng tiện ích, như ban công, thang máy hoặc chỗ để xe.',
      'Thử các tiện ích trong bộ mô phỏng định giá để tham khảo mức giá gợi ý.',
      'Chênh lệch giá giữa hai nhóm không chứng minh riêng tiện ích đó làm tăng giá; vị trí và diện tích cũng có ảnh hưởng.'
    ]
  },
  {
    title: 'Rủi ro ngập lụt',
    steps: [
      'Xem phân bố mức rủi ro và các thông tin ngập lịch sử để so sánh khu vực.',
      'Dùng bộ lọc Rủi ro ngập để chọn mức thấp, trung bình hoặc cao.',
      'Dữ liệu lịch sử không phải dự báo ngập hiện tại. Nên kiểm tra thực địa trước khi quyết định thuê.'
    ]
  },
  {
    title: 'Phân tích nâng cao',
    steps: [
      'So sánh giá theo khoảng cách tới các điểm quan tâm và theo mức nội thất.',
      'Dùng ma trận cơ hội và gợi ý chiến lược để tham khảo, đối chiếu với nguồn cung và giá của khu vực.',
      'Điểm xếp hạng và ước tính hoàn vốn phụ thuộc dữ liệu, giả định đang sử dụng; không phải cam kết lợi nhuận.'
    ]
  }
]

export default function DashboardHelp({ activeNav }: { activeNav: string }) {
  return <div className="dashboard-help">
    <p>Bạn đang xem <strong>{activeNav}</strong>. Mở từng mục bên dưới để xem hướng dẫn.</p>
    {guides.map(guide => <details key={guide.title} open={guide.title === activeNav}>
      <summary>{guide.title}</summary>
      <ul>{guide.steps.map(step => <li key={step}>{step}</li>)}</ul>
    </details>)}
    <details>
      <summary>Bộ lọc và tìm kiếm</summary>
      <ul>
        <li>Bấm Bộ lọc ở đầu trang. Các điều kiện được kết hợp với nhau và dùng chung khi chuyển tab.</li>
        <li>Chọn khu vực, loại hình, nội thất, giá, diện tích, cự ly và mức rủi ro. Tích tiện ích để chỉ giữ tin có tiện ích đó.</li>
        <li>Ngày đăng từ / đến lọc theo ngày đăng tin. Có thể chỉ chọn một đầu khoảng; ngày bắt đầu không được sau ngày kết thúc.</li>
        <li>Tìm kiếm theo khu vực hoặc loại hình. Đợi dữ liệu tải xong sau khi thay đổi điều kiện.</li>
        <li>Nếu không có kết quả, bỏ bớt điều kiện hoặc dùng nút xóa bộ lọc để đặt lại tất cả, kể cả ngày đăng.</li>
      </ul>
    </details>
    <details>
      <summary>Xuất CSV, cập nhật dữ liệu và tài khoản</summary>
      <ul>
        <li>Xuất CSV tải toàn bộ kết quả theo bộ lọc lúc bấm xuất, không chỉ trang đang xem. Chờ thông báo số tin đã xuất hoặc lỗi.</li>
        <li>Mở chuông thông báo để xem lần tải tổng quan thành công gần nhất, lỗi tải và nút Làm mới ngay. Đây không phải thời điểm nguồn tin được thu thập.</li>
        <li>Trong Cài đặt, bật tự động làm mới để tải lại tổng quan sau 60 giây tính từ khi tải xong. Chế độ tối và lựa chọn này được lưu trên trình duyệt nếu bộ nhớ được cho phép.</li>
        <li>Mở menu tài khoản để đăng nhập Google hoặc đăng xuất. Nếu phiên kết thúc hoặc đăng nhập lỗi, dùng nút Đăng nhập lại trong thông báo.</li>
      </ul>
    </details>
  </div>
}
