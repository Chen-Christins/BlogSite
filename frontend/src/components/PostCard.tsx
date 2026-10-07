import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, Clock, Eye } from 'lucide-react'
import type { Post } from '@/api/types'
import { formatDate } from '@/lib/format'

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-brand-100 bg-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_10px_30px_#254b3512] dark:border-[#24382a] dark:bg-[#101811]/85 dark:hover:border-brand-500/40">
      <div className="flex flex-col sm:flex-row">
        {post.cover_image && (
          <Link
            to={`/posts/${post.slug}`}
            className="relative block shrink-0 overflow-hidden sm:w-60"
          >
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-full"
            />
          </Link>
        )}
        <div className="min-w-0 flex-1 p-5 sm:p-6">
          {post.category && (
            <Link
              to={`/category/${post.category.slug}`}
              className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-[#16201399] dark:text-brand-400"
            >
              {post.category.name}
            </Link>
          )}
          <h2 className="mt-2.5 font-serif text-xl font-bold leading-snug tracking-[.5px]">
            <Link
              to={`/posts/${post.slug}`}
              className="text-slate-900 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400"
            >
              {post.title}
            </Link>
          </h2>
          {post.summary && (
            <p className="mt-2.5 line-clamp-2 text-sm leading-[1.8] text-slate-500 dark:text-slate-400">
              {post.summary}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13.5} />
              {formatDate(post.published_at ?? post.created_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13.5} />
              {Math.max(1, post.reading_time)} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={13.5} />
              {post.view_count}
            </span>
            {post.tags?.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to={`/tags/${t.slug}`}
                className="rounded-full bg-brand-50/70 px-2 py-0.5 text-brand-600/80 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:bg-[#16201399] dark:text-brand-400/80 dark:hover:text-brand-300"
              >
                #{t.name}
              </Link>
            ))}
            <ArrowUpRight
              size={16}
              className="ml-auto -translate-x-1 text-brand-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
