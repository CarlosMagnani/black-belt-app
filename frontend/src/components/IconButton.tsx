import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function IconButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`w-[38px] h-[38px] bg-surface border border-line flex items-center justify-center text-text transition enabled:hover:bg-surface-2 disabled:opacity-40 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
