import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Save, Send, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { adminPostApi, publicApi } from '@/api'
import type { PostInput } from '@/api/types'
import Markdown from '@/components/Markdown'
import MediaPicker from '@/components/admin/MediaPicker'
import { Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { Input, Textarea, Field } from '@/components/ui/Field'
import Select from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'

export default function PostEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [mediaMode, setMediaMode] = useState<'cover' | 'insert' | null>(null)

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin', 'post', id],
    queryFn: () => adminPostApi.get(Number(id)),
    enabled: !isNew,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: publicApi.categories,
  })
  const { data: allTags } = useQuery({ queryKey: ['tags'], queryFn: publicApi.tags })

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setSummary(post.summary || '')
      setCoverImage(post.cover_image || '')
      setCategoryId(post.category_id ? String(post.category_id) : '')
      setTagsText(post.tags?.map((t) => t.name).join(', ') || '')
      setContent(post.content_md || '')
      setStatus(post.status)
    }
  }, [post])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'posts'] })
    qc.invalidateQueries({ queryKey: ['admin', 'post', id] })
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const buildInput = (nextStatus: 'draft' | 'published'): PostInput => ({
    title,
    slug: slug.trim() || undefined,
    summary,
    content_md: content,
    cover_image: coverImage,
    category_id: categoryId ? Number(categoryId) : null,
    tags: tagsText
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    status: nextStatus,
  })

  const save = useMutation({
    mutationFn: async (nextStatus: 'draft' | 'published') => {
      if (!title.trim()) throw new Error('Title is required')
      if (isNew) {
        return adminPostApi.create(buildInput(nextStatus))
      }
      const updated = await adminPostApi.update(Number(id), buildInput(nextStatus))
      if (nextStatus === 'published') await adminPostApi.publish(Number(id))
      else await adminPostApi.unpublish(Number(id))
      return updated
    },
    onSuccess: (saved, nextStatus) => {
      invalidate()
      toast.success(nextStatus === 'published' ? 'Post published' : 'Saved as draft')
      setStatus(saved.status as 'draft' | 'published')
      if (isNew) navigate(`/admin/posts/${saved.id}`, { replace: true })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const insertImage = (url: string, name: string) => {
    const md = `\n![${name}](${url})\n`
    const el = textareaRef.current
    if (el) {
      const start = el.selectionStart
      const end = el.selectionEnd
      setContent(content.slice(0, start) + md + content.slice(end))
      requestAnimationFrame(() => {
        el.focus()
        el.selectionStart = el.selectionEnd = start + md.length
      })
    } else {
      setContent(content + md)
    }
  }

  if (!isNew && isLoading) return <Loading />

  const categoryOptions = [
    { label: 'Uncategorized', value: '' },
    ...(categories?.map((c) => ({ label: c.name, value: String(c.id) })) ?? []),
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/posts')}>
          <ArrowLeft size={16} /> Back
        </Button>
        <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
          {isNew ? 'New Post' : 'Edit Post'}
        </h1>
        {status === 'published' && (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-[#16201399] dark:text-brand-300">
            Published
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => save.mutate('draft')} disabled={save.isPending}>
            {status === 'published' ? <EyeOff size={16} /> : <Save size={16} />}
            {status === 'published' ? 'Unpublish' : 'Save draft'}
          </Button>
          <Button variant="primary" onClick={() => save.mutate('published')} disabled={save.isPending}>
            <Send size={16} /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 dark:border-[#24382a] dark:bg-[#101811]">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            className="h-12 !text-lg font-semibold"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug">
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </Field>
            <Field label="Category">
              <Select
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
                placeholder="Select a category"
              />
            </Field>
          </div>

          <Field label="Tags" hint="Separate multiple tags with commas">
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. Go, React"
              list="tag-suggestions"
            />
          </Field>
          <datalist id="tag-suggestions">
            {allTags?.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>

          <Field label="Cover image">
            <div className="flex items-center gap-3">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="cover"
                  className="h-12 w-20 shrink-0 rounded-lg object-cover"
                />
              )}
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Image URL or pick from the media library"
              />
              <Button
                variant="outline"
                onClick={() => setMediaMode('cover')}
                className="shrink-0"
              >
                Media library
              </Button>
            </div>
          </Field>
        </div>

        <Field label="Summary" hint="Leave blank to auto-excerpt the body">
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarize this post in one sentence..."
            rows={8}
          />
        </Field>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white dark:border-[#24382a] dark:bg-[#101811]">
          <div className="flex items-center justify-between border-b border-brand-100 px-4 py-2.5 dark:border-[#24382a]">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Markdown
            </span>
            <Button variant="ghost" size="sm" onClick={() => setMediaMode('insert')}>
              <ImagePlus size={14} /> Insert image
            </Button>
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="min-h-[520px] flex-1 resize-y rounded-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 dark:border-[#24382a] dark:bg-[#101811]">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Eye size={15} /> Preview
          </div>
          <div className="max-h-[540px] overflow-y-auto">
            <Markdown content={content || '*(No content yet)*'} />
          </div>
        </div>
      </div>

      <MediaPicker
        open={mediaMode !== null}
        onClose={() => setMediaMode(null)}
        onSelect={(m) => {
          if (mediaMode === 'cover') setCoverImage(m.url)
          else insertImage(m.url, m.filename)
          setMediaMode(null)
        }}
      />
    </div>
  )
}
