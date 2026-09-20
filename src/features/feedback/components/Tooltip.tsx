import type { ReactNode } from 'react'
import './Tooltip.css'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  open?: boolean
  showOnHover?: boolean
}

export function Tooltip({ content, children, open = false, showOnHover = true }: TooltipProps) {
  return (
    <span className="fb-tooltip" data-open={open} data-show-on-hover={showOnHover}>
      {children}
      <span className="fb-tooltip-content" role="tooltip">
        {content}
      </span>
    </span>
  )
}
