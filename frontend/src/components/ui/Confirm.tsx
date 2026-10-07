import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import Modal from './Modal'
import Button from './Button'

interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))

export function useConfirm() {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ConfirmOptions>({ title: '' })
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    setOpts(options)
    setOpen(true)
    return new Promise<boolean>((resolve) => setResolver(() => resolve))
  }, [])

  const close = (value: boolean) => {
    setOpen(false)
    resolver?.(value)
    setResolver(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={open}
        onClose={() => close(false)}
        title={opts.title}
        description={opts.description}
        className="max-w-sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              {opts.cancelText || 'Cancel'}
            </Button>
            <Button
              variant={opts.danger ? 'danger' : 'primary'}
              onClick={() => close(true)}
            >
              {opts.confirmText || 'Confirm'}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  )
}
