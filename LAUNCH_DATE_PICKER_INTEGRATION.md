# LaunchDatePicker Integration Guide

## Overview
The `LaunchDatePicker` component is a comprehensive date input that combines manual typing with calendar picking, designed specifically for the Mobile Game Hunt submit form.

## Features
- ✅ **Dual Input Methods**: Type manually OR pick from calendar
- ✅ **Multiple Date Formats**: Supports YYYY-MM-DD, DD/MM/YYYY, MMM DD, YYYY, etc.
- ✅ **Smart Validation**: Prevents past dates, validates format
- ✅ **Auto-formatting**: Displays as "Oct 11, 2025" but outputs ISO string
- ✅ **Dark Theme**: Matches Mobile Game Hunt's futuristic style
- ✅ **Smooth Animations**: Framer Motion powered transitions
- ✅ **Full Accessibility**: ARIA labels, keyboard navigation, focus management
- ✅ **React Hook Form Ready**: Drop-in replacement for existing date inputs

## Quick Integration

### 1. Replace Existing Date Input

**Before (current implementation):**
```tsx
<Input
  id="launchDate"
  type="date"
  {...form.register('launchDate')}
  className="mt-2"
  onBlur={() => form.trigger('launchDate')}
/>
```

**After (with LaunchDatePicker):**
```tsx
<Controller
  name="launchDate"
  control={form.control}
  render={({ field }) => (
    <LaunchDatePicker
      value={field.value}
      onChange={field.onChange}
      placeholder="Select or type a launch date"
      id="launchDate"
      onBlur={() => form.trigger('launchDate')}
      required
    />
  )}
/>
```

### 2. Import the Component
```tsx
import { LaunchDatePicker } from '@/components/ui/launch-date-picker'
import { Controller } from 'react-hook-form'
```

### 3. Update Form Schema (if needed)
The component outputs ISO date strings (`YYYY-MM-DD`), so your existing schema should work:
```tsx
launchDate: z.string().optional(), // or .min(1, 'Launch date is required')
```

## Supported Input Formats

Users can type dates in these formats:
- `2025-10-11` (ISO format)
- `11/10/2025` (European DD/MM/YYYY)
- `10/11/2025` (US MM/DD/YYYY)
- `Oct 11, 2025` (English format)
- `11 Oct 2025` (European format)
- `2025/10/11` (Alternative format)

## Validation Rules
- ✅ **Format Validation**: Must be a valid date format
- ✅ **Past Date Prevention**: Only today and future dates allowed
- ✅ **Required Field**: Can be marked as required
- ✅ **Clear Functionality**: Easy to clear and reset

## Styling
The component uses Mobile Game Hunt's design system:
- **Input**: `bg-black/40 border-neutral-700 focus:border-purple-500`
- **Calendar**: Dark background with purple accents
- **Error State**: Red border and error message
- **Hover Effects**: Subtle purple highlights

## Accessibility Features
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus trapping in calendar
- **Error Announcements**: Screen reader friendly error messages
- **Escape Key**: Close calendar with Escape

## Animation Details
- **Entrance**: Fade in + scale up (0.25s duration)
- **Exit**: Fade out + scale down
- **Hover States**: Smooth color transitions
- **Focus States**: Ring animations

## Demo Page
Visit `/demo/launch-date-picker` to see the component in action with:
- Live form integration
- All supported date formats
- Validation examples
- Real-time form state display

## API Reference

### Props
```tsx
interface LaunchDatePickerProps {
  value?: string              // ISO date string (YYYY-MM-DD)
  onChange?: (date: string) => void
  placeholder?: string        // Default: "Select or type a launch date"
  className?: string          // Additional CSS classes
  id?: string                // HTML id attribute
  name?: string              // HTML name attribute
  onBlur?: () => void        // Blur callback
  disabled?: boolean         // Disable the input
  required?: boolean         // Mark as required field
}
```

### Output Format
The component always outputs ISO date strings (`YYYY-MM-DD`) for consistent backend integration, while displaying user-friendly formats in the input field.

## Migration Checklist
- [ ] Import `LaunchDatePicker` and `Controller`
- [ ] Replace `<Input type="date">` with `<Controller>` + `<LaunchDatePicker>`
- [ ] Update form validation schema if needed
- [ ] Test with various date formats
- [ ] Verify accessibility with screen reader
- [ ] Check mobile responsiveness
- [ ] Test form submission with ISO output

## Browser Support
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

The component uses modern web standards but maintains compatibility with older browsers through graceful degradation.
