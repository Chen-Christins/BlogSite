import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2, Upload, EyeOff } from 'lucide-react'
import { adminPostApi } from '@/api'
import type { Post } from '@/api/types'
import { formatDateTime } from '@/lib/format'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

const tabs = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

export default function PostList() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || ''
  const page = Math.max(1, Number(params.get('page') || '1'))
  const [q, setQ] = useState(params.get('q') || '')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'posts', status, page, params.get('q')],
    queryFn: () =>
      adminPostApi.list({ page, size: 10, status, q: params.get('q') || undefined }),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'posts'] })

  const publish = useMutation({
    mutationFn: adminPostApi.publish,
    onSuccess: () => {
      invalidate()
      toast.success('Post published')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const unpublish = useMutation({
    mutationFn: adminPostApi.unpublish,
    onSuccess: () => {
      invalidate()
      toast.info('Moved to draft')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const remove = useMutation({
    mutationFn: adminPostApi.remove,
    onSuccess: () => {
      invalidate()
      toast.success('Post deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const setStatus = (s: string) => {
    const next = new URLSearchParams()
    if (s) next.set('status', s)
    setParams(next)
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams()
    if (status) next.set('status', status)
    if (q.trim()) next.set('q', q.trim())
    setParams(next)
  }

  const onDelete = async (post: Post) => {
    const ok = await confirm({
      title: `Delete "${post.title}"?`,
      description: 'This cannot be undone. The post and its comments will be deleted.',
      confirmText: 'Delete',
      danger: true,
    })
    if (ok) remove.mutate(post.id)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100" >Posts</h1>
        <Button
          variant="primary"
          className="ml-auto"
          onClick={() => navigate('/admin/posts/new')}
        >
          <Plus size={16} /> New Post
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-brand-100 bg-white p-0.5 dark:border-[#24382a] dark:bg-[#101811]">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setStatus(t.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                status === t.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or content"
            className="w-52 pl-9"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm dark:border-[#24382a] dark:bg-[#101811]">
        {isLoading && <Loading />}
        {isError && <ErrorState message={(error as Error).message} />}
        {data && data.list.length === 0 && <Empty label="No posts yet" />}
        {data && data.list.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 text-left text-xs text-slate-400 dark:border-[#24382a]">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 text-center font-medium lg:table-cell">Category</th>
                <th className="hidden px-4 py-3 text-center font-medium lg:table-cell">Views</th>
                <th className="hidden px-4 py-3 text-center font-medium md:table-cell">Updated</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50 dark:divide-[#1c2a1b]">
              {data.list.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-brand-50/40 dark:hover:bg-[#16201399]"
                >
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      to={`/admin/posts/${post.id}`}
                      className="line-clamp-1 font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
                    >
                      {post.title}
                    </Link>
                    <span className="text-xs text-slate-400">/{post.slug}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-brand-100 text-brand-700 dark:bg-[#16201399] dark:text-brand-300'
                          : 'bg-accent-500/10 text-accent-500'
                      }`}
                    >
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-center text-slate-500 dark:text-slate-400 lg:table-cell">
                    {post.category?.name || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-slate-500 dark:text-slate-400 lg:table-cell">
                    {post.view_count}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-xs text-slate-400 md:table-cell">
                    {formatDateTime(post.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => navigate(`/admin/posts/${post.id}`)}
                      >
                        <Pencil size={15} />
                      </Button>
                      {post.status === 'published' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Unpublish"
                          className="hover:text-accent-500"
                          onClick={() => unpublish.mutate(post.id)}
                        >
                          <EyeOff size={15} />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Publish"
                          className="hover:text-brand-600"
                          onClick={() => publish.mutate(post.id)}
                        >
                          <Upload size={15} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        className="hover:bg-danger-500/10 hover:text-danger-500"
                        onClick={() => onDelete(post)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <Pagination
          page={data.page}
          pages={data.pages}
          onChange={(p) => {
            const next = new URLSearchParams(params)
            next.set('page', String(p))
            setParams(next)
          }}
        />
      )}
    </div>
  )
}
