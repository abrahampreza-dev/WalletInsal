import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Grid, 
  Video, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Users, 
  Layers, 
  Sparkles, 
  Zap, 
  QrCode, 
  UploadCloud, 
  Settings, 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Check, 
  PlusCircle, 
  Award,
  Play,
  Pause,
  FileText,
  KeyRound,
  ShieldCheck,
  Maximize,
  Minimize,
  Trash2,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import ModalSubirFoto from './ModalSubirFoto';
import ModalConfigurarDrive from './ModalConfigurarDrive';
import ModalHistoria from './ModalHistoria';
import ModalFotoDetalle from './ModalFotoDetalle';
import ModalAccesoEquipo from './ModalAccesoEquipo';
import ModalEditarPerfilGrupo from './ModalEditarPerfilGrupo';
import VentanaDonar from './VentanaDonar';
import CodigoQRGrupo from './CodigoQRGrupo';

const ItemFotoFeed = memo(function ItemFotoFeed({ foto, onClick, puedeAdministrar, eliminandoFotoId, manejarEliminarFoto }) {
  const [cargada, setCargada] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer border border-slate-200 shadow-md flex flex-col"
    >
      <div className="relative flex-1 overflow-hidden bg-slate-100">
        {/* Placeholder skeleton mientras carga la imagen */}
        {!cargada && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse z-0">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
        )}

        <img
          src={foto.url || '/logo.png'}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setCargada(true)}
          onError={(e) => {
            setCargada(true);
            e.target.onerror = null;
            e.target.src = '/logo.png';
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-opacity duration-300 ${
            cargada ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Overlay estilo Instagram al pasar el cursor */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm z-10">
          <div className="flex items-center gap-1.5">
            <Heart className="w-5 h-5 fill-white" />
            <span>{foto.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>{(foto.comentarios || []).length}</span>
          </div>
        </div>

        {/* Botón rápido de eliminar si es equipo o administrador */}
        {puedeAdministrar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              manejarEliminarFoto(foto.id);
            }}
            disabled={eliminandoFotoId === foto.id}
            title="Eliminar publicación"
            className="absolute top-2.5 right-2.5 z-20 p-2 rounded-xl bg-black/70 hover:bg-rose-600 text-white shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Contadores siempre visibles debajo de la foto */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white z-10">
        <div className="flex items-center gap-1">
          <Heart className={`w-3.5 h-3.5 ${foto.leGusta ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold text-slate-400">{foto.likes || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400">{(foto.comentarios || []).length}</span>
        </div>
      </div>
    </div>
  );
});

export default function PerfilInstagramGrupo({ idGrupo, alVolver, alAbrirRegistro }) {
  const { 
    listaGrupos, 
    usuarioActual, 
    grupoActual,
    subirFotoGrupo, 
    eliminarFotoGrupo,
    adminToken,
    actualizarVideoDrive, 
    actualizarGrupo,
    listaTransacciones,
    iniciarTimerVideo,
    verificarRetencionVideo,
    haVistoVideo,
    marcarVideoVisto
  } = usarUsuario();

  // Obtener datos reactivos del grupo
  const grupo = listaGrupos.find((g) => g.idGrupo === idGrupo) || listaGrupos[0];

  const [pestanaActiva, setPestanaActiva] = useState('publicaciones');
  const [modalSubirAbierto, setModalSubirAbierto] = useState(false);
  const [modalDriveAbierto, setModalDriveAbierto] = useState(false);
  const [modalEditarPerfilAbierto, setModalEditarPerfilAbierto] = useState(false);
  const [modalHistoriaAbierto, setModalHistoriaAbierto] = useState(false);
  const [modalAccesoEquipoAbierto, setModalAccesoEquipoAbierto] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [mostrarDonarModal, setMostrarDonarModal] = useState(false);
  const [mostrarQRModal, setMostrarQRModal] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [eliminandoFotoId, setEliminandoFotoId] = useState(null);
  const [notificacionFeed, setNotificacionFeed] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(30);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [yaInicio, setYaInicio] = useState(false);
  const [requisitoCumplido, setRequisitoCumplido] = useState(() => {
    if (haVistoVideo && haVistoVideo(idGrupo)) return true;
    try { return localStorage.getItem('slbits_video_' + idGrupo) === 'true'; } catch { return false; }
  });
  const [timerIniciado, setTimerIniciado] = useState(false);
  const contenedorVideoRef = useRef(null);
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false);

  const tieneVideo = !!(grupo && grupo.urlVideo && grupo.urlVideo.trim());
  const duracionTotal = (grupo && grupo.duracionSegundos) || 30;
  const tiempoRequerido = Math.max(15, Math.ceil(duracionTotal * 0.5));

  const esMiembroEquipo = grupoActual && grupo && (grupoActual.idGrupo === grupo.idGrupo || grupoActual.id === grupo.idGrupo);
  const puedeAdministrar = esMiembroEquipo || Boolean(adminToken);

  useEffect(() => {
    setSegundosRestantes(tiempoRequerido);
  }, [tiempoRequerido]);

  if (!grupo) return null;

  const manejarEliminarFoto = async (idFoto) => {
    if (!window.confirm("¿Confirmas que deseas eliminar esta fotografía del muro del estand? Esta acción no se puede deshacer.")) {
      return;
    }
    setEliminandoFotoId(idFoto);
    try {
      const res = await eliminarFotoGrupo(grupo.idGrupo, idFoto);
      if (res && res.exito) {
        setNotificacionFeed("Publicación eliminada correctamente del estand.");
        if (fotoSeleccionada && fotoSeleccionada.id === idFoto) {
          setFotoSeleccionada(null);
        }
        setTimeout(() => setNotificacionFeed(""), 4000);
      } else {
        alert(res?.mensaje || "No se pudo eliminar la publicación.");
      }
    } finally {
      setEliminandoFotoId(null);
    }
  };

  // Sincronizar estado globalmente si se marca como visto
  useEffect(() => {
    if (haVistoVideo && haVistoVideo(idGrupo)) {
      setRequisitoCumplido(true);
      setSegundosRestantes(0);
    }
  }, [haVistoVideo, idGrupo]);

  // Detectar cambio de fullscreen
  useEffect(() => {
    const manejarCambio = () => {
      setEnPantallaCompleta(Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', manejarCambio);
    document.addEventListener('webkitfullscreenchange', manejarCambio);
    return () => {
      document.removeEventListener('fullscreenchange', manejarCambio);
      document.removeEventListener('webkitfullscreenchange', manejarCambio);
    };
  }, []);

  const activarPantallaCompleta = useCallback(() => {
    const el = contenedorVideoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  const salirPantallaCompleta = useCallback(() => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }, []);

  // Guardar en localStorage y notificar globalmente cuando se cumple el requisito del video
  useEffect(() => {
    if (requisitoCumplido) {
      if (marcarVideoVisto) {
        marcarVideoVisto(idGrupo);
      } else {
        try { localStorage.setItem('slbits_video_' + idGrupo, 'true'); } catch {}
      }
    }
  }, [requisitoCumplido, idGrupo, marcarVideoVisto]);

  useEffect(() => {
    if (!tieneVideo || pestanaActiva !== 'videoDrive' || !reproduciendo) return;
    if (segundosRestantes <= 0) {
      setRequisitoCumplido(true);
      return;
    }
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setRequisitoCumplido(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [reproduciendo, tieneVideo, pestanaActiva]);

  // Sincronizar con servidor cada 10 segundos mientras se reproduce
  useEffect(() => {
    if (!tieneVideo || pestanaActiva !== 'videoDrive' || !reproduciendo || !timerIniciado || !usuarioActual) return;
    const sincronizar = async () => {
      try {
        const resultado = await verificarRetencionVideo(idGrupo);
        if (resultado && resultado.retencionCumplida) {
          setRequisitoCumplido(true);
          setSegundosRestantes(0);
        }
      } catch {}
    };
    const intervaloSync = setInterval(sincronizar, 10000);
    return () => clearInterval(intervaloSync);
  }, [tieneVideo, pestanaActiva, reproduciendo, timerIniciado, usuarioActual, idGrupo, verificarRetencionVideo]);

  // Iniciar timer en servidor cuando se abre la pestaña de video (sin auto-reproducir)
  useEffect(() => {
    if (pestanaActiva === 'videoDrive' && tieneVideo && usuarioActual && !timerIniciado && !requisitoCumplido) {
      const iniciar = async () => {
        try {
          const resultado = await iniciarTimerVideo(idGrupo);
          if (resultado && resultado.exito) {
            setTimerIniciado(true);
            if (resultado.tiempoRequeridoSegundos) {
              setSegundosRestantes(resultado.tiempoRequeridoSegundos);
            }
          }
        } catch {}
      };
      iniciar();
    }
  }, [pestanaActiva, tieneVideo, usuarioActual, timerIniciado, requisitoCumplido, idGrupo, iniciarTimerVideo]);

  useEffect(() => {
    if (pestanaActiva !== 'videoDrive') {
      setReproduciendo(false);
      setYaInicio(false);
      setTimerIniciado(false);
      setSegundosRestantes(0);
    }
  }, [pestanaActiva, idGrupo]);

  if (!grupo) return null;

// Filtrar donaciones recibidas por este grupo
  const donacionesRecibidas = listaTransacciones.filter(
    (tx) => tx.idReceptor === grupo.idGrupo || tx.nombreReceptor?.includes(grupo.nombreGrupo)
  );
  const apoyosUnicos = new Set(donacionesRecibidas.map((tx) => tx.idEmisor)).size;

  const fotos = grupo.fotos || [];
  const historias = grupo.historias || [];

  const copiarEnlace = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const porcentajeProgreso = Math.min(
    100,
    Math.round(((tiempoRequerido - segundosRestantes) / tiempoRequerido) * 100)
  );

  // Solicitar clave de acceso si no está autenticado como el grupo ni es administrador
  const solicitarAccionEquipo = (tipoAccion) => {
    if (puedeAdministrar) {
      if (tipoAccion === 'subirFoto') setModalSubirAbierto(true);
      if (tipoAccion === 'configDrive') setModalDriveAbierto(true);
    } else {
      setAccionPendiente(tipoAccion);
      setModalAccesoEquipoAbierto(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Barra superior de navegación rápida y retroceso */}
      <div className="flex items-center justify-between">
        <button
          onClick={alVolver}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 border border-slate-200 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista de Estands
        </button>

        <div className="flex items-center gap-2">
          {puedeAdministrar && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {adminToken ? 'Modo Administrador' : 'Modo Edición del Equipo'}
            </span>
          )}

          <button
            onClick={() => setMostrarQRModal(true)}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 border border-slate-200"
            title="Código QR del Estand"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={copiarEnlace}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-800 border border-slate-200 text-xs font-bold transition-colors"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copiado ? '¡Enlace Copiado!' : 'Compartir'}
          </button>
        </div>
      </div>

      {/* Tarjeta de Perfil Estilo Instagram */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        
        {/* Cabecera del Perfil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          
          {/* Avatar con Anillo de Historia de Instagram */}
          <div 
            onClick={() => historias.length > 0 && setModalHistoriaAbierto(true)}
            className={`relative cursor-pointer group ${
              historias.length > 0 ? 'p-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 animate-pulse' : ''
            }`}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#FFFFFF] bg-slate-50 shadow-xl">
              <img
                src={grupo.urlFoto || "/logo.png"}
                alt={grupo.nombreGrupo}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {historias.length > 0 && (
              <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-rose-600 text-[10px] font-black text-white border-2 border-[#FFFFFF]">
                HISTORIA DEL EQUIPO
              </span>
            )}
          </div>

          {/* Información del Perfil */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            
            {/* Handle y Botones de Acción */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">{grupo.handle || `@${grupo.idGrupo.toLowerCase()}`}</h2>
                <div className="w-5 h-5 rounded-full bg-[#0A4D9C] flex items-center justify-center text-slate-800 font-black text-[11px]" title="Proyecto Oficial Verificado">
                  ✓
                </div>
              </div>

              {/* Botones de acción principales */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* El botón de donar SOLO aparece si ya vio el video */}
                {requisitoCumplido ? (
                  <button
                    onClick={() => setMostrarDonarModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#d87012] hover:to-[#be8f30] text-white text-xs font-black shadow-lg shadow-orange-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    Apoyar con SL - BITS
                  </button>
                ) : tieneVideo ? (
                  <button
                    onClick={() => {
                      setPestanaActiva('videoDrive');
                      setReproduciendo(true);
                      setYaInicio(true);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#0A4D9C] hover:bg-[#07366E] text-white text-xs font-bold shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Ver Video ({duracionTotal}s) para Apoyar
                  </button>
                ) : null}

                {puedeAdministrar && (
                  <>
                    <button
                      onClick={() => solicitarAccionEquipo('subirFoto')}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-pink-500/20 flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Nueva Publicación
                    </button>

                    <button
                      onClick={() => solicitarAccionEquipo('configDrive')}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-2"
                    >
                      <Video className="w-4 h-4 text-[#0A4D9C]" />
                      Video Drive
                    </button>

                    <button
                      onClick={() => setModalEditarPerfilAbierto(true)}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-[#0A4D9C]" />
                      Editar Estand
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Estadísticas de Instagram */}
            <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 border-y border-slate-200 py-3 text-xs">
              <div>
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">{fotos.length}</span>
                <span className="text-slate-400 block sm:inline sm:ml-1 font-medium">publicaciones</span>
              </div>
<div>
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">{apoyosUnicos}</span>
                <span className="text-slate-400 block sm:inline sm:ml-1 font-medium">apoyos</span>
              </div>
              <div>
                <span className="font-extrabold text-[#E67A15] text-sm sm:text-base">{(grupo.totalRecaudado || 0).toFixed(2)} ⚡</span>
                <span className="text-slate-400 block sm:inline sm:ml-1 font-medium">SL - BITS</span>
              </div>
<div>
                <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                  {grupo.integrantes?.split(',').length || 0}
                </span>
                <span className="text-slate-400 block sm:inline sm:ml-1 font-medium">integrantes</span>
              </div>
            </div>

            {/* Biografía / Descripción del Proyecto */}
            <div className="space-y-1.5 text-xs">
              <h1 className="text-sm sm:text-base font-black text-slate-800">{grupo.nombreGrupo}</h1>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 text-[#0A4D9C] font-bold text-[11px]">
                <Layers className="w-3.5 h-3.5" />
                {grupo.especialidad}
              </div>

              <p className="text-slate-400 leading-relaxed pt-1">
                {grupo.descripcion}
              </p>

              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <Users className="w-3.5 h-3.5 text-[#E67A15] flex-shrink-0" />
                <span className="font-medium text-slate-800">Equipo de trabajo:</span>
                <span className="text-slate-400">{grupo.integrantes}</span>
              </div>

              {grupo.enlaceDriveCarpeta && (
                <div className="pt-1">
                  <a
                    href={grupo.enlaceDriveCarpeta}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#0A4D9C] hover:underline font-bold text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Carpeta de Documentación en Google Drive
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Barra de Historias / Highlights Estilo Instagram */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            
            {/* Botón para subir historia o foto (Solo visible para miembros del estand activo) */}
            {esMiembroEquipo && (
              <button
                onClick={() => solicitarAccionEquipo('subirFoto')}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-[#E67A15] flex items-center justify-center text-slate-400 group-hover:text-[#E67A15] transition-colors">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium group-hover:text-white">Nueva Publicación</span>
              </button>
            )}

            {/* Burbujas de Historias */}
            {historias.map((historia, idx) => (
              <button
                key={historia.id || idx}
                onClick={() => setModalHistoriaAbierto(true)}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                    {historia.foto ? (
                      <img src={historia.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{historia.icono || "•"}</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[70px] group-hover:text-white">
                  {historia.titulo}
                </span>
              </button>
            ))}

          </div>
        </div>

      </div>

      {/* Pestañas de Navegación de Instagram */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1">
        <button
          onClick={() => { setPestanaActiva('publicaciones'); setReproduciendo(false); }}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${
            pestanaActiva === 'publicaciones'
              ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          PUBLICACIONES ({fotos.length})
        </button>

        <button
          onClick={() => setPestanaActiva('videoDrive')}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${
            pestanaActiva === 'videoDrive'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          REEL / VIDEO DRIVE
        </button>

        <button
          onClick={() => { setPestanaActiva('apoyos'); setReproduciendo(false); }}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${
            pestanaActiva === 'apoyos'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          DONACIONES ({donacionesRecibidas.length})
        </button>

        <button
          onClick={() => { setPestanaActiva('ficha'); setReproduciendo(false); }}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all ${
            pestanaActiva === 'ficha'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          FICHA TÉCNICA
        </button>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}

      {/* 1. Cuadrícula de Fotos de Instagram */}
      {pestanaActiva === 'publicaciones' && (
        <div className="space-y-6">
          
          {notificacionFeed && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
              <span>{notificacionFeed}</span>
              <button onClick={() => setNotificacionFeed('')} className="text-emerald-500 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Galería de Publicaciones</h3>
              <p className="text-xs text-slate-400">Explora fotografías del prototipo, pruebas técnicas y experiencias del equipo</p>
            </div>

            <button
              onClick={() => solicitarAccionEquipo('subirFoto')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E67A15]/15 hover:bg-[#E67A15]/25 text-[#E67A15] border border-[#E67A15]/50 text-xs font-bold transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Agregar Foto al Muro
            </button>
          </div>

          {fotos.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-3">
              <Grid className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Aún no hay fotos en este perfil</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sé el primero en subir fotos del prototipo y capturas de la Expotecnia.
              </p>
              <button
                onClick={() => solicitarAccionEquipo('subirFoto')}
                className="px-5 py-2.5 rounded-2xl bg-[#E67A15] text-white text-xs font-bold shadow-lg"
              >
                Subir primera foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fotos.map((foto) => (
                <ItemFotoFeed
                  key={foto.id}
                  foto={foto}
                  onClick={() => setFotoSeleccionada(foto)}
                  puedeAdministrar={puedeAdministrar}
                  eliminandoFotoId={eliminandoFotoId}
                  manejarEliminarFoto={manejarEliminarFoto}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* 2. Reproductor de Video de Google Drive */}
      {pestanaActiva === 'videoDrive' && (
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 text-[#0A4D9C] text-xs font-bold">
                <Video className="w-3.5 h-3.5" />
                Video Demostrativo Oficial
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-1">Demostración Técnica del Estand</h3>
              <p className="text-xs text-slate-400">
                Visualiza el video demostrativo para validar tu apoyo y desbloquear la donación en SL - BITS.
              </p>
            </div>

            {puedeAdministrar && (
            <button
              onClick={() => solicitarAccionEquipo('configDrive')}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0A4D9C] border border-slate-200 text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
            >
              <Settings className="w-4 h-4" />
              Actualizar Video de Drive
            </button>
            )}
          </div>

{/* Reproductor de Video Iframe de Google Drive */}
          {grupo.urlVideo ? (
            <div className="space-y-3">
              {/* Contenedor del video */}
              <div
                ref={contenedorVideoRef}
                className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-slate-200"
                style={{ paddingBottom: '56.25%' }}
              >
                <iframe
                  src={grupo.urlVideo}
                  title={`Video de ${grupo.nombreGrupo}`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />

                {/* Overlay con controles superpuestos — solo antes del primer play */}
                {yaInicio === false && !requisitoCumplido && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <button
                      onClick={() => { setReproduciendo(true); setYaInicio(true); }}
                      className="w-20 h-20 rounded-full bg-[#E67A15] hover:bg-[#C8640C] text-white flex items-center justify-center shadow-2xl shadow-orange-500/40 transition-all hover:scale-105"
                    >
                      <Play className="w-10 h-10 fill-white ml-1" />
                    </button>
                  </div>
                )}

                {requisitoCumplido && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Desbloqueado!
                    </div>
                  </div>
                )}

                {/* Botón pantalla completa / salir */}
                <button
                  onClick={enPantallaCompleta ? salirPantallaCompleta : activarPantallaCompleta}
                  className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                  title={enPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {enPantallaCompleta ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

              {/* Barra de progreso + controles debajo del video */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setReproduciendo(!reproduciendo)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-all ${
                        reproduciendo
                          ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                          : 'bg-[#E67A15] hover:bg-orange-600 shadow-orange-500/30'
                      }`}
                    >
                      {reproduciendo ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {requisitoCumplido
                          ? '¡Desbloqueado! Ya puedes apoyar'
                          : reproduciendo
                            ? 'Temporizador activo — mantente en el video'
                            : 'Presiona play para iniciar el conteo'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Mínimo: {tiempoRequerido}s de {duracionTotal}s de video
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {requisitoCumplido ? (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Listo
                      </span>
                    ) : (
                      <span className="text-amber-600 font-mono font-bold text-sm">
                        {segundosRestantes}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                      requisitoCumplido
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-gradient-to-r from-[#E67A15] to-amber-500'
                    }`}
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-6">
              <Video className="w-12 h-12 text-[#0A4D9C]/40 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-bold">Este estand aún no publica su video</p>
              <p className="text-xs text-slate-400 mt-1">El equipo puede configurarlo desde "Actualizar Video de Drive".</p>
            </div>
          )}

          {/* Botón de donación: SOLO aparece una vez cumplido el requisito del video */}
          {tieneVideo && requisitoCumplido && (
            <button
              onClick={() => setMostrarDonarModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#d87012] hover:to-[#be8f30] text-white shadow-xl shadow-orange-500/30 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-white" />
              ¡Apoyar a este proyecto con SL - BITS!
            </button>
          )}

        </div>
      )}

      {/* 3. Muro de Donadores y Apoyos */}
      {pestanaActiva === 'apoyos' && (
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Comunidad de Apoyos y Donaciones</h3>
              <p className="text-xs text-slate-400">Total recaudado: <strong className="text-[#E67A15]">{(grupo.totalRecaudado || 0).toFixed(2)} SL - BITS</strong></p>
            </div>
            
            {/* Botón de donar en el muro: SOLO aparece si ya vio el video */}
            {requisitoCumplido ? (
              <button
                onClick={() => setMostrarDonarModal(true)}
                className="px-4 py-2 rounded-2xl bg-[#E67A15] hover:bg-[#d87012] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-colors"
              >
                Realizar una Donación
              </button>
            ) : tieneVideo ? (
              <button
                onClick={() => {
                  setPestanaActiva('videoDrive');
                  setReproduciendo(true);
                  setYaInicio(true);
                }}
                className="px-4 py-2 rounded-2xl bg-[#0A4D9C]/15 hover:bg-[#0A4D9C]/25 text-[#0A4D9C] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-[#0A4D9C]" />
                Ver Video para Apoyar
              </button>
            ) : null}
          </div>

          {donacionesRecibidas.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <Zap className="w-10 h-10 text-[#E67A15] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400 font-bold">Aún no se registran donaciones en vivo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Sé el primero en donar SL - BITS a este equipo estudiantil.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {donacionesRecibidas.map((tx) => (
                <div key={tx.idTransaccion} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center text-xs font-bold text-[#E67A15]">
                      ⚡
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tx.nombreEmisor || "Estudiante San Luis"}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.fecha).toLocaleString('es-SV', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-emerald-600">
                    +{parseFloat(tx.monto).toFixed(2)} SL - BITS
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* 4. Ficha Técnica del Proyecto */}
      {pestanaActiva === 'ficha' && (
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-base font-black text-slate-800">Ficha Técnica e Innovación</h3>
            <p className="text-xs text-slate-400">Detalles del prototipo, tecnología empleada y estructura del equipo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(grupo.especificaciones || [
              { clave: "Especialidad", valor: grupo.especialidad },
              { clave: "Equipo", valor: grupo.integrantes },
              { clave: "Certamen", valor: "Expotecnia Institucional 2026" }
            ]).map((spec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A4D9C] block">
                  {spec.clave}
                </span>
                <span className="text-sm font-semibold text-slate-800 block">
                  {spec.valor}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Impacto y Relevancia Institucional:</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Proyecto calificado dentro de los estándares de excelencia académica del Instituto San Luis. Enfocado en resolver problemáticas del entorno comunitario con tecnología abierta y sustentabilidad.
            </p>
          </div>
        </div>
      )}

      {/* MODALES DEL PERFIL */}
      
      {/* Modal Estado del Usuario de Equipo con Clave */}
      <ModalAccesoEquipo
        estaAbierto={modalAccesoEquipoAbierto}
        alCerrar={() => setModalAccesoEquipoAbierto(false)}
        grupo={grupo}
        alAutenticado={() => {
          if (accionPendiente === 'subirFoto') setModalSubirAbierto(true);
          if (accionPendiente === 'configDrive') setModalDriveAbierto(true);
          setAccionPendiente(null);
        }}
      />

      {/* Modal Nueva Publicación */}
      <ModalSubirFoto
        estaAbierto={modalSubirAbierto}
        alCerrar={() => setModalSubirAbierto(false)}
        alSubir={async (datos) => {
          const res = await subirFotoGrupo(grupo.idGrupo, datos);
          if (res?.exito) {
            setNotificacionFeed("¡Foto publicada con éxito en el feed del estand!");
            setTimeout(() => setNotificacionFeed(""), 4000);
          }
          return res;
        }}
        nombreGrupo={grupo.nombreGrupo}
      />

      {/* Modal Configurar Drive */}
      <ModalConfigurarDrive
        estaAbierto={modalDriveAbierto}
        alCerrar={() => setModalDriveAbierto(false)}
        urlActual={grupo.urlVideo}
        duracionActual={grupo.duracionSegundos}
        alGuardar={(url, dur) => actualizarVideoDrive(grupo.idGrupo, url, dur)}
        nombreGrupo={grupo.nombreGrupo}
      />

      {/* Modal Editar Perfil del Estand */}
      <ModalEditarPerfilGrupo
        estaAbierto={modalEditarPerfilAbierto}
        alCerrar={() => setModalEditarPerfilAbierto(false)}
        grupo={grupo}
        alGuardar={(datos) => actualizarGrupo(datos)}
      />

      {/* Modal Historias */}
      <ModalHistoria
        estaAbierto={modalHistoriaAbierto}
        alCerrar={() => setModalHistoriaAbierto(false)}
        historias={historias}
        grupo={grupo}
      />

      {/* Modal Detalle de Foto (Lightbox) */}
      <ModalFotoDetalle
        estaAbierto={Boolean(fotoSeleccionada)}
        alCerrar={() => setFotoSeleccionada(null)}
        foto={fotoSeleccionada ? (grupo.fotos || []).find(f => f.id === fotoSeleccionada.id) || fotoSeleccionada : null}
        grupo={grupo}
        esMiembroEquipo={puedeAdministrar}
        alEliminarFoto={manejarEliminarFoto}
        alAbrirDonacion={() => {
          setFotoSeleccionada(null);
          setMostrarDonarModal(true);
        }}
        alAbrirRegistro={alAbrirRegistro}
      />

      {/* Modal Apoyar Estand */}
      <VentanaDonar
        estand={grupo}
        estaAbierto={mostrarDonarModal}
        alCerrar={() => setMostrarDonarModal(false)}
        alAbrirRegistro={alAbrirRegistro}
      />

      {/* Modal Código QR */}
      <CodigoQRGrupo
        grupo={grupo}
        estaAbierto={mostrarQRModal}
        alCerrar={() => setMostrarQRModal(false)}
      />

    </div>
  );
}

