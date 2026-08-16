import * as React from "react"
import { Command } from "cmdk"
import { Search, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

export const CommandPalette = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <Command label="Global Command Palette" className="flex flex-col w-full h-full">
          <div className="flex items-center border-b border-border px-4 py-3">
            <Search className="w-5 h-5 text-foreground-muted mr-3" />
            <Command.Input 
              autoFocus
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground-muted text-lg" 
              placeholder="Search commands, projects, or experts... (Ctrl+Shift+P)" 
            />
            <button onClick={() => onOpenChange(false)} className="text-xs text-foreground-muted border border-border rounded px-2 py-1 bg-elevated hover:bg-border transition-colors">ESC</button>
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-foreground-muted">No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs font-semibold text-foreground-muted mb-2 px-2 pt-2">
              <Command.Item className="flex items-center px-3 py-2 rounded-md hover:bg-elevated cursor-pointer text-sm text-foreground my-1 aria-selected:bg-elevated">Go to Dashboard</Command.Item>
              <Command.Item className="flex items-center px-3 py-2 rounded-md hover:bg-elevated cursor-pointer text-sm text-foreground my-1 aria-selected:bg-elevated">Go to Projects</Command.Item>
            </Command.Group>
            
            <Command.Group heading="Actions" className="text-xs font-semibold text-foreground-muted mb-2 px-2 pt-2">
              <Command.Item className="flex items-center px-3 py-2 rounded-md hover:bg-elevated cursor-pointer text-sm text-foreground my-1 aria-selected:bg-elevated">Create New Project</Command.Item>
              <Command.Item className="flex items-center px-3 py-2 rounded-md hover:bg-elevated cursor-pointer text-sm text-foreground my-1 aria-selected:bg-elevated">Toggle Theme</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
