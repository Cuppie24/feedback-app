import { Inbox, MessageSquarePlus, TrendingUp, type LucideIcon } from 'lucide-react'
import './UserTabBar.css'

export type UserView = 'create' | 'mine' | 'popular'

type UserTabBarProps = {
  active: UserView
  onNavigate: (view: UserView) => void
}

const TAB_ITEMS: { view: UserView; label: string; Icon: LucideIcon }[] = [
  { view: 'create', label: 'Новое обращение', Icon: MessageSquarePlus },
  { view: 'mine', label: 'Мои обращения', Icon: Inbox },
  { view: 'popular', label: 'Популярное', Icon: TrendingUp },
]

// Minimal top-of-page tab switcher for user mode - a big animated pill,
// not the Sidebar's vertical nav. Deliberately its own component/file
// with no brand mark, so user mode stays free to look nothing like
// agent mode's chrome - see FeedbackApp.tsx.
export function UserTabBar({ active, onNavigate }: UserTabBarProps) {
  const activeIndex = TAB_ITEMS.findIndex((item) => item.view === active)

  return (
    <header className="fb-user-header">
      <nav className="fb-user-tabs" data-active={activeIndex} aria-label="Разделы">
        <span className="fb-user-tabs-thumb" aria-hidden="true" />
        {TAB_ITEMS.map(({ view, label, Icon }) => (
          <button
            key={view}
            type="button"
            className={`fb-user-tab${active === view ? ' active' : ''}`}
            onClick={() => onNavigate(view)}
            aria-current={active === view ? 'page' : undefined}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
