import type { LucideIcon } from 'lucide-react'
import './SegmentedControl.css'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  Icon: LucideIcon
}

type SegmentedControlProps<T extends string> = {
  options: [SegmentedOption<T>, SegmentedOption<T>]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((option) => option.value === value)

  return (
    <div className="fb-segmented" data-active={activeIndex}>
      <span className="fb-segmented-thumb" aria-hidden="true" />
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          className={`fb-segmented-btn${index === activeIndex ? ' active' : ''}`}
          aria-selected={index === activeIndex}
          onClick={() => onChange(option.value)}
        >
          <option.Icon size={14} />
          {option.label}
        </button>
      ))}
    </div>
  )
}
