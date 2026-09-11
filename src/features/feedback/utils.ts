export function extOf(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase().slice(0, 4) : 'FILE'
}

export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} КБ`
  return `${(kb / 1024).toFixed(1)} МБ`
}
