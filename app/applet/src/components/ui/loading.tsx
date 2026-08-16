import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

const LoadingSpinner = ({ className, size = "default" }: { className?: string, size?: "default" | "sm" | "lg" }) => {
  return (
    <Loader2 
      className={cn("animate-spin text-brand", {
        "w-4 h-4": size === "sm",
        "w-6 h-6": size === "default",
        "w-10 h-10": size === "lg",
      }, className)} 
    />
  )
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-elevated", className)}
      {...props}
    />
  )
}

export { LoadingSpinner, Skeleton }
