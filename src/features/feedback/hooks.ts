import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, Dispatch, FormEvent, KeyboardEvent as ReactKeyboardEvent, RefObject, SetStateAction } from 'react'
import { INITIAL_TICKETS, USERS } from './data'
import type { Attachment, Message, MessageSender, NewFeedbackInput, Status, System, Ticket } from './types'
import { buildCommentTree, extOf, formatFileSize, type CommentNode } from './utils'

const SIDEBAR_STORAGE_KEY = 'feedback-app-sidebar-collapsed'

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
    return false
  }
}

// Remembers the sidebar's collapsed state across reloads - same
// try/catch-localStorage shape as useTheme.
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readStoredCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0')
    } catch {
      // Persisting is best-effort.
    }
  }, [collapsed])

  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [])

  return { collapsed, toggleCollapsed }
}

const MODE_STORAGE_KEY = 'feedback-app-mode'

// 'agent' is the full app (sidebar, every view) for support staff; 'user'
// is the two-tab create/my-tickets shell for a regular employee - see
// FeedbackApp.tsx and ModeSwitch. The URL (/agent/... vs /user/...) is the
// source of truth for which mode is active; this is only for remembering
// the last one visited so "/" has somewhere sensible to redirect to.
export type AppMode = 'agent' | 'user'

export function readStoredMode(): AppMode {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) === 'user' ? 'user' : 'agent'
  } catch {
    // localStorage can be unavailable (private mode, blocked cookies).
    return 'agent'
  }
}

// Syncs the current route's mode to localStorage - same try/catch shape as
// useSidebarCollapsed/useTheme, just writing instead of also owning state.
export function usePersistedMode(mode: AppMode) {
  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode)
    } catch {
      // Persisting is best-effort.
    }
  }, [mode])
}

function highestTicketNumber(tickets: Ticket[]): number {
  return tickets.reduce((max, ticket) => {
    const num = Number(ticket.id.replace(/\D/g, ''))
    return Number.isFinite(num) && num > max ? num : max
  }, 0)
}

// Shared ticket state for every feedback view (create form, recent/trending
// lists, "my"/"all" lists, detail). Lifted into one hook instead of context
// since it's used by a single feature tree - see CLAUDE.md > Conventions.
export function useFeedbackTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const nextNumber = useRef(highestTicketNumber(INITIAL_TICKETS))

  const toggleLike = useCallback((id: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? { ...ticket, liked: !ticket.liked, likes: ticket.likes + (ticket.liked ? -1 : 1) }
          : ticket,
      ),
    )
  }, [])

  const updateSystem = useCallback((id: string, system: System | null) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, system } : ticket)))
  }, [])

  const updateStatus = useCallback((id: string, status: Status | null) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)))
  }, [])

  const addComment = useCallback((id: string, text: string, replyToId?: string, attachments: Attachment[] = []) => {
    const commentId = crypto.randomUUID()
    const message = {
      id: commentId,
      sender: 'me' as const,
      text,
      time: 'только что',
      attachments,
      ...(replyToId ? { replyToId } : {}),
    }
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === id ? { ...ticket, messages: [...ticket.messages, message] } : ticket)),
    )
    return commentId
  }, [])

  const editComment = useCallback((ticketId: string, commentId: string, text: string) => {
    setTickets((prev) => prev.map((ticket) => (
      ticket.id === ticketId
        ? {
            ...ticket,
            messages: ticket.messages.map((message) => (
              message.id === commentId ? { ...message, text, time: 'изменено только что' } : message
            )),
          }
        : ticket
    )))
  }, [])

  const deleteComment = useCallback((ticketId: string, commentId: string) => {
    setTickets((prev) => prev.map((ticket) => {
      if (ticket.id !== ticketId) return ticket
      const deleted = ticket.messages.find((message) => message.id === commentId)
      if (!deleted) return ticket

      return {
        ...ticket,
        messages: ticket.messages
          .filter((message) => message.id !== commentId)
          .map((message) => (
            message.replyToId === commentId
              ? { ...message, replyToId: deleted.replyToId }
              : message
          )),
      }
    }))
  }, [])

  const addTicket = useCallback((input: NewFeedbackInput): string => {
    nextNumber.current += 1
    const id = `ОБ-${nextNumber.current}`
    const ticket: Ticket = {
      id,
      title: input.title,
      category: input.category,
      // The create form doesn't collect a system yet - default until it does.
      system: 'cwatis',
      status: 'open',
      mine: true,
      author: USERS.me,
      assignee: null,
      time: 'только что',
      createdAt: Date.now(),
      likes: 0,
      liked: false,
      messages: [
        {
          id: `${id}-1`,
          sender: 'me',
          text: input.message,
          time: 'только что',
          attachments: input.attachments,
        },
      ],
    }
    setTickets((prev) => [ticket, ...prev])
    return id
  }, [])

  return { tickets, toggleLike, updateSystem, updateStatus, addComment, editComment, deleteComment, addTicket }
}

