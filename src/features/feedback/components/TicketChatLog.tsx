import { Check, CornerUpLeft, FileText, Image, Pencil, Trash2, X } from 'lucide-react'
import type { TicketChatState } from '../hooks'
import type { Ticket } from '../types'
import { UserPopover } from './UserPopover'
import './TicketChatLog.css'

type TicketChatLogProps = {
  ticket: Ticket
  chat: TicketChatState
}

// The scrollable message log for a ticket's 1:1 chat with its assignee -
// the composer lives outside this, in a fixed dock the caller renders
// alongside it (see ErrorDetailView), same split as CommentSection/
// CommentComposer sharing one useCommentThread state object.
export function TicketChatLog({ ticket, chat }: TicketChatLogProps) {
  return (
    <section className="fb-chat" aria-label="Переписка с исполнителем">
      <div className="fb-chat-log">
        {chat.groups.map((group, index) => {
          const isOwn = group.sender === 'me'
          const author = chat.resolveAuthor(group.sender)
          return (
            <div key={index} className={`fb-chat-group${isOwn ? ' own' : ''}`}>
              <UserPopover user={author} label={isOwn ? 'Вы' : 'Исполнитель'} />
              <div className="fb-chat-content">
                <div className="fb-chat-meta">
                  {isOwn ? (
                    <>
                      <time className="fb-chat-time">{group.messages[0].time}</time>
                      <span className="fb-chat-name">{author ? author.name : 'Вы'}</span>
                    </>
                  ) : (
                    <>
                      <span className="fb-chat-name">{author ? author.name : 'Исполнитель'}</span>
                      <time className="fb-chat-time">{group.messages[0].time}</time>
                    </>
                  )}
                </div>
                <div className="fb-chat-messages">
                  {group.messages.map((message) => {
                    const quoted = message.replyToId
                      ? ticket.messages.find((candidate) => candidate.id === message.replyToId)
                      : undefined
                    const quotedAuthor = quoted ? chat.resolveAuthor(quoted.sender) : undefined
                    const quotedAuthorName = quoted
                      ? (quotedAuthor ? quotedAuthor.name : quoted.sender === 'me' ? 'Вы' : 'Исполнитель')
                      : undefined
                    const isEditing = chat.editingId === message.id
                    const isHighlighted = chat.highlightedMessageId === message.id

                    return (
                      <div key={message.id} className="fb-chat-message">
                        <div
                          className={`fb-chat-bubble${isHighlighted ? ' is-highlighted' : ''}`}
                          ref={(element) => chat.registerMessageRef(message.id, element)}
                          tabIndex={-1}
                        >
                          {quoted && (
                            <button
                              type="button"
                              className="fb-chat-quote"
                              onClick={() => chat.scrollToMessage(quoted.id)}
                              aria-label={`Перейти к сообщению: ${quotedAuthorName}`}
                            >
                              <span className="fb-chat-quote-author">{quotedAuthorName}</span>
                              <span className="fb-chat-quote-text">{quoted.text || 'Вложение'}</span>
                            </button>
                          )}
                          {isEditing ? (
                            <form className="fb-chat-edit" noValidate onSubmit={(event) => chat.submitEdit(event, message)}>
                              <textarea
                                autoFocus
                                value={chat.editText}
                                onChange={(event) => chat.updateEditText(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Escape') chat.cancelEditing()
                                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) event.currentTarget.form?.requestSubmit()
                                }}
                                aria-label="Текст сообщения"
                                rows={2}
                              />
                              {chat.editError && <p className="fb-chat-edit-error" role="alert">{chat.editError}</p>}
                              <div className="fb-chat-edit-actions">
                                <button type="submit" className="fb-chat-edit-save"><Check size={14} />Сохранить</button>
                                <button type="button" className="fb-chat-edit-cancel" onClick={chat.cancelEditing}><X size={14} />Отмена</button>
                              </div>
                            </form>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                        {!isEditing && (
                          <div className="fb-chat-message-actions">
                            <button
                              type="button"
                              className="fb-chat-message-action-button"
                              onClick={() => chat.startReply(message)}
                              aria-label="Ответить"
                              title="Ответить"
                            >
                              <CornerUpLeft size={14} aria-hidden="true" />
                              <span className="fb-chat-message-action-label">Ответить</span>
                            </button>
                            {isOwn && (
                              <>
                                <button
                                  type="button"
                                  className="fb-chat-message-action-button"
                                  onClick={() => chat.startEditing(message)}
                                  aria-label="Редактировать"
                                  title="Редактировать"
                                >
                                  <Pencil size={14} aria-hidden="true" />
                                  <span className="fb-chat-message-action-label">Редактировать</span>
                                </button>
                                <button
                                  type="button"
                                  className="fb-chat-message-action-button"
                                  onClick={() => chat.deleteMessage(message)}
                                  aria-label="Удалить"
                                  title="Удалить"
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                  <span className="fb-chat-message-action-label">Удалить</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
