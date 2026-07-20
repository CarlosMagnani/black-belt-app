import { useRef, useState, useCallback } from 'react'
import { ArrowRightIcon } from './Icons'

const THUMB_SIZE = 64

const SNAP_TOLERANCE = 4

const CONFIRM_DELAY_MS = 180

const SNAP_TRANSITION_MS = 250

type SlideToConfirmProps = {
  label: string
  confirmLabel?: string
  onConfirm: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function SlideToConfirm({
  label,
  confirmLabel,
  onConfirm,
  isLoading = false,
  disabled = false,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumbX, setThumbX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [maxX, setMaxX] = useState(0)

  const updateMax = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const nextMax = Math.max(0, track.clientWidth - THUMB_SIZE)
    setMaxX(nextMax)
    setThumbX((current) => Math.min(current, nextMax))
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || isLoading) return
      updateMax()
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    },
    [disabled, isLoading, updateMax]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging || disabled || isLoading) return
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const pointerX = event.clientX - rect.left - THUMB_SIZE / 2
      const nextX = Math.max(0, Math.min(maxX, pointerX))
      setThumbX(nextX)
    },
    [dragging, disabled, isLoading, maxX]
  )

  const handlePointerUp = useCallback(() => {
    if (!dragging) return
    setDragging(false)
    if (thumbX >= maxX - SNAP_TOLERANCE) {
      setThumbX(maxX)
      window.setTimeout(() => {
        onConfirm()
      }, CONFIRM_DELAY_MS)
    } else {
      setThumbX(0)
    }
  }, [dragging, thumbX, maxX, onConfirm])

  const canInteract = !disabled && !isLoading
  const labelOpacity = maxX > 0 ? Math.max(0, 1 - thumbX / maxX) : 1

  return (
    <div>
      <div
        ref={trackRef}
        className="relative h-16 overflow-hidden border border-line bg-surface select-none touch-none"
        aria-label={confirmLabel || label}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={maxX}
        aria-valuenow={thumbX}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: thumbX + THUMB_SIZE,
            background: 'linear-gradient(90deg, var(--color-red-deep), transparent)',
            opacity: 0.25,
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: labelOpacity }}
        >
          <span className="font-display text-[14px] uppercase tracking-[0.01em] text-text-2">
            {label}
          </span>
        </div>
        <div
          className={`absolute top-0 left-0 w-16 h-16 bg-red flex items-center justify-center text-text transition-transform ${
            canInteract ? '' : 'opacity-40'
          }`}
          style={{
            transform: `translateX(${thumbX}px)`,
            transitionDuration: dragging ? '0ms' : `${SNAP_TRANSITION_MS}ms`,
            boxShadow: '0 0 24px var(--color-red-glow)',
          }}
          onPointerDown={handlePointerDown}
        >
          {isLoading ? (
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-text rounded-full animate-[dot-blink_1.2s_infinite_ease-in-out]" />
              <span className="w-1.5 h-1.5 bg-text rounded-full animate-[dot-blink_1.2s_infinite_ease-in-out_200ms]" />
              <span className="w-1.5 h-1.5 bg-text rounded-full animate-[dot-blink_1.2s_infinite_ease-in-out_400ms]" />
            </div>
          ) : (
            <ArrowRightIcon className="w-[22px] h-[22px]" strokeWidth={2.2} />
          )}
        </div>
      </div>
      <p className="mt-2.5 text-center font-mono text-[10px] text-muted tracking-[0.15em] uppercase">
        OSS · CHEGUE 10MIN ANTES
      </p>
    </div>
  )
}

export type { SlideToConfirmProps }
