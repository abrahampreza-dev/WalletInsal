import React, { useEffect, useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import TarjetaEstand from './TarjetaEstand';
import VentanaDonar from './VentanaDonar';
import { Search, Sparkles, Filter, Building2, Zap, Grid, Video } from 'lucide-react';

export default function ListaEstands({ alAbrirRegistro, alAbrirPerfilInstagram }) {
  const { listaGrupos } = usarUsuario();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('Todos los proyectos');
  const [estandParaDonar, setEstandParaDonar] = useState(null);

  useEffect(() => {
    const idGrupoSolicitado = new URLSearchParams(window.location.search).get('donar');
    if (!idGrupoSolicitado) return;

    const grupoSolicitado = listaGrupos.find((grupo) => grupo.idGrupo === idGrupoSolicitado);
    if (grupoSolicitado) {
      setEstandParaDonar(grupoSolicitado);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [listaGrupos]);

  // Lista única de especialidades disponibles
  const especialidadesDisponibles = [
    'Todos los proyectos',
    ...Array.from(new Set(listaGrupos.map((g) => g.especialidad).filter(Boolean)))
  ];

  // Filtrar grupos por término de búsqueda y por especialidad
  const gruposFiltrados = listaGrupos.filter((grupo) => {
    const coincideTexto =
      grupo.nombreGrupo?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      grupo.handle?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      grupo.integrantes?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      grupo.descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase());

    const coincideEspecialidad =
      especialidadSeleccionada === 'Todos los proyectos' || grupo.especialidad === especialidadSeleccionada;

    return coincideTexto && coincideEspecialidad;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Banner Principal de Expotecnia 2026 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] border border-[#0A4D9C]/40 p-6 sm:p-10 shadow-2xl superficie-azul">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D19E37]/15 border border-[#D19E37]/40 text-[#D19E37] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            EXPOTECNIA 2026 • Instituto San Luis — ¡La innovación comienza aquí!
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Estands Técnicos y Perfiles Explorar INSALSPACE
          </h1>
<p className="text-xs sm:text-sm text-white/85">
            Explora las publicaciones y fotos de cada equipo, visualiza sus videos demostrativos en <span className="text-[#D19E37] font-bold">INSALSPACE</span> y apóyalos con tus <span className="text-[#D19E37] font-bold">SL - BITS</span>.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro de Especialidades */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        {/* Buscador */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Busca por proyecto, @handle de Explorar INSALSPACE, integrante o palabra clave..."
            className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#E67A15]"
          />
        </div>

        {/* Filtro de Especialidad */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {especialidadesDisponibles.map((esp) => (
            <button
              key={esp}
              onClick={() => setEspecialidadSeleccionada(esp)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                especialidadSeleccionada === esp
                  ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white border-[#E67A15] shadow-md shadow-orange-500/20'
                  : 'bg-[#FFFFFF] text-slate-400 border-slate-200 hover:text-white hover:border-slate-300'
              }`}
            >
              {esp}
            </button>
          ))}
        </div>

      </div>

      {/* Cuadrícula de Proyectos Técnicos */}
      {gruposFiltrados.length === 0 ? (
<div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-2">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">¡Ups! No encontramos ese estand</h3>
          <p className="text-xs text-slate-400">
            Intenta con otro término de búsqueda o selecciona otra especialidad.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gruposFiltrados.map((grupo) => (
            <TarjetaEstand
              key={grupo.idGrupo}
              estand={grupo}
              alAbrirDonacion={(estandSeleccionado) => setEstandParaDonar(estandSeleccionado)}
              alAbrirPerfilInstagram={(id) => alAbrirPerfilInstagram(id)}
            />
          ))}
        </div>
      )}

      {/* Modal para donar */}
      <VentanaDonar
        estand={estandParaDonar}
        estaAbierto={Boolean(estandParaDonar)}
        alCerrar={() => setEstandParaDonar(null)}
        alAbrirRegistro={alAbrirRegistro}
      />

    </div>
  );
}

