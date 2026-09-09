import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-800">Algo salió mal</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ha ocurrido un error inesperado. No te preocupes, tu saldo y datos están seguros.
              </p>
              {this.state.error && (
                <p className="text-[10px] text-red-400 font-mono bg-red-50 p-2 rounded-xl break-all">
                  {this.state.error.message || 'Error desconocido'}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0A4D9C] to-[#07366E] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
