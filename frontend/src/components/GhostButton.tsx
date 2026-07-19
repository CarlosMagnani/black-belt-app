import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function GhostButton({
  children,
  className = '',
  fullWidth = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean; children: ReactNode }) {
  return (
    <button
      className={`min-h-[50px] border border-line-2 bg-transparent text-text-2 font-display uppercase text-[14px] tracking-[0.01em] px-4 transition enabled:hover:bg-surface-2 disabled:opacity-40 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
