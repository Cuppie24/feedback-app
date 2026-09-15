import type { Message } from './types'

export type CommentNode = Message & { children: CommentNode[] }

// Turns the flat, replyToId-linked message list into a tree for threaded
// rendering. A comment whose replyToId doesn't resolve to another comment
// in the list becomes a root instead of being dropped.
export function buildCommentTree(comments: Message[]): CommentNode[] {
  const nodeById = new Map<string, CommentNode>()
  for (const comment of comments) nodeById.set(comment.id, { ...comment, children: [] })

  const roots: CommentNode[] = []
  for (const comment of comments) {
    const node = nodeById.get(comment.id)
    if (!node) continue
    const parent = comment.replyToId ? nodeById.get(comment.replyToId) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

export function extOf(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase().slice(0, 4) : 'FILE'
}

export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} КБ`
  return `${(kb / 1024).toFixed(1)} МБ`
}

// Russian plural forms follow a 3-way rule keyed off the last one/two
// digits (1 обращение, 2 обращения, 5 обращений, 11 обращений, 21 обращение...).
export function pluralizeRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
