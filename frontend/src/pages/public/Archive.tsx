import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { publicApi } from '@/api'
import type { Post } from '@/api/types'
import { Empty, ErrorState, Loading } from '@/components/StateViews'

export default function Archive() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['archive'],
    queryFn: () => publicApi.posts({ page: 1, size: 100 }),
  })

  if (isLoading) return <Loading />
  if (isError) return <ErrorState message={(error as Error).message} />
  if (!data || data.list.length === 0) return <Empty label="No posts yet" />

  const groups = data.list.reduce<Record<string, Post[]>>((acc, post) => {
    const year = dayjs(post.published_at ?? post.created_at).format('YYYY')
    ;(acc[year] ||= []).push(post)
    return acc
  }, {})
  const years = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      <header className="mb-10">
        <h1 className="font-serif text-[30px] font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
          Archive
        </h1>
        <p className="mt-2 text-sm text-slate-400">{data.total} posts</p>
      </header>

      <div className="space-y-10">
        {years.map((year) => (
          <section key={year} className="relative">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
                {year.slice(2)}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {year}
              </span>
              <span className="text-sm text-slate-400">{groups[year].length} posts</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <ul className="space-y-1 border-l-2 border-slate-100 pl-5 dark:border-slate-800">
              {groups[year].map((post) => (
                <li key={post.id} className="group relative flex items-baseline gap-4 py-1.5">
                  <span className="absolute -left-[1.6rem] top-3 h-2 w-2 rounded-full bg-slate-200 transition-colors group-hover:bg-brand-500 dark:bg-slate-700" />
                  <time className="shrink-0 font-mono text-xs text-slate-400">
                    {dayjs(post.published_at ?? post.created_at).format('MM-DD')}
                  </time>
                  <Link
                    to={`/posts/${post.slug}`}
                    className="text-slate-700 transition-colors group-hover:text-brand-600 dark:text-slate-300 dark:group-hover:text-brand-400"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
