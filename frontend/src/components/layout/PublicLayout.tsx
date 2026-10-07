import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function PublicLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative isolate flex min-h-full flex-col overflow-clip bg-[#f6faf4] text-slate-800 dark:bg-[#0b120d] dark:text-slate-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 select-none">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-500/[0.06] to-transparent" />
        <div className="animate-sway absolute -left-24 bottom-[-10%] hidden h-[420px] w-[420px] rounded-full bg-brand-400/10 blur-3xl md:block" />
        <div
          className="animate-sway absolute -right-20 top-[6%] hidden h-[360px] w-[360px] rounded-full bg-brand-300/10 blur-3xl md:block"
          style={{ animationDelay: '-6s' }}
        />
      </div>

      <div className="relative z-10 flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-10 pt-[88px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
