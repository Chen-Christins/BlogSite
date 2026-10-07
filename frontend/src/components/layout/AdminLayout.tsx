import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ExternalLink,
  FileText,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  LogOut,
  Menu,
  MessageSquare,
  PenSquare,
  Settings as SettingsIcon,
  Tags as TagsIcon,
  X,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores/auth'

const items = [
  { to: '/admin', end: true, label: 'Dashboard', icon: Gauge },
  { to: '/admin/posts', end: false, label: 'Posts', icon: FileText },
  { to: '/admin/posts/new', end: true, label: 'New Post', icon: PenSquare },
  { to: '/admin/media', label: 'Media', icon: ImageIcon },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/tags', label: 'Tags', icon: TagsIcon },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
]

function isActivePath(to: string, end: boolean | undefined, pathname: string): boolean {
  // The posts list and the edit page (/admin/posts/:id) highlight "Posts",
  // while the create page /admin/posts/new only highlights "New Post".
  if (to === '/admin/posts') {
    return pathname === '/admin/posts' || /^\/admin\/posts\/\d+$/.test(pathname)
  }
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = isActivePath(item.to, item.end, pathname)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-600 hover:bg-brand-50 dark:text-slate-400 dark:hover:bg-[#16201399]'
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminLayout() {
  const logout = useAuthStore((s) => s.logout)
  const username = useAuthStore((s) => s.username)
  const navigate = useNavigate()
  const [drawer, setDrawer] = useState(false)

  const doLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-full bg-[#f6faf4] dark:bg-[#0b120d]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-brand-100 bg-white p-4 dark:border-[#24382a] dark:bg-[#101811] md:flex">
        <div className="mb-7 flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-brand-500/25">
            B
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Blog Admin</p>
            <p className="text-[11px] text-slate-400">Content</p>
          </div>
        </div>
        <NavItems />
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition-colors hover:bg-brand-50 dark:hover:bg-[#16201399]"
        >
          <ExternalLink size={17} /> View site
        </a>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <aside className="animate-fade-in absolute left-0 top-0 flex h-full w-64 flex-col bg-white p-4 dark:bg-[#101811]">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100">Blog Admin</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 dark:hover:bg-[#16201399]"
              >
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-100 bg-white/80 px-4 backdrop-blur-xl dark:border-[#24382a] dark:bg-[#101811]/80">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 dark:hover:bg-[#16201399] md:hidden"
          >
            <Menu size={18} />
          </button>
          <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
            {username ? `Hi, ${username}` : 'Admin'}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={doLogout}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-brand-50 dark:text-slate-400 dark:hover:bg-[#16201399]"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
