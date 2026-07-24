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
  interested: 'Interested',
}

const FRANCHISE_STATUS_ORDER = [
  'untouched',
  'not_answering_calls',
  'interested',
  'follow_up',
  'join_later',
  'cold',
  'warm',
  'hot',
  'converted_mou_signed',
  'converted_agreement_signed',
]

/** Used when Select Lead = All — do not change. */
const ALL_STATUS_ORDER = [
  'untouched',
  'not_answering',
  'follow_up',
  'visited_school',
  'joined_competition',
  'converted_admission',
  'not_interested',
  'wrong_enquiry',
]

const ADMISSION_STATUS_ORDER = [
  'untouched',
  'not_answering',
  'wrong_enquiry',
  'not_interested',
  'follow_up',
  'joined_competition',
  'visited_school',
  'converted_admission',
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
  interested: '#0EA5E9',
}

const legacyMap: Record<string, string[]> = {
  // Admission / All funnel aggregations (unchanged)
  untouched: ['untouched', 'new'],
  not_answering: ['not_answering', 'called', 'contacted', 'not_answering_calls'],
  follow_up: ['follow_up', 'hot', 'warm', 'cold', 'interested'],
  visited_school: ['visited_school', 'meeting_scheduled'],
  converted_admission: ['converted_admission', 'converted', 'converted_mou_signed', 'converted_agreement_signed'],
  joined_competition: ['joined_competition'],
  not_interested: ['not_interested', 'dropped', 'join_later'],
  wrong_enquiry: ['wrong_enquiry'],

  // Franchise stages — one status each (no roll-up double-count)
  hot: ['hot'],
  warm: ['warm'],
  cold: ['cold'],
  converted_mou_signed: ['converted_mou_signed'],
  converted_agreement_signed: ['converted_agreement_signed'],
  join_later: ['join_later'],
  not_answering_calls: ['not_answering_calls'],
  interested: ['interested'],
}

const franchiseLegacyMap: Record<string, string[]> = {
  untouched: ['untouched', 'new'],
  not_answering_calls: ['not_answering_calls'],
  interested: ['interested'],
  follow_up: ['follow_up'],
  join_later: ['join_later'],
  cold: ['cold'],
  warm: ['warm'],
  hot: ['hot'],
  converted_mou_signed: ['converted_mou_signed'],
  converted_agreement_signed: ['converted_agreement_signed'],
}

const admissionLegacyMap: Record<string, string[]> = {
  untouched: ['untouched', 'new'],
  not_answering: ['not_answering', 'called', 'contacted'],
  wrong_enquiry: ['wrong_enquiry'],
  not_interested: ['not_interested', 'dropped'],
  follow_up: ['follow_up'],
  joined_competition: ['joined_competition'],
  visited_school: ['visited_school', 'meeting_scheduled'],
  converted_admission: ['converted_admission', 'converted'],
}

export type FunnelMode = 'all' | 'franchise' | 'admission'

interface ConversionFunnelProps {
  data: any[]
  /** @deprecated use funnelMode */
  isFranchise?: boolean
  funnelMode?: FunnelMode
}

export default function ConversionFunnel({
  data,
  isFranchise = false,
  funnelMode,
}: ConversionFunnelProps) {
  const mode: FunnelMode = funnelMode ?? (isFranchise ? 'franchise' : 'all')
  const statusOrder =
    mode === 'franchise'
      ? FRANCHISE_STATUS_ORDER
      : mode === 'admission'
        ? ADMISSION_STATUS_ORDER
        : ALL_STATUS_ORDER
  const keyMap =
    mode === 'franchise'
      ? franchiseLegacyMap
      : mode === 'admission'
        ? admissionLegacyMap
        : legacyMap
  const stages = statusOrder.map((status) => {
    const keys = keyMap[status] || [status]
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

  // Reference style: tapering body, then a straight spout (last ~2 stages equal width)
  const spoutCount = Math.min(2, Math.max(1, Math.floor(stageCount / 3)))
  const bodyCount = Math.max(stageCount - spoutCount, 1)
  const topWidthPct = 100
  const spoutWidthPct = 36
  const bodyStep = (topWidthPct - spoutWidthPct) / bodyCount
  const bandHeight = stageCount > 9 ? 36 : stageCount > 7 ? 40 : 44
  const gapPx = 6

  const segmentWidth = (index: number) => {
    if (index < bodyCount) {
      const widthTop = topWidthPct - bodyStep * index
      const widthBottom = topWidthPct - bodyStep * (index + 1)
      return { widthTop, widthBottom }
    }
    return { widthTop: spoutWidthPct, widthBottom: spoutWidthPct }
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 sm:text-lg">Lead Funnel</h3>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No leads in this funnel yet.</p>
      ) : (
        <div className="mx-auto flex w-full max-w-sm flex-col items-center px-1">
          {stages.map((stage, index) => {
            const { widthTop, widthBottom } = segmentWidth(index)
            const insetTop = (100 - widthTop) / 2
            const insetBottom = (100 - widthBottom) / 2
            const pctOfTotal = total > 0 ? Math.round((stage.count / total) * 100) : 0
            const inSpout = index >= bodyCount
            const isFirst = index === 0
            const isLast = index === stageCount - 1

            const radius = inSpout
              ? isLast
                ? '0 0 12px 12px'
                : '10px'
              : isFirst
                ? '14px 14px 0 0'
                : '0'

            return (
              <div
                key={stage.id}
                className="relative w-full"
                style={{ height: bandHeight, marginBottom: isLast ? 0 : gapPx }}
                title={`${stage.label}: ${stage.count.toLocaleString()} (${pctOfTotal}%)`}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center"
                  style={{
                    backgroundColor: stage.color,
                    clipPath: inSpout
                      ? undefined
                      : `polygon(${insetTop}% 0%, ${100 - insetTop}% 0%, ${100 - insetBottom}% 100%, ${insetBottom}% 100%)`,
                    width: inSpout ? `${spoutWidthPct}%` : '100%',
                    left: inSpout ? `${(100 - spoutWidthPct) / 2}%` : 0,
                    borderRadius: radius,
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)',
                  }}
                >
                  <span className="max-w-full truncate text-[10px] font-semibold leading-tight text-white/95 sm:text-[11px]">
                    {stage.label}
                  </span>
                  <span className="text-[11px] font-extrabold tabular-nums leading-tight text-white sm:text-xs">
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
