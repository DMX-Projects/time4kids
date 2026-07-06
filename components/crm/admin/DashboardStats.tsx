'use client'

interface Stats {
  totalEnquiries: number
  todayLeads: number
  followUps: number
  converted: number
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalEnquiries,
      color: 'bg-orange-500',
      icon: '📊',
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl shadow-lg px-5 py-4 text-white transition-shadow duration-150 hover:shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="text-4xl opacity-80">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

