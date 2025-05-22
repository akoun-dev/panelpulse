import { Card } from '@/components/ui/card'
import AdminStats from './AdminStats'
import AdminManageUsers from './AdminManageUsers'

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tableau de Bord Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Aperçu Rapide</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
              <p className="text-2xl font-bold">128</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Panels</p>
              <p className="text-2xl font-bold">42</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Activité Récente</h2>
          {/* Liste d'activités à implémenter */}
        </Card>
      </div>

      <AdminStats />
      <AdminManageUsers />
    </div>
  )
}
