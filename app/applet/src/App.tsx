import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/layout/AppShell";
import { Workspace } from "./pages/Workspace";
import { Dashboard, Projects, Admin, Settings } from "./pages/Placeholders";

// Simple Auth Placeholder
const Auth = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="bg-surface border border-border p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <div className="w-12 h-12 rounded bg-brand flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">U</div>
        <h1 className="text-2xl font-bold mb-2">URJAFLUX AI OS</h1>
        <p className="text-foreground-muted mb-8">Sign in to your enterprise workspace</p>
        <button className="w-full bg-brand text-white rounded-md py-2 font-medium hover:bg-brand/90 transition-colors">
          Sign In
        </button>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = true; // Placeholder for actual auth state

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster 
        position="bottom-right" 
        theme="system" 
        toastOptions={{
          className: "bg-surface border border-border text-foreground rounded-lg shadow-lg",
        }}
      />
    </BrowserRouter>
  );
}

export default App;
