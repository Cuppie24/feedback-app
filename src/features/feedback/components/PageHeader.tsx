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
      <div className="fb-page-header-row">
        <h1 className="fb-page-title">{title}</h1>
        {meta}
      </div>
      {subtitle && <p className="fb-page-sub">{subtitle}</p>}
    </div>
  )
}
