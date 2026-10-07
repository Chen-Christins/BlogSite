import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload, ImagePlus } from 'lucide-react'
import { adminMediaApi } from '@/api'
import type { Media } from '@/api/types'
import { Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (media: Media) => void
}

export default function MediaPicker({ open, onClose, onSelect }: Props) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'media', 1],
    queryFn: () => adminMediaApi.list({ page: 1, size: 50 }),
    enabled: open,
  })

  const upload = useMutation({
    mutationFn: (file: File) => adminMediaApi.upload(file),
    onSuccess: (media) => {
      qc.invalidateQueries({ queryKey: ['admin', 'media'] })
      onSelect(media)
    },
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select media"
      className="max-w-3xl"
      footer={
        <Button variant="primary" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> Upload image
        </Button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload.mutate(f)
          e.target.value = ''
        }}
      />

      {isLoading ? (
        <Loading />
      ) : data && data.list.length > 0 ? (
        <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {data.list.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className="group overflow-hidden rounded-xl border border-brand-100 transition-colors hover:border-brand-400 dark:border-[#24382a]"
            >
              <img
                src={m.thumb_url || m.url}
                alt={m.filename}
                className="h-24 w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
          <ImagePlus size={24} className="text-brand-400" />
          <span className="text-sm">The media library is empty. Upload an image first.</span>
        </div>
      )}
    </Modal>
  )
}
