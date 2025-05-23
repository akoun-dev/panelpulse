import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './lib/fontawesome'
import './index.css'
import { router } from './routes/AppRouter'
import { ThemeProvider } from './components/ui/theme-provider'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'

// Composant de fallback pour l'hydratation
const HydrateFallback = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Chargement de l'application...</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="panelpulse-theme">
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={<HydrateFallback />} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
