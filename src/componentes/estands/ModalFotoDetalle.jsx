import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Zap, Share2 } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function ModalFotoDetalle({ estaAbierto, alCerrar, foto, grupo, alAbrirDonacion }) {
  const { toggleLikeFoto, agregarComentarioFoto } = usarUsuario();
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [animacionCorazon, setAnimacionCorazon] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const inputRef = useRef(null);
  const comentariosRef = useRef(null);

  // Auto-scroll al fondo de comentarios cuando se agrega uno nuevo
  useEffect(() => {
    if (comentariosRef.current) {
      comentariosRef.current.scrollTop = comentariosRef.current.scrollHeight;
    }
  }, [foto?.comentarios?.length]);

  // Cerrar con teclado
  useEffect(() => {
    if (!estaAbierto) return;
    const handler = (e) => { if (e.key === 'Escape') alCerrar(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [estaAbierto, alCerrar]);

  if (!estaAbierto || !foto || !grupo) return null;

  const manejarLike = () => {
    toggleLikeFoto(grupo.idGrupo, foto.id);
    if (!foto.leGusta) {
      setAnimacionCorazon(true);
      setTimeout(() => setAnimacionCorazon(false), 700);
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!comentarioTexto.trim() || enviandoComentario) return;
    setEnviandoComentario(true);
    try {
      await agregarComentarioFoto(grupo.idGrupo, foto.id, comentarioTexto);
      setComentarioTexto('');
    } catch (err) {
      // error handled in context
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Modal: en móvil full screen, en desktop centrado */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] bg-[#FFFFFF] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row animate-slideUp">

        {/* Botón cerrar */}
        <button
          onClick={alCerrar}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* EN MÓVIL: Input de comentario ARRIBA para que el teclado no lo tape */}
        <div className="sm:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E67A15] to-[#D19E37] flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
            {grupo.handle?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={comentarioTexto}
            onChange={(e) => setComentarioTexto(e.target.value)}
            placeholder="Escribe un comentario..."
            disabled={enviandoComentario}
            className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E67A15]/30 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={enviarComentario}
            disabled={!comentarioTexto.trim() || enviandoComentario}
            className="text-sm font-bold text-[#E67A15] hover:text-[#C8640C] disabled:opacity-30 disabled:cursor-not-allowed px-1"
          >
            {enviandoComentario ? '...' : 'Publicar'}
          </button>
        </div>

        {/* Columna Izquierda: Imagen */}
        <div className="relative sm:w-3/5 bg-black flex items-center justify-center flex-shrink-0" style={{ minHeight: '30vh', maxHeight: '50vh' }}>
          <img
            src={foto.url}
            alt=""
            onDoubleClick={manejarLike}
            className="w-full h-full object-contain"
          />

          {/* Animación corazón */}
          {animacionCorazon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
            </div>
          )}
        </div>

        {/* Columna Derecha: Comentarios */}
        <div className="sm:w-2/5 flex flex-col min-h-0 flex-1 sm:flex-initial">

          {/* Header (solo desktop) */}
          <div className="hidden sm:flex p-4 border-b border-slate-200 items-center justify-between">
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
              Apoyar
            </button>
          </div>

          {/* Lista de comentarios — scrollable */}
          <div ref={comentariosRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: '40vh' }}>

            {/* Pie de foto */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
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

            {/* Comentarios */}
            {(foto.comentarios || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Sé el primero en comentar
              </div>
            ) : (
              (foto.comentarios || []).map((com) => (
                <div key={com.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E67A15] to-[#D19E37] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                    {com.autor?.charAt(0) || "U"}
                  </div>
                  <div className="text-xs flex-1 min-w-0">
                    <p className="text-slate-800 leading-relaxed">
                      <strong className="text-slate-800 mr-1">{com.autor}</strong>
                      {com.texto}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{com.hora}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Barra de acciones + likes + input (desktop) */}
          <div className="border-t border-slate-200 bg-white">
            <div className="px-4 py-2.5 flex items-center gap-3">
              <button onClick={manejarLike} className="text-slate-400 hover:text-rose-500 transition-colors">
                <Heart className={`w-5 h-5 ${foto.leGusta ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
              <button className="text-slate-400">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="text-slate-400">
                <Share2 className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 ml-auto">{foto.likes || 0} Me gusta</span>
            </div>

            {/* Input de comentario — solo en desktop */}
            <form onSubmit={enviarComentario} className="hidden sm:flex items-center gap-2 px-4 pb-3 pt-1 border-t border-slate-100">
              <input
                type="text"
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
                placeholder="Añade un comentario..."
                disabled={enviandoComentario}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 py-2"
              />
              <button
                type="submit"
                disabled={!comentarioTexto.trim() || enviandoComentario}
                className="text-xs font-bold text-[#E67A15] hover:text-[#C8640C] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {enviandoComentario ? '...' : 'Publicar'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
