import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { History, ShieldCheck, Heart, Search } from 'lucide-react';

export default function HistorialBitacora() {
  const { listaTransacciones, listaBitacoras } = usarUsuario();
  const [filtroTipo, setFiltroTipo] = useState('transacciones'); // 'transacciones' o 'bitacoras'
  const [busqueda, setBusqueda] = useState('');

  const transaccionesFiltradas = listaTransacciones.filter((tx) =>
    (tx.nombreEmisor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (tx.nombreReceptor || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (tx.idTransaccion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const bitacorasFiltradas = listaBitacoras.filter((bit) =>
    (bit.nombreUsuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (bit.documentoUsuario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (bit.autorizadoPor || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8">
      
      {/* Encabezado y Selector de Auditoría */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center">
            <History className="w-5 h-5 text-[#0A4D9C]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Bitácora y Auditoría de Movimientos</h3>
            <p className="text-xs text-slate-400">Monitoreo transparente de transferencias, apoyos y transacciones de caja</p>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200">
          <button
            onClick={() => setFiltroTipo('transacciones')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filtroTipo === 'transacciones'
                ? 'bg-[#E67A15] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Donaciones ({listaTransacciones.length})
          </button>

          <button
            onClick={() => setFiltroTipo('bitacoras')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filtroTipo === 'bitacoras'
                ? 'bg-[#E67A15] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Bitácora de Caja ({listaBitacoras.length})
          </button>
        </div>
      </div>

      {/* Buscador de Auditoría */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Filtrar por nombre, documento o identificador de transacción..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#E67A15]"
        />
      </div>

      {/* Tabla de Donaciones Generales */}
      {filtroTipo === 'transacciones' && (
        <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Emisor (Donante)</th>
                <th className="py-3 px-4">Receptor (Estand)</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs">
              {transaccionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">
                    No se hallaron registros bajo los parámetros ingresados.
                  </td>
                </tr>
              ) : (
                transaccionesFiltradas.map((tx) => (
                  <tr key={tx.idTransaccion} className="hover:bg-slate-100/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(tx.fecha).toLocaleString('es-SV', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.tipo === 'donacion'
                            ? 'bg-[#E67A15]/15 text-[#E67A15] border border-[#E67A15]/50'
                            : tx.tipo === 'bono_bienvenida'
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/45'
                            : 'bg-[#0A4D9C]/15 text-[#0A4D9C] border border-[#0A4D9C]/50'
                        }`}
                      >
                        {tx.tipo === 'donacion'
                          ? 'Donación'
                          : tx.tipo === 'bono_bienvenida'
                          ? 'Bono Bienvenida'
                          : 'Recarga'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {tx.nombreEmisor || 'Visitante'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {tx.nombreReceptor || 'Estand'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#E67A15]">
                      {parseFloat(tx.monto).toFixed(2)} ⚡
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla de Bitácora Administrativa */}
      {filtroTipo === 'bitacoras' && (
        <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Usuario Beneficiario</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Abono</th>
                <th className="py-3 px-4">Autorizado Por</th>
                <th className="py-3 px-4">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs">
              {bitacorasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No se presentan operaciones de caja en el historial.
                  </td>
                </tr>
              ) : (
                bitacorasFiltradas.map((bit) => (
                  <tr key={bit.idBitacora} className="hover:bg-slate-100/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(bit.fecha).toLocaleString('es-SV', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {bit.nombreUsuario}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {bit.documentoUsuario}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-600">
                      +{parseFloat(bit.montoRecarga).toFixed(2)} ⚡
                    </td>
                    <td className="py-3 px-4 text-[#0A4D9C] font-semibold">
                      {bit.autorizadoPor}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {bit.motivo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
