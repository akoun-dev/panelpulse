import { DataTable } from '@/components/ui/data-table'
import { invitationsColumns } from '@/components/layout/user/invitations-columns'
import { Invitation } from '@/types'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const fetchInvitations = () => {
    setIsLoading(true)
    // Simuler un délai de chargement
    setTimeout(() => {
      // TODO: Remplacer par appel API
      setInvitations([
        {
          id: '1',
          panelId: '1',
          email: 'vous@example.com',
          status: 'pending',
          createdAt: new Date().toISOString(),
          panelTitle: 'Panel Marketing Digital',
          panelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
          role: 'Expert en Marketing',
          moderatorName: 'Jean Dupont'
        },
        {
          id: '2',
          panelId: '2',
          email: 'vous@example.com',
          status: 'accepted',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
          panelTitle: 'Panel Produit Innovation',
          panelDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
          role: 'Product Manager',
          moderatorName: 'Marie Leroy'
        },
        {
          id: '3',
          panelId: '3',
          email: 'vous@example.com',
          status: 'accepted',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours
          panelTitle: 'Panel Intelligence Artificielle',
          panelDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Demain
          role: 'Expert en IA',
          moderatorName: 'Pierre Dubois'
        },
        {
          id: '4',
          panelId: '4',
          email: 'vous@example.com',
          status: 'rejected',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 10 jours
          panelTitle: 'Panel Cybersécurité',
          panelDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours (passé)
          role: 'Analyste Sécurité',
          moderatorName: 'Sophie Martin'
        }
      ])
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleAccept = (id: string) => {
    setInvitations(invitations.map(inv =>
      inv.id === id ? {...inv, status: 'accepted'} : inv
    ))
  }

  const handleReject = (id: string) => {
    setInvitations(invitations.map(inv =>
      inv.id === id ? {...inv, status: 'rejected'} : inv
    ))
  }

  const handleRefresh = () => {
    fetchInvitations()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Invitations</h1>
        <Button
          variant="outline"
          className="gap-2 border-gray-300 dark:border-gray-700"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Chargement...' : 'Rafraîchir'}</span>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md">
        <DataTable
          columns={invitationsColumns({
            handleAccept,
            handleReject,
            navigate
          })}
          data={invitations}
        />
      </div>
    </div>
  )
}
