'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const statusOrder = ['new', 'contacted', 'follow_up', 'interested', 'meeting_scheduled', 'converted', 'dropped']
const statusColors: { [key: string]: string } = {
  new: '#3B82F6',
  contacted: '#10B981',
  called: '#F59E0B',
  follow_up: '#8B5CF6',
  interested: '#EF4444',
  meeting_scheduled: '#6366F1',
  converted: '#14B8A6',
  dropped: '#9CA3AF',
  not_interested: '#6B7280',
}

export default function ConversionFunnel({ data }: { data: any[] }) {
  const chartData = statusOrder.map((status) => {
    let count = 0
    if (status === 'contacted') {
      const item1 = data.find((d) => d.status === 'contacted')
      const item2 = data.find((d) => d.status === 'called')
      count = (item1 ? parseInt(item1.count) : 0) + (item2 ? parseInt(item2.count) : 0)
    } else if (status === 'dropped') {
      const item1 = data.find((d) => d.status === 'dropped')
      const item2 = data.find((d) => d.status === 'not_interested')
      count = (item1 ? parseInt(item1.count) : 0) + (item2 ? parseInt(item2.count) : 0)
    } else {
      const item = data.find((d) => d.status === status)
      count = item ? parseInt(item.count) : 0
    }

    let label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
    if (status === 'new') label = 'Pending'
    if (status === 'contacted') label = 'Called/Contacted'
    if (status === 'dropped') label = 'Dropped/Not Interested'

    return {
      status: label,
      count: count,
      color: statusColors[status] || '#6B7280',
    }
  })

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
