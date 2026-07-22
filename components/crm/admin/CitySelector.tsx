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

  const loadCities = async () => {
    setLoading(true)
    try {
      if (scope === 'franchise-lp') {
        const stateNames = (state || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

        // No state selected → load cities for all franchise-lp states.
        let statesToLoad = stateNames
        if (!statesToLoad.length) {
          const statesRes = await fetch(apiUrl('/common/states/?scope=franchise-lp'))
          const statesData = await statesRes.json()
          statesToLoad = (Array.isArray(statesData?.results) ? statesData.results : [])
            .map((s: { name?: string }) => (s?.name || '').trim())
            .filter(Boolean)
        }

        // If a CRM user is selected, keep only states in their territory.
        if (scopeUserId) {
          const scopedRes = await api.get(`/states?userId=${encodeURIComponent(scopeUserId)}`)
          const allowed = new Set(
            (Array.isArray(scopedRes.data) ? scopedRes.data : [])
              .map((s: { name?: string }) => (s?.name || '').trim().toLowerCase())
              .filter(Boolean),
          )
          if (allowed.size > 0) {
            statesToLoad = statesToLoad.filter((s) => allowed.has(s.toLowerCase()))
          }
        }

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
          })
        )
        setCities(Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } else {
        const params = new URLSearchParams()
        if (state) params.append('state', state)
        if (scopeUserId) params.append('userId', scopeUserId)
        const response = await api.get(`/cities?${params.toString()}`)
        setCities(response.data || [])
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
