import * as React from "react"
import { cn } from "cn"

import { useFieldContext } from "@/components/ui/field-context"

function Textarea({
  className,
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedByProp,
  ...props
}: React.ComponentProps<"textarea">) {
  const field = useFieldContext()

  const describedBy =
    [ariaDescribedByProp, field?.hintId, field?.errorId].filter(Boolean).join(" ") ||
    undefined
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid || undefined)

  return (
    <textarea
      data-slot="textarea"
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
      className={cn(
        "flex min-h-16 w-full rounded-sm border border-line-strong bg-surface px-[var(--space-3)] py-2 text-md font-normal text-ink transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none placeholder:text-ink-subtle hover:border-ink-subtle focus-visible:border-focus focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-focus)_28%,transparent)] focus-visible:outline-none aria-invalid:border-negative disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-45 field-sizing-content",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
