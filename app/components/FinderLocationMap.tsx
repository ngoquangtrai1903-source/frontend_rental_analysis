'use client'

import { MapPin, ExternalLink, Home, Waves, Building2, GraduationCap } from 'lucide-react'
import type { Database } from '@/lib/database.types'

export interface FinderLocation extends Partial<Database['gold']['Tables']['rental_room']['Row']> {
  source: string
  list_id: string
  ward_name: string | null
  latitude?: number | null
  longitude?: number | null
}

export function hasLocation(room: FinderLocation): boolean {
  return typeof room.latitude === 'number' && Number.isFinite(room.latitude) && Math.abs(room.latitude) <= 90
    && typeof room.longitude === 'number' && Number.isFinite(room.longitude) && Math.abs(room.longitude) <= 180
    && !(room.latitude === 0 && room.longitude === 0)
}

export default function FinderLocationMap({ rooms, selected, onSelect }: {
  rooms: FinderLocation[]
  selected: number
  onSelect: (index: number) => void
}) {
  const room = rooms[selected]
  if (!room) return null
  const located = hasLocation(room)
  const lat = room.latitude ?? 0
  const lng = room.longitude ?? 0
  const bbox = [Math.max(-180, lng - .012), Math.max(-90, lat - .008), Math.min(180, lng + .012), Math.min(90, lat + .008)].join(',')
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`
  const distance = (value: number | null | undefined) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} km` : 'Chưa có dữ liệu'
  const amenityFields = [['has_balcony', 'Ban công'], ['has_parking', 'Chỗ để xe'], ['private_bathroom', 'WC riêng'], ['has_elevator', 'Thang máy'], ['wifi', 'Wi-Fi'], ['has_window', 'Cửa sổ'], ['has_camera_security', 'Camera'], ['has_mezzanine', 'Gác lửng'], ['free_hours', 'Giờ giấc tự do']] as const

  return <section className="finder-location" aria-label="Vị trí phòng đang chọn">
    <div className="finder-location-heading"><MapPin size={18} /><strong>Khám phá vị trí phòng</strong><span>{rooms.filter(hasLocation).length}/{rooms.length} phòng có tọa độ</span></div>
    <label htmlFor="finder-location-room">Chọn phòng để xem bản đồ</label>
    <select id="finder-location-room" value={selected} onChange={e => onSelect(Number(e.target.value))}>
      {rooms.map((item, index) => <option key={`${item.source}:${item.list_id}`} value={index}>Phòng {index + 1} · {item.ward_name || 'Chưa rõ khu vực'} · #{item.list_id}{hasLocation(item) ? '' : ' · Chưa có tọa độ'}</option>)}
    </select>
    <div className="finder-map-stage">
      {located ? <iframe key={`${room.source}:${room.list_id}`} title={`Vị trí phòng ${room.list_id} tại ${room.ward_name || 'Đà Nẵng'}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer" /> : <div className="finder-location-missing">Phòng này chưa có tọa độ. Hãy chọn phòng khác để xem bản đồ.</div>}
      <div className="finder-map-chip"><MapPin size={14} /> Phòng {selected + 1} · {room.ward_name || 'Chưa rõ khu vực'}</div>
    </div>
    <article className="finder-detail" aria-live="polite">
      <header><div><span className="finder-detail-eyebrow">ĐANG KHÁM PHÁ · PHÒNG {selected + 1}</span><h3><Home size={18} /> {room.category_name || 'Phòng cho thuê'}</h3></div><strong className="finder-detail-price">{room.price_vnd ? `${(room.price_vnd / 1000000).toLocaleString('vi-VN')} triệu` : 'Thỏa thuận'}<small>/ tháng</small></strong></header>
      <dl className="finder-detail-facts">
        <div><dt>Diện tích</dt><dd>{room.size_m2 ? `${room.size_m2} m²` : 'Chưa cập nhật'}</dd></div>
        <div><dt>Nội thất</dt><dd>{room.furnishing_status || 'Chưa cập nhật'}</dd></div>
        <div><dt>Rủi ro ngập</dt><dd>{room.flood_risk_label === 0 ? 'Thấp' : room.flood_risk_label === 1 ? 'Trung bình' : room.flood_risk_label === 2 ? 'Cao' : 'Chưa có dữ liệu'}</dd></div>
        <div><dt>Ngày đăng</dt><dd>{room.posted_date?.slice(0, 10) || 'Chưa cập nhật'}</dd></div>
      </dl>
      <div className="finder-distances">
        <div><Waves size={17} /><span>Tới biển<strong>{distance(room.dist_to_beach)}</strong></span></div>
        <div><Building2 size={17} /><span>Tới trung tâm<strong>{distance(room.dist_to_cbd)}</strong></span></div>
        <div><GraduationCap size={17} /><span>Tới đại học gần nhất<strong>{distance(room.dist_to_nearest_uni)}</strong></span></div>
      </div>
      <h4>Tiện ích trong tin đăng</h4>
      <div className="finder-detail-amenities">{amenityFields.map(([key, label]) => <span className={room[key] === 1 ? 'available' : ''} key={key}>{room[key] === 1 ? '✓' : room[key] === 0 ? '−' : '?'} {label}</span>)}</div>
      <p className="finder-detail-note">✓ Có · − Không được ghi nhận · ? Chưa có dữ liệu</p>
      <p className="finder-detail-note">Nguồn: {room.source} · Mã tin: {room.list_id}</p>
    </article>
    <div className="finder-location-footer">
      <div><strong>{room.ward_name || 'Chưa rõ khu vực'}, Đà Nẵng</strong><p>Chưa có địa chỉ số nhà/tên đường. {located ? 'Vị trí theo tọa độ tin đăng, cần xác nhận với chủ nhà.' : 'Không thể xác định vị trí chính xác.'}</p></div>
      {located && <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Chỉ đường</a>}
    </div>
  </section>
}
