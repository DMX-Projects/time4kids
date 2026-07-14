'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/crmApi'
import { MultiSelectCheckbox } from '@/components/crm/MultiSelectCheckbox'

interface StateSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function StateSelector({ value, onChange }: StateSelectorProps) {
  const [states, setStates] = useState<{ name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStates()
  }, [])

  const loadStates = async () => {
    try {
      const response = await api.get('/states')
      setStates(response.data || [])
    } catch (error) {
      console.error('Failed to load states:', error)
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
