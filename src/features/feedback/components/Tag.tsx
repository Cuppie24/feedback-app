import type { TagTone } from '../types'
import './Tag.css'

type TagProps = {
  tone: TagTone
  children: string
}

export function Tag({ tone, children }: TagProps) {
  return <span className={`fb-tag fb-tag-${tone}`}>{children}</span>
}
