'use client'

import { useState, useEffect } from 'react'
import Select, { components, type OptionProps, StylesConfig } from 'react-select'
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
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
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
  searchable?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  'aria-label': ariaLabel,
  searchable = false,
}: SearchableSelectProps) {
  const selectedOption = options.find((o) => o.value === value) ?? null
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div style={{ minHeight: 42, border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#f9fafb' }} />
    )
  }

  return (
    <Select<Option, false>
      isSearchable={searchable}
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

interface MultiSearchableSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  'aria-label'?: string
  /** Allow typing values that are not in the list. */
  creatable?: boolean
  noOptionsText?: string
}

function CheckboxOption(props: OptionProps<Option, true>) {
  return (
    <components.Option {...props}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={props.isSelected} readOnly style={{ pointerEvents: 'none' }} />
        {props.label}
      </span>
    </components.Option>
  )
}

const checkboxStyles: StylesConfig<Option, true> = {
  ...(defaultStyles as unknown as StylesConfig<Option, true>),
  placeholder: (base, state) => ({
    ...base,
    color: state.hasValue ? '#111827' : '#9ca3af',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#eff6ff' : 'white',
    color: '#111827',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  }),
}

function selectionSummary(labels: string[], placeholder: string): string {
  if (labels.length === 0) return placeholder
  if (labels.length <= 2) return labels.join(', ')
  return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`
}

/** Tick-box dropdown: the box shows the picked names (or "+N more") instead of tags. */
export function MultiSearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  'aria-label': ariaLabel,
  creatable = false,
  noOptionsText = 'No options found',
}: MultiSearchableSelectProps) {
  const byValue = new Map(options.map((o) => [o.value, o]))
  const selected = value.map((v) => byValue.get(v) ?? { value: v, label: v })
  const allOptions = [...options, ...selected.filter((o) => !byValue.has(o.value))]
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div style={{ minHeight: 42, border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#f9fafb' }} />
    )
  }

  const common = {
    isMulti: true as const,
    isSearchable: true,
    closeMenuOnSelect: false,
    hideSelectedOptions: false,
    controlShouldRenderValue: false,
    backspaceRemovesValue: false,
    components: { Option: CheckboxOption },
    options: allOptions,
    value: selected,
    onChange: (opts: readonly Option[]) => onChange(opts.map((o) => o.value)),
    placeholder: selectionSummary(selected.map((o) => o.label), placeholder),
    isDisabled: disabled,
    'aria-label': ariaLabel,
    styles: checkboxStyles,
    filterOption: (option: { label: string }, inputValue: string) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    noOptionsMessage: () => noOptionsText,
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'fixed' as const,
  }

  if (creatable) {
    return (
      <CreatableSelect<Option, true>
        {...common}
        onCreateOption={(input) => {
          const v = input.trim()
          if (v && !value.includes(v)) onChange([...value, v])
        }}
        formatCreateLabel={(v) => `Add "${v}"`}
      />
    )
  }
  return <Select<Option, true> {...common} />
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

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div style={{ minHeight: 42, border: '1px solid #d1d5db', borderRadius: 8, backgroundColor: '#f9fafb' }} />
    )
  }

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
