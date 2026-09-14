import { Send } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { CATEGORY_ICON, CATEGORY_LABEL, CATEGORY_TONE } from '../data'
import { useAttachments } from '../hooks'
import type { Category, NewFeedbackInput } from '../types'
import { AttachmentsField } from './AttachmentsField'
import './FormField.css'
import './FeedbackForm.css'

type FeedbackFormProps = {
  onSubmit: (input: NewFeedbackInput) => void
}

type FieldErrors = {
  title?: string
  message?: string
}

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABEL) as Category[]
const CATEGORY_MOTION_DURATION_MS = 400

function centerSelectedCategory(selected: Category): Category[] {
  const selectedIndex = CATEGORY_OPTIONS.indexOf(selected)
  const centerIndex = Math.floor(CATEGORY_OPTIONS.length / 2)

  return CATEGORY_OPTIONS.map((_, displayIndex) => {
    const optionIndex = (selectedIndex - centerIndex + displayIndex + CATEGORY_OPTIONS.length) % CATEGORY_OPTIONS.length
    return CATEGORY_OPTIONS[optionIndex]
  })
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const titleId = useId()
  const messageId = useId()
  const typeLabelId = useId()

  const [category, setCategory] = useState<Category>('bug')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [displayedCategories, setDisplayedCategories] = useState<Category[]>(() => centerSelectedCategory('bug'))
  const pillElements = useRef(new Map<Category, HTMLButtonElement>())
  const previousPillRects = useRef(new Map<Category, DOMRect>())
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()

  useLayoutEffect(() => {
    if (previousPillRects.current.size === 0) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!reduceMotion) {
      pillElements.current.forEach((element, option) => {
        const previousRect = previousPillRects.current.get(option)
        if (!previousRect) return

        const currentRect = element.getBoundingClientRect()
        const deltaX = previousRect.left - currentRect.left
        const deltaY = previousRect.top - currentRect.top
        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

        element.animate(
          [{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }],
          { duration: CATEGORY_MOTION_DURATION_MS, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        )
      })
    }

    previousPillRects.current.clear()
  }, [category])

  const selectCategory = (nextCategory: Category) => {
    if (nextCategory === category) return

    const currentRects = new Map<Category, DOMRect>()
    pillElements.current.forEach((element, option) => {
      currentRects.set(option, element.getBoundingClientRect())
    })
    previousPillRects.current = currentRects
    setDisplayedCategories((currentCategories) => {
      const selectedIndex = currentCategories.indexOf(category)
      const nextIndex = currentCategories.indexOf(nextCategory)
      const nextCategories = [...currentCategories]
      const selectedCategory = nextCategories[selectedIndex]
      nextCategories[selectedIndex] = nextCategories[nextIndex]
      nextCategories[nextIndex] = selectedCategory
      return nextCategories
    })
    setCategory(nextCategory)
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const describedBy = (field: keyof FieldErrors) => (fieldErrors[field] ? `${field}-error` : undefined)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FieldErrors = {}
    if (!title.trim()) nextErrors.title = 'Введите заголовок обращения'
    if (!message.trim()) nextErrors.message = 'Опишите проблему или предложение'
    setFieldErrors(nextErrors)
    if (nextErrors.title || nextErrors.message) return

    onSubmit({ category, title: title.trim(), message: message.trim(), attachments })

    selectCategory('bug')
    setTitle('')
    setMessage('')
    clearAttachments()
  }

  return (
    <form className="fb-form" onSubmit={handleSubmit} noValidate>
      <div className="fb-field">
        <span className="fb-field-label" id={typeLabelId}>
          Тип обращения
        </span>
        <div className="fb-pills" role="radiogroup" aria-labelledby={typeLabelId}>
          {displayedCategories.map((option) => {
            const Icon = CATEGORY_ICON[option]
            const tone = CATEGORY_TONE[option]

            return (
              <button
                ref={(element) => {
                  if (element) pillElements.current.set(option, element)
                  else pillElements.current.delete(option)
                }}
                key={option}
                type="button"
                className={`fb-pill fb-pill-${tone}${category === option ? ' active' : ''}`}
                role="radio"
                aria-checked={category === option}
                onClick={() => selectCategory(option)}
              >
                <Icon className="fb-pill-icon" size={15} strokeWidth={2.25} aria-hidden="true" />
                {CATEGORY_LABEL[option]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="fb-field">
        <label className="fb-field-label" htmlFor={titleId}>
          Заголовок
        </label>
        <input
          className="fb-text-input"
          id={titleId}
          type="text"
          placeholder="Кратко опишите суть обращения"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            clearFieldError('title')
          }}
          aria-required="true"
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={describedBy('title')}
        />
        {fieldErrors.title && (
          <p className="fb-field-error" id="title-error" role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="fb-field">
        <label className="fb-field-label" htmlFor={messageId}>
          Сообщение
        </label>
        <textarea
          className="fb-textarea-input"
          id={messageId}
          rows={4}
          placeholder="Опишите проблему или предложение подробнее..."
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            clearFieldError('message')
          }}
          aria-required="true"
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={describedBy('message')}
        />
        {fieldErrors.message && (
          <p className="fb-field-error" id="message-error" role="alert">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <AttachmentsField attachments={attachments} onAddFiles={addFiles} onRemove={removeAttachment} />

      <div className="fb-form-footer">
        <button className="fb-btn-primary" type="submit">
          <Send size={15} />
          Отправить обращение
        </button>
      </div>
    </form>
  )
}
