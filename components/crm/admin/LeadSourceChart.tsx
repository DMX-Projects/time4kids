'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  facebook_lead_ads: 'BCWW_Meta',
  instagram: 'Instagram',
  website: 'Website',
  google: 'BCWW_Google',
  july_lp: 'BCWW_Google',
  july_meta: 'BCWW_Meta',
  lp_wb: 'Ants_Google',
  ants_meta: 'Ants_Meta',
  youtube: 'YouTube',
  admission: 'Admission',
  contact: 'Centers Enquiry',
  campaign: 'Paid Campaign',
  landing: 'Paid Campaign',
  franchise: 'Website',
}

const COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  campaign: '#8B5CF6',
  website: '#7C3AED',
  google: '#F59E0B',
  july_lp: '#F59E0B',
  july_meta: '#EC4899',
  facebook_lead_ads: '#EC4899',
  lp_wb: '#0D9488',
  ants_meta: '#14B8A6',
  youtube: '#FF0000',
  admission: '#2563EB',
  contact: '#0EA5E9',
  landing: '#14B8A6',
  franchise: '#6B7280',
  google_ads: '#EA4335',
  referral: '#10B981',
  walk_in: '#F59E0B',
  other: '#6B7280',
}

export default function LeadSourceChart({
  data,
  meetingFixed = 0,
  meetingDone = 0,
  showMeetings = false,
}: {
  data: any[]
  meetingFixed?: number
  meetingDone?: number
  showMeetings?: boolean
}) {
  const merged = new Map<string, number>()
  for (const item of data) {
    const raw = String(item.source || '')
    // BCWW Google LP only — keep Ants (lp_wb / West Bengal) as its own slice.
    const key = raw === 'july_lp' ? 'google' : raw
    merged.set(key, (merged.get(key) || 0) + parseInt(item.count, 10))
  }
  const chartData = Array.from(merged.entries()).map(([source, count]) => ({
    name: SOURCE_LABELS[source] || source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' '),
    value: count,
    color: COLORS[source as keyof typeof COLORS] || COLORS.other,
  }))
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className={`card ${showMeetings ? 'flex h-full flex-col' : ''}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Lead Source Breakdown</h3>
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No leads for this filter yet.</p>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const count = typeof value === 'number' ? value : Number(value) || 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return [`${count} (${pct}%)`, String(name ?? '')]
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value, entry: any) => {
              const count = entry?.payload?.value ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return `${value} : ${count} (${pct}%)`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      )}

      {showMeetings && (
        <div className="mt-auto border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Meetings</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-sky-50 px-3 py-3 ring-1 ring-inset ring-sky-100">
              <p className="text-xs font-semibold text-sky-700">Meeting fixed</p>
              <p className="mt-1 text-2xl font-bold text-sky-900">{meetingFixed}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-3 ring-1 ring-inset ring-emerald-100">
              <p className="text-xs font-semibold text-emerald-700">Meeting done</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{meetingDone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
