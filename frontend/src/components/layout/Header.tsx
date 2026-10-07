import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useSettings } from '@/hooks/useSettings'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/archive', label: 'Archive' },
  { to: '/tags', label: 'Tags' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const { data: settings } = useSettings()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const title = settings?.site_title || 'Blog'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setOpen(false)
    }
  }

  return (
    <header
      className={`fixed left-1/2 top-2.5 z-40 h-[58px] w-[calc(100%-20px)] -translate-x-1/2 rounded-[17px] border border-brand-100 bg-white/85 backdrop-blur-xl transition-shadow duration-300 dark:border-[#24382a] dark:bg-[#101811]/85 md:top-3.5 md:w-[min(1120px,calc(100%-40px))] ${
        scrolled ? 'shadow-[0_6px_26px_#254b3520]' : 'shadow-[0_6px_26px_#254b3510]'
      }`}
    >
      <div className="flex h-full items-center justify-between gap-3 px-3.5 md:px-5">
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-gradient-to-br from-brand-500 to-brand-600 font-serif text-base font-bold text-white shadow-sm">
            {title.slice(0, 1)}
          </span>
          <strong className="font-serif text-[20px] font-bold tracking-[2px] text-slate-900 dark:text-slate-100">
            {title}
          </strong>
          <span className="hidden font-serif text-[13px] tracking-[1px] text-slate-400 sm:inline">
            Blog
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] font-medium md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center py-2 transition-colors ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <form onSubmit={submit} className="hidden md:block">
            <div className="group relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-40 rounded-full border border-brand-100 bg-brand-50/70 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:w-52 focus:border-brand-400 focus:bg-white dark:border-[#24382a] dark:bg-[#0d150f]"
              />
            </div>
          </form>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 dark:text-slate-400 dark:hover:bg-[#16201399] md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in absolute left-0 right-0 top-[65px] rounded-[14px] border border-brand-100 bg-white p-2 shadow-[0_8px_24px_#163b3812] dark:border-[#24382a] dark:bg-[#101811] md:hidden">
          <form onSubmit={submit} className="mb-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts"
                className="h-10 w-full rounded-xl border border-brand-100 bg-brand-50/70 pl-9 pr-3 text-sm outline-none focus:border-brand-400 dark:border-[#24382a] dark:bg-[#0d150f]"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-[#16201399] dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
