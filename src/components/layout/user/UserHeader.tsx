import { Input } from '@/components/ui/input'
import { Search, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserHeader() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
