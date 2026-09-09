import React from 'react';
import { Zap, QrCode, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function TarjetaSaldo({ 
  usuario, 
  alHacerClicEnQR, 
  alHacerClicEnRecargar 
}) {
  if (!usuario) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] p-8 border border-[#0A4D9C]/40 shadow-2xl text-center superficie-azul">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 border border-white/40 flex items-center justify-center">
            <Zap className="w-8 h-8 text-[#D19E37]" />
          </div>
          <h3 className="text-xl font-bold text-white">¡Activa tu Billetera Digital SL-BITS!</h3>
          <p className="text-sm text-white/85">
            Regístrate con tu NIE o DUI para recibir gratis tu bono de bienvenida de <span className="font-bold text-[#D19E37]">1.00 ⚡ SL - BITS</span> y apoyar a tus estands favoritos.
          </p>
        </div>
      </div>
    );
  }

  const saldoFormateado = (usuario.saldoActual || 0).toFixed(2);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] p-6 sm:p-8 border border-[#0A4D9C]/40 shadow-2xl resplandor-naranja transition-all duration-300 superficie-azul">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#D19E37]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-gradient-to-tr from-[#D19E37]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        
        {/* Encabezado de la Tarjeta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E67A15] to-[#D19E37] flex items-center justify-center shadow-md shadow-black/30">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D19E37] font-black">
                Billetera Digital
              </span>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                SL-BITS OFICIAL
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-300/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Activa
            </span>
          </div>
        </div>

        {/* Saldo Central Destacado */}
        <div className="py-2">
          <p className="text-xs font-semibold text-white/85 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D19E37]" />
            Saldo Disponible
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {saldoFormateado}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#D19E37] flex items-center">
              ⚡ SL - BITS
            </span>
          </div>
          <p className="text-xs text-white/85 mt-1">Sistema Oficial de Votación y Donaciones • Expotecnia 2026</p>
        </div>

        {/* Datos del Titular y Acciones */}
        <div className="pt-4 border-t border-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-white/85 uppercase font-semibold">Titular</p>
            <p className="text-base font-bold text-white tracking-wide">
              {usuario.nombreCompleto}
            </p>
            <p className="text-xs text-white/85 font-mono">
              {usuario.tipoDocumento || 'DOC'}: {usuario.numeroDocumento}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {alHacerClicEnQR && (
              <button
                onClick={alHacerClicEnQR}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white border border-white/40 text-xs font-bold transition-colors"
              >
                <QrCode className="w-4 h-4 text-[#D19E37]" />
                Mi QR
              </button>
            )}

            {alHacerClicEnRecargar && (
              <button
                onClick={alHacerClicEnRecargar}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white text-xs font-bold shadow-md shadow-black/30 transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                Recargar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}