import React from "react";

interface FloatingWorkflowPanelProps {
  open: boolean;
  canvasTheme: "light" | "dark";
  onClose: () => void;
  children: React.ReactNode;
}

export const FloatingWorkflowPanel: React.FC<FloatingWorkflowPanelProps> = ({
  open,
  canvasTheme,
  onClose,
  children,
}) => {
  const isDark = canvasTheme === "dark";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <div
        className={`fixed z-50 top-3 right-3 bottom-3 w-[min(360px,calc(100vw-24px))] transition-all duration-300 ease-out ${
          open ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+16px)] opacity-0 pointer-events-none"
        }`}
        role="complementary"
        aria-label="Workflow guide"
        aria-hidden={!open}
      >
        <div
          className={`h-full rounded-2xl border overflow-hidden shadow-2xl ${
            isDark
              ? "bg-[#0a0e16]/92 border-white/10 shadow-black/50"
              : "bg-white/92 border-slate-200/80 shadow-slate-400/20"
          }`}
          style={{ backdropFilter: "blur(20px)" }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default FloatingWorkflowPanel;
