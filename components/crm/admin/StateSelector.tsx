'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/crmApi'
import { apiUrl } from '@/lib/api-client'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  filterStateNameListToEmailTerritory,
  filterStatesToEmailTerritory,
  territoryStateNamesForEmail,
} from '@/lib/crmTerritory'

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
  const { user } = useAuth()
  const [states, setStates] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const scopeUserId =
    userId && userId !== 'unassigned' && userId !== 'all' ? userId : ''
  const viewerEmail = user?.email || ''

  useEffect(() => {
    loadStates()
  }, [scope, scopeUserId, viewerEmail])

  // Drop out-of-territory selections (e.g. Jammu & Kashmir left over from a wider list).
  useEffect(() => {
    if (loading || states.length === 0 || value.length === 0) return
    const allowed = new Set(states.map((s) => (s.name || '').trim().toLowerCase()))
    const next = value.filter((v) => allowed.has((v || '').trim().toLowerCase()))
    if (next.length !== value.length) onChange(next)
  }, [loading, states, value, onChange])

  const loadScopedStateNames = async (): Promise<string[] | null> => {
    try {
      const scopedParams = new URLSearchParams()
      if (scopeUserId) scopedParams.set('userId', scopeUserId)
      const qs = scopedParams.toString()
      const scopedRes = await api.get(`/states${qs ? `?${qs}` : ''}`)
      const names = (Array.isArray(scopedRes.data) ? scopedRes.data : [])
        .map((s: { name?: string }) => (s?.name || '').trim())
        .filter(Boolean)
      return names.length > 0 ? names : null
    } catch {
      return null
    }
  }

  const applyTerritory = (names: string[]): string[] => {
    const hard = territoryStateNamesForEmail(viewerEmail)
    if (hard && hard.length > 0) {
      const hardSet = new Set(hard.map((n) => n.trim().toLowerCase()))
      const intersected = names.filter((n) => hardSet.has((n || '').trim().toLowerCase()))
      // Always stay inside the hard territory — never allow JK etc. through.
      return intersected.length > 0 ? intersected : [...hard]
    }
    return filterStateNameListToEmailTerritory(names, viewerEmail)
  }

  const loadStates = async () => {
    setLoading(true)
    try {
      const hard = territoryStateNamesForEmail(viewerEmail)
      if (hard && hard.length > 0 && !scopeUserId) {
        setStates(hard.map((name) => ({ name })))
        return
      }

      const scopedNames = await loadScopedStateNames()
      if (scopedNames) {
        setStates(applyTerritory(scopedNames).map((name) => ({ name })))
        return
      }

      if (scope === 'franchise-lp') {
        const res = await fetch(apiUrl('/common/states/?scope=franchise-lp'))
        const data = await res.json()
        const rows: { name: string }[] = Array.isArray(data?.results) ? data.results : []
        setStates(filterStatesToEmailTerritory(rows, viewerEmail))
      } else {
        const response = await api.get('/states')
        const rows: { name: string }[] = response.data || []
        setStates(filterStatesToEmailTerritory(rows, viewerEmail))
      }
    } catch (error) {
      console.error('Failed to load states:', error)
      const hard = territoryStateNamesForEmail(viewerEmail)
      setStates(hard ? hard.map((name) => ({ name })) : [])
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
