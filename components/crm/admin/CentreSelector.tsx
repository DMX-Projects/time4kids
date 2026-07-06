'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/crmApi'
import { SearchableSelect } from '@/components/crm/SearchableSelect'

interface CentreSelectorProps {
  city: string
  value: string
  onChange: (value: string) => void
}

export default function CentreSelector({ city, value, onChange }: CentreSelectorProps) {
  const [centres, setCentres] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!city) {
      setCentres([])
      return
    }

    let cancelled = false
    const loadCentres = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ city })
        const response = await api.get(`/centres?${params.toString()}`)
        if (!cancelled) {
          setCentres(response.data || [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load centres:', error)
          setCentres([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCentres()
    return () => {
      cancelled = true
    }
  }, [city])

  const options = useMemo(
    () => [
      ...centres.map((centre) => ({ value: centre.id, label: centre.name })),
    ],
    [centres],
  )

  if (!city) {
    return (
      <div className="flex-1 min-w-[140px]">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Select Centre</label>
        <SearchableSelect
          options={[{ value: '', label: 'Select a city first' }]}
          value=""
          onChange={() => {}}
          placeholder="Select a city first"
          disabled={true}
          aria-label="Select Centre"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-[140px]">
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select Centre</label>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select Centre"
        disabled={loading}
        aria-label="Select Centre"
      />
    </div>
  )
}
