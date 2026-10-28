import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'RentIQ — Da Nang Market Intelligence',
  description: 'Dashboard phân tích thị trường cho thuê bất động sản Đà Nẵng',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@qpokychuk/sf-pro-display@latest/index.css" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
