'use client'

import Select, { StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

export type Option = { value: string; label: string }

const defaultStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
    borderWidth: state.isFocused ? 2 : 1,
    borderRadius: 8,
    boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    zIndex: 50,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
  }),
  singleValue: (base) => ({
    ...base,
    maxWidth: '100%',
    whiteSpace: 'normal',
    lineHeight: 1.3,
  }),
  option: (base) => ({
    ...base,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  }),
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  'aria-label'?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  'aria-label': ariaLabel,
}: SearchableSelectProps) {
  const selectedOption = options.find((o) => o.value === value) ?? null

  return (
    <Select<Option, false>
      isSearchable
      isClearable={false}
      options={options}
      value={selectedOption}
      onChange={(opt) => onChange(opt?.value ?? '')}
      placeholder={placeholder}
      isDisabled={disabled}
      aria-label={ariaLabel}
      styles={defaultStyles}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      noOptionsMessage={() => 'No options found'}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
    />
  )
}

/** For city when state has no list: user can type custom city. */
export function SearchableSelectOrCreate({
  options,
  value,
  onChange,
  placeholder = 'Type or select city...',
  disabled = false,
  'aria-label': ariaLabel,
}: SearchableSelectProps) {
  const selectedOption = value
    ? options.find((o) => o.value === value) ?? { value, label: value }
    : null

  return (
    <CreatableSelect<Option, false>
      isSearchable
      isClearable
      options={options}
      value={selectedOption}
      onChange={(opt) => onChange(opt?.value ?? '')}
      onCreateOption={(inputValue) => onChange(inputValue.trim())}
      placeholder={placeholder}
      isDisabled={disabled}
      aria-label={ariaLabel}
      styles={defaultStyles}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      formatCreateLabel={(v) => `Use "${v}"`}
      noOptionsMessage={() => 'Type your city name and press Enter to add'}
    />
  )
}
