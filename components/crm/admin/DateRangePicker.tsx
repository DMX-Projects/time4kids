'use client'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date | null, end: Date | null) => void
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const handleStartChange = (date: Date | null) => {
    if (!date) {
      onChange(null, endDate)
      return
    }
    const start = startOfDay(date)
    // Only adjust end date if it's already set and is before the new start date
    if (endDate && start.getTime() > endDate.getTime()) {
      onChange(start, null)
    } else {
      onChange(start, endDate)
    }
  }

  const handleEndChange = (date: Date | null) => {
    if (!date) {
      onChange(startDate, null)
      return
    }
    const end = endOfDay(date)
    // Only adjust start date if it's already set and is after the new end date
    if (startDate && end.getTime() < startDate.getTime()) {
      onChange(null, end)
    } else {
      onChange(startDate, end)
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date Range</label>
      <div className="flex gap-2">
        <div className="relative">
          <DatePicker
            selected={startDate}
            onChange={handleStartChange}
            selectsStart
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            className="h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-[140px]"
            dateFormat="dd/MM/yyyy"
            placeholderText="From Date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
        <div className="relative">
          <DatePicker
            selected={endDate}
            onChange={handleEndChange}
            selectsEnd
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            minDate={startDate ?? undefined}
            className="h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-[140px]"
            dateFormat="dd/MM/yyyy"
            placeholderText="To Date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
      </div>
    </div>
  )
}
