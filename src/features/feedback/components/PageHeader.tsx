import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
  title: string
  subtitle?: string
  meta?: ReactNode
}

export function PageHeader({ title, subtitle, meta }: PageHeaderProps) {
  return (
    <div className="fb-page-header">
      <h1 className="fb-page-title">{title}</h1>
      {(subtitle || meta) && (
        <div className="fb-page-meta-row">
          {subtitle && <p className="fb-page-sub">{subtitle}</p>}
          {meta}
        </div>
      )}
    </div>
  )
}
