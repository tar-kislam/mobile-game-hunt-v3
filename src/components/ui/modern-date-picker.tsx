"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModernDatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  onBlur?: () => void
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ModernDatePicker({
  value = '',
  onChange,
  placeholder = 'Select date',
  className,
  id,
  name,
  onBlur
}: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const inputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate.getMonth())
      setCurrentYear(selectedDate.getFullYear())
    }
  }, [selectedDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    const formattedDate = formatDate(selectedDate)
    onChange?.(formattedDate)
    setIsOpen(false)
    onBlur?.()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleToday = () => {
    const today = new Date()
    const formattedDate = formatDate(today)
    onChange?.(formattedDate)
    setIsOpen(false)
    onBlur?.()
  }

  const handleClear = () => {
    onChange?.('')
    setIsOpen(false)
    onBlur?.()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const today = new Date()
    const isToday = (day: number) => {
      return (
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      )
    }
    const isSelected = (day: number) => {
      return (
        selectedDate &&
        day === selectedDate.getDate() &&
        currentMonth === selectedDate.getMonth() &&
        currentYear === selectedDate.getFullYear()
      )
    }

    const days = []
    
    // Previous month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear)
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          className="h-8 w-8 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
          onClick={() => {
            setCurrentMonth(prevMonth)
            setCurrentYear(prevYear)
          }}
        >
          {daysInPrevMonth - i}
        </button>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          className={cn(
            "h-8 w-8 rounded-md text-sm font-medium transition-colors",
            isToday(day) && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
            isSelected(day) && "bg-purple-600 text-white hover:bg-purple-700",
            !isToday(day) && !isSelected(day) && "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          )}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      )
    }

    // Next month days
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    
    for (let day = 1; days.length < 42; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className="h-8 w-8 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm"
          onClick={() => {
            setCurrentMonth(nextMonth)
            setCurrentYear(nextYear)
          }}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value ? new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : ''}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border bg-white dark:bg-gray-800 shadow-lg p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {months[currentMonth]} {currentYear}
            </h3>
            
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
