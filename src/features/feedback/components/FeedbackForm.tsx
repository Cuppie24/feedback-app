import { Send } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { CATEGORY_LABEL, CATEGORY_TONE } from '../data'
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

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const titleId = useId()
  const messageId = useId()
  const typeLabelId = useId()

  const [category, setCategory] = useState<Category>('bug')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()

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

    setCategory('bug')
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
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`fb-pill fb-pill-${CATEGORY_TONE[option]}${category === option ? ' active' : ''}`}
              role="radio"
              aria-checked={category === option}
              onClick={() => setCategory(option)}
            >
              {CATEGORY_LABEL[option]}
            </button>
          ))}
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
