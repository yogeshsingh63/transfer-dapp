import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'USDT Transfer dApp',
  description: 'Transfer USDT using spender contract',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}