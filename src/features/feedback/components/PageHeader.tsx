import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
  title?: string
  icon?: ReactNode
  subtitle?: string
  meta?: ReactNode
}

// title is optional so a view reachable only through a labeled tab (no
// sidebar/breadcrumb of its own) can skip the redundant on-page heading
// - see CreateFeedbackView, MyTicketsView, PopularTicketsView. Views
// reachable from a sidebar (which has no per-page label) still pass one.
export function PageHeader({ title, icon, subtitle, meta }: PageHeaderProps) {
  return (
    <div className={`fb-page-header${title ? '' : ' no-title'}`}>
      {title && (
        <h1 className="fb-page-title">
          {icon}
          {title}
        </h1>
      )}
      {(subtitle || meta) && (
        <div className="fb-page-meta-row">
          {subtitle && <p className="fb-page-sub">{subtitle}</p>}
          {meta}
        </div>
      )}
    </div>
  )
}
