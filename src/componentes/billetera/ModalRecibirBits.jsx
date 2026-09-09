import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function ModalRecibirBits({ estaAbierto, alCerrar }) {
  const { usuarioActual } = usarUsuario();
  const [copiado, setCopiado] = useState(false);

  if (!estaAbierto || !usuarioActual) return null;

  const codigoBilletera = usuarioActual.numeroDocumento || usuarioActual.idUsuario;
  const valorQR = JSON.stringify({
    tipo: 'pago_estudiante',
    idUsuario: usuarioActual.idUsuario,
    nombre: usuarioActual.nombreCompleto,
    documento: usuarioActual.numeroDocumento
  });

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(codigoBilletera);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-center">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="text-left">
            <h3 className="text-base font-black text-slate-800">Recibir Fondeo / SL-BITS</h3>
            <p className="text-xs text-slate-400">Identificador digital para recibir transferencias</p>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-8 space-y-6 flex flex-col items-center">
          
          <div className="text-xs text-slate-400">
            Presenta este código QR para solicitar transferencias entre alumnos, recargar saldo en caja autorizada o recibir asignaciones académicas.
          </div>

          <div className="relative p-5 bg-white rounded-3xl shadow-2xl border-4 border-[#E67A15]/45">
            <QRCodeSVG
              value={valorQR}
              size={210}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/logo.png",
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          <div className="w-full space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Identificador Único de Billetera</span>
                <span className="text-xs font-mono font-bold text-slate-800">{codigoBilletera}</span>
              </div>
              <button
                onClick={copiarCodigo}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? '¡Copiado!' : 'Copiar ID'}
              </button>
            </div>

            <button
              onClick={copiarCodigo}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir Ficha QR
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}