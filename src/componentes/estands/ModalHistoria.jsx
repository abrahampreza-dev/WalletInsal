import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';

export default function ModalHistoria({ estaAbierto, alCerrar, historias = [], grupo }) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (!estaAbierto || historias.length === 0) return;
    setProgreso(0);
  }, [indiceActual, estaAbierto]);

  useEffect(() => {
    if (!estaAbierto || historias.length === 0 || pausado) return;

    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          if (indiceActual < historias.length - 1) {
            setIndiceActual((i) => i + 1);
            return 0;
          } else {
            alCerrar();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [estaAbierto, indiceActual, historias.length, pausado, alCerrar]);

  if (!estaAbierto || historias.length === 0) return null;

  const historiaActual = historias[indiceActual] || historias[0];

  const anterior = () => {
    if (indiceActual > 0) setIndiceActual((i) => i - 1);
  };

  const siguiente = () => {
    if (indiceActual < historias.length - 1) setIndiceActual((i) => i + 1);
    else alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[85vh] bg-slate-50 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none">
        
        {/* Barras de progreso de historias */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {historias.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: idx === indiceActual ? `${progreso}%` : idx < indiceActual ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Encabezado del perfil de la historia */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={grupo?.urlFoto || "/logo.png"}
              alt={grupo?.nombreGrupo}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#E67A15] shadow-md"
            />
            <div>
              <span className="text-xs font-bold text-white block leading-tight drop-shadow-md">
                {grupo?.nombreGrupo || "Avances del Avances del Estand San Luis"}
              </span>
              <span className="text-[10px] text-slate-400 drop-shadow-md">
                {historiaActual.titulo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPausado(!pausado)}
              className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
            >
              {pausado ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={alCerrar}
              className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Imagen / Fondo de la historia */}
        <div className="absolute inset-0 z-10 bg-black">
          <img
            src={historiaActual.foto || grupo?.urlFoto}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Zonas de pulsación izquierda/derecha */}
        <div className="absolute inset-y-16 inset-x-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={anterior} />
          <div className="w-1/3 h-full" onClick={() => setPausado(!pausado)} />
          <div className="w-1/3 h-full cursor-pointer" onClick={siguiente} />
        </div>

        {/* Pie de historia */}
        <div className="relative z-30 p-5 pt-0 mt-auto text-white space-y-3">
          <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/30">
            <div className="flex items-center gap-2 mb-1 text-[#E67A15] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{historiaActual.icono} {historiaActual.titulo}</span>
            </div>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {historiaActual.texto}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Expotecnia Institucional 2026</span>
            <span className="font-mono">{indiceActual + 1} de {historias.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
