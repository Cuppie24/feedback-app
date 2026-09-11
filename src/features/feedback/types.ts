export type Category = 'bug' | 'idea' | 'review'

export type Status = 'open' | 'progress' | 'done'

export type TagTone = 'danger' | 'info' | 'success' | 'warning' | 'neutral'

export type AttachmentKind = 'image' | 'file'

export type Attachment = {
  id: string
  kind: AttachmentKind
  name: string
  url: string
  ext?: string
  sizeLabel?: string
}

export type MessageSender = 'me' | 'agent'

export type Message = {
  id: string
  sender: MessageSender
  text: string
  time: string
  attachments: Attachment[]
}

export type Ticket = {
  id: string
  title: string
  category: Category
  status: Status
  mine: boolean
  author: string
  initials: string
  time: string
  likes: number
  liked: boolean
  messages: Message[]
}

export type NewFeedbackInput = {
  category: Category
  title: string
  message: string
  attachments: Attachment[]
}
