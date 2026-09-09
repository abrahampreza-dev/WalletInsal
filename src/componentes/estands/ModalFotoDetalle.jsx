import React, { useState } from 'react';
import { X, Heart, MessageCircle, Send, Zap, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function ModalFotoDetalle({ estaAbierto, alCerrar, foto, grupo, alAbrirDonacion }) {
  const { toggleLikeFoto, agregarComentarioFoto } = usarUsuario();
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [animacionCorazon, setAnimacionCorazon] = useState(false);

  if (!estaAbierto || !foto || !grupo) return null;

  const manejarLike = () => {
    toggleLikeFoto(grupo.idGrupo, foto.id);
    if (!foto.leGusta) {
      setAnimacionCorazon(true);
      setTimeout(() => setAnimacionCorazon(false), 700);
    }
  };

  const enviarComentario = (e) => {
    e.preventDefault();
    if (!comentarioTexto.trim()) return;
    agregarComentarioFoto(grupo.idGrupo, foto.id, comentarioTexto);
    setComentarioTexto('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Botón flotante para cerrar */}
        <button
          onClick={alCerrar}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna Izquierda: Imagen a Gran Tamaño */}
        <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px] select-none">
          <img
            src={foto.url}
            alt=""
            onDoubleClick={manejarLike}
            className="w-full h-full object-contain max-h-[85vh]"
          />

          {/* Animación de corazón al dar doble tap */}
          {animacionCorazon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles, Comentarios e Interacciones */}
        <div className="md:w-2/5 flex flex-col justify-between bg-[#FFFFFF] border-t md:border-t-0 md:border-l border-slate-200">
          
          {/* Header del Post */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
                <img
                  src={grupo.urlFoto || "/logo.png"}
                  alt={grupo.nombreGrupo}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-200"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {grupo.handle || `@${grupo.idGrupo.toLowerCase()}`}
                </span>
                <span className="text-[10px] text-slate-400 truncate block max-w-[170px]">
                  {grupo.nombreGrupo}
                </span>
              </div>
            </div>

            <button
              onClick={() => alAbrirDonacion(grupo)}
              className="px-3 py-1.5 rounded-xl bg-[#E67A15]/15 hover:bg-[#E67A15]/25 text-[#E67A15] border border-[#E67A15]/50 text-xs font-bold flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-[#E67A15]" />
              Apoyar Estand
            </button>
          </div>

          {/* Lista de Comentarios y Pie de Foto */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[300px] md:max-h-[380px] divide-y divide-slate-200/40">
            
            {/* Pie de foto principal */}
            <div className="flex items-start gap-3 pb-3">
              <img
                src={grupo.urlFoto || "/logo.png"}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
              />
              <div className="text-xs space-y-1">
                <p className="text-slate-800 leading-relaxed">
                  <strong className="text-slate-800 mr-1.5">{grupo.handle || grupo.nombreGrupo}</strong>
                  {foto.pie}
                </p>
                <span className="text-[10px] text-slate-400 block">{foto.fecha}</span>
              </div>
            </div>

            {/* Comentarios de la comunidad */}
            {(foto.comentarios || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Aún no hay comentarios. ¡Sé el primero en felicitar al equipo!
              </div>
            ) : (
              (foto.comentarios || []).map((com) => (
                <div key={com.id} className="pt-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-[#E67A15] font-bold flex-shrink-0">
                    {com.autor?.charAt(0) || "U"}
                  </div>
                  <div className="text-xs flex-1">
                    <p className="text-slate-800">
                      <strong className="text-slate-800 mr-1.5">{com.autor}</strong>
                      {com.texto}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{com.hora}</span>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Barra de Acciones y Likes */}
          <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={manejarLike}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      foto.leGusta ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => alAbrirDonacion(grupo)}
                className="text-xs font-black text-[#E67A15] hover:underline flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5 fill-[#E67A15]" />
                Votar por el Proyecto
              </button>
            </div>

            <div className="text-xs">
              <span className="font-bold text-slate-800">{foto.likes || 0} Me gusta</span>
              {(foto.nombresLikkes || []).length > 0 && (
                <span className="text-slate-400 text-[10px] block mt-0.5">
                  {foto.nombresLikkes.length <= 3
                    ? `Les gusta a ${foto.nombresLikkes.join(', ')}`
                    : `Les gusta a ${foto.nombresLikkes.slice(0, 2).join(', ')} y ${foto.nombresLikkes.length - 2} más`}
                </span>
              )}
              <span className="text-slate-400 text-[10px] block mt-0.5">{foto.fecha}</span>
            </div>

            {/* Input para agregar comentario */}
            <form onSubmit={enviarComentario} className="pt-2 flex items-center gap-2 border-t border-slate-200">
              <input
                type="text"
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
                placeholder="Añade un comentario..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!comentarioTexto.trim()}
                className="text-xs font-bold text-[#E67A15] hover:text-[#E67A15] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Comentar
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
