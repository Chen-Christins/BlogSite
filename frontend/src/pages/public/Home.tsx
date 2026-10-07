import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Feather, PenLine, Rss, Search, Tags, SunMoon } from 'lucide-react'
import { publicApi } from '@/api'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'
import { useSettings } from '@/hooks/useSettings'

const PAGE_SIZE = 8

const features = [
  { icon: PenLine, title: 'Markdown writing', desc: 'Focus on the words, not the layout' },
  { icon: Search, title: 'Full-text search', desc: 'Weighted title and body search' },
  { icon: Tags, title: 'Categories & tags', desc: 'Organize your notes by topic' },
  { icon: SunMoon, title: 'Light & dark', desc: 'Comfortable to read day or night' },
]

export default function Home() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page') || '1'))
  const { data: settings } = useSettings()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => publicApi.posts({ page, size: PAGE_SIZE }),
  })

  const goPage = (p: number) => {
    setParams(p > 1 ? { page: String(p) } : {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <section className="relative pb-4 pt-6 text-center">
        <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:border-[#24382a] dark:bg-[#16201399] dark:text-brand-400">
          <Feather size={13} /> Writing down what is worth keeping
        </span>
        <h1 className="animate-fade-up mx-auto mt-5 max-w-3xl font-serif text-[32px] font-bold leading-[1.35] tracking-[1px] text-slate-900 dark:text-slate-100 sm:text-[44px]">
          {settings?.site_title || 'My Blog'}
        </h1>
        <p className="animate-fade-up mx-auto mt-4 max-w-xl text-[14px] leading-[1.8] text-slate-500 dark:text-slate-400">
          {settings?.site_subtitle || settings?.site_description || 'Notes on tech and life. Slower, but longer lasting.'}
        </p>
        <div className="animate-fade-up mt-5 text-[13px] tracking-[.5px] text-brand-600 dark:text-brand-400">
          Keep writing <span className="px-2 font-normal text-brand-300">·</span> Think deeply{' '}
          <span className="px-2 font-normal text-brand-300">·</span> Go & React
        </div>
        <div className="animate-fade-up mt-6 flex justify-center gap-3">
          <a
            href="#posts"
            className="inline-flex min-h-[39px] items-center justify-center gap-2 rounded-xl border border-brand-600 bg-brand-600 px-6 text-sm font-semibold text-white shadow-[inset_0_0_10px_#ffffff13] transition hover:-translate-y-px hover:bg-brand-700"
          >
            Start reading
          </a>
          <a
            href="/rss.xml"
            className="inline-flex min-h-[39px] items-center justify-center gap-2 rounded-xl border border-brand-500 bg-white/70 px-5 text-sm font-semibold text-brand-600 transition hover:-translate-y-px hover:bg-brand-50 dark:bg-transparent dark:hover:bg-[#16201399]"
          >
            <Rss size={16} /> RSS Feed
          </a>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-y-4 rounded-2xl bg-brand-50/80 py-4 dark:bg-[#101811]/80 md:grid-cols-4 md:gap-0 md:p-4">
        {features.map((f, i) => (
          <div key={f.title} className="relative flex items-center gap-3 px-3 md:px-4">
            {i > 0 && (
              <span className="absolute left-0 hidden h-9 w-px bg-brand-100 dark:bg-[#24382a] md:block" />
            )}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-[#16201399] dark:text-brand-400">
              <f.icon size={20} />
            </span>
            <div>
              <strong className="text-[13px] text-slate-800 dark:text-slate-200">
                {f.title}
              </strong>
              <p className="mt-0.5 text-[11px] leading-[1.55] text-slate-500 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section id="posts" className="scroll-mt-24">
        <div className="mb-6 mt-12 text-center">
          <h2 className="font-serif text-[22px] font-bold leading-[1.25] text-slate-900 dark:text-slate-100">
            Latest posts
          </h2>
          <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
            {data ? `${data.total} posts` : 'Updated regularly'}
          </p>
        </div>

        {isLoading && <Loading />}
        {isError && <ErrorState message={(error as Error).message} />}
        {data && data.list.length === 0 && <Empty label="No posts published yet" />}
        {data && data.list.length > 0 && (
          <>
            <div className="space-y-5">
              {data.list.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={goPage} />
          </>
        )}
      </section>
    </div>
  )
}
