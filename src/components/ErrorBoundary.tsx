import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">មានបញ្ហាបច្ចេកទេស (Something went wrong)</h1>
            <p className="text-slate-600 mb-6">សូមអភ័យទោស ប្រព័ន្ធមានបញ្ហាខណៈពេលកំពុងដំណើរការ។ សូមព្យាយាម Refresh ម្ដងទៀត។</p>
            <div className="bg-slate-100 p-4 rounded-xl overflow-auto max-h-64 text-sm text-red-800 font-mono">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </div>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
              onClick={() => window.location.reload()}
            >
              Refresh ទំព័រនេះ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
