import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'
import './VoteButton.css'

type VoteButtonProps = {
  likes: number
  liked: boolean
  onToggle: () => void
}

export function VoteButton({ likes, liked, onToggle }: VoteButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Vote buttons sit inside clickable ticket rows - voting must not also
    // open the ticket.
    event.stopPropagation()
    onToggle()
  }

  return (
    <button
      type="button"
      className={`fb-vote-btn${liked ? ' liked' : ''}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Убрать голос' : 'Проголосовать'}
    >
      <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
      <span>{likes}</span>
    </button>
  )
}
