import { useEffect, useRef } from 'react'

// Adds .is-visible when the element scrolls into view. CSS handles the rest
// (and switches itself off under prefers-reduced-motion).
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}
