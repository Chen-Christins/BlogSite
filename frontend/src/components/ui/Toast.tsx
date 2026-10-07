import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const styles: Record<
  ToastType,
  { icon: typeof CheckCircle2; bar: string; iconCls: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-brand-500',
    iconCls: 'text-brand-600 dark:text-brand-400',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-danger-500',
    iconCls: 'text-danger-500',
  },
  info: {
    icon: Info,
    bar: 'bg-sky-500',
    iconCls: 'text-sky-500',
  },
}

function Toast({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: () => void
}) {
  const { icon: Icon, bar, iconCls } = styles[item.type]
  return (
    <div className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-brand-100 bg-white/95 px-4 py-3 shadow-[0_12px_32px_#163b3820] backdrop-blur-xl dark:border-[#24382a] dark:bg-[#101811]/95">
      <span className={`mt-0.5 shrink-0 ${iconCls}`}>
        <Icon size={18} />
      </span>
      <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {item.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="-mr-1 -mt-1 shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-brand-50 hover:text-slate-600 dark:hover:bg-[#16201399]"
      >
        <X size={15} />
      </button>
      <span className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${bar} opacity-70`} />
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (!message) return
      const id = ++idRef.current
      setToasts((list) => [...list, { id, type, message }])
      setTimeout(() => remove(id), 3200)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id} className="relative w-full max-w-sm">
            <Toast item={t} onClose={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
