import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent bg-clip-padding text-base leading-none font-semibold whitespace-nowrap transition-all select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-negative [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-ink-on-accent hover:bg-accent-hover active:bg-accent-pressed",
        primary:
          "bg-accent text-ink-on-accent hover:bg-accent-hover active:bg-accent-pressed",
        outline:
          "border-line-strong bg-transparent text-ink hover:bg-surface-sunken aria-expanded:bg-surface-sunken",
        secondary:
          "border-line-strong bg-transparent text-ink hover:bg-surface-sunken aria-expanded:bg-surface-sunken",
        quiet:
          "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink aria-expanded:bg-surface-sunken",
        ghost:
          "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink aria-expanded:bg-surface-sunken",
        destructive:
          "bg-negative text-ink-on-accent hover:bg-negative-ink active:bg-negative-ink",
        danger:
          "bg-negative text-ink-on-accent hover:bg-negative-ink active:bg-negative-ink",
        link: "bg-transparent text-accent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[38px] px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-[42px] px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-[38px] p-0",
        "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 p-0",
        "icon-lg": "size-[42px] p-0",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        class: "h-auto border-transparent px-0 py-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