// Backing state for the attachments widget: turns picked/dropped Files
// into previewable Attachment objects and revokes their object URLs as
// they're removed, so a long session doesn't leak blob URLs.
export function useAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: Attachment[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith('image/')
      return {
        id: crypto.randomUUID(),
        kind: isImage ? 'image' : 'file',
        name: file.name,
        url: URL.createObjectURL(file),
        ext: isImage ? undefined : extOf(file.name),
        sizeLabel: isImage ? undefined : formatFileSize(file.size),
      }
    })
    setAttachments((prev) => [...prev, ...next])
  }, [])

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((attachment) => attachment.id !== id)
    })
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((attachment) => URL.revokeObjectURL(attachment.url))
      return []
    })
  }, [])

  return { attachments, addFiles, removeAttachment, clearAttachments }
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

type UseTicketChatOptions = {
  ticket: Ticket
  onSendMessage: (text: string, attachments: Attachment[], replyToId?: string) => void
  onEditMessage: (messageId: string, text: string) => void
  onDeleteMessage: (messageId: string) => void
}

// Backing state for the ticket chat log + composer: reply target, inline
// editing, scroll-to-message refs, and the composer's own text/attachments -
// same state-hook-plus-renderer split as useCommentThread (TicketChatLog and
// MessageComposer both read off this one object), but for the ticket's flat
// 1:1 message log instead of a threaded comment tree.
export function useTicketChat({ ticket, onSendMessage, onEditMessage, onDeleteMessage }: UseTicketChatOptions) {
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageRefs = useRef(new Map<string, HTMLElement>())
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const highlightTimerRef = useRef<number | null>(null)
  const highlightFrameRef = useRef<number | null>(null)
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()
  const groups = groupMessages(ticket.messages)

  useEffect(() => {
    if (replyTo) inputRef.current?.focus()
  }, [replyTo])

  useEffect(() => () => {
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
  }, [])

  function resolveAuthor(sender: MessageSender) {
    return sender === 'agent' ? ticket.assignee : USERS.me
  }

  function registerMessageRef(messageId: string, element: HTMLElement | null) {
    if (element) messageRefs.current.set(messageId, element)
    else messageRefs.current.delete(messageId)
  }

  // Same scroll-then-pulse as useCommentThread's scrollToComment: clear any
  // in-flight highlight first and re-add it a frame later, so retriggering
  // on the same message (click "reply" reference twice) restarts the pulse
  // instead of no-op'ing because the class never left.
  function scrollToMessage(messageId: string) {
    const target = messageRefs.current.get(messageId)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus({ preventScroll: true })
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
    setHighlightedMessageId(null)
    highlightFrameRef.current = window.requestAnimationFrame(() => {
      setHighlightedMessageId(messageId)
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedMessageId(null)
        highlightTimerRef.current = null
      }, 2600) // matches fb-chat-message-pulse's animation-duration in TicketChatLog.css
      highlightFrameRef.current = null
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = text.trim()
    if (!value && attachments.length === 0) return
    onSendMessage(value, attachments, replyTo?.id)
    setText('')
    setReplyTo(null)
    clearAttachments()
  }

  function startReply(message: Message) {
    setReplyTo(message)
  }

  function cancelReply() {
    setReplyTo(null)
  }

  function startEditing(message: Message) {
    setEditingId(message.id)
    setEditText(message.text)
    setEditError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditText('')
    setEditError('')
  }

  function updateEditText(value: string) {
    setEditText(value)
    setEditError('')
  }

  function submitEdit(event: FormEvent<HTMLFormElement>, message: Message) {
    event.preventDefault()
    const value = editText.trim()
    if (!value && message.attachments.length === 0) {
      setEditError('Введите текст сообщения.')
      return
    }
    onEditMessage(message.id, value)
    cancelEditing()
  }

  function requestDelete(message: Message) {
    setPendingDelete(message)
  }

  function cancelDelete() {
    setPendingDelete(null)
  }

  function confirmDelete() {
    if (!pendingDelete) return
    if (editingId === pendingDelete.id) cancelEditing()
    if (replyTo?.id === pendingDelete.id) setReplyTo(null)
    onDeleteMessage(pendingDelete.id)
    setPendingDelete(null)
  }

  const replyToAuthor = replyTo ? resolveAuthor(replyTo.sender) : undefined
  const replyToName = replyTo ? (replyTo.sender === 'me' ? 'себя' : replyToAuthor?.name ?? 'Исполнителя') : ''

  return {
    groups,
    resolveAuthor,
    registerMessageRef,
    scrollToMessage,
    highlightedMessageId,
    text,
    setText,
    submit,
    inputRef,
    replyTo,
    replyToName,
    startReply,
    cancelReply,
    attachments,
    addFiles,
    removeAttachment,
    editingId,
    editText,
    updateEditText,
    editError,
    startEditing,
    cancelEditing,
    submitEdit,
    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}

export type TicketChatState = ReturnType<typeof useTicketChat>

type UseCommentThreadOptions = {
  comments: Message[]
  onAddComment: (text: string, replyToId?: string, attachments?: Attachment[]) => string
  onEditComment: (commentId: string, text: string) => void
  onDeleteComment: (commentId: string) => void
}

// Backing state for a threaded comment section: composer (text, reply
// target, attachments), inline editing, collapse/expand animation, and
// scroll-to-highlight on submit. Takes a flat comment list and three
// callbacks so it has no dependency on where the comments live (a ticket
// or anything else) - see CommentSection/CommentThread/CommentComposer.
export function useCommentThread({ comments, onAddComment, onEditComment, onDeleteComment }: UseCommentThreadOptions) {
  const commentTree = buildCommentTree(comments)
  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState('')
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const commentRefs = useRef(new Map<string, HTMLElement>())
  const highlightTimerRef = useRef<number | null>(null)
  const highlightFrameRef = useRef<number | null>(null)
  const submittedScrollFrameRef = useRef<number | null>(null)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [openingIds, setOpeningIds] = useState<Set<string>>(new Set())
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set())
  const { attachments, addFiles, removeAttachment, clearAttachments } = useAttachments()

  function toggleReplies(commentId: string) {
    if (closingIds.has(commentId)) {
      setClosingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      return
    }

    if (collapsedIds.has(commentId)) {
      setCollapsedIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      setOpeningIds((prev) => new Set(prev).add(commentId))
      return
    }

    setOpeningIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
    setClosingIds((prev) => new Set(prev).add(commentId))
  }

  function finishRepliesAnimation(commentId: string, isClosing: boolean) {
    if (isClosing) {
      setCollapsedIds((prev) => new Set(prev).add(commentId))
      setClosingIds((prev) => {
        const next = new Set(prev)
        next.delete(commentId)
        return next
      })
      return
    }

    setOpeningIds((prev) => {
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

  function expandReplies(commentId: string) {
    setClosingIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
    setCollapsedIds((prev) => {
      if (!prev.has(commentId)) return prev
      const next = new Set(prev)
      next.delete(commentId)
      return next
    })
  }

  useEffect(() => {
    if (replyToId) commentInputRef.current?.focus()
  }, [replyToId])

  useEffect(() => () => {
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
    if (submittedScrollFrameRef.current !== null) window.cancelAnimationFrame(submittedScrollFrameRef.current)
  }, [])

  function scrollToComment(commentId: string) {
    const target = commentRefs.current.get(commentId)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.focus({ preventScroll: true })
    if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current)
    if (highlightFrameRef.current !== null) window.cancelAnimationFrame(highlightFrameRef.current)
    setHighlightedCommentId(null)
    highlightFrameRef.current = window.requestAnimationFrame(() => {
      setHighlightedCommentId(commentId)
      highlightTimerRef.current = window.setTimeout(() => {
        setHighlightedCommentId(null)
        highlightTimerRef.current = null
      }, 2000)
      highlightFrameRef.current = null
    })
  }

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = commentText.trim()
    if (!text && attachments.length === 0) return
    const commentId = onAddComment(text, replyToId ?? undefined, attachments)
    if (replyToId) expandReplies(replyToId)
    setCommentText('')
    setReplyToId(null)
    clearAttachments()
    if (submittedScrollFrameRef.current !== null) window.cancelAnimationFrame(submittedScrollFrameRef.current)
    submittedScrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollToComment(commentId)
      commentInputRef.current?.focus({ preventScroll: true })
      submittedScrollFrameRef.current = null
    })
  }

  function pasteImages(event: ClipboardEvent<HTMLTextAreaElement>) {
    const images: File[] = []
    for (const item of event.clipboardData.items) {
      if (item.kind !== 'file' || !item.type.startsWith('image/')) continue
      const file = item.getAsFile()
      if (file) images.push(file)
    }
    if (images.length > 0) {
      event.preventDefault()
      addFiles(images)
    }
  }

  function submitOnEnter(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  function startEditing(comment: CommentNode) {
    setEditingCommentId(comment.id)
    setEditText(comment.text)
    setEditError('')
  }

  function cancelEditing() {
    setEditingCommentId(null)
    setEditText('')
    setEditError('')
  }

  function submitEdit(event: FormEvent<HTMLFormElement>, comment: CommentNode) {
    event.preventDefault()
    const text = editText.trim()
    if (!text && comment.attachments.length === 0) {
      setEditError('Введите текст комментария.')
      return
    }
    onEditComment(comment.id, text)
    cancelEditing()
  }

  function deleteComment(comment: CommentNode) {
    const confirmed = window.confirm('Удалить комментарий? Ответы на него будут сохранены.')
    if (!confirmed) return
    if (editingCommentId === comment.id) cancelEditing()
    onDeleteComment(comment.id)
  }

  function startReply(commentId: string) {
    setReplyToId(commentId)
  }

  function cancelReply() {
    setReplyToId(null)
    commentInputRef.current?.focus()
  }

  function updateCommentText(value: string) {
    setCommentText(value)
  }

  function updateEditText(value: string) {
    setEditText(value)
    setEditError('')
  }

  function registerCommentRef(commentId: string, element: HTMLElement | null) {
    if (element) commentRefs.current.set(commentId, element)
    else commentRefs.current.delete(commentId)
  }

  const replyTarget = replyToId ? comments.find((comment) => comment.id === replyToId) : undefined

  return {
    commentTree,
    commentText,
    updateCommentText,
    replyTarget,
    startReply,
    cancelReply,
    commentInputRef,
    attachments,
    addFiles,
    removeAttachment,
    submitComment,
    pasteImages,
    submitOnEnter,
    editingCommentId,
    editText,
    updateEditText,
    editError,
    startEditing,
    cancelEditing,
    submitEdit,
    deleteComment,
    collapsedIds,
    openingIds,
    closingIds,
    toggleReplies,
    finishRepliesAnimation,
    highlightedCommentId,
    registerCommentRef,
    scrollToComment,
  }
}

export type CommentThreadState = ReturnType<typeof useCommentThread>

// Shared outside-click + Escape dismissal for the filter/sort dropdowns
// (FilterDropdown, SortDropdown) - both need identical "close when the
// user clicks elsewhere or presses Escape" behavior.
export function useDismissOnOutsideOrEscape(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  setOpen: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, rootRef, setOpen])
}
