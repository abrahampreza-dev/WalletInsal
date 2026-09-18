import React, { useState } from 'react';
import { X, UploadCloud, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { comprimirImagen } from '../../utilidades/compresionImagen';
import { enviarPeticion } from '../../servicios/conexionGas';

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || "4ebfa8bd17749fad6aefea2e7b51e909";

export default function ModalSubirFoto({ estaAbierto, alCerrar, alSubir, nombreGrupo }) {
  const [urlImagen, setUrlImagen] = useState('');
  const [pieDeFoto, setPieDeFoto] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [etiquetaSugerida, setEtiquetaSugerida] = useState('#Expotecnia2026 #SanLuis');
  const [procesando, setProcesando] = useState(false);
  const [estadoSubida, setEstadoSubida] = useState(''); // 'comprimiendo', 'subiendo', 'listo'
  const [infoCompresion, setInfoCompresion] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const [guardandoPublicacion, setGuardandoPublicacion] = useState(false);

  if (!estaAbierto) return null;

  const manejarArchivoLocal = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setMensajeError('');
    setInfoCompresion(null);
    setProcesando(true);
    setEstadoSubida('comprimiendo');

    try {
      // 1. COMPRESIÓN INTELIGENTE EN CLIENTE (Reduce fotos de 8MB a ~35-50KB al instante para carga ultrarrápida)
      const resCompresion = await comprimirImagen(archivo, {
        maxAncho: 900,
        maxAlto: 900,
        calidad: 0.70,
        formato: 'image/webp'
      });

      setVistaPrevia(resCompresion.dataUrl);
      setInfoCompresion({
        pesoOriginal: resCompresion.pesoOriginal,
        pesoComprimido: resCompresion.pesoComprimido,
        porcentajeAhorro: resCompresion.porcentajeAhorro
      });

      // 2. SUBIDA MULTI-NIVEL (ImgBB directo con fallback automático a GAS o Base64)
      setEstadoSubida('subiendo');
      let urlFinal = '';

      // Intento 1: API ImgBB directa con imagen comprimida
      if (IMGBB_KEY) {
        try {
          const formData = new FormData();
          formData.append('image', resCompresion.base64Pura);

          const resp = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
            method: 'POST',
            body: formData
          });

          const data = await resp.json();
          if (data && data.success && data.data?.url) {
            urlFinal = data.data.url;
          }
        } catch (errImgbb) {
          console.warn("Intento directo a ImgBB omitido o bloqueado, usando backend GAS:", errImgbb);
        }
      }

      // Intento 2: Backend Google Apps Script como proxy (evita bloqueadores de anuncios / CORS)
      if (!urlFinal) {
        try {
          const respGas = await enviarPeticion('subirImagen', { imagenBase64: resCompresion.base64Pura });
          if (respGas && respGas.exito && respGas.urlImagen) {
            urlFinal = respGas.urlImagen;
          }
        } catch (errGas) {
          console.warn("Fallo subida vía GAS:", errGas);
        }
      }

      // Intento 3: Si ambos servicios fallan, la imagen comprimida (<150KB) se usa directamente
      if (!urlFinal) {
        urlFinal = resCompresion.dataUrl;
      }

      setUrlImagen(urlFinal);
      setEstadoSubida('listo');
    } catch (err) {
      console.error("Error al procesar la imagen:", err);
      setMensajeError('No se pudo procesar la imagen seleccionada. Intenta con otra imagen.');
      setVistaPrevia('');
      setEstadoSubida('');
    } finally {
      setProcesando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!urlImagen.trim() || guardandoPublicacion) return;

    setMensajeError('');
    setGuardandoPublicacion(true);

    const textoCompleto = pieDeFoto.trim()
      ? `${pieDeFoto.trim()} ${etiquetaSugerida}`
      : `Proyecto ${nombreGrupo} ⚡ ${etiquetaSugerida}`;

    try {
      const resultado = await alSubir({
        url: urlImagen,
        pie: textoCompleto
      });

      if (resultado && resultado.exito === false) {
        setMensajeError(resultado.mensaje || 'No se pudo guardar la publicación en el estand.');
        setGuardandoPublicacion(false);
        return;
      }

      // Limpieza y cierre
      setUrlImagen('');
      setPieDeFoto('');
      setVistaPrevia('');
      setInfoCompresion(null);
      setEstadoSubida('');
      alCerrar();
    } catch (err) {
      console.error("Error al guardar publicación:", err);
      setMensajeError('Ocurrió un error al enviar la publicación.');
    } finally {
      setGuardandoPublicacion(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E67A15] to-[#D19E37] flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Nueva Publicación en Explorar INSALSPACE</h3>
              <p className="text-xs text-slate-400">Feed oficial de {nombreGrupo}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            disabled={guardandoPublicacion}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-6 overflow-y-auto space-y-5">
          
          {mensajeError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{mensajeError}</span>
            </div>
          )}

          {/* Opciones de carga */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paso 1: Selecciona la fotografía
            </label>
            
            <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative cursor-pointer group ${
              procesando 
                ? 'border-[#E67A15] bg-orange-50/50' 
                : 'border-slate-200 hover:border-[#E67A15] bg-slate-50 hover:bg-white'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={manejarArchivoLocal}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                disabled={procesando || guardandoPublicacion}
              />

              {procesando ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 text-[#E67A15] mx-auto animate-spin" />
                  <p className="text-xs font-bold text-[#E67A15]">
                    {estadoSubida === 'comprimiendo' ? 'Comprimiendo y optimizando imagen...' : 'Subiendo imagen optimizada al servidor...'}
                  </p>
                  <p className="text-[11px] text-slate-400">Reduciendo peso de datos para carga ultrarrápida</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#E67A15] mx-auto mb-1.5 transition-colors" />
                  <p className="text-xs font-bold text-slate-800">Haz clic para subir desde tu dispositivo</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WEBP — Compresión inteligente automática</p>
                </>
              )}
            </div>
          </div>

          {/* Badge de Compresión exitosa */}
          {infoCompresion && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Foto optimizada: <strong className="line-through text-slate-400">{infoCompresion.pesoOriginal}</strong> ➔ <strong className="text-emerald-700">{infoCompresion.pesoComprimido}</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 font-black text-[11px] text-emerald-800 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-700" /> -{infoCompresion.porcentajeAhorro}% peso
              </span>
            </div>
          )}

          {/* Opción alternativa por URL si no hay archivo */}
          {!vistaPrevia && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                O ingresa la URL directa de la imagen:
              </label>
              <input
                type="url"
                value={urlImagen}
                onChange={(e) => { setUrlImagen(e.target.value); setVistaPrevia(e.target.value); }}
                placeholder="https://i.ibb.co/... o enlace directo"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]"
                disabled={procesando || guardandoPublicacion}
              />
            </div>
          )}

          {/* Vista previa si existe */}
          {vistaPrevia && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600">Vista Previa de la Publicación</label>
                <button
                  type="button"
                  onClick={() => { setVistaPrevia(''); setUrlImagen(''); setInfoCompresion(null); }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  Cambiar foto
                </button>
              </div>
              <div className="relative aspect-square max-h-56 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={vistaPrevia} alt="Vista previa" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Pie de foto / Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Pie de foto / Descripción
            </label>
            <textarea
              rows={3}
              value={pieDeFoto}
              onChange={(e) => setPieDeFoto(e.target.value)}
              placeholder="Describe novedades del prototipo, integrantes que participaron, avances técnicos..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] resize-none"
              disabled={guardandoPublicacion}
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={alCerrar}
              disabled={guardandoPublicacion}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!urlImagen.trim() || procesando || guardandoPublicacion}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E67A15] to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {guardandoPublicacion ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
              ) : procesando ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Optimizando...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Publicar en Explorar INSALSPACE</>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
