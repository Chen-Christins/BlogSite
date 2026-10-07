import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Trash2, Upload, ImagePlus } from 'lucide-react'
import { adminMediaApi } from '@/api'
import type { Media } from '@/api/types'
import { formatDateTime, formatSize } from '@/lib/format'
import Pagination from '@/components/Pagination'
import { Empty, ErrorState, Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

export default function MediaPage() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [page, setPage] = useState(1)
  const [dragOver, setDragOver] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'media', page],
    queryFn: () => adminMediaApi.list({ page, size: 24 }),
  })

  const upload = useMutation({
    mutationFn: (file: File) => adminMediaApi.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] })
      toast.success('Image uploaded')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminMediaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] })
      toast.success('File deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((f) => upload.mutate(f))
  }

  const copy = async (m: Media) => {
    await navigator.clipboard.writeText(m.url)
    setCopiedId(m.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const onDelete = async (m: Media) => {
    const ok = await confirm({
      title: 'Delete this file?',
      description: `"${m.filename}" will be removed from storage. Posts referencing it will no longer show the image.`,
      confirmText: 'Delete',
      danger: true,
    })
    if (ok) remove.mutate(m.id)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Media</h1>
        <Button variant="primary" className="ml-auto" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center text-sm transition-colors ${
          dragOver
            ? 'border-brand-400 bg-brand-50/60 text-brand-600'
            : 'border-brand-100 text-slate-400 hover:border-brand-300 dark:border-[#24382a]'
        }`}
      >
        <ImagePlus size={22} className="text-brand-400" />
        {upload.isPending ?  'Uploading...' : 'Drag an image here, or click to select'}
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState message={(error as Error).message} />}
      {data && data.list.length === 0 && <Empty label="Media library is empty" />}

      {data && data.list.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.list.map((m) => (
              <div
                key={m.id}
                className="group overflow-hidden rounded-2xl border border-brand-100 bg-white dark:border-[#24382a] dark:bg-[#101811]"
              >
                <div className="relative aspect-square bg-brand-50 dark:bg-[#0d150f]">
                  <img
                    src={m.thumb_url || m.url}
                    alt={m.filename}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => copy(m)}
                      title="Copy link"
                      className="rounded-xl bg-white/90 p-2 text-slate-700 transition-colors hover:bg-white"
                    >
                      {copiedId === m.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m)}
                      title="Delete"
                      className="rounded-xl bg-white/90 p-2 text-danger-500 transition-colors hover:bg-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                    {m.filename}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatSize(m.size)} · {formatDateTime(m.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
