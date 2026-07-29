'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/crmApi'
import { apiUrl } from '@/lib/api-client'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'
import type { GeoScope } from '@/components/crm/admin/StateSelector'

interface CitySelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  state?: string
  /** July LP / July Meta campaign forms use franchise-lp city list. */
  scope?: GeoScope
  /** When set to a CRM user id, limit cities to that user's zone/region. */
  userId?: string
}

export default function CitySelector({
  value,
  onChange,
  state,
  scope = 'default',
  userId = '',
}: CitySelectorProps) {
  const [cities, setCities] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const scopeUserId =
    userId && userId !== 'unassigned' && userId !== 'all' ? userId : ''

  useEffect(() => {
    loadCities()
  }, [state, scope, scopeUserId])

  // Drop cities that are no longer in the scoped options list.
  useEffect(() => {
    if (loading || cities.length === 0 || value.length === 0) return
    const allowed = new Set(cities.map((c) => (c.name || '').trim().toLowerCase()))
    const next = value.filter((v) => allowed.has((v || '').trim().toLowerCase()))
    if (next.length !== value.length) onChange(next)
  }, [loading, cities, value, onChange])

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

  const loadCrmCities = async () => {
    const params = new URLSearchParams()
    if (state) params.append('state', state)
    if (scopeUserId) params.append('userId', scopeUserId)
    const qs = params.toString()
    const response = await api.get(`/cities${qs ? `?${qs}` : ''}`)
    setCities(response.data || [])
  }

  const loadFranchiseLpCities = async (statesToLoad: string[]) => {
    const merged = new Map<string, { name: string }>()
    await Promise.all(
      statesToLoad.map(async (stateName: string) => {
        const params = new URLSearchParams({ state: stateName, scope: 'franchise-lp' })
        const res = await fetch(apiUrl(`/common/cities/?${params.toString()}`))
        const data = await res.json()
        const rows = Array.isArray(data?.results) ? data.results : []
        for (const row of rows) {
          const name = (row?.name || '').trim()
          if (name) merged.set(name.toLowerCase(), { name })
        }
      }),
    )
    setCities(Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)))
  }

  const loadCities = async () => {
    setLoading(true)
    try {
      // Zonal/regional CRM: always use their territory cities (never full LP India list).
      const scopedNames = await loadScopedStateNames()
      if (scopedNames) {
        await loadCrmCities()
        return
      }

      if (scope === 'franchise-lp') {
        const stateNames = (state || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        let statesToLoad = stateNames
        if (!statesToLoad.length) {
          const statesRes = await fetch(apiUrl('/common/states/?scope=franchise-lp'))
          const statesData = await statesRes.json()
          statesToLoad = (Array.isArray(statesData?.results) ? statesData.results : [])
            .map((s: { name?: string }) => (s?.name || '').trim())
            .filter(Boolean)
        }

        await loadFranchiseLpCities(statesToLoad)
      } else {
        await loadCrmCities()
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  const options = useMemo(
    () => cities.map((city) => ({ value: city.name, label: city.name })),
    [cities]
  )

  return (
    <div className="flex-1 min-w-[140px] w-full sm:max-w-[240px]">
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select City</label>
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
