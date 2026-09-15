import { MessageCircle } from 'lucide-react'
import type { CommentThreadState } from '../hooks'
import type { MessageSender, User } from '../types'
import { CommentThread } from './CommentThread'
import './CommentSection.css'

type CommentSectionProps = {
  thread: CommentThreadState
  resolveAuthor: (sender: MessageSender) => User | null
  commentCount: number
}

// A threaded comment list with heading and empty state. Renders off
// useCommentThread's state alone - no Ticket, no USERS - so it (and its
// sibling CommentComposer, sharing the same thread) can be dropped into
// any page that hands it a flat comment list, an author resolver, and the
// three mutation callbacks. See SuggestionDetailView for the call site.
export function CommentSection({ thread, resolveAuthor, commentCount }: CommentSectionProps) {
  return (
    <section className="fb-detail-comments" aria-labelledby="comments-title">
      <div className="fb-detail-section-heading">
        <MessageCircle size={18} />
        <h2 id="comments-title">Обсуждение</h2>
        <span>{commentCount}</span>
      </div>
      {thread.commentTree.length > 0 ? (
        <div className="fb-detail-comment-list">
          {thread.commentTree.map((comment, index) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              depth={0}
              hasNextSibling={index < thread.commentTree.length - 1}
              thread={thread}
              resolveAuthor={resolveAuthor}
            />
          ))}
        </div>
      ) : (
        <p className="fb-detail-empty">Пока нет комментариев. Начните обсуждение.</p>
      )}
    </section>
  )
}
