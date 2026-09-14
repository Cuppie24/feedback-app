import { LayoutList, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import { CATEGORY_ICON } from '../data'
import type { Category } from '../types'
import './Sidebar.css'

export type SidebarView = Category | 'all'

type SidebarProps = {
  active: SidebarView
  onNavigate: (view: SidebarView) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}

const NAV_ITEMS: { view: SidebarView; label: string; Icon: LucideIcon }[] = [
  { view: 'bug', label: 'Ошибки', Icon: CATEGORY_ICON.bug },
  { view: 'idea', label: 'Предложения', Icon: CATEGORY_ICON.idea },
  { view: 'review', label: 'Отзывы', Icon: CATEGORY_ICON.review },
  { view: 'all', label: 'Все обращения', Icon: LayoutList },
]

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside className={`fb-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="fb-sidebar-content">
        <div className="fb-sidebar-brand">
          <button
            type="button"
            className="fb-sidebar-brand-mark"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель'}
            title={collapsed ? 'Развернуть панель' : 'Свернуть панель'}
          >
            <span className="fb-mark-letter">M</span>
            <span className="fb-mark-icon">
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </span>
          </button>
          <div className="fb-sidebar-brand-text">
            <div className="fb-sidebar-brand-name">Micros</div>
            <div className="fb-sidebar-brand-sub">Рабочее пространство</div>
          </div>
        </div>

        <nav className="fb-nav">
          {NAV_ITEMS.map(({ view, label, Icon }) => (
            <button
              key={view}
              type="button"
              className={`fb-nav-item${active === view ? ' active' : ''}`}
              onClick={() => onNavigate(view)}
              aria-current={active === view ? 'page' : undefined}
              aria-label={label}
              title={label}
            >
              <Icon size={16} />
              <span className="fb-nav-label">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
