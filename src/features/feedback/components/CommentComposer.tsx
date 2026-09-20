import type { CommentThreadState } from '../hooks'
import type { MessageSender, User } from '../types'
import { MessageComposer } from './MessageComposer'

type CommentComposerProps = {
  thread: CommentThreadState
  resolveAuthor: (sender: MessageSender) => User | null
}

export function CommentComposer({ thread, resolveAuthor }: CommentComposerProps) {
  const replyTarget = thread.replyTarget
  const replyLabel = replyTarget ? resolveAuthor(replyTarget.sender)?.name ?? 'Команда продукта' : undefined

  return (
    <MessageComposer
      textareaRef={thread.commentInputRef}
      value={thread.commentText}
      onChange={thread.updateCommentText}
      onSubmit={thread.submitComment}
      placeholder="Добавить комментарий..."
      ariaLabel="Текст комментария"
      submitAriaLabel="Отправить комментарий"
      avatarInitials={resolveAuthor('me')?.initials ?? ''}
      attachments={thread.attachments}
      onAddFiles={thread.addFiles}
      onRemoveAttachment={thread.removeAttachment}
      replyLabel={replyLabel}
      onScrollToReply={replyTarget ? () => thread.scrollToComment(replyTarget.id) : undefined}
      onCancelReply={thread.cancelReply}
    />
  )
}
