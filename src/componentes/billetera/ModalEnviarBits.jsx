import React, { useState } from 'react';
import { X, Send, Zap, CheckCircle2, AlertCircle, Scan, Lock, Wallet, ArrowRight } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import EscanearQR from './EscanearQR';

export default function ModalEnviarBits({ estaAbierto, alCerrar }) {
  const { usuarioActual, enviarBits } = usarUsuario();
  const [destinatario, setDestinatario] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [scannerAbierto, setScannerAbierto] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!estaAbierto) return null;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setMensajeExito('');
    setMensajeError('');

    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) {
      setMensajeError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (montoNum < 0.01) {
      setMensajeError('El monto mínimo es 0.01 SL-BITS.');
      return;
    }

    if (usuarioActual.saldoActual < montoNum) {
      setMensajeError(`Saldo insuficiente en tu billetera. Tienes ${usuarioActual.saldoActual.toFixed(2)} SL - BITS.`);
      return;
    }

    if (!contrasena || !contrasena.trim()) {
      setMensajeError('Ingresa tu contraseña para confirmar la transferencia.');
      return;
    }

    setEnviando(true);

    try {
      const resultado = await enviarBits(
        destinatario,
        montoNum,
        concepto || 'Transferencia entre usuarios',
        contrasena.trim()
      );

      if (resultado.exito) {
        setMensajeExito(resultado.mensaje);
      } else {
        setMensajeError(resultado.mensaje);
      }
    } catch (err) {
      setMensajeError('Error inesperado al procesar la transferencia.');
    } finally {
      setEnviando(false);
    }
  };

  const irAWallet = () => {
    setMensajeExito('');
    setDestinatario('');
    setMonto('');
    setConcepto('');
    setContrasena('');
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E67A15]/10 border border-[#E67A15]/50 flex items-center justify-center text-[#E67A15]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Enviar SL - BITS</h3>
              <p className="text-xs text-slate-400">Transferencia entre usuarios</p>
            </div>
          </div>
          {!enviando && (
            <button onClick={irAWallet} className="p-2 text-slate-400 hover:text-white bg-slate-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Saldo actual */}
        <div className="px-6 pt-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tu saldo disponible:</span>
            <span className="font-extrabold text-[#E67A15] text-sm">
              {(usuarioActual?.saldoActual || 0).toFixed(2)} SL - BITS
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* MODAL DE ÉXITO - persistente hasta que el usuario presione OK */}
          {mensajeExito && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-600 mb-1">¡Transferencia Enviada!</h4>
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
                  setDestinatario('');
                  setMonto('');
                  setConcepto('');
                  setContrasena('');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Hacer otra transferencia
              </button>
            </div>
          )}

          {/* FORMULARIO - solo se muestra si no hay éxito */}
          {!mensajeExito && (
            <form onSubmit={manejarEnvio} className="space-y-4">
              
              {mensajeError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {mensajeError}
                </div>
              )}

              {/* Destinatario */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ¿A quién quieres enviar? (NIE, DUI, estand o compañero)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Ingresa NIE, DUI, @usuario o nombre del proyecto..."
                    disabled={enviando}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setScannerAbierto(true)}
                    disabled={enviando}
                    className="px-4 py-3 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/45 text-[#E67A15] hover:bg-[#E67A15]/25 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Scan className="w-4 h-4" />
                    <span className="text-xs font-bold hidden sm:block">QR</span>
                  </button>
                </div>
              </div>

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monto en SL - BITS
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={usuarioActual?.saldoActual || 999999.99}
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                    disabled={enviando}
                    className="w-full pl-4 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-black text-[#E67A15] pointer-events-none">
                    SL - BITS
                  </span>
                </div>
              </div>

              {/* Concepto */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Motivo del envío (opcional)
                </label>
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="Ej. Colaboración, felicitaciones por proyecto..."
                  disabled={enviando}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                />
              </div>

              {/* Contraseña de seguridad */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Contraseña de seguridad
                </label>
                <input
                  type="password"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingresa tu contraseña para confirmar"
                  disabled={enviando}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] disabled:opacity-50"
                />
              </div>

              {/* Botón de Enviar */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Procesando transferencia...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      Confirmar y Enviar SL - BITS
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

      <EscanearQR
        estaAbierto={scannerAbierto}
        alCerrar={() => setScannerAbierto(false)}
        alEscanear={(id) => setDestinatario(id)}
      />
    </div>
  );
}
