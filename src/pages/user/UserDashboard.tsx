import { Card } from '@/components/ui/card'
import { Panel } from '@/types'
import { useRecentPanels } from '@/hooks/useRecentPanels'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users } from 'lucide-react'

export default function UserDashboard() {
  const { recentPanels, isLoading } = useRecentPanels()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <Button asChild>
            <Link to="/user/my-panels/new">Créer un panel</Link>
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard 
          icon={<Calendar className="h-4 w-4" />}
          title="Panels actifs"
          value="5"
          description="+2 cette semaine"
        />
        <DashboardStatCard 
          icon={<Users className="h-4 w-4" />}
          title="Participants"
          value="24"
          description="+8 cette semaine"
        />
        <DashboardStatCard 
          icon={<Clock className="h-4 w-4" />}
          title="Temps moyen"
          value="42 min"
          description="+5 min vs semaine dernière"
        />
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Mes panels récents</h2>
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <div className="space-y-2">
            {recentPanels.map((panel: Panel) => (
              <PanelCard key={panel.id} panel={panel} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function DashboardStatCard({ icon, title, value, description }: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-secondary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-green-500">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function PanelCard({ panel }: { panel: Panel }) {
  return (
    <Card className="p-3 hover:bg-accent transition-colors">
      <Link to={`/user/my-panels/${panel.id}`} className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{panel.title}</h3>
          <p className="text-sm text-muted-foreground">{panel.description}</p>
        </div>
        <Badge variant={
          panel.status === 'active' ? 'default' :
          panel.status === 'completed' ? 'secondary' : 'outline'
        }>
          {panel.status}
        </Badge>
      </Link>
    </Card>
  )
}
