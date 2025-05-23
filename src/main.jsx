import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './lib/fontawesome'
import './index.css'
import { router } from './routes/AppRouter'
import { ThemeProvider } from './components/ui/theme-provider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="panelpulse-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
