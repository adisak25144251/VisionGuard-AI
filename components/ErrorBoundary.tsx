import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-red-500/30 shadow-2xl shadow-red-900/10">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">System Application Error</h1>
            <p className="text-slate-400 mb-6 text-sm">
              An unexpected critical error occurred in the VisionGuard Interface. 
              The monitoring core may still be running in the background.
            </p>
            
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 mb-6 text-left overflow-auto max-h-32 custom-scrollbar">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || 'Unknown Error'}
              </code>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={this.handleHome}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} /> Dashboard
              </button>
              <button 
                onClick={this.handleReload}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20"
              >
                <RefreshCw size={16} /> Reload System
              </button>
            </div>
          </div>
          <div className="mt-8 text-slate-600 text-xs font-mono">
            VisionGuard AI v3.2.0-stable | Session ID: {Math.random().toString(36).substr(2, 9)}
          </div>
        </div>
      );
    }

    return (this as any).props.children || null;
  }
}

export default ErrorBoundary;