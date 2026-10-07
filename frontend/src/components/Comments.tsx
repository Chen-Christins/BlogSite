import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Reply } from 'lucide-react'
import { publicApi } from '@/api'
import type { Comment } from '@/api/types'
import { formatDateTime } from '@/lib/format'
import { Empty, Loading } from './StateViews'

const AVATAR_COLORS = [
  'from-brand-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

function avatarColor(name: string) {
  let sum = 0
  for (const ch of name) sum += ch.charCodeAt(0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment
  onReply: (c: Comment | null) => void
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 dark:border-[#24382a] dark:bg-[#101811]">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarColor(
            comment.author_name,
          )}`}
        >
          {comment.author_name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {comment.author_name}
          </p>
          <p className="text-xs text-slate-400">{formatDateTime(comment.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={() => onReply(comment)}
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <Reply size={13} /> Reply
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap pl-11 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {comment.content}
      </p>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-brand-100 pl-4 dark:border-[#24382a]">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comments({ postId }: { postId: number }) {
  const qc = useQueryClient()
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [form, setForm] = useState({ author_name: '', email: '', content: '', honeypot: '' })
  const [notice, setNotice] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => publicApi.comments(postId),
  })

  const mutation = useMutation({
    mutationFn: () =>
      publicApi.createComment({
        post_id: postId,
        parent_id: replyTo?.id ?? null,
        author_name: form.author_name,
        email: form.email,
        content: form.content,
        honeypot: form.honeypot,
      }),
    onSuccess: (res) => {
      setNotice(res.message || 'Comment submitted, pending moderation')
      setForm({ author_name: '', email: '', content: '', honeypot: '' })
      setReplyTo(null)
      qc.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: (err: Error) => setNotice(err.message),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.content.trim() || !form.author_name.trim()) {
      setNotice('Please fill in your name and comment')
      return
    }
    mutation.mutate()
  }

  const field =
    'h-10 rounded-xl border border-brand-100 bg-brand-50/50 px-3 text-sm outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-[#24382a] dark:bg-[#0d150f]'

  return (
    <section className="mt-14">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
        <MessageSquare size={18} className="text-brand-500" /> Comments
        {data && <span className="text-sm font-normal text-slate-400">{data.length}</span>}
      </h2>

      {isLoading ? (
        <Loading />
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={setReplyTo} />
          ))}
        </div>
      ) : (
        <Empty label="No comments yet. Be the first!" />
      )}

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-brand-100 bg-white p-5 dark:border-[#24382a] dark:bg-[#101811]"
      >
        <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {replyTo ? `Replying to @${replyTo.author_name}` : 'Leave a comment'}
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="ml-2 text-xs font-normal text-slate-400 hover:text-slate-600"
            >
              cancel
            </button>
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.author_name}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            placeholder="Name *"
            className={field}
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email (optional)"
            className={field}
          />
        </div>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="A friendly comment is the start of a conversation..."
          rows={4}
          className="mt-3 w-full rounded-xl border border-brand-100 bg-brand-50/50 p-3 text-sm outline-none transition-colors focus:border-brand-400 focus:bg-white dark:border-[#24382a] dark:bg-[#0d150f]"
        />
        {/* honeypot: hidden from users, bots tend to fill it */}
        <input
          type="text"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">{notice}</span>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {mutation.isPending ? 'Submitting...' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  )
}
