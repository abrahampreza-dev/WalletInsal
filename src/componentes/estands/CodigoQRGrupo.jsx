import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Printer, QrCode, ShieldCheck, X } from 'lucide-react';

export default function CodigoQRGrupo({ grupo, estaAbierto, alCerrar }) {
  const [copiado, setCopiado] = useState(false);

  if (!estaAbierto || !grupo) return null;

  const valorQR = `${window.location.origin}${window.location.pathname}?donar=${encodeURIComponent(grupo.idGrupo)}`;

  const copiarCodigo = async () => {
    await navigator.clipboard.writeText(valorQR);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        <button
          onClick={alCerrar}
          aria-label="Cerrar código QR"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center mb-2">
            <QrCode className="w-6 h-6 text-[#E67A15]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0A4D9C]">Recibir donaciones</p>
          <h3 className="text-lg font-black text-slate-800 mt-1">{grupo.nombreGrupo}</h3>
          <p className="text-xs text-slate-400 mt-1">Escanea este código para apoyar este proyecto</p>
        </div>

        <div className="p-4 bg-white rounded-2xl mx-auto w-fit shadow-xl border-4 border-[#E67A15]/50">
          <QRCodeSVG value={valorQR} size={210} level="H" includeMargin />
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <p className="text-xs text-slate-400">Código del estand</p>
          <p className="text-sm font-mono font-bold text-slate-800">{grupo.idGrupo}</p>
          <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Código oficial del proyecto
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copiarCodigo}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiado ? 'Copiado' : 'Copiar código'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-3 rounded-xl bg-[#E67A15] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
