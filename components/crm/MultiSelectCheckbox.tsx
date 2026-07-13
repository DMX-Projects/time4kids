'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectCheckboxProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelectCheckbox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false
}: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredOptions = useMemo(() => {
    return options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [options, searchTerm])
  
  const allSelected = value.length === options.length && options.length > 0
  
  const handleSelectAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(options.map(o => o.value))
    }
  }

  const handleToggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val))
    } else {
      onChange([...value, val])
    }
  }
  
  const displayValue = value.length === 0 
    ? placeholder 
    : value.length === options.length 
      ? 'All Selected' 
      : value.length <= 2
        ? value.map(val => options.find(o => o.value === val)?.label).filter(Boolean).join(', ')
        : `${value.length} Selected`

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between min-h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <span className={`text-sm truncate ${value.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
          {displayValue}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            {!searchTerm && options.length > 0 && (
              <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded text-sm font-semibold text-gray-800">
                <input
                  type="checkbox"
                  className="mr-3 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
                Select All
              </label>
            )}
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <label key={opt.value} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer rounded text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={value.includes(opt.value)}
                    onChange={() => handleToggle(opt.value)}
                  />
                  {opt.label}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
