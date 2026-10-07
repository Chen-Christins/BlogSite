import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-slate-50 py-28 text-center dark:bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div className="animate-fade-up relative">
        <p className="bg-gradient-to-br from-brand-500 to-violet-500 bg-clip-text text-8xl font-extrabold text-transparent">
          404
        </p>
        <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">
          Page not found
        </p>
        <p className="mt-2 text-sm text-slate-400">
          The page you are looking for does not exist or has moved
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-700"
        >
          <Home size={16} /> Back home
        </Link>
      </div>
    </div>
  )
}
