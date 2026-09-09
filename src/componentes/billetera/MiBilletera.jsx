import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import TarjetaSaldo from '../comun/TarjetaSaldo';
import MostrarQR from './MostrarQR';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  QrCode, 
  ShieldCheck, 
  Calendar,
  Send,
  Zap
} from 'lucide-react';

export default function MiBilletera({ alIrAEstands, alIrARecargar }) {
  const { usuarioActual, listaTransacciones } = usarUsuario();
  const [modalQRVisible, setModalQRVisible] = useState(false);

  if (!usuarioActual) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-10 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-[#E67A15]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sesión no iniciada</h2>
          <p className="text-sm text-slate-400 mb-6">
            Para consultar tu estado de cuenta y movimientos, ingresa con tu NIE o DUI registrado.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar transacciones pertenecientes al usuario
  const misTransacciones = listaTransacciones.filter(
    (tx) => tx.idEmisor === usuarioActual.idUsuario || tx.idReceptor === usuarioActual.idUsuario
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">Estado de Cuenta y Movimientos</h1>
        <p className="text-sm text-slate-400">
          Revisa el desglose de tus transacciones, saldo disponible y acreditación para votar en la Expotecnia 2026.
        </p>
      </div>

      {/* Tarjeta Digital Principal */}
      <TarjetaSaldo
        usuario={usuarioActual}
        alHacerClicEnQR={() => setModalQRVisible(true)}
        alHacerClicEnRecargar={alIrARecargar}
      />

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setModalQRVisible(true)}
          className="p-5 rounded-2xl bg-slate-100 hover:bg-slate-100 border border-slate-200 flex items-center gap-4 text-left transition-all hover:border-[#0A4D9C]/50 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <QrCode className="w-6 h-6 text-[#0A4D9C]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Mostrar QR de Recarga</h4>
            <p className="text-xs text-slate-400">Para recargas en ventanilla</p>
          </div>
        </button>

        <button
          onClick={alIrAEstands}
          className="p-5 rounded-2xl bg-slate-100 hover:bg-slate-100 border border-slate-200 flex items-center gap-4 text-left transition-all hover:border-[#E67A15]/50 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Send className="w-6 h-6 text-[#E67A15]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Explorar y Apoyar Estands</h4>
            <p className="text-xs text-slate-400">Ver videos y donar SL - BITS</p>
          </div>
        </button>

        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/45 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Resumen de Cuenta</h4>
            <p className="text-xs text-emerald-600 font-medium">Billetera Verificada</p>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <History className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Historial de Transacciones</h3>
              <p className="text-xs text-slate-400">Historial completo de donaciones y recargas</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-400 rounded-full border border-slate-200">
            {misTransacciones.length} registros
          </span>
        </div>

        {misTransacciones.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400">Todavía no registra transacciones en su cuenta.</p>
            <button
              onClick={alIrAEstands}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#E67A15] hover:underline"
            >
              Ver proyectos disponibles →
            </button>
          </div>
        ) : (
<div className="divide-y divide-slate-200">
            {misTransacciones.map((tx) => {
              const soyEmisor = tx.idEmisor === usuarioActual.idUsuario;
              const soyReceptor = tx.idReceptor === usuarioActual.idUsuario;
              const esDonacion = tx.tipo === 'donacion';
              const esBono = tx.tipo === 'bono_bienvenida';
              const esRecarga = tx.tipo === 'recarga_efectivo';
              const esEnvio = tx.tipo === 'envio_estudiante';

              const esEntrada = esBono || esRecarga || (esEnvio && soyReceptor);

              let etiqueta;
              if (esDonacion) etiqueta = `Donación otorgada a: ${tx.nombreReceptor}`;
              else if (esBono) etiqueta = 'Asignación Inicial de Bienvenida';
              else if (esRecarga) etiqueta = 'Abono en Punto de Caja';
              else if (esEnvio && soyReceptor) etiqueta = `Transferencia de: ${tx.nombreEmisor}`;
              else if (esEnvio && soyEmisor) etiqueta = `Transferencia hacia: ${tx.nombreReceptor}`;
              else etiqueta = `Operación: ${tx.nombreReceptor || tx.nombreEmisor}`;

              return (
                <div key={tx.idTransaccion} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        esEntrada
                          ? 'bg-emerald-500/15 border border-emerald-500/45 text-emerald-600'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {esEntrada ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{etiqueta}</p>
                      {tx.concepto && (
                        <p className="text-[11px] text-slate-400">{tx.concepto}</p>
                      )}
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(tx.fecha).toLocaleString('es-SV', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black ${
                        esEntrada ? 'text-emerald-600' : 'text-rose-400'
                      }`}
                    >
                      {esEntrada ? '+' : '-'}
                      {parseFloat(tx.monto).toFixed(2)} ⚡
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">SL - BITS</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Código QR */}
      <MostrarQR
        usuario={usuarioActual}
        estaAbierto={modalQRVisible}
        alCerrar={() => setModalQRVisible(false)}
      />

    </div>
  );
}

