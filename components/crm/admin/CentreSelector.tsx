'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/crmApi'

interface CentreSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function CentreSelector({ value, onChange }: CentreSelectorProps) {
  const [centres, setCentres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCentres()
  }, [])

  const loadCentres = async () => {
    try {
      const response = await api.get('/centres')
      setCentres(response.data)
    } catch (error) {
      console.error('Failed to load centres:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Centre</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        <option value="">All Centres</option>
        {centres.map((centre) => (
          <option key={centre.id} value={centre.id}>
            {centre.name}
          </option>
        ))}
      </select>
    </div>
  )
}

