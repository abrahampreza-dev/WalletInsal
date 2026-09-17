import React, { useState } from 'react';
import { X, UploadCloud, Image as ImageIcon, Sparkles, Check, Loader2 } from 'lucide-react';
import { enviarPeticion } from '../../servicios/conexionGas';

export default function ModalSubirFoto({ estaAbierto, alCerrar, alSubir, nombreGrupo }) {
  const [urlImagen, setUrlImagen] = useState('');
  const [pieDeFoto, setPieDeFoto] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [etiquetaSugerida, setEtiquetaSugerida] = useState('#Expotecnia2026 #SanLuis');
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [subiendoImgBB, setSubiendoImgBB] = useState(false);

  if (!estaAbierto) return null;

  const manejarArchivoLocal = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setCargandoArchivo(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = (evento) => resolve(evento.target?.result);
        lector.onerror = reject;
        lector.readAsDataURL(archivo);
      });

      setVistaPrevia(base64);
      setSubiendoImgBB(true);

      const respuesta = await enviarPeticion('subirImagen', { imagenBase64: base64 });
      if (respuesta?.exito && respuesta.urlImagen) {
        setUrlImagen(respuesta.urlImagen);
        setVistaPrevia(respuesta.urlImagen);
      } else {
        alert(respuesta?.mensaje || 'Error al subir la imagen. Intenta con una URL directa.');
        setVistaPrevia('');
      }
    } catch (err) {
      alert('Error al procesar la imagen.');
      setVistaPrevia('');
    } finally {
      setCargandoArchivo(false);
      setSubiendoImgBB(false);
    }
  };

  const manejarUrlDirecta = (valor) => {
    setUrlImagen(valor);
    setVistaPrevia(valor);
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!urlImagen.trim()) return;

    const textoCompleto = pieDeFoto.trim() 
      ? `${pieDeFoto.trim()} ${etiquetaSugerida}` 
      : `Proyecto ${nombreGrupo} ⚡ ${etiquetaSugerida}`;

    alSubir({
      url: urlImagen,
      pie: textoCompleto
    });

    setUrlImagen('');
    setPieDeFoto('');
    setVistaPrevia('');
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E67A15] to-[#D19E37] flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Nueva Publicación en Explorar INSALSPACE</h3>
              <p className="text-xs text-slate-400">Comparte en el feed de {nombreGrupo}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={manejarEnvio} className="p-6 overflow-y-auto space-y-5">
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Paso 1: Selecciona tu imagen
            </label>
            
            <div className={`border-2 border-dashed rounded-2xl p-4 text-center bg-slate-50 transition-colors relative cursor-pointer group ${
              subiendoImgBB ? 'border-[#0A4D9C] bg-[#0A4D9C]/5' : 'border-slate-200 hover:border-[#E67A15]/80 hover:bg-white'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={manejarArchivoLocal}
                disabled={subiendoImgBB}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
              />
              {subiendoImgBB ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#0A4D9C] mx-auto mb-1.5 animate-spin" />
                  <p className="text-xs font-semibold text-[#0A4D9C]">Subiendo imagen a la nube...</p>
                  <p className="text-[11px] text-slate-400">Esto puede tomar unos segundos</p>
                </>
              ) : cargandoArchivo ? (
                <>
                  <Loader2 className="w-8 h-8 text-slate-400 mx-auto mb-1.5 animate-spin" />
                  <p className="text-xs font-semibold text-slate-800">Cargando imagen...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#E67A15] mx-auto mb-1.5 transition-colors" />
                  <p className="text-xs font-semibold text-slate-800">Haz clic para subir desde tu dispositivo</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WEBP — se sube automáticamente a la nube</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              O ingresa la URL de la imagen:
            </label>
            <input
              type="url"
              value={urlImagen}
              onChange={(e) => manejarUrlDirecta(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]"
            />
          </div>

          {vistaPrevia && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Vista Previa de la Publicación
              </label>
              <div className="relative aspect-square max-h-48 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                <img src={vistaPrevia} alt="Vista previa" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Pie de foto / Descripción
            </label>
            <textarea
              rows={3}
              value={pieDeFoto}
              onChange={(e) => setPieDeFoto(e.target.value)}
              placeholder="Escribe un pie de foto para tu publicación, novedades del prototipo..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!urlImagen.trim() || subiendoImgBB || cargandoArchivo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E67A15] to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Publicar en Explorar INSALSPACE
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
