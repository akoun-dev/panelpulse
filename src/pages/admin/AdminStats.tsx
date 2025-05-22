import { ChartContainer } from '@/components/ui/chart'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer } from 'recharts'
import { RechartsWrapper } from '@/components/ui/recharts-wrapper'

export default function AdminStats() {
  const panelData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
  ]

  const userData = [
    { name: 'Admins', value: 15 },
    { name: 'Users', value: 85 },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Statistiques Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold p-4">Activité des panels</h2>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsWrapper component="BarChart" data={panelData}>
                <RechartsWrapper component="Bar" dataKey="value" fill="#8884d8" />
                <RechartsWrapper component="XAxis" dataKey="name" />
                <RechartsWrapper component="YAxis" />
              </RechartsWrapper>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold p-4">Répartition utilisateurs</h2>
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsWrapper component="PieChart">
                <RechartsWrapper 
                  component="Pie"
                  data={userData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                />
              </RechartsWrapper>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>
    </div>
  )
}
