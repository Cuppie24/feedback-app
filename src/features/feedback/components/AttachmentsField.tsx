import { FileText, Image, Upload, X } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import type { Attachment } from '../types'
import './FormField.css'
import './AttachmentsField.css'

type AttachmentsFieldProps = {
  attachments: Attachment[]
  onAddFiles: (files: FileList) => void
  onRemove: (id: string) => void
}

export function AttachmentsField({ attachments, onAddFiles, onRemove }: AttachmentsFieldProps) {
  const inputId = useId()
  const labelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    if (event.dataTransfer.files.length) onAddFiles(event.dataTransfer.files)
  }

  return (
    <div className="fb-field">
      <span className="fb-field-label" id={labelId}>
        Вложения
      </span>
      <label
        className={`fb-dropzone${isDragOver ? ' drag-over' : ''}`}
        htmlFor={inputId}
        aria-labelledby={labelId}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="fb-dropzone-input"
          id={inputId}
          type="file"
          multiple
          onChange={(event) => {
            if (event.target.files?.length) onAddFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <Upload className="fb-dropzone-icon" size={22} />
        <span className="fb-dropzone-title">Перетащите файлы или нажмите, чтобы выбрать</span>
        <span className="fb-dropzone-hint">PNG, JPG, PDF до 10 МБ</span>
      </label>

      {attachments.length > 0 && (
        <div className="fb-attachments">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className={`fb-attachment${attachment.kind === 'image' ? ' image' : ''}`}
              title={attachment.kind === 'image' ? attachment.name : `${attachment.name} (${attachment.sizeLabel})`}
            >
              {attachment.kind === 'image' ? <Image size={22} /> : <FileText size={20} />}
              {attachment.kind === 'file' && <span className="fb-attachment-ext">{attachment.ext}</span>}
              <button
                type="button"
                className="fb-attachment-remove"
                aria-label={`Удалить вложение ${attachment.name}`}
                onClick={() => onRemove(attachment.id)}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
