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
  converted_mou_signed: 'Converted – MOU',
  converted_agreement_signed: 'Converted – Agreement',
  join_later: 'Join Later',
  not_answering_calls: 'Not Answering Calls',
  interested: 'Interested',
}

const FRANCHISE_STATUS_ORDER = [
  'untouched',
  'not_answering_calls',
  'follow_up',
  'join_later',
  'cold',
  'warm',
  'hot',
  'not_interested',
  'wrong_enquiry',
  'converted_mou_signed',
  'converted_agreement_signed',
]

/** Used when Lead Source = All — do not change. */
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
  follow_up: ['follow_up', 'interested'],
  join_later: ['join_later'],
  cold: ['cold'],
  warm: ['warm'],
  hot: ['hot'],
  not_interested: ['not_interested'],
  wrong_enquiry: ['wrong_enquiry'],
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
  // Not qualified = Not Interested + Not Answering + Wrong Enquiry
  // (franchise uses not_answering_calls; admission/all use not_answering)
  const notQualifiedStatuses = new Set([
    'not_interested',
    'not_answering',
    'not_answering_calls',
    'wrong_enquiry',
  ])
  const notQualified = (data || []).reduce((sum, row) => {
    const status = String(row?.status || '').trim()
    if (!notQualifiedStatuses.has(status)) return sum
    return sum + (parseInt(row.count, 10) || 0)
  }, 0)
  const qualified = Math.max(total - notQualified, 0)
  const stageCount = Math.max(stages.length, 1)

  // Tapering body, then a straight spout for the last 2 stages (matches reference funnel).
  const spoutCount = Math.min(2, Math.max(1, Math.floor(stageCount / 3)))
  const bodyCount = Math.max(stageCount - spoutCount, 1)
  const topWidthPct = 100
  const spoutWidthPct = 42
  const bodyStep = (topWidthPct - spoutWidthPct) / bodyCount
  const bandHeight = stageCount > 9 ? 44 : stageCount > 7 ? 48 : 52
  const gapPx = 4

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
        <h3 className="text-xl font-bold text-gray-800">Lead Funnel</h3>
      </div>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No leads in this funnel yet.</p>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-2 text-center sm:gap-3">
            <div className="rounded-lg bg-emerald-50 px-2 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs">
                Qualified
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-900 sm:text-2xl">
                {qualified.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 px-2 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 sm:text-xs">
                Total Leads
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
                {total.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 px-2 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 sm:text-xs">
                Not Qualified
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-rose-900 sm:text-2xl">
                {notQualified.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
            {stages.map((stage, index) => {
              const { widthTop, widthBottom } = segmentWidth(index)
              const insetTop = (100 - widthTop) / 2
              const insetBottom = (100 - widthBottom) / 2
              const pctOfTotal = total > 0 ? Math.round((stage.count / total) * 100) : 0
              const inSpout = index >= bodyCount
              const isFirst = index === 0
              const isLast = index === stageCount - 1
              const height = bandHeight

              const radius = inSpout
                ? isLast
                  ? '0 0 12px 12px'
                  : '10px'
                : isFirst
                  ? '14px 14px 0 0'
                  : '0'

              const useTwoCol = (mode === 'franchise' || mode === 'admission') && inSpout
              // Stack label above count when text would clip (spout / long names like Converted – MOU).
              const stackLabel =
                useTwoCol ||
                stage.label.length > 14 ||
                stage.label.toLowerCase().includes('converted')

              return (
                <div
                  key={stage.id}
                  className="relative w-full"
                  style={{
                    height: stackLabel ? Math.max(height, 64) : height,
                    marginBottom: isLast ? 0 : gapPx,
                  }}
                  title={`${stage.label}: ${stage.count.toLocaleString()} (${pctOfTotal}%)`}
                >
                  <div
                    className="absolute inset-0 flex items-center px-2 text-white"
                    style={{
                      backgroundColor: stage.color,
                      clipPath: inSpout
                        ? undefined
                        : `polygon(${insetTop}% 0%, ${100 - insetTop}% 0%, ${100 - insetBottom}% 100%, ${insetBottom}% 100%)`,
                      width: inSpout ? `${spoutWidthPct}%` : '100%',
                      left: inSpout ? `${(100 - spoutWidthPct) / 2}%` : 0,
                      borderRadius: radius,
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                      justifyContent: 'center',
                    }}
                  >
                    {stackLabel ? (
                      <span className="flex max-w-[92%] flex-col items-center justify-center gap-0.5 px-0.5 text-center leading-tight">
                        <span className="text-[15px] font-medium break-words sm:text-base">
                          {stage.label}
                        </span>
                        <span className="whitespace-nowrap">
                          <span className="text-[15px] font-bold tabular-nums sm:text-base">
                            {stage.count.toLocaleString()}
                          </span>
                          <span className="text-[15px] font-semibold tabular-nums text-white/95 sm:text-base">
                            ({pctOfTotal}%)
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="max-w-[95%] whitespace-nowrap text-center text-[15px] font-medium leading-none text-white sm:text-base">
                        {stage.label}{' '}
                        <span className="text-[15px] font-bold tabular-nums sm:text-base">
                          {stage.count.toLocaleString()}
                        </span>{' '}
                        <span className="text-[15px] font-semibold tabular-nums text-white/95 sm:text-base">
                          ({pctOfTotal}%)
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
