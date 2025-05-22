import { DataTable } from '@/components/ui/data-table'
import { invitationsColumns } from '@/components/layout/user/invitations-columns'
import { Invitation } from '@/types'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])

  useEffect(() => {
    // TODO: Remplacer par appel API
    setInvitations([
      {
        id: '1',
        panelId: '1',
        email: 'panel1@example.com',
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        panelId: '2',
        email: 'panel2@example.com',
        status: 'accepted',
        createdAt: new Date().toISOString()
      }
    ])
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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mes Invitations</h1>
      <DataTable
        columns={invitationsColumns({handleAccept, handleReject})}
        data={invitations}
      />
    </div>
  )
}
