import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function IconButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  // 44px per AGENTS.md / iOS HIG (deviates from 38px design spec at 04-design-rules.md:103)
  return (
    <button
      className={`min-w-[44px] min-h-[44px] w-11 h-11 bg-surface border border-line flex items-center justify-center text-text transition enabled:hover:bg-surface-2 disabled:opacity-40 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
