import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Hash } from 'lucide-react'
import { publicApi } from '@/api'
import { Empty, ErrorState, Loading } from '@/components/StateViews'

export default function Tags() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tags'],
    queryFn: publicApi.tags,
  })

  if (isLoading) return <Loading />
  if (isError) return <ErrorState message={(error as Error).message} />

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-[30px] font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
          Tags
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {data?.length ?? 0} tags, sorted by post count
        </p>
      </header>
      {!data || data.length === 0 ? (
        <Empty label="No tags yet" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {data.map((tag) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.slug}`}
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-600 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500/40 dark:hover:text-brand-400"
            >
              <Hash size={14} className="text-brand-500" />
              <span className="font-medium">{tag.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400 dark:bg-slate-800">
                {tag.post_count ?? 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
