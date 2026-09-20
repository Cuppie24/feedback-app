import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import './Toast.css'

type ToastProps = {
  children: ReactNode
  Icon?: LucideIcon
  open: boolean
  leaving?: boolean
}

export function Toast({ children, Icon, open, leaving = false }: ToastProps) {
  return (
    <div className="fb-toast" role={open ? 'status' : undefined} aria-live="polite" aria-hidden={!open} data-open={open} data-leaving={leaving}>
      {Icon && <Icon size={18} strokeWidth={2.5} aria-hidden="true" />}
      <span>{children}</span>
    </div>
  )
}
