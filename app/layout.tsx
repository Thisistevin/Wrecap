import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WRecap - WhatsApp Retrospective',
  description: 'Generate your 2025 WhatsApp conversation retrospective',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

