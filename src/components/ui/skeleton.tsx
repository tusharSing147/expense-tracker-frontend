import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-shimmer rounded-sm bg-surface-sunken", className)}
      {...props}
    />
  )
}

export { Skeleton }
