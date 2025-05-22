import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminSettings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Paramètres Administrateur</h1>
      <Card>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Paramètres généraux</h2>
              {/* Contenu des paramètres généraux */}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Paramètres de sécurité</h2>
              {/* Contenu des paramètres de sécurité */}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Paramètres de notifications</h2>
              {/* Contenu des paramètres de notifications */}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
