import { Outlet } from 'react-router-dom'
import UserSidebar from './UserSidebar'
import UserHeader from './UserHeader'

export default function UserLayout() {
  return (
    <div className="flex h-screen bg-background">
      <UserSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
