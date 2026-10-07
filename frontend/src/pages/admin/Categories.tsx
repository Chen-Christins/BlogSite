import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminCategoryApi, publicApi } from '@/api'
import type { Category } from '@/api/types'
import { ErrorState, Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Field'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

export default function CategoriesAdmin() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: publicApi.categories,
  })

  const [form, setForm] = useState({ name: '', slug: '', description: '', sort: 0 })
  const [editing, setEditing] = useState<Category | null>(null)

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] })

  const create = useMutation({
    mutationFn: () => adminCategoryApi.create(form),
    onSuccess: () => {
      setForm({ name: '', slug: '', description: '', sort: 0 })
      invalidate()
      toast.success('Category created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const update = useMutation({
    mutationFn: (c: Category) => adminCategoryApi.update(c.id, editing!),
    onSuccess: () => {
      setEditing(null)
      invalidate()
      toast.success('Category updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const remove = useMutation({
    mutationFn: (id: number) => adminCategoryApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Category deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const onDelete = async (c: Category) => {
    const ok = await confirm({
      title: `Delete category "${c.name}"?`,
      description: 'Posts in this category are not deleted, they become uncategorized.',
      confirmText: 'Delete',
      danger: true,
    })
    if (ok) remove.mutate(c.id)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
        Categories
      </h1>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 dark:border-[#24382a] dark:bg-[#101811]">
        <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">
          New category
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
            />
          </Field>
          <Field label="Slug">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Leave blank to auto-generate"
            />
          </Field>
          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
          </Field>
          <Field label="Order">
            <Input
              type="number"
              value={form.sort}
              onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
            />
          </Field>
          <Button
            variant="primary"
            onClick={() => create.mutate()}
            disabled={!form.name.trim() || create.isPending}
            className="h-10"
          >
            <Plus size={16} /> Add
          </Button>
        </div>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorState message={(error as Error).message} />}

      {data && (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white dark:border-[#24382a] dark:bg-[#101811]">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 text-left text-xs text-slate-400 dark:border-[#24382a]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 text-center font-medium">Slug</th>
                <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Description</th>
                <th className="px-4 py-3 text-center font-medium">Posts</th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50 dark:divide-[#1c2a1b]">
              {data.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-brand-50/40 dark:hover:bg-[#16201399]">
                  {editing?.id === c.id ? (
                    <>
                      <td className="px-4 py-2">
                        <Input
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          className="h-9"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={editing.slug}
                          onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                          className="h-9"
                        />
                      </td>
                      <td className="hidden px-4 py-2 sm:table-cell">
                        <Input
                          value={editing.description}
                          onChange={(e) =>
                            setEditing({ ...editing, description: e.target.value })
                          }
                          className="h-9"
                        />
                      </td>
                      <td className="px-4 py-2 text-center text-slate-400">{c.post_count ?? 0}</td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center gap-1">
                          <Button variant="primary" size="sm" onClick={() => update.mutate(c)}>
                            Save
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                            <X size={15} />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{c.slug}</td>
                      <td className="hidden max-w-xs truncate px-4 py-3 text-center text-slate-500 dark:text-slate-400 sm:table-cell">
                        {c.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-6 justify-center rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-[#16201399] dark:text-brand-400">
                          {c.post_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(c)}
                            className="hover:bg-danger-500/10 hover:text-danger-500"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
