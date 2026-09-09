import React, { useState } from 'react';
import { X, Scan, Zap, CheckCircle2, Building2, User } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function ModalEscanearQR({ estaAbierto, alCerrar, alEscanearGrupo }) {
  const { listaGrupos } = usarUsuario();
  const [escaneando, setEscaneando] = useState(true);

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center text-[#0A4D9C]">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Escanear Código QR</h3>
              <p className="text-xs text-slate-400">Escanea el QR de un estand para donar o ver su perfil Explorar INSALSPACE</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Visor de Cámara Simulado con Animación Láser */}
          <div className="relative aspect-video max-h-52 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
            
            {/* Esquinas de enfoque */}
            <div className="w-36 h-36 border-2 border-dashed border-[#E67A15] rounded-2xl relative flex items-center justify-center">
              {/* Línea de escaneo animada */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#E67A15] to-transparent shadow-[0_0_15px_#E67A15] animate-pulse" />
              <Scan className="w-10 h-10 text-[#E67A15] opacity-60" />
            </div>

            <span className="absolute bottom-3 text-[11px] text-slate-400 font-medium">
              Apunta la cámara al código QR del estand
            </span>
          </div>

          {/* Detección Rápida de Estands Oficiales */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              O selecciona directamente un proyecto detectado cercanamente:
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {listaGrupos.map((grupo) => (
                <div
                  key={grupo.idGrupo}
                  onClick={() => {
                    alEscanearGrupo(grupo.idGrupo);
                    alCerrar();
                  }}
                  className="p-3 bg-white hover:bg-slate-100 border border-slate-200 hover:border-[#E67A15]/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={grupo.urlFoto || "/logo.png"}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#E67A15] transition-colors">
                        {grupo.nombreGrupo}
                      </p>
                      <p className="text-[10px] text-slate-400">{grupo.especialidad}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-[#E67A15]/15 text-[#E67A15] text-xs font-bold border border-[#E67A15]/45 group-hover:bg-[#E67A15] group-hover:text-white transition-all">
                    Ir al Perfil del Proyecto →
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
