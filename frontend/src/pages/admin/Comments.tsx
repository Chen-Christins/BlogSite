import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ShieldX, Trash2 } from 'lucide-react'
import { adminCommentApi } from '@/api'
import type { CommentStatus } from '@/api/types'
import { formatDateTime } from '@/lib/format'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

const tabs: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'spam', label: 'Spam' },
  { value: '', label: 'All' },
]

const badge: Record<CommentStatus, string> = {
  pending: 'bg-accent-500/10 text-accent-500',
  approved: 'bg-brand-100 text-brand-700 dark:bg-[#16201399] dark:text-brand-300',
  spam: 'bg-danger-500/10 text-danger-500',
}
const badgeLabel: Record<CommentStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  spam: 'Spam',
}

export default function CommentsAdmin() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'comments', status, page],
    queryFn: () => adminCommentApi.list({ page, size: 20, status: status || undefined }),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'comments'] })
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }
  const setStatusMutation = useMutation({
    mutationFn: ({ id, s }: { id: number; s: CommentStatus }) =>
      adminCommentApi.setStatus(id, s),
    onSuccess: (_d, { s }) => {
      invalidate()
      toast.success(s === 'approved' ? 'Comment approved' : 'Comment marked as spam')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const remove = useMutation({
    mutationFn: adminCommentApi.remove,
    onSuccess: () => {
      invalidate()
      toast.success('Comment deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete this comment?',
      description: 'This cannot be undone.',
      confirmText: 'Delete',
      danger: true,
    })
    if (ok) remove.mutate(id)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Comments</h1>

      <div className="flex w-fit rounded-xl border border-brand-100 bg-white p-0.5 dark:border-[#24382a] dark:bg-[#101811]">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setStatus(t.value)
              setPage(1)
            }}
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

      {isLoading && <Loading />}
      {isError && <ErrorState message={(error as Error).message} />}
      {data && data.list.length === 0 && <Empty label="No comments yet" />}

      {data && data.list.length > 0 && (
        <div className="space-y-3">
          {data.list.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-brand-100 bg-white p-4 dark:border-[#24382a] dark:bg-[#101811]"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {c.author_name}
                </span>
                {c.email && <span className="text-xs text-slate-400">{c.email}</span>}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[c.status]}`}>
                  {badgeLabel[c.status]}
                </span>
                <span className="text-xs text-slate-400">{formatDateTime(c.created_at)}</span>
                <Link
                  to={`/admin/posts/${c.post_id}`}
                  className="ml-auto text-xs text-brand-600 hover:underline dark:text-brand-400"
                >
                  Post #{c.post_id}
                </Link>
              </div>
              <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {c.content}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {c.status !== 'approved' && (
                  <Button
                    size="sm"
                    className="border-transparent bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-[#16201399] dark:text-brand-300"
                    onClick={() => setStatusMutation.mutate({ id: c.id, s: 'approved' })}
                  >
                    <Check size={14} /> Approve
                  </Button>
                )}
                {c.status !== 'spam' && (
                  <Button
                    size="sm"
                    variant="dangerSoft"
                    onClick={() => setStatusMutation.mutate({ id: c.id, s: 'spam' })}
                  >
                    <ShieldX size={14} /> Mark as spam
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-danger-500/10 hover:text-danger-500"
                  onClick={() => onDelete(c.id)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  )
}
