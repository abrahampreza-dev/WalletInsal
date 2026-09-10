import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, 
  Play, 
  Pause,
  Clock, 
  CheckCircle2, 
  Lock, 
  Users, 
  Layers, 
  Heart,
  QrCode,
  Grid,
  Video,
  Maximize,
  X
} from 'lucide-react';
import CodigoQRGrupo from './CodigoQRGrupo';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function TarjetaEstand({ estand, alAbrirDonacion, alAbrirPerfilInstagram }) {
  const { usuarioActual, iniciarTimerVideo, verificarRetencionVideo } = usarUsuario();
  const tieneVideo = !!(estand.urlVideo && estand.urlVideo.trim());
  const duracionTotal = estand.duracionSegundos || 30;
  const tiempoRequeridoSegundos = Math.max(15, Math.ceil(duracionTotal * 0.5));

  const [segundosRestantes, setSegundosRestantes] = useState(tiempoRequeridoSegundos);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [requisitoCumplido, setRequisitoCumplido] = useState(false);
  const [mostrarVideoModal, setMostrarVideoModal] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [timerIniciado, setTimerIniciado] = useState(false);
  const contenedorVideoRef = useRef(null);

  const activarPantallaCompleta = useCallback(() => {
    const el = contenedorVideoRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  useEffect(() => {
    if (!tieneVideo || !mostrarVideoModal || !reproduciendo) return;
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
  }, [reproduciendo, tieneVideo, mostrarVideoModal]);

  // Sincronizar con servidor cada 10 segundos mientras se reproduce
  useEffect(() => {
    if (!tieneVideo || !mostrarVideoModal || !reproduciendo || !timerIniciado || !usuarioActual) return;
    const sincronizar = async () => {
      try {
        const resultado = await verificarRetencionVideo(estand.idGrupo);
        if (resultado && resultado.retencionCumplida) {
          setRequisitoCumplido(true);
          setSegundosRestantes(0);
        }
      } catch {}
    };
    const intervaloSync = setInterval(sincronizar, 10000);
    return () => clearInterval(intervaloSync);
  }, [tieneVideo, mostrarVideoModal, reproduciendo, timerIniciado, usuarioActual, estand.idGrupo, verificarRetencionVideo]);

  const porcentajeProgreso = Math.min(
    100,
    Math.round(((tiempoRequeridoSegundos - segundosRestantes) / tiempoRequeridoSegundos) * 100)
  );

  const iniciarReproduccion = async () => {
    setReproduciendo(true);
    setMostrarVideoModal(true);
    if (usuarioActual && !timerIniciado) {
      try {
        const resultado = await iniciarTimerVideo(estand.idGrupo);
        if (resultado && resultado.exito) {
          setTimerIniciado(true);
          if (resultado.tiempoRequeridoSegundos) {
            setSegundosRestantes(resultado.tiempoRequeridoSegundos);
          }
        }
      } catch {}
    }
  };

  const cantidadFotos = (estand.fotos || []).length;

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between group">
      
      {/* Contenedor de Imagen de Portada y Video */}
      <div className="relative aspect-video w-full bg-slate-50 overflow-hidden">
        <img
          src={estand.urlFoto || "/logo.png"}
          alt={estand.nombreGrupo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Capa de degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A4D9C]/90 via-[#0A4D9C]/15 to-transparent" />

        {/* Insignia de Especialidad */}
        <div className="absolute top-3 left-3">
          <span className="bg-white backdrop-blur-md text-[#0A4D9C] border border-[#0A4D9C]/50 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <Layers className="w-3 h-3" />
            {estand.especialidad}
          </span>
        </div>

        {/* Total Recaudado */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-md text-[#0A4D9C] border border-white/50 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Zap className="w-3.5 h-3.5 fill-[#E67A15]" />
            {(estand.totalRecaudado || 0).toFixed(2)} SL - BITS
          </span>
        </div>

        {/* Botón QR */}
        <button
          onClick={() => setMostrarQR(true)}
          aria-label={`Mostrar QR de ${estand.nombreGrupo}`}
          className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white text-[#0A4D9C] shadow-lg hover:bg-[#E67A15] hover:text-white transition-colors"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Badge de Instagram / Fotos */}
        <div className="absolute bottom-3 left-3">
          <button
            onClick={() => alAbrirPerfilInstagram(estand.idGrupo)}
            className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-pink-400 hover:text-pink-300 border border-pink-500/30 text-[10px] font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Grid className="w-3 h-3" />
            {cantidadFotos} fotos • Ver Explorar INSALSPACE
          </button>
        </div>

        {/* Botón de Reproducción sobre la portada */}
        {tieneVideo && (
          <button
            onClick={iniciarReproduccion}
            className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E67A15]/90 hover:bg-[#E67A15] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-110 transition-all duration-300">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Contenido Informativo */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Handle de Instagram y Nombre */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-pink-400">
              {estand.handle || `@${(estand.nombreGrupo || 'estand').toLowerCase().replace(/\s+/g, '.')}`}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Video className="w-3 h-3 text-[#0A4D9C]" />
              Drive {duracionTotal}s
            </span>
          </div>

          <h3 
            onClick={() => alAbrirPerfilInstagram(estand.idGrupo)}
            className="text-base font-black text-slate-800 group-hover:text-[#E67A15] transition-colors line-clamp-1 cursor-pointer mt-1"
          >
            {estand.nombreGrupo}
          </h3>

<p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
            {estand.descripcion || "Sin descripción disponible aún."}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-[#0A4D9C] flex-shrink-0" />
            <span className="truncate">{estand.integrantes}</span>
          </div>
        </div>

        {/* Barra de Tiempo de Retención del Video */}
        {tieneVideo ? (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Retención (50%):
              </span>
              {requisitoCumplido ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ¡Apoyo Desbloqueado!
                </span>
              ) : (
                <span className="text-slate-400 font-mono font-bold text-[11px]">
                  {segundosRestantes}s restantes
                </span>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  requisitoCumplido
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    : 'bg-gradient-to-r from-[#E67A15] to-amber-500'
                }`}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Video className="w-3 h-3" />
              Video no disponible aún — donación bloqueada
            </span>
          </div>
        )}

        {/* Botones: Ver Perfil Instagram + Realizar una Donación */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => alAbrirPerfilInstagram(estand.idGrupo)}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
<Grid className="w-3.5 h-3.5 text-pink-400" />
            Explorar INSALSPACE
          </button>

          <button
            onClick={() => alAbrirDonacion(estand)}
            disabled={!requisitoCumplido}
            className={`py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              requisitoCumplido
                ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white shadow-lg shadow-orange-500/25 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-[11px]'
            }`}
          >
            {requisitoCumplido ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-white" />
                Realizar una Donación
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                {tieneVideo ? `Ver video (${segundosRestantes}s)` : 'Video no disponible'}
              </>
            )}
          </button>
        </div>

      </div>

      {/* Modal Reproductor de Video de Google Drive */}
      {mostrarVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Header del modal */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A4D9C]/10 border border-[#0A4D9C]/30 flex items-center justify-center">
                  <Video className="w-4 h-4 text-[#0A4D9C]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">{estand.nombreGrupo}</h4>
                  <p className="text-[10px] text-slate-400">Demostración técnica • Google Drive</p>
                </div>
              </div>
              <button
                onClick={() => { setMostrarVideoModal(false); setReproduciendo(false); }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Iframe Google Drive */}
            {estand.urlVideo ? (
              <div className="space-y-0">
                <div
                  ref={contenedorVideoRef}
                  className="relative w-full bg-black"
                  style={{ paddingBottom: '56.25%' }}
                >
                  <iframe
                    src={estand.urlVideo}
                    title={`Video de ${estand.nombreGrupo}`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />

                  {/* Overlay de play cuando no está reproduciendo */}
                  {!reproduciendo && !requisitoCumplido && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <button
                        onClick={() => {
                          setReproduciendo(true);
                          if (usuarioActual && !timerIniciado) {
                            iniciarTimerVideo(estand.idGrupo).then((r) => {
                              if (r && r.exito) {
                                setTimerIniciado(true);
                                if (r.tiempoRequeridoSegundos) setSegundosRestantes(r.tiempoRequeridoSegundos);
                              }
                            });
                          }
                        }}
                        className="w-16 h-16 rounded-full bg-[#E67A15] hover:bg-[#C8640C] text-white flex items-center justify-center shadow-2xl shadow-orange-500/40 transition-all hover:scale-105"
                      >
                        <Play className="w-8 h-8 fill-white ml-0.5" />
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

                  {/* Botón pantalla completa */}
                  <button
                    onClick={activarPantallaCompleta}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                    title="Pantalla completa"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>

                {/* Controles debajo del video */}
                <div className="p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setReproduciendo(!reproduciendo);
                          if (!reproduciendo && usuarioActual && !timerIniciado) {
                            iniciarTimerVideo(estand.idGrupo).then((r) => {
                              if (r && r.exito) {
                                setTimerIniciado(true);
                                if (r.tiempoRequeridoSegundos) setSegundosRestantes(r.tiempoRequeridoSegundos);
                              }
                            });
                          }
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-all ${
                          reproduciendo
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-[#E67A15] hover:bg-orange-600'
                        }`}
                      >
                        {reproduciendo ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {requisitoCumplido
                            ? '¡Listo! Puedes apoyar este proyecto'
                            : reproduciendo
                              ? 'Conteo activo — no cierres el video'
                              : 'Presiona play para iniciar validación'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Mínimo {tiempoRequeridoSegundos}s de {duracionTotal}s
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold font-mono ${requisitoCumplido ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {requisitoCumplido ? '✓' : `${segundosRestantes}s`}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-linear ${requisitoCumplido ? 'bg-emerald-400' : 'bg-[#E67A15]'}`}
                      style={{ width: `${porcentajeProgreso}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-slate-50 flex flex-col items-center justify-center gap-2 text-center p-6">
                <Video className="w-8 h-8 text-[#0A4D9C]/50" />
                <p className="text-xs text-slate-400 font-semibold">Este estand aún no publica su video.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CodigoQRGrupo
        grupo={estand}
        estaAbierto={mostrarQR}
        alCerrar={() => setMostrarQR(false)}
      />

    </div>
  );
}

