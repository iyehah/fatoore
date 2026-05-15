'use client'

import { type ReactNode } from 'react'
import { FontProvider } from '@/components/font-provider'
import { AuthProvider } from '@/hooks/use-auth'
import { LanguageProvider } from '@/hooks/use-language'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <FontProvider>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </FontProvider>
    </ThemeProvider>
  )
}
