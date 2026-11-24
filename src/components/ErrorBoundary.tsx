import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (error.stack?.includes('chrome-extension://')) {
      this.setState({ hasError: false });
      return;
    }
    console.error('Unexpected application error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-6 text-ink">
          <div className="max-w-md rounded-[12px] border border-border-hairline bg-surface p-8 text-center">
            <h1 className="font-serif text-2xl font-medium text-ink">
              Terjadi kendala saat memuat halaman
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Muat ulang halaman untuk mencoba kembali.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink hover:opacity-92 transition-opacity cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
