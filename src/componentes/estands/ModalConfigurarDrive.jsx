import React, { useState } from 'react';
import { X, Video, Play, CheckCircle2, HelpCircle, ExternalLink } from 'lucide-react';

export default function ModalConfigurarDrive({ estaAbierto, alCerrar, urlActual, duracionActual, alGuardar, nombreGrupo }) {
  const [urlVideo, setUrlVideo] = useState(urlActual || '');
  const [duracion, setDuracion] = useState(duracionActual || 30);
  const [urlPrevia, setUrlPrevia] = useState(urlActual || '');
  const [probando, setProbando] = useState(false);
  const [cargando, setCargando] = useState(false);

  if (!estaAbierto) return null;

  // Convertir URL compartida de Google Drive a formato incrustable /preview
  const transformarUrlDrive = (url) => {
    let limpia = url.trim();
    if (!limpia) return '';

    if (limpia.includes('drive.google.com')) {
      if (limpia.includes('/file/d/')) {
        const idArchivo = limpia.split('/file/d/')[1].split('/')[0].split('?')[0];
        return `https://drive.google.com/file/d/${idArchivo}/preview`;
      }
    }
    return limpia;
  };

  const manejarCambioUrl = (valor) => {
    setUrlVideo(valor);
    const convertida = transformarUrlDrive(valor);
    setUrlPrevia(convertida);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const finalUrl = transformarUrlDrive(urlVideo);
      await alGuardar(finalUrl, Number(duracion) || 30);
      alCerrar();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A4D9C] to-[#07366E] flex items-center justify-center text-white">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Configurar Video de Google Drive</h3>
              <p className="text-xs text-slate-400">Estand: {nombreGrupo}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={manejarGuardar} className="p-6 overflow-y-auto space-y-5">
          
          {/* Instrucciones de Google Drive */}
          <div className="p-4 rounded-2xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/45 space-y-2">
            <div className="flex items-center gap-2 text-[#0A4D9C] font-bold text-xs">
              <HelpCircle className="w-4 h-4" />
              ¿Cómo obtener el enlace de Google Drive?
            </div>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Sube tu video a tu <strong>Google Drive</strong>.</li>
              <li>Haz clic derecho en el video &gt; <strong>Compartir</strong>.</li>
              <li>Cambia el acceso a: <strong className="text-slate-800">"Cualquier persona con el enlace"</strong>.</li>
              <li>Copia y pega el enlace aquí. ¡El sistema lo adaptará automáticamente!</li>
            </ol>
          </div>

          {/* Input de URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enlace de Video (Google Drive)
            </label>
            <input
              type="text"
              required
              value={urlVideo}
              onChange={(e) => manejarCambioUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/1Bxi.../view?usp=sharing"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C] font-mono"
            />
          </div>

          {/* Duración */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Duración del Video (segundos)
            </label>
            <input
              type="number"
              min="15"
              max="300"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C] font-bold"
            />
            <p className="text-[10px] text-slate-400">
              Mínimo de retención requerido para votar: {Math.max(15, Math.ceil(duracion * 0.5))} segundos (50%).
            </p>
          </div>

          {/* Previsualización en Vivo */}
          {urlPrevia && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Previsualización del Reproductor Drive:</span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enlace validado
                </span>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
                <iframe
                  src={urlPrevia}
                  title="Vista previa video Google Drive"
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-extrabold shadow-lg shadow-sky-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {cargando ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle2 className="w-4 h-4" />}
              {cargando ? 'Guardando...' : 'Guardar Video de Drive'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
