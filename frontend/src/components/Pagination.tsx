import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pages: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pages, onChange }: Props) {
  if (pages <= 1) return null

  const nums: number[] = []
  const start = Math.max(1, Math.min(page - 2, pages - 4))
  const end = Math.min(pages, start + 4)
  for (let i = start; i <= end; i++) nums.push(i)

  const base =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-xl border text-sm font-medium transition-all'

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${base} border-brand-100 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-40 dark:border-[#24382a] dark:bg-[#101811] dark:text-slate-400 dark:hover:border-brand-500/50`}
      >
        <ChevronLeft size={16} />
      </button>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`${base} ${
            n === page
              ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-500/25'
              : 'border-brand-100 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-[#24382a] dark:bg-[#101811] dark:text-slate-400 dark:hover:border-brand-500/50'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={`${base} border-brand-100 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-40 dark:border-[#24382a] dark:bg-[#101811] dark:text-slate-400 dark:hover:border-brand-500/50`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
