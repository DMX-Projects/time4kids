'use client'

interface Stats {
  totalEnquiries: number
  todayLeads: number
  followUps: number
  converted: number
  crossStateFormLeads?: number
}

export default function DashboardStats({
  stats,
  showCrossStateForm = true,
}: {
  stats: Stats
  /** Internal Time Kids CRM only — hidden for agency / external viewers */
  showCrossStateForm?: boolean
}) {
  const additional = showCrossStateForm ? Number(stats.crossStateFormLeads) || 0 : 0
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalEnquiries,
      color: 'bg-orange-500',
      icon: '📊',
      hint:
        showCrossStateForm && additional > 0
          ? `Includes ${additional} from other state forms`
          : undefined,
    },
    {
      title: "Today's Leads",
      value: stats.todayLeads,
      color: 'bg-yellow-500',
      icon: '📈',
    },
    {
      title: 'Follow-Ups',
      value: stats.followUps,
      color: 'bg-green-500',
      icon: '📞',
    },
    {
      title: 'Converted',
      value: stats.converted,
      color: 'bg-red-500',
      icon: '✅',
    },
  ]

  if (showCrossStateForm) {
    cards.push({
      title: 'Additional (other state forms)',
      value: additional,
      color: 'bg-slate-600',
      icon: '➕',
      hint: 'Form state ≠ city state',
    })
  }

  const gridClass = showCrossStateForm
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'

  return (
    <div className={gridClass}>
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl shadow-lg px-5 py-4 text-white transition-shadow duration-150 hover:shadow-xl`}
          title={card.hint}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white/80 text-sm font-semibold mb-1 leading-snug">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
              {card.hint ? (
                <p className="mt-1 text-[11px] text-white/75 leading-snug">{card.hint}</p>
              ) : null}
            </div>
            <div className="text-4xl opacity-80 shrink-0">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
