import { Bug, Lightbulb, MessageSquare, type LucideIcon } from 'lucide-react'
import type { Category, Status, TagTone, Ticket } from './types'

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

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'ОБ-104',
    title: 'Кнопка сохранения не работает на странице профиля.',
    category: 'bug',
    status: 'open',
    mine: true,
    author: 'Вы',
    initials: 'ВЫ',
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
    status: 'progress',
    mine: true,
    author: 'Вы',
    initials: 'ВЫ',
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
    status: 'done',
    mine: true,
    author: 'Вы',
    initials: 'ВЫ',
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
    status: 'open',
    mine: false,
    author: 'Игорь Соколов',
    initials: 'ИС',
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
    status: 'progress',
    mine: false,
    author: 'Мария Волкова',
    initials: 'МВ',
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
    status: 'progress',
    mine: false,
    author: 'Дмитрий Орлов',
    initials: 'ДО',
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
    status: 'done',
    mine: false,
    author: 'Игорь Соколов',
    initials: 'ИС',
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
