import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`animate-fade-up relative w-full max-w-md rounded-2xl border border-brand-100 bg-white shadow-2xl dark:border-[#24382a] dark:bg-[#101811] ${className ?? ''}`}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-brand-50 hover:text-slate-600 dark:hover:bg-[#16201399]"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className={title ? 'px-6 pb-6 pt-4' : 'p-6'}>{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-brand-100 px-6 py-4 dark:border-[#24382a]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
