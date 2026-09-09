import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function ModalConfirmacion({ estaAbierto, alCerrar, alConfirmar, titulo, mensaje, textoConfirmar, textoCancelar, tipo = 'peligro' }) {
  if (!estaAbierto) return null;

  const colores = {
    peligro: { icono: <AlertTriangle className="w-5 h-5 text-rose-500" />, btn: 'bg-rose-500 hover:bg-rose-600' },
    info: { icono: <Info className="w-5 h-5 text-[#0A4D9C]" />, btn: 'bg-[#0A4D9C] hover:bg-[#07366E]' },
    exito: { icono: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, btn: 'bg-emerald-500 hover:bg-emerald-600' }
  };
  const c = colores[tipo] || colores.peligro;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{c.icono}</div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800">{titulo}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mensaje}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={alCerrar} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors">
            {textoCancelar || 'Cancelar'}
          </button>
          <button onClick={alConfirmar} className={`flex-1 py-2.5 rounded-xl ${c.btn} text-white font-bold text-xs transition-colors`}>
            {textoConfirmar || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalInput({ estaAbierto, alCerrar, alConfirmar, titulo, mensaje, placeholder, valorInicial = '', tipo = 'text', textoConfirmar = 'Guardar' }) {
  const [valor, setValor] = React.useState(valorInicial);

  React.useEffect(() => {
    if (estaAbierto) setValor(valorInicial);
  }, [estaAbierto, valorInicial]);

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5"><Info className="w-5 h-5 text-[#E67A15]" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800">{titulo}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mensaje}</p>
          </div>
        </div>
        <input
          type={tipo}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#E67A15]"
          onKeyDown={(e) => { if (e.key === 'Enter') alConfirmar(valor); }}
        />
        <div className="flex gap-2 pt-1">
          <button onClick={alCerrar} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={() => alConfirmar(valor)} className="flex-1 py-2.5 rounded-xl bg-[#E67A15] hover:bg-[#D19E37] text-white font-bold text-xs transition-colors">
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModalAlerta({ estaAbierto, alCerrar, titulo, mensaje, tipo = 'info' }) {
  if (!estaAbierto) return null;

  const colores = {
    peligro: { icono: <AlertTriangle className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-500/10 border-rose-500/30' },
    info: { icono: <Info className="w-5 h-5 text-[#0A4D9C]" />, bg: 'bg-[#0A4D9C]/10 border-[#0A4D9C]/30' },
    exito: { icono: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/10 border-emerald-500/30' }
  };
  const c = colores[tipo] || colores.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{c.icono}</div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800">{titulo}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mensaje}</p>
          </div>
        </div>
        <button onClick={alCerrar} className="w-full py-2.5 rounded-xl bg-[#0A4D9C] hover:bg-[#07366E] text-white font-bold text-xs transition-colors">
          Entendido
        </button>
      </div>
    </div>
  );
}