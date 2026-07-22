'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/crmApi'
import { apiUrl } from '@/lib/api-client'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'

export type GeoScope = 'default' | 'franchise-lp'

interface StateSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  /** July LP / July Meta campaign forms use franchise-lp state list. */
  scope?: GeoScope
  /** When set to a CRM user id, limit states to that user's zone/region. */
  userId?: string
}

export default function StateSelector({
  value,
  onChange,
  scope = 'default',
  userId = '',
}: StateSelectorProps) {
  const [states, setStates] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const scopeUserId =
    userId && userId !== 'unassigned' && userId !== 'all' ? userId : ''

  useEffect(() => {
    loadStates()
  }, [scope, scopeUserId])

  const loadStates = async () => {
    setLoading(true)
    try {
      if (scope === 'franchise-lp') {
        const res = await fetch(apiUrl('/common/states/?scope=franchise-lp'))
        const data = await res.json()
        let rows: { name: string }[] = Array.isArray(data?.results) ? data.results : []
        // Narrow franchise-lp list to the selected CRM user's territory when possible.
        if (scopeUserId) {
          const scopedRes = await api.get(`/states?userId=${encodeURIComponent(scopeUserId)}`)
          const allowed = new Set(
            (Array.isArray(scopedRes.data) ? scopedRes.data : [])
              .map((s: { name?: string }) => (s?.name || '').trim().toLowerCase())
              .filter(Boolean),
          )
          if (allowed.size > 0) {
            rows = rows.filter((s) => allowed.has((s.name || '').trim().toLowerCase()))
          }
        }
        setStates(rows)
      } else {
        const params = new URLSearchParams()
        if (scopeUserId) params.set('userId', scopeUserId)
        const qs = params.toString()
        const response = await api.get(`/states${qs ? `?${qs}` : ''}`)
        setStates(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load states:', error)
      setStates([])
    } finally {
      setLoading(false)
    }
  }

  const options = useMemo(
    () => states.map((state) => ({ value: state.name, label: state.name })),
    [states]
  )

  return (
    <div className="flex-1 min-w-[140px] w-full sm:max-w-[240px]">
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select State</label>
      <MultiSelectCheckbox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="All"
        disabled={loading}
      />
    </div>
  )
}
