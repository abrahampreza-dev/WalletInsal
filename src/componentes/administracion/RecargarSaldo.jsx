import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { 
  CreditCard, 
  Zap, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  PlusCircle,
  Banknote
} from 'lucide-react';

const MONTOS_RAPIDOS_RECARGA = [1.00, 5.00, 10.00];

export default function RecargarSaldo() {
  const { recargarSaldoAdmin, cargando } = usarUsuario();

  const [criterioBusqueda, setCriterioBusqueda] = useState('');
  const [montoRecarga, setMontoRecarga] = useState(5.00);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [esMontoLibre, setEsMontoLibre] = useState(false);
  const [motivo, setMotivo] = useState('Recarga en efectivo en caja');

  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [procesando, setProcesando] = useState(false);

  const montoFinal = esMontoLibre 
    ? parseFloat(montoPersonalizado || 0) 
    : montoRecarga;

  const manejarRecarga = async (evento) => {
    evento.preventDefault();
    if (procesando) return;
    setMensajeError('');
    setMensajeExito('');

    if (!criterioBusqueda.trim()) {
      setMensajeError('Especifique el documento o identificador del usuario.');
      return;
    }

    if (isNaN(montoFinal) || montoFinal <= 0) {
      setMensajeError('Ingrese una cantidad a recargar superior a 0.00 SL-BITS.');
      return;
    }

    setProcesando(true);
    try {
      const respuesta = await recargarSaldoAdmin(
        criterioBusqueda.trim(),
        montoFinal,
        motivo.trim()
      );

      if (respuesta.exito) {
        setMensajeExito(respuesta.mensaje || '¡Abono procesado correctamente!');
        setCriterioBusqueda('');
        setMontoPersonalizado('');
      } else {
        setMensajeError(respuesta.mensaje || 'No se logró procesar la acreditación del saldo.');
      }
    } catch (err) {
      setMensajeError('Error inesperado al procesar la recarga.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center">
          <Banknote className="w-5 h-5 text-[#E67A15]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Módulo General de Caja y Recargas</h3>
          <p className="text-xs text-slate-400">Acreditación de saldo en efectivo para los asistentes de la Expotecnia</p>
        </div>
      </div>

      {/* Alertas */}
      {mensajeError && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/45 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          {mensajeError}
        </div>
      )}

      {mensajeExito && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {mensajeExito}
        </div>
      )}

      <form onSubmit={manejarRecarga} className="space-y-5">
        
        {/* Campo: Documento o ID de Usuario */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            NIE, DUI o Identificador del Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={criterioBusqueda}
              onChange={(e) => setCriterioBusqueda(e.target.value)}
              placeholder="Ingresa NIE (solo números), DUI (con o sin guion) o ID..."
              disabled={procesando}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Botones de Abono Rápido (+1.00, +5.00, +10.00) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Monto a Recargar (⚡ SL - BITS)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MONTOS_RAPIDOS_RECARGA.map((monto) => (
              <button
                key={monto}
                type="button"
                onClick={() => {
                  setMontoRecarga(monto);
                  setEsMontoLibre(false);
                }}
                disabled={procesando}
                className={`py-3 rounded-2xl font-black text-sm border transition-all flex flex-col items-center justify-center disabled:opacity-50 ${
                  !esMontoLibre && montoRecarga === monto
                    ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white border-[#E67A15] shadow-md shadow-orange-500/20'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>+{monto.toFixed(2)} ⚡</span>
                <span className="text-[10px] font-medium opacity-80">SL - BITS</span>
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setEsMontoLibre(!esMontoLibre)}
              className="text-xs font-semibold text-[#0A4D9C] hover:underline"
            >
              {esMontoLibre ? 'Usar montos rápidos' : 'Ingresar otro monto en efectivo'}
            </button>

            {esMontoLibre && (
              <div className="mt-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={montoPersonalizado}
                  onChange={(e) => setMontoPersonalizado(e.target.value)}
                  placeholder="Ej. 20.00"
                  disabled={procesando}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Motivo o Referencia */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Observación / Motivo
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Recarga en efectivo en caja"
            disabled={procesando}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-white text-xs focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
          />
        </div>

        {/* Botón de Ejecutar Recarga */}
        <button
          type="submit"
          disabled={procesando}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {procesando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Aplicando Abono a la Cuenta...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Abonar +{montoFinal > 0 ? `${montoFinal.toFixed(2)} ⚡ SL - BITS` : ''}
            </>
          )}
        </button>

      </form>
    </div>
  );
}

