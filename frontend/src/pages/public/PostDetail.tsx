import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, Eye } from 'lucide-react'
import { publicApi } from '@/api'
import Markdown from '@/components/Markdown'
import Toc from '@/components/Toc'
import Comments from '@/components/Comments'
import ReadingProgress from '@/components/ReadingProgress'
import { ErrorState, Loading } from '@/components/StateViews'
import { formatDate } from '@/lib/format'

export default function PostDetail() {
  const { slug = '' } = useParams()
  const contentRef = useRef<HTMLDivElement>(null)

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => publicApi.post(slug),
    enabled: Boolean(slug),
  })

  if (isLoading) return <Loading />
  if (isError) return <ErrorState message={(error as Error).message} />
  if (!post) return null

  return (
    <>
      <ReadingProgress />
      <div className="flex gap-12">
        <article className="min-w-0 max-w-3xl flex-1">
          <header className="animate-fade-up mb-8 border-b border-brand-100 pb-8 dark:border-[#24382a]">
            {post.category && (
              <Link
                to={`/category/${post.category.slug}`}
                className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 dark:bg-[#16201399] dark:text-brand-400"
              >
                {post.category.name}
              </Link>
            )}
            <h1 className="mt-3 font-serif text-3xl font-bold leading-[1.35] tracking-[1px] text-slate-900 dark:text-slate-100 sm:text-[38px]">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={15} />
                {formatDate(post.published_at ?? post.created_at, 'MMM D, YYYY')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} />
                {Math.max(1, post.reading_time)} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye size={15} />
                {post.view_count} views
              </span>
            </div>
          </header>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="mb-8 w-full rounded-2xl object-cover shadow-sm"
            />
          )}

          <div ref={contentRef} className="animate-fade-in">
            <Markdown content={post.content_md} />
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-brand-100 pt-8 dark:border-[#24382a]">
              <span className="text-sm text-slate-400">Tags</span>
              {post.tags.map((t) => (
                <Link
                  key={t.id}
                  to={`/tags/${t.slug}`}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-600 transition-colors hover:bg-brand-100 dark:bg-[#16201399] dark:text-brand-400 dark:hover:bg-[#1c2a1b]"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          <Comments postId={post.id} />
        </article>

        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-brand-100 bg-white/70 p-5 backdrop-blur dark:border-[#24382a] dark:bg-[#101811]/70">
            <Toc containerRef={contentRef} contentKey={post.slug} />
          </div>
        </aside>
      </div>
    </>
  )
}
