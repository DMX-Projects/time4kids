'use client'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { getMonth, getYear } from 'date-fns'

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

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

  const renderCustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => {
    // Generate years from 90 years ago to the current year
    const currentYear = getYear(new Date());
    const years = Array.from({ length: 91 }, (_, i) => currentYear - 90 + i);

    return (
      <div className="flex items-center justify-between px-2 py-2 bg-white">
        <button
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          type="button"
          className="p-1 hover:bg-gray-100 rounded-md text-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={MONTHS[getMonth(date)]}
              onChange={({ target: { value } }) =>
                changeMonth(MONTHS.indexOf(value))
              }
              className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={getYear(date)}
              onChange={({ target: { value } }) => changeYear(Number(value))}
              className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none cursor-pointer"
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          type="button"
          className="p-1 hover:bg-gray-100 rounded-md text-gray-700 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

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
            maxDate={new Date()}
            className="h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-[140px]"
            dateFormat="dd/MM/yyyy"
            placeholderText="From Date"
            renderCustomHeader={renderCustomHeader}
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
            maxDate={new Date()}
            openToDate={endDate || new Date()}
            className="h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm w-[140px]"
            dateFormat="dd/MM/yyyy"
            placeholderText="To Date"
            renderCustomHeader={renderCustomHeader}
          />
        </div>
      </div>
    </div>
  )
}
