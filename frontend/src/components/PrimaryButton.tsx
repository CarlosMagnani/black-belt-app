import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean; children: ReactNode }
>(function PrimaryButton({ children, className = '', fullWidth = false, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`min-h-[56px] bg-red text-text font-display uppercase text-[15px] tracking-[0.01em] px-4 transition enabled:hover:-translate-y-px enabled:hover:shadow-[0_0_28px_var(--color-red-glow)] disabled:opacity-40 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
})
