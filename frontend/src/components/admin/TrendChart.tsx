import { useEffect, useRef, useState } from 'react'
import type { DailyPoint } from '@/api/types'

interface Props {
  data: DailyPoint[]
  height?: number
}

interface Point {
  x: number
  y: number
  value: number
  date: string
}

function catmullRom(pts: Point[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function niceMax(v: number): number {
  if (v <= 5) return 5
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

export default function TrendChart({ data, height = 240 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pad = { top: 18, right: 14, bottom: 26, left: 30 }
  const innerW = Math.max(0, width - pad.left - pad.right)
  const innerH = height - pad.top - pad.bottom
  const max = niceMax(Math.max(...data.map((d) => d.count), 0))

  const points: Point[] = data.map((d, i) => ({
    x: pad.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2),
    y: pad.top + innerH - (max > 0 ? (d.count / max) * innerH : 0),
    value: d.count,
    date: d.date,
  }))

  const line = catmullRom(points)
  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`
      : ''

  const gridCount = 4
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const y = pad.top + (innerH / gridCount) * i
    const value = Math.round(max - (max / gridCount) * i)
    return { y, value }
  })

  const labelEvery = Math.max(1, Math.ceil(data.length / 6))

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x)
      if (dist < best) {
        best = dist
        nearest = i
      }
    })
    setHover(nearest)
  }

  const h = hover !== null ? points[hover] : null

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="30-day view trend"
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-brand-500)" />
              <stop offset="100%" stopColor="var(--color-brand-400)" />
            </linearGradient>
          </defs>

          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={g.y}
                y2={g.y}
                className="stroke-brand-100 dark:stroke-[#24382a]"
                strokeWidth={1}
                strokeDasharray={i === gridCount ? '0' : '3 5'}
              />
              <text
                x={pad.left - 8}
                y={g.y + 3}
                textAnchor="end"
                className="fill-slate-400"
                fontSize={10}
              >
                {g.value}
              </text>
            </g>
          ))}

          {area && <path d={area} fill="url(#trendFill)" />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke="url(#trendStroke)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400"
                fontSize={10}
              >
                {p.date.slice(5)}
              </text>
            ) : null,
          )}

          {h && (
            <g>
              <line
                x1={h.x}
                x2={h.x}
                y1={pad.top}
                y2={pad.top + innerH}
                className="stroke-brand-400"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={h.x}
                cy={h.y}
                r={5}
                fill="var(--color-brand-500)"
                className="stroke-white dark:stroke-[#101811]"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      )}

      {h && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-brand-100 bg-white px-2.5 py-1.5 text-center shadow-lg dark:border-[#24382a] dark:bg-[#101811]"
          style={{
            left: Math.min(Math.max(h.x, 44), width - 44),
            top: h.y - 12,
          }}
        >
          <p className="text-[11px] text-slate-400">{h.date}</p>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {h.value} views
          </p>
        </div>
      )}
    </div>
  )
}
