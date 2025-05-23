import { useState, useEffect } from 'react'
import { Panel } from '@/types'
import { getUserPanels } from '@/services/panelService'

interface UseRecentPanelsResult {
  recentPanels: Panel[]
  isLoading: boolean
  error?: Error
}

/**
 * Hook pour récupérer les panels récents de l'utilisateur
 * @param limit Nombre maximum de panels à récupérer
 * @returns Les panels récents, l'état de chargement et les erreurs éventuelles
 */
export function useRecentPanels(limit: number = 5): UseRecentPanelsResult {
  const [recentPanels, setRecentPanels] = useState<Panel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const fetchRecentPanels = async () => {
      try {
        setIsLoading(true)

        // Récupérer tous les panels de l'utilisateur
        const panels = await getUserPanels()

        // Trier par date de création (du plus récent au plus ancien)
        const sortedPanels = panels.sort((a, b) => {
          const dateA = new Date(a.createdAt || '').getTime()
          const dateB = new Date(b.createdAt || '').getTime()
          return dateB - dateA
        })

        // Limiter le nombre de panels
        setRecentPanels(sortedPanels.slice(0, limit))
      } catch (err) {
        console.error('Erreur lors de la récupération des panels récents:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentPanels()
  }, [limit])

  return { recentPanels, isLoading, error }
}
