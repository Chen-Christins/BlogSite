import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select',
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const activeIndex = options.findIndex((o) => o.value === value)

  const commit = (idx: number) => {
    if (idx < 0 || idx >= options.length) return
    onChange(options[idx].value)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(activeIndex)
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(active)
    }
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setActive(activeIndex)
          setOpen((v) => !v)
        }}
        onKeyDown={onKeyDown}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border px-3.5 text-left text-sm outline-none transition-colors focus:ring-4 focus:ring-brand-500/10 disabled:opacity-60 ${
          open
            ? 'border-brand-400 bg-white dark:bg-[#0d150f]'
            : 'border-brand-100 bg-brand-50/40 hover:bg-brand-50 dark:border-[#24382a] dark:bg-[#0d150f] dark:hover:bg-[#16201399]'
        }`}
      >
        <span className={selected ? 'text-slate-700 dark:text-slate-100' : 'text-slate-400'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-fade-in absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-brand-100 bg-white p-1 shadow-[0_12px_32px_#163b3820] dark:border-[#24382a] dark:bg-[#101811]">
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-400">No options</p>
          )}
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => commit(i)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                i === active
                  ? 'bg-brand-50 text-brand-700 dark:bg-[#16201399] dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={15} className="shrink-0 text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
