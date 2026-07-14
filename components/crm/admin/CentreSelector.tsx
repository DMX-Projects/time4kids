'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/crmApi'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'

interface CentreSelectorProps {
  cities?: string[]
  states?: string[]
  value: string[]
  onChange: (value: string[]) => void
}

export default function CentreSelector({
  cities = [],
  states = [],
  value,
  onChange,
}: CentreSelectorProps) {
  const [centres, setCentres] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const citiesKey = cities.join(',')
  const statesKey = states.join(',')

  useEffect(() => {
    let cancelled = false

    const loadCentres = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (cities.length === 1) {
          params.set('city', cities[0])
        } else if (cities.length > 1 && cities.length <= 40) {
          params.set('city', citiesKey)
        } else if (states.length > 0 && states.length <= 40) {
          params.set('state', statesKey)
        }

        const qs = params.toString()
        const response = await api.get(`/centres${qs ? `?${qs}` : ''}`)
        if (!cancelled) {
          setCentres(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load centres:', error)
          setCentres([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCentres()
    return () => {
      cancelled = true
    }
  }, [cities.length, citiesKey, states.length, statesKey])

  const options = useMemo(
    () =>
      centres.map((centre) => ({
        value: String(centre.id),
        label: centre.name,
      })),
    [centres],
  )

  return (
    <div className="flex-1 min-w-[140px] w-full sm:max-w-[240px]">
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select Centre</label>
      <MultiSelectCheckbox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="All"
        disabled={loading || centres.length === 0}
      />
    </div>
  )
}
