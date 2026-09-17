import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Sparkles, Check, Loader2, AlertTriangle } from 'lucide-react';
import { enviarPeticion } from '../../servicios/conexionGas';

export default function ModalSubirFoto({ estaAbierto, alCerrar, alSubir, nombreGrupo }) {
  const [pieDeFoto, setPieDeFoto] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [urlSubida, setUrlSubida] = useState('');
  const [estado, setEstado] = useState('idle');
  const [mensajeError, setMensajeError] = useState('');
  const inputRef = useRef(null);

  if (!estaAbierto) return null;

  const limpiar = () => {
    setPieDeFoto('');
    setVistaPrevia('');
    setUrlSubida('');
    setEstado('idle');
    setMensajeError('');
  };

  const cerrar = () => { limpiar(); alCerrar(); };

  const manejarArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setMensajeError('Solo se permiten archivos de imagen (JPG, PNG, WEBP).');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      setMensajeError('La imagen no debe superar 10 MB.');
      return;
    }

    setEstado('cargando');
    setMensajeError('');

    try {
      const base64 = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = (ev) => resolve(ev.target?.result);
        lector.onerror = () => reject(new Error('No se pudo leer el archivo'));
        lector.readAsDataURL(archivo);
      });

      setVistaPrevia(base64);
      setEstado('subiendo');

      const respuesta = await enviarPeticion('subirImagen', { imagenBase64: base64 });

      if (respuesta?.exito && respuesta.urlImagen) {
        setUrlSubida(respuesta.urlImagen);
        setVistaPrevia(respuesta.urlImagen);
        setEstado('listo');
      } else {
        const msg = respuesta?.mensaje || 'Error al subir imagen. Verifica que GAS esté redeployado y la IMGBB_API_KEY configurada.';
        console.error('[ModalSubirFoto] Error subirImagen:', respuesta);
        setMensajeError(msg);
        setEstado('error');
        setVistaPrevia('');
      }
    } catch (err) {
      console.error('[ModalSubirFoto] Error de red:', err);
      setMensajeError('Error de conexión con el servidor. Verifica tu conexión a Internet.');
      setEstado('error');
      setVistaPrevia('');
    }
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!urlSubida.trim()) return;

    const textoCompleto = pieDeFoto.trim()
      ? `${pieDeFoto.trim()} #Expotecnia2026 #SanLuis`
      : `Proyecto ${nombreGrupo} ⚡ #Expotecnia2026 #SanLuis`;

    alSubir({ url: urlSubida, pie: textoCompleto });
    limpiar();
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E67A15] to-[#D19E37] flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Nueva Publicación</h3>
              <p className="text-xs text-slate-400">Comparte en el feed de {nombreGrupo}</p>
            </div>
          </div>
          <button onClick={cerrar} className="p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="p-6 overflow-y-auto space-y-5">
          
          {mensajeError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/45 text-red-300 text-xs font-semibold text-center flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{mensajeError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Selecciona tu imagen
            </label>
            
            <div
              onClick={() => { if (estado !== 'subiendo') inputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                estado === 'subiendo'
                  ? 'border-[#0A4D9C] bg-[#0A4D9C]/5 cursor-not-allowed'
                  : estado === 'listo'
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 hover:border-[#E67A15]/80 bg-slate-50 hover:bg-white'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={manejarArchivo}
                disabled={estado === 'subiendo'}
                className="hidden"
              />
              
              {estado === 'subiendo' ? (
                <>
                  <Loader2 className="w-10 h-10 text-[#0A4D9C] mx-auto mb-2 animate-spin" />
                  <p className="text-sm font-bold text-[#0A4D9C]">Subiendo a la nube...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Espera un momento</p>
                </>
              ) : estado === 'listo' ? (
                <>
                  <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-600">Imagen lista para publicar</p>
                  <p className="text-[11px] text-slate-400 mt-1">Haz clic para cambiar la imagen</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Haz clic para seleccionar una imagen</p>
                  <p className="text-[11px] text-slate-400 mt-1">JPG, PNG o WEBP — máximo 10 MB</p>
                </>
              )}
            </div>
          </div>

          {vistaPrevia && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Vista Previa
              </label>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <img src={vistaPrevia} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pie de foto (opcional)
            </label>
            <textarea
              rows={2}
              value={pieDeFoto}
              onChange={(e) => setPieDeFoto(e.target.value)}
              placeholder="Describe tu publicación..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button type="button" onClick={cerrar} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-white text-xs font-semibold">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!urlSubida || estado === 'subiendo' || estado === 'cargando'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E67A15] to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Publicar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
