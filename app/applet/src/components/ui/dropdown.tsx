import * as React from "react"
import { cn } from "../../lib/utils"

// A simple native select placeholder for a Dropdown
// For a production app, this would use @radix-ui/react-dropdown-menu or similar
export const Dropdown = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Dropdown.displayName = "Dropdown"
