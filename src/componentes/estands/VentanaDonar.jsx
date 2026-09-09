import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { 
  Zap, Heart, X, CheckCircle2, AlertCircle, Loader2, Wallet, Sparkles, ArrowRight
} from 'lucide-react';

const MONTOS_RAPIDOS = [0.01, 0.25, 0.50, 1.00];

export default function VentanaDonar({ estand, estaAbierto, alCerrar, alAbrirRegistro }) {
  const { usuarioActual, realizarDonacion } = usarUsuario();

  const [montoSeleccionado, setMontoSeleccionado] = useState(0.50);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [esPersonalizado, setEsPersonalizado] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [procesando, setProcesando] = useState(false);

  if (!estaAbierto || !estand) return null;

  const montoFinal = esPersonalizado 
    ? parseFloat(montoPersonalizado || 0) 
    : montoSeleccionado;

  const manejarEnvioDonacion = async (evento) => {
    evento.preventDefault();
    if (procesando) return;

    setMensajeError('');
    setMensajeExito('');

    if (!usuarioActual) {
      setMensajeError('Debes registrarte o iniciar sesión para poder realizar una donación.');
      return;
    }

    if (isNaN(montoFinal) || montoFinal <= 0) {
      setMensajeError('Por favor, selecciona o ingresa un monto válido.');
      return;
    }

    if (montoFinal < 0.01) {
      setMensajeError('El monto mínimo es 0.01 SL-BITS.');
      return;
    }

    if (usuarioActual.saldoActual < montoFinal) {
      setMensajeError(`Saldo insuficiente. Tienes ${usuarioActual.saldoActual.toFixed(2)} SL - BITS.`);
      return;
    }

    setProcesando(true);

    try {
      const resultado = await realizarDonacion(estand.idGrupo, montoFinal);
      if (resultado.exito) {
        setMensajeExito(resultado.mensaje || '¡Donación de SL - BITS registrada con éxito!');
      } else {
        setMensajeError(resultado.mensaje || 'No se pudo procesar la donación.');
      }
    } catch (err) {
      setMensajeError('Error inesperado al procesar la donación.');
    } finally {
      setProcesando(false);
    }
  };

  const irAWallet = () => {
    setMensajeExito('');
    setMontoPersonalizado('');
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Botón Cerrar */}
        {!procesando && (
          <button onClick={irAWallet} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors z-10">
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Encabezado */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#E67A15] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-2">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0A4D9C]">
            Apoyar Proyecto Técnico
          </span>
          <h3 className="text-xl font-black text-slate-800">{estand.nombreGrupo}</h3>
          <p className="text-xs text-slate-500 font-medium">{estand.especialidad}</p>
        </div>

        {/* MODAL DE ÉXITO - persistente */}
        {mensajeExito && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-600 mb-1">¡Donación Enviada!</h4>
                <p className="text-xs text-emerald-600/80 leading-relaxed">{mensajeExito}</p>
              </div>
            </div>

            <button
              onClick={irAWallet}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0A4D9C] to-[#07366E] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Wallet className="w-4 h-4" />
              Ver mi billetera
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMensajeExito('');
                setMontoPersonalizado('');
                setEsPersonalizado(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Hacer otra donación
            </button>
          </div>
        )}

        {/* Error */}
        {mensajeError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/45 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {mensajeError}
          </div>
        )}

        {/* Si no ha iniciado sesión */}
        {!usuarioActual ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Para transferir SL - BITS es necesario identificarte con tu NIE o DUI. ¡Recibirás un bono de bienvenida de 1.00 SL - BITS!
            </p>
            <button
              onClick={() => { alCerrar(); alAbrirRegistro(); }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E67A15] hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
            >
              Crear Cuenta / Iniciar Sesión
            </button>
          </div>
        ) : (
          /* FORMULARIO - solo si no hay éxito */
          !mensajeExito && (
            <form onSubmit={manejarEnvioDonacion} className="space-y-5">
              
              {/* Saldo actual */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-[#0A4D9C]" />
                  <span className="text-xs text-slate-400 font-medium">Tu Saldo Disponible:</span>
                </div>
                <span className="text-sm font-extrabold text-[#E67A15]">
                  {usuarioActual.saldoActual?.toFixed(2) || "0.00"} SL - BITS
                </span>
              </div>

              {/* Montos rápidos */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Selecciona o ingresa la cantidad a donar:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {MONTOS_RAPIDOS.map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => { setMontoSeleccionado(monto); setEsPersonalizado(false); }}
                      disabled={procesando}
                      className={`py-3 rounded-2xl font-black text-sm border transition-all flex flex-col items-center justify-center disabled:opacity-50 ${
                        !esPersonalizado && montoSeleccionado === monto
                          ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white border-[#E67A15] shadow-md shadow-orange-500/30'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{monto.toFixed(2)} ⚡</span>
                      <span className="text-[10px] font-medium opacity-80">SL - BITS</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto personalizado */}
              <div>
                <button
                  type="button"
                  onClick={() => setEsPersonalizado(!esPersonalizado)}
                  disabled={procesando}
                  className="text-xs font-semibold text-[#0A4D9C] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {esPersonalizado ? 'Volver a montos sugeridos' : 'Ingresar otro monto personalizado'}
                </button>

                {esPersonalizado && (
                  <div className="mt-2 relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={usuarioActual.saldoActual || 999999.99}
                      value={montoPersonalizado}
                      onChange={(e) => setMontoPersonalizado(e.target.value)}
                      placeholder="Ej. 2.50"
                      disabled={procesando}
                      className="w-full pl-4 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-[#E67A15]">
                      SL - BITS
                    </span>
                  </div>
                )}
              </div>

              {/* Botón Confirmar */}
              <button
                type="submit"
                disabled={procesando}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando tu apoyo…
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    Confirmar y Apoyar Estand {montoFinal > 0 ? `${montoFinal.toFixed(2)} SL - BITS` : ''}
                  </>
                )}
              </button>

            </form>
          )
        )}

      </div>
    </div>
  );
}
