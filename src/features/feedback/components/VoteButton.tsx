import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'
import './VoteButton.css'

type VoteButtonProps = {
  likes: number
  liked: boolean
  onToggle?: () => void
  // Authors can't vote on their own tickets - show the count as plain text
  // so it doesn't read as a control.
  readOnly?: boolean
}

export function VoteButton({ likes, liked, onToggle, readOnly = false }: VoteButtonProps) {
  if (readOnly) {
    return (
      <span className="fb-vote-count" title="Нельзя голосовать за своё обращение" aria-label={`${likes} голосов`}>
        <Heart size={14} strokeWidth={2.5} aria-hidden="true" />
        <span>{likes}</span>
      </span>
    )
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Vote buttons sit inside clickable ticket rows - voting must not also
    // open the ticket.
    event.stopPropagation()
    onToggle?.()
  }

  return (
    <button
      type="button"
      className={`fb-vote-btn${liked ? ' liked' : ''}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Убрать голос' : 'Проголосовать'}
    >
      <Heart size={14} strokeWidth={2.5} fill={liked ? 'currentColor' : 'none'} />
      <span>{likes}</span>
    </button>
  )
}
