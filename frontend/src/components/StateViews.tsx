import { Inbox, Loader2 } from 'lucide-react'

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <Loader2 className="animate-spin text-brand-500" size={24} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function Empty({ label = 'Nothing here yet' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Inbox size={24} />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
        😵
      </div>
      <span className="text-sm text-red-500">{message}</span>
    </div>
  )
}
