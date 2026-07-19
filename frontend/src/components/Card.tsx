import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`bg-surface border border-line ${className}`} {...props}>
      {children}
    </div>
  )
}
