import { Outlet } from 'react-router-dom'
import UserSidebar from './UserSidebar'
import UserHeader from './UserHeader'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function UserLayout() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <UserSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <UserHeader />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}
