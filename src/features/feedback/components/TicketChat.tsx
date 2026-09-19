import { FileText, Image, Paperclip, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { USERS } from '../data'
import { useAttachments } from '../hooks'
import type { Attachment, Message, MessageSender, Ticket } from '../types'
import { UserPopover } from './UserPopover'
import './TicketChat.css'

type TicketChatProps = {
  ticket: Ticket
  onSendMessage: (text: string, attachments: Attachment[]) => void
}

type MessageGroup = { sender: MessageSender; messages: Message[] }

// Consecutive messages from the same sender render as one avatar/name with
// stacked message lines underneath, instead of repeating the meta row per message.
function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.sender === message.sender) lastGroup.messages.push(message)
    else groups.push({ sender: message.sender, messages: [message] })
  }
  return groups
}

export function TicketChat({ ticket, onSendMessage }: TicketChatProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()
  const groups = groupMessages(ticket.messages)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }, [text])

  function resolveAuthor(sender: MessageSender) {
    return sender === 'agent' ? ticket.assignee : USERS.me
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = text.trim()
    if (!value && attachments.length === 0) return
    onSendMessage(value, attachments)
    setText('')
    clearAttachments()
  }

  function submitOnEnter(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <section className="fb-chat" aria-label="Переписка с исполнителем">
      <div className="fb-chat-log">
        {groups.map((group, index) => {
          const isOwn = group.sender === 'me'
          const author = resolveAuthor(group.sender)
          return (
            <div key={index} className={`fb-chat-group${isOwn ? ' own' : ''}`}>
              <UserPopover user={author} label={isOwn ? 'Вы' : 'Исполнитель'} />
              <div className="fb-chat-content">
                <div className="fb-chat-meta">
                  <span className="fb-chat-name">{author ? author.name : isOwn ? 'Вы' : 'Исполнитель'}</span>
                  <time className="fb-chat-time">{group.messages[0].time}</time>
                </div>
                <div className="fb-chat-messages">
                  {group.messages.map((message) => (
                    <div key={message.id} className="fb-chat-message">
                      {message.text && <p>{message.text}</p>}
                      {message.attachments.length > 0 && (
                        <div className="fb-chat-attachments">
                          {message.attachments.map((attachment) => (
                            <a key={attachment.id} className="fb-chat-attachment" href={attachment.url} target="_blank" rel="noreferrer">
                              {attachment.kind === 'image' ? <Image size={16} /> : <FileText size={16} />}
                              <span>{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form className="fb-chat-composer" noValidate onSubmit={submit}>
        <div className="fb-chat-composer-field">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={submitOnEnter}
            placeholder="Написать сообщение..."
            aria-label="Сообщение"
            rows={1}
          />
          <label className="fb-chat-attach-button" aria-label="Прикрепить файлы" title="Прикрепить файлы">
            <Paperclip size={15} />
            <input
              type="file"
              multiple
              onChange={(event) => {
                if (event.target.files?.length) addFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
          <button type="submit" className="fb-chat-send-button" aria-label="Отправить сообщение">
            <Send size={16} />
          </button>
        </div>
        {attachments.length > 0 && (
          <div className="fb-chat-pending-attachments" aria-label="Прикрепленные файлы">
            {attachments.map((attachment) => (
              <span key={attachment.id} className={`fb-chat-pending-attachment${attachment.kind === 'image' ? ' image' : ''}`}>
                {attachment.kind === 'image' ? (
                  <img src={attachment.url} alt={attachment.name} />
                ) : (
                  <span className="fb-chat-pending-file-copy">
                    <FileText size={22} />
                    <span>{attachment.name}</span>
                  </span>
                )}
                <button type="button" aria-label={`Удалить ${attachment.name}`} onClick={() => removeAttachment(attachment.id)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </section>
  )
}
