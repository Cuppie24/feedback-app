import { Boxes, LayoutList, PanelLeftClose, PanelLeftOpen, Users, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORY_ICON, CATEGORY_TONE } from '../data'
import type { Category, TagTone } from '../types'
import './Sidebar.css'

export type SidebarView = Category | 'all' | 'systems' | 'agents'

type SidebarProps = {
  active: SidebarView
  onNavigate: (view: SidebarView) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  footer?: ReactNode
}

type NavItem = { view: SidebarView; label: string; Icon: LucideIcon; tone?: TagTone }

const ALL_ITEM: NavItem = { view: 'all', label: 'Все обращения', Icon: LayoutList }

// Rendered indented under "Все обращения" - every category is a subset
// of all tickets, so the nav mirrors that as one parent, three children.
// Each carries its category's tone so the icon reads the same colour it
// does everywhere else (TicketList rows, CategoryTicketsView's header).
const CATEGORY_ITEMS: NavItem[] = [
  { view: 'bug', label: 'Ошибки', Icon: CATEGORY_ICON.bug, tone: CATEGORY_TONE.bug },
  { view: 'idea', label: 'Предложения', Icon: CATEGORY_ICON.idea, tone: CATEGORY_TONE.idea },
  { view: 'review', label: 'Отзывы', Icon: CATEGORY_ICON.review, tone: CATEGORY_TONE.review },
]

// A separate section, not nested under "Все обращения" - these aren't
// ticket views, they're their own (currently placeholder) areas. See
// SystemsView/AgentsView.
const SECTION_ITEMS: NavItem[] = [
  { view: 'systems', label: 'Системы', Icon: Boxes },
  { view: 'agents', label: 'Агенты', Icon: Users },
]

type NavButtonProps = NavItem & { active: boolean; onNavigate: (view: SidebarView) => void }

function NavButton({ view, label, Icon, tone, active, onNavigate }: NavButtonProps) {
  return (
    <button
      type="button"
      className={`fb-nav-item${active ? ' active' : ''}`}
      onClick={() => onNavigate(view)}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      <Icon className={tone ? `fb-nav-icon-${tone}` : undefined} size={16} />
      <span className="fb-nav-label">{label}</span>
    </button>
  )
}

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapsed, footer }: SidebarProps) {
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
          <NavButton {...ALL_ITEM} active={active === ALL_ITEM.view} onNavigate={onNavigate} />
          <div className="fb-nav-group">
            {CATEGORY_ITEMS.map((item) => (
              <NavButton key={item.view} {...item} active={active === item.view} onNavigate={onNavigate} />
            ))}
          </div>
          <div className="fb-nav-section">
            {SECTION_ITEMS.map((item) => (
              <NavButton key={item.view} {...item} active={active === item.view} onNavigate={onNavigate} />
            ))}
          </div>
        </nav>

        {footer && <div className="fb-sidebar-footer">{footer}</div>}
      </div>
    </aside>
  )
}
