import { ArrowUp, Github, Rss } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'

const siteLinks = [
  { to: '/', label: 'Home' },
  { to: '/archive', label: 'Archive' },
  { to: '/tags', label: 'Tags' },
  { to: '/about', label: 'About' },
]

export default function Footer() {
  const { data: settings } = useSettings()
  const year = new Date().getFullYear()
  const title = settings?.site_title || 'Blog'

  return (
    <footer className="relative z-10 mx-auto mt-20 w-[90%] max-w-5xl">
      <div className="grid gap-10 border-t border-brand-100 pt-10 dark:border-[#24382a] sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-gradient-to-br from-brand-500 to-brand-600 font-serif text-base font-bold text-white">
              {title.slice(0, 1)}
            </span>
            <strong className="font-serif text-[20px] font-bold tracking-[2px] text-slate-900 dark:text-slate-100">
              {title}
            </strong>
          </Link>
          <p className="mt-4 max-w-[280px] text-[13px] leading-[1.7] text-slate-500 dark:text-slate-400">
            {settings?.site_subtitle || settings?.site_description || 'Notes on tech and life'}
          </p>
          <span className="mt-3 inline-block text-[11px] tracking-[.5px] text-slate-400">
            {settings?.site_description ? '' : 'Built with Go and React'}
          </span>
        </div>

        <nav>
          <h2 className="text-[11px] font-semibold tracking-[1.5px] text-slate-700 dark:text-slate-300">
            Site
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
            {siteLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h2 className="text-[11px] font-semibold tracking-[1.5px] text-slate-700 dark:text-slate-300">
            Follow
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
            <li>
              <a
                href="/rss.xml"
                className="flex items-center gap-2 text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                <Rss size={15} /> RSS
              </a>
            </li>
            <li>
              <a
                href="/admin"
                className="flex items-center gap-2 text-slate-500 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
              >
                <Github size={15} /> Admin
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-brand-100 py-5 text-[11px] text-slate-400 dark:border-[#24382a] sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {year} {title}
          {settings?.icp && (
            <>
              {' · '}
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-brand-600"
              >
                {settings.icp}
              </a>
            </>
          )}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-serif tracking-[.5px]">A journey of a thousand miles begins with a single step.</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-brand-600"
          >
            <ArrowUp size={13} /> Top
          </button>
        </div>
      </div>
    </footer>
  )
}
