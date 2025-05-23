import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeToggle } from '@/components/ui/theme-toggle'

/**
 * Layout pour la vue audience
 * Layout minimaliste sans sidebar pour les utilisateurs anonymes accédant via QR code
 *
 * Ce layout fournit une structure simple avec un en-tête contenant les informations essentielles
 * et un espace principal pour le contenu. Il est conçu pour être accessible et facile à utiliser
 * pour les participants qui rejoignent un panel via un QR code.
 */
export default function AudienceLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* En-tête minimaliste avec titre et indicateur de direct */}
      <header className="border-b py-3 px-6 bg-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-medium text-lg">Interface Public</h1>
            <p className="text-xs text-indigo-100">Plateforme de Gestion de Panels Interactifs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-medium">EN DIRECT</span>
            </div>
            <div className="text-xs">
              <span className="font-medium">125 spectateurs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal - Zone d'affichage du contenu dynamique */}
      <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
        <div className="w-full h-full ">
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  )
}
