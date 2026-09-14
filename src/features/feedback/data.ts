import { Bug, Lightbulb, MessageSquare, type LucideIcon } from 'lucide-react'
import type { Category, Status, System, TagTone, Ticket, User } from './types'

// Placeholder data: the feedback backend does not exist yet (see
// CLAUDE.md). Seeds useFeedbackTickets() so the feature is fully
// interactive - voting, submitting, browsing - within a session. Swap
// for a real api.ts once the endpoints land.

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
// Snapshot once at module load: createdAt drives sort order, `time` is
// the matching display string - both are static placeholders, same as
// addTicket's 'только что'.
const now = Date.now()

export const CATEGORY_LABEL: Record<Category, string> = {
  bug: 'Ошибка',
  idea: 'Предложение',
  review: 'Отзыв',
}

export const STATUS_LABEL: Record<Status, string> = {
  open: 'Открыто',
  progress: 'В работе',
  done: 'Решено',
}

export const CATEGORY_TONE: Record<Category, TagTone> = {
  bug: 'danger',
  idea: 'warning',
  review: 'info',
}

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  bug: Bug,
  idea: Lightbulb,
  review: MessageSquare,
}

export const CATEGORY_VOTABLE: Record<Category, boolean> = {
  bug: true,
  idea: true,
  review: false,
}

// A non-votable ticket (review) always sorts after votable ones, even
// though it may carry a stale `likes` count from before voting was
// disabled for that category - see TicketList's fb-row-vote-empty.
export function comparePopularity(a: Ticket, b: Ticket): number {
  const aVotable = CATEGORY_VOTABLE[a.category]
  const bVotable = CATEGORY_VOTABLE[b.category]
  if (aVotable !== bVotable) return aVotable ? -1 : 1
  if (aVotable) return b.likes - a.likes
  return b.createdAt - a.createdAt
}

export const STATUS_TONE: Record<Status, TagTone> = {
  open: 'warning',
  progress: 'neutral',
  done: 'success',
}

export const SYSTEM_LABEL: Record<System, string> = {
  cwatis: 'CWATIS',
  bookkeep: 'BookKeep',
  personnel: 'Personnel',
  manufacture: 'Manufacture',
}

// Deliberately outside the danger/info/success/warning/yellow family
// used by category/status, so a system tag reads as its own dimension
// at a glance instead of blending into the other tags on a row.
export const SYSTEM_TONE: Record<System, TagTone> = {
  cwatis: 'purple',
  bookkeep: 'brown',
  personnel: 'pink',
  manufacture: 'orange',
}

