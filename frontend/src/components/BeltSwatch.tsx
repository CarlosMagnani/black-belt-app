import { beltColor } from '../utils/beltColor'

export function BeltSwatch({ belt }: { belt: string }) {
  const color = beltColor(belt)
  const isBlack = belt === 'black'

  return (
    <div
      className="relative w-[22px] h-[8px] shrink-0"
      style={{ backgroundColor: color }}
    >
      {isBlack && (
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-red" />
      )}
    </div>
  )
}
