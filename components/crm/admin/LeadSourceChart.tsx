'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  website: 'Website',
  admission: 'Admission',
  contact: 'Centers Enquiry',
  campaign: 'Campaign Enquiry',
  landing: 'Landing',
}

const COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  campaign: '#8B5CF6',
  website: '#7C3AED',
  admission: '#2563EB',
  contact: '#0EA5E9',
  landing: '#14B8A6',
  google_ads: '#EA4335',
  referral: '#10B981',
  walk_in: '#F59E0B',
  other: '#6B7280',
}

export default function LeadSourceChart({ data }: { data: any[] }) {
  const chartData = data.map((item) => ({
    name: SOURCE_LABELS[item.source] || item.source.charAt(0).toUpperCase() + item.source.slice(1).replace('_', ' '),
    value: parseInt(item.count),
    color: COLORS[item.source as keyof typeof COLORS] || COLORS.other,
  }))

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Lead Source Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

