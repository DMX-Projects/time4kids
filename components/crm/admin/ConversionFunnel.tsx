'use client'

const STATUS_LABELS: Record<string, string> = {
  untouched: 'Untouched',
  not_answering: 'Not answering',
  follow_up: 'Follow-up',
  visited_school: 'Visited the school',
  converted_admission: 'Converted to Admission',
  joined_competition: 'Joined competition',
  not_interested: 'Not Interested',
  wrong_enquiry: 'Wrong enquiry',

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
  'wrong_enquiry',
]

const statusColors: Record<string, string> = {
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
  const stages = statusOrder.map((status) => {
    const keys = legacyMap[status] || [status]
    let count = 0
    keys.forEach((k) => {
      const item = data?.find((d) => d.status === k)
      if (item) count += parseInt(item.count, 10) || 0
    })

    return {
      id: status,
      label: STATUS_LABELS[status] || status,
      count,
      color: statusColors[status] || '#6B7280',
    }
  })

  const total = stages.reduce((sum, s) => sum + s.count, 0)
  const stageCount = Math.max(stages.length, 1)
  /** Top of pyramid ≈ full width; tip stays readable */
  const topWidth = 100
  const bottomWidth = 28
  const step = (topWidth - bottomWidth) / Math.max(stageCount - 1, 1)

  return (
    <div className="card">
      <div className="mb-5 flex items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold text-gray-800">Lead Funnel</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {total.toLocaleString()} total
        </span>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No leads in this funnel yet.</p>
      ) : (
        <div className="mx-auto w-full max-w-xl space-y-[3px]">
          {stages.map((stage, index) => {
            const widthPct = topWidth - step * index
            const nextWidthPct =
              index === stageCount - 1 ? Math.max(widthPct - 10, 18) : topWidth - step * (index + 1)
            const insetTop = (100 - widthPct) / 2
            const insetBottom = (100 - nextWidthPct) / 2
            const pctOfTotal = Math.round((stage.count / total) * 100)

            return (
              <div
                key={stage.id}
                className="grid grid-cols-[minmax(0,42%)_minmax(0,58%)] items-center gap-3 sm:grid-cols-[minmax(0,38%)_minmax(0,62%)] sm:gap-4"
                title={`${stage.label}: ${stage.count.toLocaleString()} (${pctOfTotal}%)`}
              >
                {/* Name outside clip-path so it always shows */}
                <p className="text-right text-xs font-semibold leading-snug text-gray-700 sm:text-sm">
                  {stage.label}
                </p>

                <div
                  className="group relative flex h-11 w-full items-center justify-center transition-[filter] duration-200 group-hover:brightness-105 sm:h-12"
                  style={{
                    backgroundColor: stage.color,
                    clipPath: `polygon(${insetTop}% 0%, ${100 - insetTop}% 0%, ${100 - insetBottom}% 100%, ${insetBottom}% 100%)`,
                    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08)',
                  }}
                >
                  <span className="px-2 text-center text-sm font-extrabold tabular-nums text-white drop-shadow-sm">
                    {stage.count.toLocaleString()}
                    <span className="ml-1 text-[10px] font-semibold opacity-90">({pctOfTotal}%)</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
