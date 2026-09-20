import { Bug, Lightbulb, MessageSquare, type LucideIcon } from 'lucide-react'
import type { Category, CategoryLabelMode, Message, Status, System, TagTone, Ticket, User } from './types'

// Placeholder data: the feedback backend does not exist yet (see
// CLAUDE.md). Seeds useFeedbackTickets() so the feature is fully
// interactive - voting, submitting, browsing - within a session. Swap
// for a real api.ts once the endpoints land.

const HOUR_MS = 60 * 60 * 1000
// Snapshot once at module load: createdAt drives sort order, `time` is
// the matching display string - both are static placeholders, same as
// addTicket's 'только что'.
const now = Date.now()

export const CATEGORY_LABEL: Record<Category, Record<CategoryLabelMode, string>> = {
  bug: { singular: 'Ошибка', plural: 'Ошибки' },
  idea: { singular: 'Предложение', plural: 'Предложения' },
  review: { singular: 'Отзыв', plural: 'Отзывы' },
}

export function getCategoryLabel(category: Category, mode: CategoryLabelMode = 'singular') {
  return CATEGORY_LABEL[category][mode]
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

// Temporary presentation state for the user ticket list. Replace this with
// backend-backed read receipts when message delivery is available.
export function hasUnreadMessages(ticket: Ticket) {
  return ticket.category === 'bug' && ticket.status !== 'done'
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
    name: 'Ishnazarov Saidnazar',
    initials: 'ВЫ',
    role: 'Сотрудник · Micros',
    email: 'you@example.com',
  },
  irina: {
    id: 'irina-smirnova',
    name: 'Ирина Смирнова',
    initials: 'ИС',
    role: 'Разработчик интерфейсов · Platform',
    email: 'i.smirnova@example.com',
  },
  alexey: {
    id: 'alexey-morozov',
    name: 'Алексей Морозов',
    initials: 'АМ',
    role: 'Разработчик · Platform',
    email: 'a.morozov@example.com',
  },
  elena: {
    id: 'elena-kuznetsova',
    name: 'Елена Кузнецова',
    initials: 'ЕК',
    role: 'Владелец продукта · Business systems',
    email: 'e.kuznetsova@example.com',
  },
  olga: {
    id: 'olga-ivanova',
    name: 'Ольга Иванова',
    initials: 'ОИ',
    role: 'Главный бухгалтер · Финансы',
    email: 'o.ivanova@example.com',
  },
  sergey: {
    id: 'sergey-petrov',
    name: 'Сергей Петров',
    initials: 'СП',
    role: 'Заведующий складом · Логистика',
    email: 's.petrov@example.com',
  },
  natalia: {
    id: 'natalia-sokolova',
    name: 'Наталья Соколова',
    initials: 'НС',
    role: 'Менеджер по закупкам · Снабжение',
    email: 'n.sokolova@example.com',
  },
  pavel: {
    id: 'pavel-volkov',
    name: 'Павел Волков',
    initials: 'ПВ',
    role: 'Менеджер по продажам · Коммерция',
    email: 'p.volkov@example.com',
  },
  anna: {
    id: 'anna-orlova',
    name: 'Анна Орлова',
    initials: 'АО',
    role: 'Юрист · Договорной отдел',
    email: 'a.orlova@example.com',
  },
} satisfies Record<string, User>

type TicketSeed = Omit<Ticket, 'createdAt' | 'time' | 'messages'> & {
  ageHours: number
  time: string
  text: string
  response?: {
    text: string
    time: string
  }
  comments?: Array<Omit<Message, 'id' | 'attachments'>>
}

