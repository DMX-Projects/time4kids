'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/crmApi'

interface CitySelectorProps {
  value: string
  onChange: (value: string) => void
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

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Select City</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select min-w-[180px] max-w-xs"
        disabled={loading}
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  )
}
