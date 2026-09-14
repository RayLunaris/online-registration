import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkLoadError = 
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAFAF9] dark:bg-slate-950 transition-colors">
          <div className="max-w-md w-full p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl text-center space-y-5">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isChunkLoadError ? 'Pembaruan Halaman Tersedia' : 'Terjadi Kesalahan Sistem'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isChunkLoadError
                  ? 'Aplikasi telah diperbarui atau koneksi terputus sesaat. Silakan muat ulang halaman untuk melanjutkan.'
                  : 'Sistem mengalami kendala saat memproses halaman ini. Tim pengembang telah mencatat laporan ini.'}
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="p-3 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-slate-200 text-[11px] font-mono rounded-lg text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto bg-[#0D9488] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold h-10 px-5 gap-2 rounded-xl shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Muat Ulang Halaman</span>
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700 text-xs font-semibold h-10 px-5 gap-2 rounded-xl"
              >
                <Home className="h-4 w-4" />
                <span>Ke Beranda</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
