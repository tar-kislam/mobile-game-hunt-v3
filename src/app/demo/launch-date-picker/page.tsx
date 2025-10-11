"use client"

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LaunchDatePicker } from '@/components/ui/launch-date-picker'
import { toast } from 'sonner'

// Demo schema
const demoSchema = z.object({
  launchDate: z.string().min(1, 'Launch date is required'),
})

type DemoFormData = z.infer<typeof demoSchema>

export default function LaunchDatePickerDemo() {
  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      launchDate: '',
    },
  })

  const onSubmit = (data: DemoFormData) => {
    toast.success(`Launch date selected: ${data.launchDate}`)
    console.log('Form data:', data)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Launch Date Picker Demo</h1>
          <p className="text-gray-400">
            Test the new LaunchDatePicker component with various input formats
          </p>
        </div>

        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Launch Date Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Launch Date Field */}
              <div>
                <label htmlFor="launchDate" className="block text-sm font-medium text-white mb-2">
                  Launch Date *
                </label>
                <Controller
                  name="launchDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <LaunchDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select or type a launch date"
                      id="launchDate"
                      name="launchDate"
                      onBlur={() => form.trigger('launchDate')}
                      required
                    />
                  )}
                />
                {form.formState.errors.launchDate && (
                  <p className="text-red-400 text-sm mt-1">
                    {form.formState.errors.launchDate.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Launch Date
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Supported Date Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Try these formats:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li><code className="bg-gray-800 px-2 py-1 rounded">2025-10-11</code> (ISO format)</li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">11/10/2025</code> (DD/MM/YYYY)</li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">10/11/2025</code> (MM/DD/YYYY)</li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">Oct 11, 2025</code> (English format)</li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">11 Oct 2025</code> (European format)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Features:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>✅ Calendar picker with dark theme</li>
                  <li>✅ Manual date typing with multiple formats</li>
                  <li>✅ Past date validation (today and future only)</li>
                  <li>✅ Auto-format to MMM dd, yyyy display</li>
                  <li>✅ Smooth animations with Framer Motion</li>
                  <li>✅ Full accessibility support</li>
                  <li>✅ React Hook Form integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Form State */}
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Form State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Current value:</span>
                <code className="bg-gray-800 px-2 py-1 rounded ml-2 text-green-400">
                  {form.watch('launchDate') || 'Empty'}
                </code>
              </div>
              <div>
                <span className="text-gray-400">Form valid:</span>
                <span className={`ml-2 ${form.formState.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {form.formState.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
