import React, { useEffect, useState } from "react";
import { authService, AuthUser } from "../../services/authService";
import { UserRole } from "../../core/security/SecurityTypes";
import { ShieldAlert, RefreshCw, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  onUnauthorized,
}) => {
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [isChecking, setIsChecking] = useState<boolean>(!authService.isAuthenticated());

  useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      setUser(session?.user || null);
    });

    if (!authService.isAuthenticated()) {
      setIsChecking(true);
      authService.restoreSessionSilently().finally(() => {
        setIsChecking(false);
      });
    } else {
      setIsChecking(false);
    }

    return () => unsubscribe();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8 rounded-2xl border border-slate-800">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Verifying session token and route permissions...</p>
      </div>
    );
  }

  if (!user) {
    if (onUnauthorized) onUnauthorized();
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8 rounded-2xl border border-slate-800 max-w-lg mx-auto text-center my-12">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
        <p className="text-slate-400 text-sm mb-6">
          You must be logged in with valid session credentials to access this protected URJAFLUX OS domain.
        </p>
        <button
          onClick={() => {
            if (onUnauthorized) onUnauthorized();
            else window.location.reload();
          }}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-xl transition cursor-pointer text-sm"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Check required role
  if (requiredRole && requiredRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8 rounded-2xl border border-slate-800 max-w-lg mx-auto text-center my-12">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Insufficient Role Permissions</h3>
        <p className="text-slate-400 text-sm mb-4">
          This operation requires the <span className="text-amber-400 font-mono font-bold">{requiredRole}</span> role. Current role: <span className="text-slate-200 font-mono">{user.role}</span>.
        </p>
      </div>
    );
  }

  // Check required permission
  if (requiredPermission && !user.permissions.includes(requiredPermission) && user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-950 text-slate-300 p-8 rounded-2xl border border-slate-800 max-w-lg mx-auto text-center my-12">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Missing Domain Permission</h3>
        <p className="text-slate-400 text-sm mb-4">
          Missing required capability token: <span className="text-emerald-400 font-mono">{requiredPermission}</span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