export const USERS = {
  me: {
    id: 'current-user',
    name: 'Вы',
    initials: 'ВЫ',
    role: 'Сотрудник · Micros',
    email: 'you@example.com',
  },
  irina: {
    id: 'irina-smirnova',
    name: 'Ирина Смирнова',
    initials: 'ИС',
    role: 'Frontend developer · Platform',
    email: 'i.smirnova@example.com',
  },
  alexey: {
    id: 'alexey-morozov',
    name: 'Алексей Морозов',
    initials: 'АМ',
    role: 'Backend developer · Platform',
    email: 'a.morozov@example.com',
  },
  elena: {
    id: 'elena-kuznetsova',
    name: 'Елена Кузнецова',
    initials: 'ЕК',
    role: 'Product manager · Business systems',
    email: 'e.kuznetsova@example.com',
  },
  igor: {
    id: 'igor-sokolov',
    name: 'Игорь Соколов',
    initials: 'ИС',
    role: 'Сотрудник · BookKeep',
    email: 'i.sokolov@example.com',
  },
  maria: {
    id: 'maria-volkova',
    name: 'Мария Волкова',
    initials: 'МВ',
    role: 'Сотрудник · BookKeep',
    email: 'm.volkova@example.com',
  },
  dmitry: {
    id: 'dmitry-orlov',
    name: 'Дмитрий Орлов',
    initials: 'ДО',
    role: 'Сотрудник · Personnel',
    email: 'd.orlov@example.com',
  },
} satisfies Record<string, User>

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'ОБ-104',
    title: 'Кнопка сохранения не работает на странице профиля.',
    category: 'bug',
    system: 'cwatis',
    status: 'open',
    mine: true,
    author: USERS.me,
    assignee: USERS.irina,
    time: '2 ч назад',
    createdAt: now - 2 * HOUR_MS,
    likes: 1,
    liked: false,
    messages: [
      {
        id: 'ОБ-104-1',
        sender: 'me',
        text: 'Кнопка сохранения не работает на странице профиля.',
        time: '2 ч назад',
        attachments: [],
      },
      {
        id: 'ОБ-104-2',
        sender: 'agent',
        text: 'Спасибо, приняли в работу, уточним детали.',
        time: '1 ч назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-103',
    title: 'Добавить тёмную тему в мобильное приложение.',
    category: 'idea',
    system: 'cwatis',
    status: 'progress',
    mine: true,
    author: USERS.me,
    assignee: USERS.alexey,
    time: '1 день назад',
    createdAt: now - DAY_MS,
    likes: 4,
    liked: true,
    messages: [
      {
        id: 'ОБ-103-1',
        sender: 'me',
        text: 'Добавить тёмную тему в мобильное приложение.',
        time: '1 день назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-098',
    title: 'Ускорить загрузку списка заказов.',
    category: 'review',
    system: 'cwatis',
    status: 'done',
    mine: true,
    author: USERS.me,
    assignee: USERS.irina,
    time: '3 дня назад',
    createdAt: now - 3 * DAY_MS,
    likes: 7,
    liked: true,
    messages: [
      {
        id: 'ОБ-098-1',
        sender: 'me',
        text: 'Ускорить загрузку списка заказов.',
        time: '3 дня назад',
        attachments: [],
      },
      {
        id: 'ОБ-098-2',
        sender: 'agent',
        text: 'Оптимизировали запрос, стало быстрее.',
        time: '2 дня назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-091',
    title: 'Не приходит уведомление на email после оформления заказа.',
    category: 'bug',
    system: 'bookkeep',
    status: 'open',
    mine: false,
    author: USERS.igor,
    assignee: USERS.alexey,
    time: '4 дня назад',
    createdAt: now - 4 * DAY_MS,
    likes: 2,
    liked: false,
    messages: [
      {
        id: 'ОБ-091-1',
        sender: 'me',
        text: 'Не приходит уведомление на email после оформления заказа.',
        time: '4 дня назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-089',
    title: 'Добавить фильтр по дате в отчётах.',
    category: 'idea',
    system: 'bookkeep',
    status: 'progress',
    mine: false,
    author: USERS.maria,
    assignee: USERS.elena,
    time: '4 дня назад',
    createdAt: now - 4 * DAY_MS - 6 * HOUR_MS,
    likes: 5,
    liked: false,
    messages: [
      {
        id: 'ОБ-089-1',
        sender: 'me',
        text: 'Добавить фильтр по дате в отчётах.',
        time: '4 дня назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-076',
    title: 'Уточнить регламент доступа для новых сотрудников.',
    category: 'review',
    system: 'personnel',
    status: 'progress',
    mine: false,
    author: USERS.dmitry,
    assignee: null,
    time: '6 дней назад',
    createdAt: now - 6 * DAY_MS,
    likes: 0,
    liked: false,
    messages: [
      {
        id: 'ОБ-076-1',
        sender: 'me',
        text: 'Уточнить регламент доступа для новых сотрудников.',
        time: '6 дней назад',
        attachments: [],
      },
    ],
  },
  {
    id: 'ОБ-070',
    title: 'Сократить время загрузки главной страницы.',
    category: 'review',
    system: 'manufacture',
    status: 'done',
    mine: false,
    author: USERS.igor,
    assignee: USERS.elena,
    time: '8 дней назад',
    createdAt: now - 8 * DAY_MS,
    likes: 3,
    liked: false,
    messages: [
      {
        id: 'ОБ-070-1',
        sender: 'me',
        text: 'Сократить время загрузки главной страницы.',
        time: '8 дней назад',
        attachments: [],
      },
    ],
  },
]
