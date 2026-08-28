import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Format Forge', template: '%s · Format Forge' },
  description: 'Local-first tools for inspecting and transforming developer data.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  )
}
