import dayjs from 'dayjs'

export function formatDate(value?: string | null, format = 'YYYY-MM-DD'): string {
  if (!value) return ''
  return dayjs(value).format(format)
}

export function formatDateTime(value?: string | null): string {
  return formatDate(value, 'YYYY-MM-DD HH:mm')
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function readingTime(minutes: number): string {
  return `${Math.max(1, minutes)} min read`
}
