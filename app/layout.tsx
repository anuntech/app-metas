import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MetasProvider } from "@/lib/context/MetasContext"
import { ToastProvider } from "@/components/custom-toast"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sistema de Gestão</title>
        <link rel="stylesheet" href="https://use.typekit.net/xxxxxxx.css" />
        <link rel="icon" href="/casaDoConstrutor.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/casaDoConstrutor.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <MetasProvider>
              {children}
            </MetasProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
