import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

import { useFieldContext } from "@/components/ui/field-context"

function Input({
  className,
  type,
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedByProp,
  ...props
}: React.ComponentProps<"input">) {
  const field = useFieldContext()

  const describedBy =
    [ariaDescribedByProp, field?.hintId, field?.errorId].filter(Boolean).join(" ") ||
    undefined
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid || undefined)

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-line-strong bg-surface px-[var(--space-3)] text-md leading-none font-normal text-ink transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-focus)_28%,transparent)] focus-visible:outline-none aria-invalid:border-negative file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-45",
        className
      )}
      {...props}
    />
  )
}

export { Input }
