import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { adminSettingApi, publicApi } from '@/api'
import type { Settings } from '@/api/types'
import { Loading } from '@/components/StateViews'
import Button from '@/components/ui/Button'
import { Input, Textarea, Field } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

const fields: { key: string; label: string; textarea?: boolean; placeholder?: string }[] = [
  { key: 'site_title', label: 'Site title', placeholder: 'Shown in the header and page title' },
  { key: 'site_subtitle', label: 'Subtitle', placeholder: 'A line below the home title' },
  { key: 'site_description', label: 'Site description', textarea: true, placeholder: 'Used for SEO and the about page' },
  { key: 'site_keywords', label: 'Keywords', placeholder: 'Comma separated, for SEO' },
  { key: 'footer_text', label: 'Footer text' },
  { key: 'icp', label: 'ICP license' },
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: publicApi.settings,
  })
  const [form, setForm] = useState<Settings>({})

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const update = useMutation({
    mutationFn: () => adminSettingApi.update(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Site settings saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
          Site settings
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <Button variant="primary" onClick={() => update.mutate()} disabled={update.isPending}>
            <Save size={16} /> Save
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid gap-5 rounded-2xl border border-brand-100 bg-white p-6 dark:border-[#24382a] dark:bg-[#101811] sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
              <Field label={f.label}>
                {f.textarea ? (
                  <Textarea
                    value={form[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={form[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
              </Field>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
