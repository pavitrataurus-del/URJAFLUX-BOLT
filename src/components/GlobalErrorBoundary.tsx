import React, { ErrorInfo, ReactNode } from 'react';
import { globalErrorTracker } from '../core/telemetry/GlobalErrorTracker';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  file: string | null;
  line: string | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  private static firstCapturedError: {
    error: any;
    componentName?: string;
    stackTrace?: string;
    file?: string;
    line?: string;
  } | null = null;

  public state: State = {
    hasError: false,
    error: null,
    componentStack: null,
    file: null,
    line: null,
  };

  private static parseStack(stack: string | undefined) {
    if (!stack) return { file: 'Unknown', line: 'Unknown' };
    
    // Simple stack parser to find the first source file (excluding node_modules or system files if possible)
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('at ') && !line.includes('node_modules') && !line.includes('react')) {
        const match = line.match(/\((https?:\/\/.*?):(\d+):(\d+)\)/) || line.match(/at\s+(https?:\/\/.*?):(\d+):(\d+)/);
        if (match) {
          return { file: match[1], line: match[2] };
        }
      }
    }
    
    // Fallback parser
    for (const line of lines) {
      const match = line.match(/(https?:\/\/.*?):(\d+):(\d+)/);
      if (match) {
        return { file: match[1], line: match[2] };
      }
    }
    return { file: 'Unknown', line: 'Unknown' };
  }

  private static isApplicationError(error: any, stack?: string, filename?: string): boolean {
    const errorStr = String(error?.message || error || '').toLowerCase();
    const stackStr = (stack || '').toLowerCase();
    const fileStr = (filename || '').toLowerCase();

    // 1. Ignore browser extension, third-party wallet, or window event-emitter injection errors
    if (
      errorStr.includes('chrome-extension') ||
      errorStr.includes('ethereum') ||
      errorStr.includes('inpage') ||
      errorStr.includes('emit') ||
      errorStr.includes('addlistener') ||
      errorStr.includes('redefine property') ||
      errorStr.includes('wallet') ||
      errorStr.includes('metamask') ||
      errorStr.includes('rabby') ||
      errorStr.includes('phantom') ||
      stackStr.includes('chrome-extension') ||
      stackStr.includes('ethereum') ||
      stackStr.includes('inpage') ||
      stackStr.includes('metamask') ||
      stackStr.includes('rabby') ||
      stackStr.includes('addlistener') ||
      stackStr.includes('emit') ||
      fileStr.includes('chrome-extension') ||
      fileStr.includes('ethereum') ||
      fileStr.includes('inpage')
    ) {
      return false;
    }

    // 2. Check if the error trace comes from browser extension or non-app wallet noise
    // Any error caught by React's ErrorBoundary during rendering MUST be treated as an application error.
    return true;
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const { file, line } = GlobalErrorBoundary.parseStack(error.stack);
    
    if (GlobalErrorBoundary.isApplicationError(error, error.stack, file || undefined)) {
      if (!GlobalErrorBoundary.firstCapturedError) {
        GlobalErrorBoundary.firstCapturedError = {
          error: error.message || String(error),
          componentName: 'Unknown (Render Error)',
          stackTrace: error.stack,
          file,
          line,
        };
        console.error(' [FIRST CAPTURED RUNTIME EXCEPTION] ', GlobalErrorBoundary.firstCapturedError);
      }
      return { hasError: true, error, file, line };
    }

    return { hasError: false, error: null, file: null, line: null };
  }

  private handleGlobalError = (event: ErrorEvent) => {
    const { error, message, filename, lineno } = event;
    const stack = error?.stack || '';
    const errorObj = error || { message: message || 'Unknown Error', stack };
    const parsed = GlobalErrorBoundary.parseStack(stack);
    const resolvedFile = filename || parsed.file || 'Unknown';
    const resolvedLine = lineno ? String(lineno) : parsed.line || 'Unknown';

    if (!GlobalErrorBoundary.isApplicationError(errorObj, stack, resolvedFile)) {
      return;
    }

    if (!GlobalErrorBoundary.firstCapturedError) {
      GlobalErrorBoundary.firstCapturedError = {
        error: message || errorObj.message || String(errorObj),
        componentName: 'Global/Window',
        stackTrace: stack,
        file: resolvedFile,
        line: resolvedLine,
      };
      console.error(' [FIRST CAPTURED RUNTIME EXCEPTION] ', GlobalErrorBoundary.firstCapturedError);
    }
  };

  private handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const stack = reason instanceof Error ? reason.stack || '' : '';
    const errorObj = reason instanceof Error ? reason : { message: String(reason || 'Unhandled Promise Rejection'), stack };
    const { file, line } = GlobalErrorBoundary.parseStack(stack);

    if (!GlobalErrorBoundary.isApplicationError(errorObj, stack, file || undefined)) {
      return;
    }

    if (!GlobalErrorBoundary.firstCapturedError) {
      GlobalErrorBoundary.firstCapturedError = {
        error: `Unhandled Promise Rejection: ${errorObj.message}`,
        componentName: 'Promise/Async',
        stackTrace: stack,
        file,
        line,
      };
      console.error(' [FIRST CAPTURED RUNTIME EXCEPTION] ', GlobalErrorBoundary.firstCapturedError);
    }
  };

  public componentDidMount() {
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { file, line } = GlobalErrorBoundary.parseStack(error.stack);
    
    if (!GlobalErrorBoundary.isApplicationError(error, error.stack, file || undefined)) {
      return;
    }

    // Extract component name from errorInfo.componentStack if possible
    let componentName = 'Unknown Component';
    if (errorInfo.componentStack) {
      const match = errorInfo.componentStack.match(/at\s+([A-Z][a-zA-Z0-9_]*)/);
      if (match) {
        componentName = match[1];
      } else {
        const cleanStack = errorInfo.componentStack.trim().split('\n')[0];
        componentName = cleanStack.replace(/in\s+/, '').trim();
      }
    }

    if (!GlobalErrorBoundary.firstCapturedError) {
      GlobalErrorBoundary.firstCapturedError = {
        error: error.message || String(error),
        componentName,
        stackTrace: error.stack || errorInfo.componentStack,
        file,
        line,
      };
      console.error(' [FIRST CAPTURED RUNTIME EXCEPTION] ', GlobalErrorBoundary.firstCapturedError);
    } else {
      // Update component name if it was set to Unknown initially in getDerivedStateFromError
      if (GlobalErrorBoundary.firstCapturedError.componentName === 'Unknown (Render Error)') {
        GlobalErrorBoundary.firstCapturedError.componentName = componentName;
        if (errorInfo.componentStack && !GlobalErrorBoundary.firstCapturedError.stackTrace?.includes('componentStack')) {
          GlobalErrorBoundary.firstCapturedError.stackTrace = `${GlobalErrorBoundary.firstCapturedError.stackTrace}\n\nComponent Stack:\n${errorInfo.componentStack}`;
        }
        console.error(' [FIRST CAPTURED RUNTIME EXCEPTION UPDATED] ', GlobalErrorBoundary.firstCapturedError);
      }
    }

    this.setState({
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      const firstError = GlobalErrorBoundary.firstCapturedError || {
        error: this.state.error?.message || 'Unknown Error',
        componentName: 'Unknown',
        stackTrace: this.state.error?.stack || this.state.componentStack || '',
        file: this.state.file || 'Unknown',
        line: this.state.line || 'Unknown',
      };

      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
          <div className="w-full max-w-4xl bg-white border border-red-500/30 rounded-xl shadow-2xl p-8 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <h1 className="text-xl font-bold tracking-tight text-red-400">
                APPLICATION RUNTIME EXCEPTION DETECTED
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Exact Error
                </label>
                <div className="bg-red-950/40 border border-red-500/20 rounded px-4 py-3 text-red-200 font-mono text-sm break-words whitespace-pre-wrap">
                  {String(firstError.error)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Component Name
                  </label>
                  <div className="bg-slate-100/50 border border-slate-700/50 rounded px-3 py-2 text-slate-200 font-mono text-sm">
                    {firstError.componentName || 'Unknown'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    File Location
                  </label>
                  <div className="bg-slate-100/50 border border-slate-700/50 rounded px-3 py-2 text-slate-200 font-mono text-sm truncate" title={firstError.file || 'Unknown'}>
                    {firstError.file ? firstError.file.split('/').pop() : 'Unknown'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Line Number
                  </label>
                  <div className="bg-slate-100/50 border border-slate-700/50 rounded px-3 py-2 text-slate-200 font-mono text-sm">
                    {firstError.line || 'Unknown'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Stack Trace
                </label>
                <pre className="bg-slate-50 border border-slate-200 rounded p-4 text-slate-700 font-mono text-xs overflow-auto max-h-80 whitespace-pre-wrap break-all">
                  {firstError.stackTrace || 'No stack trace available.'}
                </pre>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-xs text-slate-400">
                <span>Instrumentation Active</span>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-700 rounded transition font-medium"
                >
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
