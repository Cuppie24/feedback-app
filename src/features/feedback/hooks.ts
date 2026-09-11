import { useCallback, useEffect, useRef, useState } from 'react'
import { INITIAL_TICKETS } from './data'
import type { Attachment, NewFeedbackInput, Ticket } from './types'
import { extOf, formatFileSize } from './utils'

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

  const addTicket = useCallback((input: NewFeedbackInput): string => {
    nextNumber.current += 1
    const id = `ОБ-${nextNumber.current}`
    const ticket: Ticket = {
      id,
      title: input.title,
      category: input.category,
      status: 'open',
      mine: true,
      author: 'Вы',
      initials: 'ВЫ',
      time: 'только что',
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

  return { tickets, toggleLike, addTicket }
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
