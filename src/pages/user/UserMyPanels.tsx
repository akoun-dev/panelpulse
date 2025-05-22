import { DataTable } from '@/components/ui/data-table'
import { panelsColumns } from '../../components/layout/user/panels-columns'
import { Panel } from '@/types'
import { useState, useEffect } from 'react'

export default function UserMyPanels() {
  const [panels, setPanels] = useState<Panel[]>([])

  useEffect(() => {
    // TODO: Remplacer par appel API
    setPanels([
      {
        id: '1',
        title: 'Panel Marketing',
        description: 'Discussion sur les stratégies marketing',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'current-user-id'
      },
      {
        id: '2', 
        title: 'Panel Produit',
        description: 'Feedback sur le nouveau produit',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'current-user-id'
      }
    ])
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mes Panels</h1>
      <DataTable
        columns={panelsColumns}
        data={panels}
      />
    </div>
  )
}
