import { Skeleton } from '@/components/ui/skeleton'

// Skeleton component for chart loading
const ChartSkeleton = ({ type = 'pie' }: { type?: 'pie' | 'line' | 'bar' }) => {
  if (type === 'pie') {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full bg-gray-600" />
          </div>
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-4 w-16 bg-gray-600" />
            <Skeleton className="h-4 w-16 bg-gray-600" />
            <Skeleton className="h-4 w-16 bg-gray-600" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-3/4 bg-gray-600" />
          <Skeleton className="h-4 w-1/2 bg-gray-600" />
          <div className="flex justify-center">
            <Skeleton className="h-32 w-full bg-gray-600" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="space-y-4 w-full">
          <Skeleton className="h-4 w-3/4 bg-gray-600" />
          <Skeleton className="h-4 w-1/2 bg-gray-600" />
          <div className="flex justify-center space-x-2">
            <Skeleton className="h-24 w-8 bg-gray-600" />
            <Skeleton className="h-32 w-8 bg-gray-600" />
            <Skeleton className="h-16 w-8 bg-gray-600" />
            <Skeleton className="h-28 w-8 bg-gray-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Skeleton className="h-32 w-32 rounded bg-gray-600" />
    </div>
  )
}

export default ChartSkeleton
