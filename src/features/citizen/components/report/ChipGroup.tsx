interface ChipOption<T extends string> {
  value: T
  label: string
}

interface SingleSelectProps<T extends string> {
  multiple?: false
  options: ChipOption<T>[]
  value: T | null
  onChange: (value: T) => void
}

interface MultiSelectProps<T extends string> {
  multiple: true
  options: ChipOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
}

export function ChipGroup<T extends string>(props: SingleSelectProps<T> | MultiSelectProps<T>) {
  const { options } = props

  function isSelected(v: T) {
    return props.multiple ? props.value.includes(v) : props.value === v
  }

  function toggle(v: T) {
    if (props.multiple) {
      const set = new Set(props.value)
      if (set.has(v)) set.delete(v)
      else set.add(v)
      props.onChange(Array.from(set))
    } else {
      props.onChange(v)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = isSelected(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            aria-pressed={active}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                : 'border-mist-200 text-ink-700 hover:bg-mist-50'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
