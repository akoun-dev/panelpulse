import { useState, useEffect } from 'react'
import { Panel } from '@/types'

interface UseRecentPanelsResult {
  recentPanels: Panel[]
  isLoading: boolean
  error?: Error
}

export function useRecentPanels(): UseRecentPanelsResult {
  const [recentPanels, setRecentPanels] = useState<Panel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const fetchRecentPanels = async () => {
      try {
        setIsLoading(true)
        // TODO: Remplacer par appel API
        const mockPanels: Panel[] = [
          {
            id: '1',
            title: 'Panel Marketing',
            description: 'Discussion stratégie marketing',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: 'current-user-id'
          },
          {
            id: '2',
            title: 'Panel Produit',
            description: 'Feedback nouveau produit',
            status: 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: 'current-user-id'
          }
        ]
        setRecentPanels(mockPanels)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentPanels()
  }, [])

  return { recentPanels, isLoading, error }
}
