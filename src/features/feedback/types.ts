export type Category = 'bug' | 'idea' | 'review'

export type CategoryLabelMode = 'singular' | 'plural'

export type Status = 'open' | 'progress' | 'done'

export type System = 'cwatis' | 'bookkeep' | 'personnel' | 'manufacture'

export type TagTone =
  | 'danger'
  | 'info'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'

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
  replyToId?: string
}

export type User = {
  id: string
  name: string
  initials: string
  role: string
  email: string
}

export type Ticket = {
  id: string
  title: string
  category: Category
  system: System | null
  status: Status | null
  mine: boolean
  author: User
  assignee: User | null
  time: string
  createdAt: number
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
