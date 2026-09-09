import React from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import RecargarSaldo from './RecargarSaldo';
import HistorialBitacora from './HistorialBitacora';
import GestionUsuarios from './GestionUsuarios';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Building2, 
  Zap, 
  RefreshCw,
  Award,
  Wallet
} from 'lucide-react';

export default function PanelAdmin() {
  const { listaGrupos, listaTransacciones, listaBitacoras, sincronizarConServidor, cargando } = usarUsuario();

  // Métricas globales del evento
  const totalRecaudado = listaGrupos.reduce(
    (acc, g) => acc + (parseFloat(g.totalRecaudado) || 0),
    0
  );

  const totalDonacionesCount = listaTransacciones.filter(
    (tx) => tx.tipo === 'donacion'
  ).length;

  const promedioPorEstand = listaGrupos.length > 0
    ? (totalRecaudado / listaGrupos.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Encabezado del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 text-[#0A4D9C] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Institucional · Gestión General de Billetera SL-BITS
          </div>
<h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Gestión General de Billetera SL-BITS
          </h1>
          <p className="text-xs text-slate-400">
            Panel de supervisión en tiempo real, control de flujo en caja y registro general del sistema.
          </p>
        </div>

        <button
          onClick={sincronizarConServidor}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-white border border-slate-200 font-bold text-xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0A4D9C]' : ''}`} />
          Sincronizar Datos
        </button>
      </div>

      {/* Tarjetas de Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Recaudado */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Circulante Global
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#E67A15]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalRecaudado.toFixed(2)}
            </span>
            <span className="text-sm font-extrabold text-[#E67A15] ml-1.5">SL-BITS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recaudación general</p>
        </div>

        {/* Total de Estands */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estands Participantes
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#0A4D9C]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {listaGrupos.length}
            </span>
            <span className="text-xs font-semibold text-slate-400 ml-1.5">proyectos inscritos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Registrados en competencia</p>
        </div>

        {/* Total de Donaciones Emitidas */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Interacciones Registradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/45 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalDonacionesCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 ml-1.5">donaciones emitidas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Emitidos por visitantes</p>
        </div>

        {/* Promedio por Estand */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Promedio por Proyecto
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-600/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {promedioPorEstand.toFixed(2)}
            </span>
            <span className="text-sm font-extrabold text-amber-600 ml-1.5">SL-BITS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Promedio por proyecto</p>
        </div>

      </div>

      {/* Sección Operativa de Caja y Recargas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RecargarSaldo />
        </div>
        <div className="lg:col-span-2">
          <HistorialBitacora />
        </div>
      </div>

      {/* Gestión de Usuarios */}
      <GestionUsuarios />

    </div>
  );
}

