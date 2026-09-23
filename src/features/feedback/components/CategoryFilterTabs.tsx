import type { CSSProperties } from 'react'
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE, getCategoryLabel } from '../data'
import type { Category } from '../types'
import './CategoryFilterTabs.css'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

type CategoryFilterTabsProps = {
  value: Category | null
  onChange: (value: Category | null) => void
  // Subset/order of tabs to show; defaults to every category.
  categories?: Category[]
  // Tabs with something new for the user get a dot after their label.
  notifications?: Partial<Record<Category, boolean>>
}

export function CategoryFilterTabs({ value, onChange, categories = ALL_CATEGORIES, notifications = {} }: CategoryFilterTabsProps) {
  const activeIndex = value ? categories.indexOf(value) : -1

  return (
    <div
      className="fb-category-filter-tabs"
      role="tablist"
      aria-label="Категории"
      data-active={activeIndex}
      style={{ '--tab-count': categories.length } as CSSProperties}
    >
      {activeIndex !== -1 && <span className="fb-category-filter-tabs-thumb" aria-hidden="true" />}
      {categories.map((category) => {
        const Icon = CATEGORY_ICON[category]
        const active = value === category

        return (
          <button
            key={category}
            type="button"
            className={`fb-category-filter-tab${active ? ' active' : ''}`}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(category)}
          >
            <Icon className={`fb-category-filter-tab-icon-${CATEGORY_TONE[category]}`} size={14} strokeWidth={2.5} />
            {getCategoryLabel(category, 'plural')}
            {notifications[category] && (
              <>
                <span className="fb-category-filter-tab-dot" aria-hidden="true" />
                <span className="fb-category-filter-tab-sr-only">, есть обновления</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
