'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/crmApi'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'

interface CitySelectorProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function CitySelector({ value, onChange }: CitySelectorProps) {
  const [cities, setCities] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCities()
  }, [])

  const loadCities = async () => {
    try {
      const response = await api.get('/cities')
      setCities(response.data || [])
    } catch (error) {
      console.error('Failed to load cities:', error)
    } finally {
      setLoading(false)
    }
  }

  const options = useMemo(
    () => cities.map((city) => ({ value: city.name, label: city.name })),
    [cities]
  )

  return (
    <div className="flex-1 min-w-[140px] max-w-[240px]">
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select City</label>
      <MultiSelectCheckbox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select City"
        disabled={loading}
      />
    </div>
  )
}
