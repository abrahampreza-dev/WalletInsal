import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, X, Zap, ShieldCheck } from 'lucide-react';

export default function MostrarQR({ usuario, estaAbierto, alCerrar }) {
  if (!estaAbierto || !usuario) return null;

  const valorQR = JSON.stringify({
    idUsuario: usuario.idUsuario,
    documento: usuario.numeroDocumento,
    nombre: usuario.nombreCompleto
  });

  const manejarImpresion = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        
        {/* Botón Cerrar */}
        <button
          onClick={alCerrar}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center mb-2">
            <QrCode className="w-6 h-6 text-[#E67A15]" />
          </div>
          <h3 className="text-lg font-black text-white">Mi Código QR de Pago</h3>
          <p className="text-xs text-slate-400">Presenta este código en caja para recargar saldo</p>
        </div>

        {/* Contenedor del Código QR */}
        <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-xl border-4 border-[#E67A15]/50">
          <QRCodeSVG
            value={valorQR}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>",
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />
        </div>

        {/* Datos del Usuario */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <p className="text-sm font-bold text-white truncate">{usuario.nombreCompleto}</p>
          <p className="text-xs text-slate-400 font-mono">
            {usuario.tipoDocumento || 'DOC'}: {usuario.numeroDocumento}
          </p>
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Credencial Digital Verificada
          </div>
        </div>

        {/* Botón de Impresión */}
        <div className="flex gap-2">
          <button
            onClick={manejarImpresion}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Credencial
          </button>

          <button
            onClick={alCerrar}
            className="py-3 px-5 rounded-xl bg-[#E67A15] text-white font-bold text-xs hover:bg-orange-600 transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
}

