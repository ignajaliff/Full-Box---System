import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import type { ReactNode } from "react"

import { AuthProvider } from "@/features/auth/hooks/useAuth"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/shared/components/ui/toaster"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* v7_startTransition: al navegar, la página actual sigue visible
          mientras se descarga la siguiente (sin parpadeo de fallback). */}
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
