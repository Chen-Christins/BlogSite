import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminTagApi, publicApi } from '@/api'
import type { Tag } from '@/api/types'
import { ErrorState, Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Field'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

export default function TagsAdmin() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tags'],
    queryFn: publicApi.tags,
  })

  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Tag | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tags'] })

  const create = useMutation({
    mutationFn: () => adminTagApi.create({ name }),
    onSuccess: () => {
      setName('')
      invalidate()
      toast.success('Tag created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const update = useMutation({
    mutationFn: (t: Tag) => adminTagApi.update(t.id, editing!),
    onSuccess: () => {
      setEditing(null)
      invalidate()
      toast.success('Tag updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const remove = useMutation({
    mutationFn: (id: number) => adminTagApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Tag deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onDelete = async (t: Tag) => {
    const ok = await confirm({
      title: `Delete tag "${t.name}"?`,
      description: 'Posts are not deleted, only this tag is removed.',
      confirmText: 'Delete',
      danger: true,
    })
    if (ok) remove.mutate(t.id)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
        Tags
      </h1>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 dark:border-[#24382a] dark:bg-[#101811]">
        <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">New tag</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Tag name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
              className="w-60"
            />
          </Field>
          <Button
            variant="primary"
            onClick={() => create.mutate()}
            disabled={!name.trim() || create.isPending}
            className="h-10"
          >
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <div className="flex flex-wrap gap-2.5">
          {data.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-2 rounded-full border border-brand-100 bg-white py-1.5 pl-3.5 pr-2 text-sm transition-colors hover:border-brand-300 dark:border-[#24382a] dark:bg-[#101811]"
            >
              {editing?.id === t.id ? (
                <>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    autoFocus
                    className="h-7 w-28 rounded-lg border border-brand-200 bg-brand-50/50 px-2 text-sm outline-none focus:border-brand-400 dark:border-[#24382a] dark:bg-[#0d150f]"
                  />
                  <button
                    type="button"
                    onClick={() => update.mutate(t)}
                    className="text-xs font-medium text-brand-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    #{t.name}
                  </span>
                  <span className="rounded-full bg-brand-50 px-1.5 text-xs text-brand-600 dark:bg-[#16201399] dark:text-brand-400">
                    {t.post_count ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="text-slate-300 transition-colors hover:text-brand-600"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t)}
                    className="text-slate-300 transition-colors hover:text-danger-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
