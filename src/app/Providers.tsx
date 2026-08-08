import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import type { ReactNode } from "react"

import { AuthProvider } from "@/features/auth/hooks/useAuth"
import { queryClient } from "@/lib/query-client"
import { Toaster } from "@/shared/components/ui/toaster"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
