import { useSettings } from '@/hooks/useSettings'

const stack = ['Go', 'Gin', 'PostgreSQL', 'React', 'Vite', 'TailwindCSS']

export default function About() {
  const { data: settings } = useSettings()
  const title = settings?.site_title || 'Blog'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="animate-fade-up rounded-3xl border border-brand-100 bg-white p-8 dark:border-[#24382a] dark:bg-[#101811]">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 font-serif text-2xl font-bold text-white shadow-lg shadow-brand-500/25">
            {title.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-[1px] text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="text-sm text-slate-400">
              {settings?.site_subtitle || 'Notes on tech and life'}
            </p>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-slate-600 dark:text-slate-300">
          {settings?.site_description || 'A personal blog built with Go and React.'}
        </p>
        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
          You can subscribe to updates via
          <a
            href="/rss.xml"
            className="mx-1 font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            RSS
          </a>
          .
        </p>

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tech stack
          </p>
          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <span
                key={s}
                className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
