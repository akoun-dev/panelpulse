import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Panel, Question, Speaker } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { questionsColumns } from '../../components/layout/user/questions-columns'
import { speakersColumns } from '../../components/layout/user/speakers-columns'
import { Timer } from '../../components/ui/timer'

export default function UserPanelDetails() {
  const { panelId } = useParams()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [newQuestion, setNewQuestion] = useState('')

  // Simuler le chargement des données
  useEffect(() => {
    // TODO: Remplacer par appel API
    setPanel({
      id: panelId || '',
      title: 'Mon Panel',
      description: 'Description du panel',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'current-user-id'
    })
    setQuestions([
      { id: '1', text: 'Question préchargée 1', status: 'approved' },
      { id: '2', text: 'Question préchargée 2', status: 'pending' }
    ])
    setSpeakers([
      { id: '1', name: 'Speaker 1', timeUsed: 120 },
      { id: '2', name: 'Speaker 2', timeUsed: 90 }
    ])
  }, [panelId])

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, {
        id: Date.now().toString(),
        text: newQuestion,
        status: 'pending'
      }])
      setNewQuestion('')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{panel?.title || 'Détails du Panel'}</h1>
        <Timer initialTime={3600} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Questions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Questions</h2>
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ajouter une question..."
            />
            <Button onClick={handleAddQuestion}>Ajouter</Button>
          </div>
          <DataTable
            columns={questionsColumns}
            data={questions}
          />
        </div>

        {/* Section Panélistes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Panélistes</h2>
          <DataTable
            columns={speakersColumns}
            data={speakers}
          />
        </div>
      </div>
    </div>
  )
}
