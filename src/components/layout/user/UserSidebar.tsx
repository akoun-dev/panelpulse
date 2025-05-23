import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'

const navItems = [
  {
    name: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Mes Panels',
    href: '/user/my-panels', 
    icon: MessageSquare
  },
  {
    name: 'Invitations',
    href: '/user/invitations',
    icon: Users
  },
  {
    name: 'Paramètres',
    href: '/user/settings',
    icon: Settings
  }
]

export default function UserSidebar() {
  const { pathname } = useLocation()

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="p-4 border-b">
        <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon size='10x' icon={faComments} className="text-purple-600 text-2xl" />
              <span className="ml-2 text-xl font-bold text-gray-900">PanelPulse</span>
            </div>
          </div>
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
