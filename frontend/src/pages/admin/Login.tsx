import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Field'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/admin'

  const mutation = useMutation({
    mutationFn: () => authApi.login(username, password),
    onSuccess: (res) => {
      setAuth(res.token, res.username)
      navigate(from, { replace: true })
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-[#f6faf4] p-4 dark:bg-[#0b120d]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl"
      />

      <form
        onSubmit={submit}
        className="animate-fade-up relative w-full max-w-sm rounded-3xl border border-brand-100 bg-white/90 p-8 shadow-2xl shadow-brand-900/5 backdrop-blur-xl dark:border-[#24382a] dark:bg-[#101811]/90"
      >
        <div className="mb-7 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 font-serif text-2xl font-bold text-white shadow-lg shadow-brand-500/30">
            B
          </span>
          <div className="text-center">
            <h1 className="font-serif text-xl font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
              Admin
            </h1>
            <p className="mt-1 text-xs text-slate-400">Sign in to manage your blog</p>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Username">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your username"
              className="h-11"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11"
            />
          </Field>
        </div>

        {mutation.isError && (
          <p className="mt-4 rounded-xl bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
            {(mutation.error as Error).message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending}
          className="mt-6 h-11 w-full text-sm font-semibold"
        >
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </div>
  )
}
