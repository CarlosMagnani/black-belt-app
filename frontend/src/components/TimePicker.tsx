type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  name?: string
  error?: string
}

export function TimePicker({ value, onChange, name, error }: TimePickerProps) {
  return (
    <div>
      <input
        type="time"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[56px] w-full bg-surface border border-line px-4 text-[17px] text-text outline-none focus:border-red"
      />
      {error && <p className="mt-2 text-[12px] text-red">{error}</p>}
    </div>
  )
}
