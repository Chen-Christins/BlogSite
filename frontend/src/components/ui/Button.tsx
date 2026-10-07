import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'dangerSoft'
type Size = 'sm' | 'md' | 'icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'border-transparent bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 hover:opacity-95',
  outline:
    'border-brand-100 bg-white text-slate-600 hover:bg-brand-50 dark:border-[#24382a] dark:bg-[#101811] dark:text-slate-300 dark:hover:bg-[#16201399]',
  ghost:
    'border-transparent text-slate-500 hover:bg-brand-50/70 dark:text-slate-400 dark:hover:bg-[#16201399]',
  danger:
    'border-transparent bg-danger-500 text-white shadow-lg shadow-danger-500/20 hover:opacity-95',
  dangerSoft:
    'border-transparent bg-danger-500/10 text-danger-500 hover:bg-danger-500/20',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-1.5',
  icon: 'h-9 w-9 p-0',
}

export default function Button({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl border font-medium transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 disabled:pointer-events-none disabled:opacity-55 ${variants[variant]} ${sizes[size]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
