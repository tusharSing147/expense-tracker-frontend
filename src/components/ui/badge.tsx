import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-3 py-0.5 text-sm leading-none font-medium whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-accent-soft text-accent-soft-ink [a]:hover:bg-accent [a]:hover:text-ink-on-accent",
        secondary:
          "border-line bg-surface-sunken text-ink-muted [a]:hover:bg-line",
        destructive:
          "bg-negative-soft text-negative-ink [a]:hover:bg-negative [a]:hover:text-ink-on-accent",
        outline:
          "border-caution/40 bg-caution-soft text-caution-ink [a]:hover:bg-caution [a]:hover:text-ink-on-accent",
        ghost:
          "bg-transparent text-ink-muted hover:bg-surface-sunken",
        link: "text-accent underline-offset-4 hover:underline",
        ok: "bg-positive-soft text-positive-ink",
        warn: "bg-caution-soft text-caution-ink",
        over: "bg-negative-soft text-negative-ink",
        neutral: "border-line bg-surface-sunken text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
