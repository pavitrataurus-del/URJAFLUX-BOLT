import { create } from "zustand";

interface AppState {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  compactMode: boolean;
  setCompactMode: (enabled: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  rightDockOpen: boolean;
  setRightDockOpen: (open: boolean) => void;
  bottomDockOpen: boolean;
  setBottomDockOpen: (open: boolean) => void;
  activeProject: string | null;
  setActiveProject: (projectId: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  compactMode: false,
  setCompactMode: (enabled) => set({ compactMode: enabled }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  rightDockOpen: true,
  setRightDockOpen: (open) => set({ rightDockOpen: open }),
  bottomDockOpen: true,
  setBottomDockOpen: (open) => set({ bottomDockOpen: open }),
  activeProject: null,
  setActiveProject: (projectId) => set({ activeProject: projectId }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
