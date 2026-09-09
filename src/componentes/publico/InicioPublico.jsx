import React, { useState } from 'react';
import ImagenMascota from '../comun/ImagenMascota';
import { 
  Sparkles, 
  Search, 
  Trophy, 
  UserPlus, 
  Grid, 
  Video, 
  Play, 
  Zap, 
  Heart, 
  Layers, 
  Users, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Shield,
  HelpCircle,
  Clock
} from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import TarjetaEstand from '../estands/TarjetaEstand';
import VentanaDonar from '../estands/VentanaDonar';
import ModalHistoria from '../estands/ModalHistoria';

export default function InicioPublico({ 
  alAbrirRegistro, 
  alAbrirPerfilInstagram, 
  alIrARanking, 
  alIrABilletera 
}) {
  const { listaGrupos, usuarioActual } = usarUsuario();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('Todos los proyectos');
  const [estandParaDonar, setEstandParaDonar] = useState(null);
  const [modalHistoriaGrupo, setModalHistoriaGrupo] = useState(null);

  // Lista única de especialidades
  const especialidadesDisponibles = [
    'Todos los proyectos',
    ...Array.from(new Set(listaGrupos.map((g) => g.especialidad).filter(Boolean)))
  ];

  // Filtrar grupos
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
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* 1. HERO PÚBLICO: Expotecnia Institucional 2026 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] border border-[#0A4D9C]/40 shadow-2xl p-6 sm:p-10 superficie-azul">
        
        {/* Glow decorativo de fondo */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#D19E37]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D19E37]/15 border border-[#D19E37]/40 text-[#D19E37] text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              EXPOTECNIA 2026 • Instituto San Luis — ¡La innovación comienza aquí!
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Explora, Apoya y Vota con <span className="text-[#D19E37]">SL - BITS</span>
            </h1>

<p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Explora las publicaciones y fotos de cada equipo, visualiza sus videos demostrativos.
              ¡Apoya tu proyecto favorito y mira cómo llega al podio oficial!
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {usuarioActual ? (
                <button
                  onClick={alIrABilletera}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Ir a Mi Wallet ({usuarioActual.saldoActual.toFixed(2)} SL - BITS)
                </button>
              ) : (
                <button
                  onClick={alAbrirRegistro}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  ¡Únete ahora y reclama 1.00 SL - BITS gratis!
                </button>
              )}

{usuarioActual && (
                <button
                  onClick={alIrARanking}
                  className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs border border-white/50 flex items-center gap-2 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-600" />
                   Ver Ranking en Vivo
                </button>
              )}
            </div>
          </div>

          {/* Mascota en el Hero */}
          <div className="w-56 sm:w-72 rounded-3xl overflow-hidden border-2 border-[#D19E37]/50 shadow-2xl shadow-black/20 bg-white flex-shrink-0">
            <ImagenMascota
              className="w-full h-auto block"
              alt="Mascota Ciervo San Luis"
            />
          </div>

        </div>

      </div>

      {/* 2. BARRA DE HISTORIA DEL EQUIPOS DESTACADAS DE LOS ESTANDS */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-4 h-4 text-pink-400" />
            Conoce los proyectos que están haciendo historia en la Expotecnia 2026
          </span>
          <span className="text-[11px] text-slate-400">¡Explora los avances y descubre nuevas ideas!</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-none">
          {listaGrupos.map((grupo) => (
            <button
              key={grupo.idGrupo}
              onClick={() => {
                if (grupo.historias?.length > 0) {
                  setModalHistoriaGrupo(grupo);
                } else {
                  alAbrirPerfilInstagram(grupo.idGrupo);
                }
              }}
              className="flex flex-col items-center gap-1.5 group flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100">
                  <img
                    src={grupo.urlFoto || "/logo.png"}
                    alt={grupo.nombreGrupo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[75px] group-hover:text-white">
                {grupo.handle?.replace('@', '') || grupo.nombreGrupo}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. AVISO INFORMATIVO PARA TODO PÚBLICO */}
      {!usuarioActual && (
        <div className="p-4 rounded-2xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/45 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <HelpCircle className="w-5 h-5 text-[#0A4D9C] flex-shrink-0" />
            <span>
              <strong>¿Cómo apoyar a los equipos?</strong> Puedes ver las fotos y videos de cada estand libremente. Si deseas <strong>donar SL - BITS</strong> y votar en el certamen oficial, solo necesitas registrarte con tu NIE/DUI.
            </span>
          </div>
          <button
            onClick={alAbrirRegistro}
            className="px-4 py-2 rounded-xl bg-[#0A4D9C] hover:bg-[#07366E] text-white font-bold whitespace-nowrap shadow-md text-xs"
          >
            Crear Cuenta / Iniciar Sesión
          </button>
        </div>
      )}

      {/* 4. BUSCADOR Y FILTRO DE ESPECIALIDADES */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Busca por proyecto, @handle de INSALSPACE, integrantes o palabras clave..."
            className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-slate-200 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#E67A15]"
          />
        </div>

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

      {/* 5. CUADRÍCULA DE ESTANDS Y PERFILES INSTAGRAM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">Estands de la Expotecnia 2026 ({gruposFiltrados.length})</h2>
          <span className="text-xs text-slate-400">Toca en cualquier proyecto para ver su perfil INSALSPACE completo</span>
        </div>

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
      </div>

      {/* MODAL DE DONACIÓN CON VALIDACIÓN DE INSCRIPCIÓN */}
      <VentanaDonar
        estand={estandParaDonar}
        estaAbierto={Boolean(estandParaDonar)}
        alCerrar={() => setEstandParaDonar(null)}
        alAbrirRegistro={alAbrirRegistro}
      />

      {/* MODAL DE HISTORIA DEL EQUIPOS */}
      {modalHistoriaGrupo && (
        <ModalHistoria
          estaAbierto={Boolean(modalHistoriaGrupo)}
          alCerrar={() => setModalHistoriaGrupo(null)}
          historias={modalHistoriaGrupo.historias || []}
          grupo={modalHistoriaGrupo}
        />
      )}

    </div>
  );
}