const TICKET_SEEDS = [
  {
    id: 'ОБ-248',
    title: 'При проведении накладной создаются двойные проводки',
    category: 'bug',
    system: 'bookkeep',
    status: 'open',
    mine: true,
    author: USERS.me,
    assignee: USERS.alexey,
    ageHours: 35 / 60,
    time: '35 мин назад',
    likes: 8,
    liked: false,
    text: 'Если открыть приходную накладную из журнала, изменить сумму и повторно провести документ, в оборотно-сальдовой ведомости появляются две одинаковые проводки. Отмена проведения удаляет только одну из них.',
    response: {
      text: 'Воспроизвели на повторном проведении. Проверяем очистку движений документа перед записью.',
      time: '18 мин назад',
    },
    comments: [
      {
        sender: 'me',
        text: 'Понял. Можно ли пока руками убирать дубли задним числом, или лучше не трогать документы до исправления?',
        time: '14 мин назад',
      },
      {
        sender: 'me',
        text: 'Дублей уже штук пять набралось за сегодня, если что.',
        time: '13 мин назад',
      },
      {
        sender: 'agent',
        text: 'Лучше не трогать: после отмены проведения один из дублей иногда остаётся в проводках, ручная чистка может сбить обороты по счёту.',
        time: '11 мин назад',
      },
      {
        sender: 'me',
        text: 'Хорошо, буду просто отслеживать через отчёт «Обороты по счёту» и не проводить такие накладные повторно.',
        time: '7 мин назад',
      },
      {
        sender: 'agent',
        text: 'Договорились.',
        time: '4 мин назад',
      },
      {
        sender: 'agent',
        text: 'Как только выпустим исправление, напишу здесь номер сборки и попрошу проверить на вашем примере.',
        time: '3 мин назад',
      },
    ],
  },
  {
    id: 'ОБ-247',
    title: 'Добавить сравнение версий прайс-листа перед публикацией',
    category: 'idea',
    system: 'cwatis',
    status: 'open',
    mine: true,
    author: USERS.me,
    assignee: USERS.elena,
    ageHours: 2,
    time: '2 ч назад',
    likes: 14,
    liked: true,
    text: 'Перед активацией нового прайс-листа нужна таблица изменений: старая цена, новая цена, разница в процентах. Строки с изменением больше 20% стоит выделять.',
    response: {
      text: 'Отличная идея. Добавили в план ближайшего обновления: сравнение будет доступно до публикации, а крупные изменения цены выделим отдельно.',
      time: '1 ч назад',
    },
    comments: [
      {
        sender: 'me',
        text: 'Спасибо. Важно, чтобы порог 20% можно было менять: для разных групп товаров он отличается.',
        time: '55 мин назад',
      },
      {
        sender: 'agent',
        text: 'Поняла. Добавим порог в настройки прайс-листа, а в самом сравнении покажем его рядом с фильтрами.',
        time: '51 мин назад',
      },
      {
        sender: 'me',
        text: 'Ещё нужен быстрый фильтр: только новые позиции, только удалённые и только изменённые цены.',
        time: '46 мин назад',
      },
      {
        sender: 'agent',
        text: 'Это входит в первый вариант. Для изменённых цен добавим фильтр по направлению: повышение или снижение.',
        time: '41 мин назад',
        replyToId: 'ОБ-247-5',
      },
      {
        sender: 'me',
        text: 'Отлично. А сравнение будет открываться до сохранения прайс-листа или только для уже созданной версии?',
        time: '35 мин назад',
      },
      {
        sender: 'agent',
        text: 'До публикации: пользователь сможет загрузить новую версию, проверить изменения и затем подтвердить публикацию.',
        time: '31 мин назад',
        replyToId: 'ОБ-247-7',
      },
      {
        sender: 'me',
        text: 'Тогда полезно сохранить черновик, если во время проверки нужно вернуться к исходному файлу.',
        time: '25 мин назад',
      },
      {
        sender: 'agent',
        text: 'Да, черновик и исходный файл будут доступны до публикации. После публикации останется история версий.',
        time: '20 мин назад',
      },
      {
        sender: 'me',
        text: 'Историю версий тоже хотелось бы видеть: кто опубликовал и когда, с возможностью скачать файл.',
        time: '14 мин назад',
      },
      {
        sender: 'agent',
        text: 'Зафиксировала. Добавим автора и дату публикации в историю, а скачивание исходного файла проверим с командой безопасности.',
        time: '9 мин назад',
        replyToId: 'ОБ-247-11',
      },
      {
        sender: 'me',
        text: 'Спасибо, такой сценарий закроет нашу ежемесячную проверку цен.',
        time: '3 мин назад',
      },
    ],
  },
  {
    id: 'ОБ-246',
    title: 'После сканирования штрихкода фокус уходит из поля товара',
    category: 'bug',
    system: 'manufacture',
    status: 'progress',
    mine: false,
    author: USERS.sergey,
    assignee: USERS.irina,
    ageHours: 5,
    time: '5 ч назад',
    likes: 11,
    liked: true,
    text: 'В форме подбора товаров после первого сканирования курсор переходит в таблицу. Для следующего товара приходится каждый раз нажимать мышью на поле штрихкода.',
    response: {
      text: 'Исправление подготовлено: после добавления позиции поле сканирования снова получает фокус.',
      time: '3 ч назад',
    },
  },
  {
    id: 'ОБ-245',
    title: 'Неверно округляется НДС в печатной форме счёта-фактуры',
    category: 'bug',
    system: 'bookkeep',
    status: 'open',
    mine: false,
    author: USERS.olga,
    assignee: USERS.alexey,
    ageHours: 9,
    time: '9 ч назад',
    likes: 9,
    liked: false,
    text: 'В документе НДС рассчитан правильно по каждой позиции, но в печатной форме итог отличается на 0,01. Ошибка возникает при количестве с тремя знаками после запятой.',
  },
  {
    id: 'ОБ-244',
    title: 'Показывать срок действия договора прямо в журнале',
    category: 'idea',
    system: 'cwatis',
    status: 'progress',
    mine: false,
    author: USERS.anna,
    assignee: USERS.elena,
    ageHours: 24,
    time: '1 день назад',
    likes: 18,
    liked: false,
    text: 'Добавьте колонки «Дата окончания» и «Осталось дней» в список договоров. Просроченные договоры выделять красным, договоры со сроком менее 30 дней — жёлтым.',
  },
  {
    id: 'ОБ-243',
    title: 'Импорт большого прайс-листа блокирует всё приложение',
    category: 'bug',
    system: 'cwatis',
    status: 'open',
    mine: false,
    author: USERS.pavel,
    assignee: USERS.irina,
    ageHours: 28,
    time: '1 день назад',
    likes: 21,
    liked: false,
    text: 'При загрузке Excel-файла на 45 000 строк окно белеет и показывает «Не отвечает» около четырёх минут. Нужны фоновая обработка, прогресс и возможность отмены.',
  },
  {
    id: 'ОБ-242',
    title: 'Упростить перенос товара между складами',
    category: 'idea',
    system: 'manufacture',
    status: 'open',
    mine: true,
    author: USERS.me,
    assignee: null,
    ageHours: 48,
    time: '2 дня назад',
    likes: 16,
    liked: true,
    text: 'Сейчас для перемещения приходится создавать расход на одном складе и приход на другом. Нужен единый документ перемещения с резервированием товара и статусом приёмки.',
  },
  {
    id: 'ОБ-241',
    title: 'Приложение выбирает просроченный договор при создании заказа',
    category: 'bug',
    system: 'cwatis',
    status: 'progress',
    mine: false,
    author: USERS.natalia,
    assignee: USERS.alexey,
    ageHours: 72,
    time: '3 дня назад',
    likes: 13,
    liked: false,
    text: 'В заказ поставщику автоматически подставляется первый договор из списка, даже если срок его действия закончился. Активный договор приходится выбирать вручную.',
    response: {
      text: 'Меняем правило подбора: сначала основной действующий договор, затем самый новый из действующих.',
      time: '2 дня назад',
    },
  },
  {
    id: 'ОБ-240',
    title: 'Добавить массовое изменение единиц измерения товаров',
    category: 'idea',
    system: 'cwatis',
    status: 'open',
    mine: false,
    author: USERS.natalia,
    assignee: USERS.elena,
    ageHours: 96,
    time: '4 дня назад',
    likes: 12,
    liked: false,
    text: 'После загрузки нового каталога нужно исправить единицы измерения у нескольких сотен товаров. Предлагаю массовую операцию для выбранных строк с предварительным просмотром результата.',
  },
  {
    id: 'ОБ-239',
    title: 'Штрихкоды с ведущим нулём сохраняются некорректно',
    category: 'bug',
    system: 'manufacture',
    status: 'done',
    mine: false,
    author: USERS.sergey,
    assignee: USERS.alexey,
    ageHours: 120,
    time: '5 дней назад',
    likes: 7,
    liked: false,
    text: 'После импорта из Excel код 0123456789012 превращается в 123456789012. Сканер затем не находит карточку товара.',
    response: {
      text: 'Импорт теперь читает штрихкод как строку. Исправление включено в последнюю сборку.',
      time: '4 дня назад',
    },
  },
  {
    id: 'ОБ-238',
    title: 'Сделать уведомления о скором окончании договора',
    category: 'idea',
    system: 'personnel',
    status: 'progress',
    mine: true,
    author: USERS.me,
    assignee: USERS.elena,
    ageHours: 144,
    time: '6 дней назад',
    likes: 20,
    liked: true,
    text: 'Нужны напоминания ответственному за 60, 30 и 7 дней до окончания договора. Периоды должны настраиваться отдельно для каждого вида договора.',
  },
  {
    id: 'ОБ-237',
    title: 'Отбор по сроку годности не учитывает партии без даты',
    category: 'bug',
    system: 'manufacture',
    status: 'open',
    mine: false,
    author: USERS.sergey,
    assignee: USERS.alexey,
    ageHours: 168,
    time: '7 дней назад',
    likes: 6,
    liked: false,
    text: 'Фильтр «Срок истекает в течение 30 дней» скрывает партии, у которых дата срока годности не заполнена. Такие строки нужно показывать отдельно как требующие проверки.',
  },
  {
    id: 'ОБ-236',
    title: 'После закрытия периода можно изменить дату документа',
    category: 'bug',
    system: 'bookkeep',
    status: 'progress',
    mine: false,
    author: USERS.olga,
    assignee: USERS.alexey,
    ageHours: 192,
    time: '8 дней назад',
    likes: 17,
    liked: false,
    text: 'В закрытом месяце редактирование суммы заблокировано, но дату документа можно изменить через календарь. Так документ переносится в другой период без перепроведения.',
  },
  {
    id: 'ОБ-235',
    title: 'Добавить историю изменения закупочной цены',
    category: 'idea',
    system: 'cwatis',
    status: 'open',
    mine: false,
    author: USERS.pavel,
    assignee: null,
    ageHours: 216,
    time: '9 дней назад',
    likes: 15,
    liked: false,
    text: 'В карточке товара нужна вкладка с историей закупочной цены: поставщик, договор, валюта, дата начала действия и пользователь, внёсший изменение.',
  },
  {
    id: 'ОБ-234',
    title: 'Колонки журнала сбрасываются после перезапуска',
    category: 'bug',
    system: 'bookkeep',
    status: 'done',
    mine: true,
    author: USERS.me,
    assignee: USERS.irina,
    ageHours: 240,
    time: '10 дней назад',
    likes: 10,
    liked: true,
    text: 'Ширина и порядок колонок в журнале платёжных документов возвращаются к значениям по умолчанию после перезапуска программы.',
    response: {
      text: 'Настройки таблицы теперь сохраняются отдельно для каждого пользователя и рабочего места.',
      time: '8 дней назад',
    },
  },
  {
    id: 'ОБ-233',
    title: 'Показывать доступный остаток с учётом резервов',
    category: 'idea',
    system: 'manufacture',
    status: 'progress',
    mine: false,
    author: USERS.sergey,
    assignee: USERS.elena,
    ageHours: 264,
    time: '11 дней назад',
    likes: 24,
    liked: false,
    text: 'В подборе отображается только физический остаток. Добавьте рядом резерв и доступное количество, чтобы менеджеры не обещали клиенту уже зарезервированный товар.',
  },
  {
    id: 'ОБ-232',
    title: 'Форма договора открывается за главным окном',
    category: 'bug',
    system: 'cwatis',
    status: 'done',
    mine: false,
    author: USERS.anna,
    assignee: USERS.irina,
    ageHours: 288,
    time: '12 дней назад',
    likes: 5,
    liked: false,
    text: 'Если открыть карточку договора из окна заказа, модальная форма иногда появляется за главным окном. Кажется, что программа зависла, пока не переключишься через панель задач.',
    response: {
      text: 'Для дочерней формы явно задано окно-владелец. Проблема устранена.',
      time: '10 дней назад',
    },
  },
  {
    id: 'ОБ-231',
    title: 'Добавить правила округления для разных прайс-листов',
    category: 'idea',
    system: 'cwatis',
    status: 'open',
    mine: false,
    author: USERS.pavel,
    assignee: USERS.elena,
    ageHours: 312,
    time: '13 дней назад',
    likes: 19,
    liked: false,
    text: 'Для розницы цену нужно округлять до целого, для опта — до двух знаков, а для маркетплейса — до ближайших 10. Сейчас всё приходится корректировать вручную.',
  },
  {
    id: 'ОБ-230',
    title: 'Добавить поиск по счёту и субконто в плане счетов',
    category: 'idea',
    system: 'bookkeep',
    status: 'done',
    mine: false,
    author: USERS.olga,
    assignee: USERS.irina,
    ageHours: 336,
    time: '14 дней назад',
    likes: 8,
    liked: false,
    text: 'Нужен быстрый поиск одновременно по коду счёта, названию и виду субконто. Желательно начинать поиск сразу при вводе без отдельной кнопки.',
    response: {
      text: 'Поиск по трём полям добавлен в версии 2.18.',
      time: '12 дней назад',
    },
  },
  {
    id: 'ОБ-229',
    title: 'На масштабе Windows 150% обрезается кнопка проведения',
    category: 'bug',
    system: 'bookkeep',
    status: 'progress',
    mine: true,
    author: USERS.me,
    assignee: USERS.irina,
    ageHours: 384,
    time: '16 дней назад',
    likes: 6,
    liked: false,
    text: 'На ноутбуке с масштабом экрана 150% нижняя панель формы авансового отчёта не помещается. Кнопка «Провести и закрыть» видна только частично.',
  },
  {
    id: 'ОБ-228',
    title: 'Печать складских этикеток стала заметно удобнее',
    category: 'review',
    system: 'manufacture',
    status: 'done',
    mine: false,
    author: USERS.sergey,
    assignee: USERS.elena,
    ageHours: 432,
    time: '18 дней назад',
    likes: 0,
    liked: false,
    text: 'Спасибо за шаблоны этикеток и предварительный просмотр. Теперь перед печатью видно размер, количество копий и расположение штрихкода.',
  },
  {
    id: 'ОБ-227',
    title: 'Нужна история согласования договора',
    category: 'idea',
    system: 'personnel',
    status: 'open',
    mine: false,
    author: USERS.anna,
    assignee: null,
    ageHours: 480,
    time: '20 дней назад',
    likes: 11,
    liked: false,
    text: 'В карточке договора нужна хронология согласования: кто получил задачу, когда одобрил или вернул, какой комментарий оставил и какая версия файла рассматривалась.',
  },
  {
    id: 'ОБ-226',
    title: 'Обновлённый отчёт по взаиморасчётам понятен без обучения',
    category: 'review',
    system: 'bookkeep',
    status: 'done',
    mine: true,
    author: USERS.me,
    assignee: USERS.elena,
    ageHours: 552,
    time: '23 дня назад',
    likes: 0,
    liked: false,
    text: 'Отдельные колонки долга контрагента и нашего долга сделали отчёт намного понятнее. Особенно полезна расшифровка суммы двойным щелчком.',
  },
  {
    id: 'ОБ-225',
    title: 'Фильтры в справочнике товаров экономят время',
    category: 'review',
    system: 'cwatis',
    status: 'done',
    mine: false,
    author: USERS.natalia,
    assignee: USERS.irina,
    ageHours: 624,
    time: '26 дней назад',
    likes: 0,
    liked: false,
    text: 'Сохранённые фильтры по группе, бренду и поставщику хорошо работают. Было бы удобно ещё закреплять один фильтр как основной.',
  },
] satisfies TicketSeed[]

export const INITIAL_TICKETS: Ticket[] = TICKET_SEEDS.map((seed): Ticket => {
  const { ageHours, text, response, comments, ...ticket } = seed
  return {
    ...ticket,
    createdAt: now - ageHours * HOUR_MS,
    time: seed.time,
    messages: [
      {
        id: `${seed.id}-1`,
        sender: 'me',
        text,
        time: seed.time,
        attachments: [],
      },
      ...(response
        ? [
            {
              id: `${seed.id}-2`,
              sender: 'agent' as const,
              text: response.text,
              time: response.time,
              attachments: [],
            },
          ]
        : []),
      ...(comments?.map((comment, index) => ({
        ...comment,
        id: `${seed.id}-${index + 3}`,
        attachments: [],
      })) ?? []),
    ],
  }
})
