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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Manrope:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap"
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
