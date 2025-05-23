import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users', 
    icon: Users
  },
  {
    name: 'Panels',
    href: '/admin/panels',
    icon: MessageSquare
  },
  {
    name: 'Statistiques',
    href: '/admin/stats',
    icon: BarChart
  },
  {
    name: 'Paramètres',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function AdminSidebar() {
  const { pathname } = useLocation()

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
              pathname === item.href 
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
