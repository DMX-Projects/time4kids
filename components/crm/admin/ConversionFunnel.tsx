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
  const tipWidth = 2
  const step = (100 - tipWidth) / stageCount
  const pyramidStages = [...stages].reverse()
  const rowHeight = stageCount > 8 ? 'h-[1.65rem] sm:h-7' : 'h-7 sm:h-8'

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 sm:text-lg">Lead Funnel</h3>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No leads in this funnel yet.</p>
      ) : (
        <div className="w-full">
          {pyramidStages.map((stage, index) => {
            const widthTop = tipWidth + step * index
            const widthBottom = tipWidth + step * (index + 1)
            const insetTop = (100 - widthTop) / 2
            const insetBottom = (100 - widthBottom) / 2
            const pctOfTotal = Math.round((stage.count / total) * 100)
            const showBandValue = widthBottom >= 14

            return (
              <div
                key={stage.id}
                className={`grid grid-cols-[minmax(0,44%)_minmax(0,56%)] items-center ${rowHeight}`}
                title={`${stage.label}: ${stage.count.toLocaleString()} (${pctOfTotal}%)`}
              >
                <div className="flex min-w-0 items-center pr-1">
                  <p className="min-w-0 truncate text-[10px] font-medium leading-tight text-slate-600 sm:text-[11px]">
                    {stage.label}
                  </p>
                  <span
                    className="mx-1.5 hidden min-w-[0.75rem] flex-1 border-t border-dotted border-slate-300 sm:block"
                    aria-hidden
                  />
                </div>

                <div className={`${rowHeight} w-full`}>
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      backgroundColor: stage.color,
                      clipPath: `polygon(${insetTop}% 0%, ${100 - insetTop}% 0%, ${100 - insetBottom}% 100%, ${insetBottom}% 100%)`,
                    }}
                  >
                    {showBandValue ? (
                      <span className="px-1 text-center text-[10px] font-extrabold tabular-nums text-white drop-shadow-sm sm:text-[11px]">
                        {stage.count.toLocaleString()} ({pctOfTotal}%)
                      </span>
                    ) : (
                      <span className="sr-only">
                        {stage.count.toLocaleString()} ({pctOfTotal}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
