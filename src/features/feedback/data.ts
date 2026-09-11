import type { Category, Status, TagTone, Ticket } from './types'

// Placeholder data: the feedback backend does not exist yet (see
// CLAUDE.md). Seeds useFeedbackTickets() so the feature is fully
// interactive - voting, submitting, browsing - within a session. Swap
// for a real api.ts once the endpoints land.

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
  idea: 'info',
  review: 'neutral',
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
