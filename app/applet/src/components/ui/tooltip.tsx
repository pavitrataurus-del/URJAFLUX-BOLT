import * as React from "react"
import { cn } from "../../lib/utils"

// A simple accessible tooltip placeholder using standard title attribute
// For a production app, this would use @radix-ui/react-tooltip
export const Tooltip = ({ 
  children, 
  content,
  className 
}: { 
  children: React.ReactNode, 
  content: string,
  className?: string
}) => {
  return (
    <div className={cn("group relative inline-block", className)} title={content}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background shadow-sm">
          {content}
        </div>
      </div>
    </div>
  )
}
