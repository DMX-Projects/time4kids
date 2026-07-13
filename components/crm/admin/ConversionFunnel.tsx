'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const STATUS_LABELS: Record<string, string> = {
  // Non-franchise specific
  untouched: 'Untouched',
  not_answering: 'Not answering',
  follow_up: 'Follow-up',
  visited_school: 'Visited the school',
  converted_admission: 'Converted to Admission',
  joined_competition: 'Joined competition',
  not_interested: 'Not Interested',
  wrong_enquiry: 'Wrong enquiry',

  // Franchise specific
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  converted_mou_signed: 'Converted – MOU Signed',
  converted_agreement_signed: 'Converted – Agreement Signed',
  join_later: 'Join Later',
  not_answering_calls: 'Not Answering Calls',
}

const FRANCHISE_STATUS_ORDER = [
  'untouched',
  'hot',
  'warm',
  'follow_up',
  'cold',
  'converted_mou_signed',
  'converted_agreement_signed',
  'join_later',
  'not_interested',
  'not_answering_calls',
]

const NON_FRANCHISE_STATUS_ORDER = [
  'untouched',
  'not_answering',
  'follow_up',
  'visited_school',
  'joined_competition',
  'converted_admission',
  'not_interested',
  'wrong_enquiry'
]

const statusColors: { [key: string]: string } = {
  untouched: '#9CA3AF',
  not_answering: '#F59E0B',
  follow_up: '#3B82F6',
  visited_school: '#14B8A6',
  joined_competition: '#8B5CF6',
  converted_admission: '#10B981',
  not_interested: '#EF4444',
  wrong_enquiry: '#F97316',

  hot: '#EF4444',
  warm: '#F97316',
  cold: '#60A5FA',
  converted_mou_signed: '#10B981',
  converted_agreement_signed: '#059669',
  join_later: '#A78BFA',
  not_answering_calls: '#F59E0B',
}

const legacyMap: Record<string, string[]> = {
  untouched: ['untouched', 'new'],
  not_answering: ['not_answering', 'called', 'contacted', 'not_answering_calls'],
  follow_up: ['follow_up', 'hot', 'warm', 'cold', 'interested'],
  visited_school: ['visited_school', 'meeting_scheduled'],
  converted_admission: ['converted_admission', 'converted', 'converted_mou_signed', 'converted_agreement_signed'],
  joined_competition: ['joined_competition'],
  not_interested: ['not_interested', 'dropped', 'join_later'],
  wrong_enquiry: ['wrong_enquiry'],

  hot: ['hot'],
  warm: ['warm'],
  cold: ['cold'],
  converted_mou_signed: ['converted_mou_signed'],
  converted_agreement_signed: ['converted_agreement_signed'],
  join_later: ['join_later'],
  not_answering_calls: ['not_answering_calls'],
}

interface ConversionFunnelProps {
  data: any[]
  isFranchise?: boolean
}

export default function ConversionFunnel({ data, isFranchise = false }: ConversionFunnelProps) {
  const statusOrder = isFranchise ? FRANCHISE_STATUS_ORDER : NON_FRANCHISE_STATUS_ORDER
  const chartData = statusOrder.map((status) => {
    const keys = legacyMap[status] || [status]
    let count = 0
    keys.forEach((k) => {
      const item = data.find((d) => d.status === k)
      if (item) {
        count += parseInt(item.count) || 0
      }
    })

    return {
      status: STATUS_LABELS[status] || status,
      count: count,
      color: statusColors[status] || '#6B7280',
    }
  })

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
          <YAxis
            dataKey="status"
            type="category"
            width={185}
            interval={0}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fill: '#4B5563', fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
