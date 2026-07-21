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
}

export default function StateSelector({ value, onChange, scope = 'default' }: StateSelectorProps) {
  const [states, setStates] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStates()
  }, [scope])

  const loadStates = async () => {
    setLoading(true)
    try {
      if (scope === 'franchise-lp') {
        const res = await fetch(apiUrl('/common/states/?scope=franchise-lp'))
        const data = await res.json()
        setStates(Array.isArray(data?.results) ? data.results : [])
      } else {
        const response = await api.get('/states')
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
