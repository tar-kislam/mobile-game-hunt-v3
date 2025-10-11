"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { parse, isValid, format, isAfter, isToday, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface LaunchDatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  onBlur?: () => void
  disabled?: boolean
  required?: boolean
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Date parsing formats
const DATE_FORMATS = [
  'yyyy-MM-dd',      // ISO format: 2025-10-11
  'dd/MM/yyyy',      // European: 11/10/2025
  'MM/dd/yyyy',      // US: 10/11/2025
  'MMM dd, yyyy',    // English: Oct 11, 2025
  'dd MMM yyyy',     // European: 11 Oct 2025
  'yyyy/MM/dd',      // Alternative: 2025/10/11
]

export function LaunchDatePicker({
  value = '',
  onChange,
  placeholder = 'Select or type a launch date',
  className,
  id,
  name,
  onBlur,
  disabled = false,
  required = false
}: LaunchDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [inputValue, setInputValue] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (isValid(date)) {
        setInputValue(format(date, 'MMM dd, yyyy'))
        setCurrentMonth(date.getMonth())
        setCurrentYear(date.getFullYear())
      }
    } else {
      setInputValue('')
    }
    setIsInvalid(false)
    setErrorMessage('')
  }, [value])

  // Close calendar when user starts typing
  useEffect(() => {
    if (isTyping && isOpen) {
      setIsOpen(false)
    }
  }, [isTyping, isOpen])

  // Handle click outside
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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const parseDateInput = useCallback((input: string): Date | null => {
    if (!input.trim()) return null

    // Try each format
    for (const formatStr of DATE_FORMATS) {
      try {
        const parsed = parse(input.trim(), formatStr, new Date())
        if (isValid(parsed)) {
          return parsed
        }
      } catch {
        continue
      }
    }

    // Try parsing as ISO string
    try {
      const isoDate = new Date(input)
      if (isValid(isoDate)) {
        return isoDate
      }
    } catch {
      // Ignore
    }

    return null
  }, [])

  const validateDate = useCallback((date: Date): boolean => {
    const today = startOfDay(new Date())
    const selectedDate = startOfDay(date)
    
    return isAfter(selectedDate, today) || isToday(selectedDate)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setIsTyping(true)

    if (!newValue.trim()) {
      setIsInvalid(false)
      setErrorMessage('')
      onChange?.('')
      return
    }

    const parsedDate = parseDateInput(newValue)
    
    if (!parsedDate) {
      setIsInvalid(true)
      setErrorMessage('Invalid date format')
      return
    }

    if (!validateDate(parsedDate)) {
      setIsInvalid(true)
      setErrorMessage('Launch date must be today or in the future')
      return
    }

    // Valid date
    setIsInvalid(false)
    setErrorMessage('')
    const isoString = format(parsedDate, 'yyyy-MM-dd')
    onChange?.(isoString)
    
    // Update calendar position
    setCurrentMonth(parsedDate.getMonth())
    setCurrentYear(parsedDate.getFullYear())
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsTyping(false)
      inputRef.current?.blur()
      onBlur?.()
    }
  }

  const handleInputFocus = () => {
    setIsTyping(false)
    setIsOpen(false)
  }

  const handleCalendarClick = () => {
    if (disabled) return
    setIsTyping(false)
    setIsOpen(!isOpen)
    inputRef.current?.blur()
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day)
    const isoString = format(selectedDate, 'yyyy-MM-dd')
    const displayValue = format(selectedDate, 'MMM dd, yyyy')
    
    setInputValue(displayValue)
    setIsInvalid(false)
    setErrorMessage('')
    onChange?.(isoString)
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
    const isoString = format(today, 'yyyy-MM-dd')
    const displayValue = format(today, 'MMM dd, yyyy')
    
    setInputValue(displayValue)
    setIsInvalid(false)
    setErrorMessage('')
    onChange?.(isoString)
    setIsOpen(false)
    onBlur?.()
  }

  const handleClear = () => {
    setInputValue('')
    setIsInvalid(false)
    setErrorMessage('')
    onChange?.('')
    setIsOpen(false)
    onBlur?.()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const today = new Date()
    const selectedDate = value ? new Date(value) : null

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

    const isPastDate = (day: number) => {
      const date = new Date(currentYear, currentMonth, day)
      return date < startOfDay(new Date())
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
          type="button"
          className="h-8 w-8 text-gray-500 hover:bg-purple-500/20 rounded-md text-sm transition-colors"
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
      const isPast = isPastDate(day)
      
      days.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          className={cn(
            "h-8 w-8 rounded-md text-sm font-medium transition-all duration-200",
            isPast && "text-gray-500 cursor-not-allowed opacity-50",
            !isPast && isToday(day) && "bg-purple-500/20 text-purple-300 border border-purple-500/50 hover:bg-purple-500/30",
            !isPast && isSelected(day) && "bg-purple-600 text-white hover:bg-purple-700 shadow-lg",
            !isPast && !isToday(day) && !isSelected(day) && "hover:bg-purple-500/20 text-white hover:text-purple-300"
          )}
          onClick={() => !isPast && handleDateSelect(day)}
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
          type="button"
          className="h-8 w-8 text-gray-500 hover:bg-purple-500/20 rounded-md text-sm transition-colors"
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
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          className={cn(
            "w-full bg-black/40 border border-neutral-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 text-white rounded-md p-3 placeholder-gray-400 transition-all duration-200",
            isInvalid && "border-red-500/60 focus:border-red-500 focus:ring-red-500/40",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="h-4 w-4 text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Clear date"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={handleCalendarClick}
            disabled={disabled}
            className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-md transition-all duration-200"
            aria-label="Open calendar"
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {isInvalid && errorMessage && (
        <p id={`${id}-error`} className="text-red-400 text-sm mt-1">
          {errorMessage}
        </p>
      )}

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border border-purple-500/30 bg-gray-900/95 backdrop-blur-sm shadow-2xl p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-md hover:bg-purple-500/20 flex items-center justify-center text-gray-300 hover:text-purple-400 transition-all duration-200"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <h3 className="text-lg font-semibold text-white">
                {months[currentMonth]} {currentYear}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-md hover:bg-purple-500/20 flex items-center justify-center text-gray-300 hover:text-purple-400 transition-all duration-200"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
