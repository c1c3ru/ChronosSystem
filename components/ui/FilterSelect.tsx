import React from 'react'
import { cn } from '@/lib/utils'
import { Filter } from 'lucide-react'

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
  icon?: React.ReactNode
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, options, icon, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700">
        {icon || <Filter className="h-4 w-4 text-primary" />}
        <select
          className={cn(
            'bg-transparent text-sm text-neutral-300 cursor-pointer focus:outline-none font-medium',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-neutral-800">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)

FilterSelect.displayName = 'FilterSelect'

export { FilterSelect }
