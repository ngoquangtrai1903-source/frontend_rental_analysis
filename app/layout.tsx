import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'RentIQ — Da Nang Market Intelligence',
  description: 'Dashboard phân tích thị trường cho thuê bất động sản Đà Nẵng',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><Providers>{children}</Providers></body></html>
}
