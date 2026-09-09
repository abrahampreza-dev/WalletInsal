import React from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { Trophy, Medal, Zap, Layers, Users, Sparkles, TrendingUp } from 'lucide-react';

export default function TablaPosiciones() {
  const { listaGrupos } = usarUsuario();

  // Ordenar grupos de mayor a menor según su totalRecaudado
  const gruposOrdenados = [...listaGrupos].sort(
    (a, b) => (parseFloat(b.totalRecaudado) || 0) - (parseFloat(a.totalRecaudado) || 0)
  );

  const primerLugar = gruposOrdenados[0];
  const segundoLugar = gruposOrdenados[1];
  const tercerLugar = gruposOrdenados[2];

  const totalRecaudadoGlobal = listaGrupos.reduce(
    (acc, g) => acc + (parseFloat(g.totalRecaudado) || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn pb-12">
      
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/40 text-amber-600 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          Tabla de Posiciones en Tiempo Real • Expotecnia 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          Clasificación Oficial de Proyectos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Métricas actualizadas según las donaciones y votos registrados en SL-BITS por los visitantes.
        </p>
      </div>

      {/* Podio Visual Destacado (Top 3) */}
      {gruposOrdenados.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
          
          {/* Segundo Lugar (Plata) */}
          <div className="order-2 md:order-1 bg-[#FFFFFF] border-2 border-slate-400/30 rounded-3xl p-6 shadow-xl relative text-center space-y-4 transform md:scale-95">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-300 text-slate-900 font-black text-lg flex items-center justify-center shadow-lg">
              <Medal className="w-5 h-5" />
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Segundo Lugar
              </span>
              <h3 className="text-lg font-black text-white mt-1 line-clamp-1">
                {segundoLugar.nombreGrupo}
              </h3>
              <p className="text-xs text-[#0A4D9C] font-semibold mt-0.5">{segundoLugar.especialidad}</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-medium">Recaudado</span>
              <span className="text-2xl font-black text-slate-800">
                {(segundoLugar.totalRecaudado || 0).toFixed(2)} ⚡
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">SL - BITS</span>
            </div>
          </div>

          {/* Primer Lugar (Oro) - Destacado al centro */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-[#FFFFFF] to-slate-100 border-2 border-amber-500/60 rounded-3xl p-8 shadow-2xl relative text-center space-y-4 transform md:-translate-y-4 resplandor-naranja">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="pt-4">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
                ¡Líder del Certamen!
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {primerLugar.nombreGrupo}
              </h3>
              <p className="text-xs text-[#E67A15] font-bold mt-1">{primerLugar.especialidad}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-amber-600/40 shadow-inner">
              <span className="text-xs text-slate-400 block font-medium">Total Acumulado</span>
              <span className="text-3xl font-black text-amber-600">
                {(primerLugar.totalRecaudado || 0).toFixed(2)} ⚡
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">SL - BITS</span>
            </div>
          </div>

          {/* Tercer Lugar (Bronce) */}
          <div className="order-3 bg-[#FFFFFF] border-2 border-amber-700/40 rounded-3xl p-6 shadow-xl relative text-center space-y-4 transform md:scale-95">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-700 text-amber-100 font-black text-lg flex items-center justify-center shadow-lg">
              <Medal className="w-5 h-5" />
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Tercer Lugar
              </span>
              <h3 className="text-lg font-black text-white mt-1 line-clamp-1">
                {tercerLugar.nombreGrupo}
              </h3>
              <p className="text-xs text-[#0A4D9C] font-semibold mt-0.5">{tercerLugar.especialidad}</p>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 block font-medium">Recaudado</span>
              <span className="text-2xl font-black text-amber-600">
                {(tercerLugar.totalRecaudado || 0).toFixed(2)} ⚡
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">SL - BITS</span>
            </div>
          </div>

        </div>
      )}

      {/* Tabla Completa de Todos los Proyectos */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#E67A15]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clasificación General</h3>
              <p className="text-xs text-slate-400">Total de proyectos: {listaGrupos.length}</p>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
            <span className="text-[11px] text-slate-400 block">Total Recaudado en el Evento</span>
            <span className="text-sm font-black text-[#E67A15]">
              {totalRecaudadoGlobal.toFixed(2)} ⚡ SL - BITS
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Posición</th>
                <th className="py-3.5 px-6">Proyecto / Estand</th>
                <th className="py-3.5 px-6">Especialidad</th>
                <th className="py-3.5 px-6">Integrantes</th>
                <th className="py-3.5 px-6 text-right">Total Recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-sm">
              {gruposOrdenados.map((grupo, indice) => {
                const esPodio = indice < 3;

                return (
                  <tr
                    key={grupo.idGrupo}
                    className={`hover:bg-slate-100 transition-colors ${
                      indice === 0 ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    {/* Posición */}
                    <td className="py-4 px-6 font-bold">
                      <div className="flex items-center gap-2">
                        {esPodio ? (
                          <span className="text-xl">{indice === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : <Medal className="w-5 h-5 text-slate-400" />}</span>
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                            #{indice + 1}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nombre del Proyecto */}
                    <td className="py-4 px-6 font-extrabold text-white">
                      <div className="flex items-center gap-3">
                        {grupo.urlFoto && (
                          <img
                            src={grupo.urlFoto}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="block text-white font-bold">{grupo.nombreGrupo}</span>
                          <span className="text-xs text-slate-400 font-normal line-clamp-1">
                            {grupo.descripcion || 'Expotecnia 2026'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Especialidad */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-[#0A4D9C] border border-slate-200">
                        {grupo.especialidad}
                      </span>
                    </td>

                    {/* Integrantes */}
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {grupo.integrantes}
                    </td>

                    {/* Total Recaudado */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-base font-black text-[#E67A15]">
                        {(parseFloat(grupo.totalRecaudado) || 0).toFixed(2)} ⚡ SL - BITS
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

