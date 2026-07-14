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
  placeholder = 'All',
  disabled = false
}: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  /** After user unchecks All — show nothing selected until they pick again */
  const [deselectedAll, setDeselectedAll] = useState(false)
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

  // Parent restored a concrete selection
  useEffect(() => {
    if (value.length > 0) setDeselectedAll(false)
  }, [value])

  // Explicit every-option selection collapses to All (empty = all for filters)
  useEffect(() => {
    if (deselectedAll) return
    if (options.length === 0 || value.length === 0) return
    if (value.length !== options.length) return
    const optionSet = new Set(options.map((o) => o.value))
    if (value.every((v) => optionSet.has(v))) {
      onChange([])
    }
  }, [options, value, onChange, deselectedAll])

  const filteredOptions = useMemo(() => {
    return options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [options, searchTerm])

  const fullySelected =
    options.length > 0 && value.length === options.length && value.every((v) => options.some((o) => o.value === v))

  // Empty value = All (no filter), unless user just unchecked All
  const isAll = !deselectedAll && (value.length === 0 || fullySelected)

  const handleSelectAll = () => {
    if (isAll) {
      // Deselect All → clear every checkbox
      setDeselectedAll(true)
      onChange([])
      return
    }
    // Select All → All (empty = no filter)
    setDeselectedAll(false)
    onChange([])
  }

  const handleToggle = (val: string) => {
    if (isAll) {
      // Uncheck one item while All was on → keep every other option
      setDeselectedAll(false)
      onChange(options.map((o) => o.value).filter((v) => v !== val))
      return
    }

    if (deselectedAll && value.length === 0) {
      // Start from nothing selected → pick this one
      setDeselectedAll(false)
      onChange([val])
      return
    }

    if (value.includes(val)) {
      const next = value.filter((v) => v !== val)
      setDeselectedAll(next.length === 0)
      onChange(next)
    } else {
      const next = [...value, val]
      setDeselectedAll(false)
      if (options.length > 0 && next.length === options.length) {
        onChange([]) // back to All
      } else {
        onChange(next)
      }
    }
  }

  const displayValue = deselectedAll
    ? 'Select...'
    : isAll
      ? 'All'
      : value.length <= 2
        ? value.map((val) => options.find((o) => o.value === val)?.label).filter(Boolean).join(', ')
        : `${value.length} Selected`

  return (
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between min-h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <span className={`text-sm truncate ${deselectedAll ? 'text-gray-400' : 'text-gray-800'}`}>
          {displayValue || placeholder}
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
                  checked={isAll}
                  onChange={handleSelectAll}
                />
                All
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
                    checked={isAll || value.includes(opt.value)}
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
