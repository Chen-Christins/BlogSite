import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Eye,
  FileEdit,
  FileText,
  MessageSquare,
  Send,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { adminStatsApi } from '@/api'
import { Loading, ErrorState } from '@/components/StateViews'
import TrendChart from '@/components/admin/TrendChart'
import { formatNumber } from '@/lib/format'

const cards = [
  { key: 'total_posts', label: 'Posts', icon: FileText, cls: 'bg-brand-500/10 text-brand-600 dark:text-brand-400' },
  { key: 'published_posts', label: 'Published', icon: Send, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { key: 'draft_posts', label: 'Drafts', icon: FileEdit, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'total_comments', label: 'Comments', icon: MessageSquare, cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { key: 'pending_comments', label: 'Pending', icon: Timer, cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { key: 'total_views', label: 'Views', icon: Eye, cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
] as const

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminStatsApi.overview,
  })

  if (isLoading) return <Loading />
  if (isError) return <ErrorState message={(error as Error).message} />
  if (!data) return null

  const periodTotal = data.view_trend.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">Content and traffic overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className="rounded-2xl border border-brand-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-[#24382a] dark:bg-[#101811]"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.cls}`}
            >
              <c.icon size={17} />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatNumber(data[c.key])}
            </p>
            <p className="text-xs text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-brand-100 bg-white p-6 dark:border-[#24382a] dark:bg-[#101811] lg:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Views (last 30 days)
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {formatNumber(periodTotal)} views in range
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> Daily views
            </span>
          </div>
          <TrendChart data={data.view_trend} />
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 dark:border-[#24382a] dark:bg-[#101811] lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Top 10 posts
          </h2>
          <ol className="space-y-3">
            {data.top_posts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    i < 3
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white'
                      : 'bg-brand-50 text-slate-400 dark:bg-[#16201399]'
                  }`}
                >
                  {i + 1}
                </span>
                <Link
                  to={`/admin/posts/${p.id}`}
                  className="min-w-0 flex-1 truncate text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                >
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-slate-400">{p.view_count}</span>
              </li>
            ))}
            {data.top_posts.length === 0 && (
              <li className="text-sm text-slate-400">No data yet</li>
            )}
          </ol>
        </section>
      </div>
    </div>
  )
}
