import { useEffect, useState, type RefObject } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  containerRef: RefObject<HTMLElement>
  contentKey: string
}

export default function Toc({ containerRef, contentKey }: Props) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll('h1, h2, h3')) as HTMLElement[]
    const list = nodes
      .filter((n) => n.id)
      .map((n) => ({
        id: n.id,
        text: (n.textContent ?? '').replace(/#$/, '').trim(),
        level: Number(n.tagName[1]),
      }))
    setItems(list)
    setActiveId(list[0]?.id ?? '')

    if (list.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [containerRef, contentKey])

  if (items.length === 0) return null

  return (
    <nav className="text-sm">
      <p className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Contents</p>
      <ul className="space-y-2 border-l border-slate-200 dark:border-slate-700">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={`-ml-px block border-l-2 py-0.5 pl-3 transition-colors ${
                activeId === item.id
                  ? 'border-brand-500 font-medium text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
