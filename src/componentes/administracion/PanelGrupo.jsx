import React, { useState } from 'react';
import { 
  Image, 
  Video, 
  Wallet, 
  Save, 
  QrCode, 
  UploadCloud, 
  Sparkles, 
  Eye
} from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import CodigoQRGrupo from '../estands/CodigoQRGrupo';
import ModalSubirFoto from '../estands/ModalSubirFoto';
import ModalConfigurarDrive from '../estands/ModalConfigurarDrive';

export default function PanelGrupo({ alVerPerfilInstagram }) {
  const { 
    grupoActual, 
    listaTransacciones, 
    actualizarGrupo, 
    subirFotoGrupo, 
    actualizarVideoDrive 
  } = usarUsuario();

  const [foto, setFoto] = useState(grupoActual?.urlFoto || '');
  const [video, setVideo] = useState(grupoActual?.urlVideo || '');
  const [guardado, setGuardado] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [modalSubir, setModalSubir] = useState(false);
  const [modalDrive, setModalDriveAbierto] = useState(false);

  if (!grupoActual) return null;

  const movimientos = listaTransacciones.filter(
    (tx) => tx.idReceptor === grupoActual.idGrupo || tx.nombreReceptor?.includes(grupoActual.nombreGrupo)
  );

  const guardar = (evento) => {
    evento.preventDefault();
    actualizarGrupo({ 
      idGrupo: grupoActual.idGrupo, 
      urlFoto: foto, 
      urlVideo: video 
    }).then(() => setGuardado(true));
    setTimeout(() => setGuardado(false), 2000);
  };

  const fotos = grupoActual.fotos || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Encabezado del Estand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 text-[#0A4D9C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Panel de Control del Estand Oficial
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{grupoActual.nombreGrupo}</h1>
          <p className="text-xs text-slate-400">{grupoActual.especialidad}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {alVerPerfilInstagram && (
            <button
              onClick={() => alVerPerfilInstagram(grupoActual.idGrupo)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-pink-500/20"
            >
              <Eye className="w-4 h-4" />
              Ver en Explorar INSALSPACE
            </button>
          )}

          <button
            onClick={() => setMostrarQR(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E67A15] text-white text-xs font-bold shadow-md shadow-orange-500/25"
          >
            <QrCode className="w-4 h-4" />
            QR de Donaciones
          </button>
        </div>
      </div>

      {/* Grid: Configuración + Saldo Recaudado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Formulario de Contenido Multimedia */}
        <form onSubmit={guardar} className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-800">Configuración Multimedia</h2>
            <button
              type="button"
              onClick={() => setModalSubir(true)}
              className="text-xs text-pink-400 hover:underline font-bold flex items-center gap-1"
            >
              <UploadCloud className="w-4 h-4" />
              + Nueva Publicación
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Image className="inline w-4 h-4 mr-1.5 text-[#0A4D9C]" />
              URL de Foto de Portada / Perfil
            </label>
            <input
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Video className="inline w-4 h-4 mr-1.5 text-[#0A4D9C]" />
                URL de Video en Google Drive
              </label>
              <button
                type="button"
                onClick={() => setModalDriveAbierto(true)}
                className="text-[11px] text-[#0A4D9C] hover:underline font-semibold"
              >
                Configurar con asistente
              </button>
            </div>
            <input
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C] font-mono"
              placeholder="https://drive.google.com/file/d/.../preview"
            />
          </div>

          {video && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200">
              <iframe
                src={video}
                title="Vista previa video Drive"
                className="w-full h-full"
                allow="autoplay"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-colors"
          >
            <Save className="w-4 h-4" />
            {guardado ? '¡Cambios Guardados!' : 'Guardar Cambios'}
          </button>
        </form>

        {/* Resumen de Recaudación en SL - BITS */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center text-[#E67A15]">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Total Recaudado</p>
                <p className="text-3xl font-black text-slate-800">
                  {Number(grupoActual.totalRecaudado || 0).toFixed(2)}{' '}
                  <span className="text-sm font-black text-[#E67A15]">SL - BITS</span>
                </p>
              </div>
            </div>

            {/* Muro de donaciones recibidas */}
            <div className="mt-4 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Donaciones Recibidas ({movimientos.length})</span>
              
              {movimientos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Aún no se registran donaciones. Comparte tu código QR con los visitantes.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-200/60">
                  {movimientos.slice(0, 10).map((tx) => (
                    <div key={tx.idTransaccion} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-800 font-semibold block">{tx.nombreEmisor || "Estudiante"}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.fecha).toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <strong className="text-emerald-600 font-black">+{Number(tx.monto).toFixed(2)} SL - BITS</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setModalSubir(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            Comentar Foto en Feed de Explorar INSALSPACE
          </button>
        </div>

      </div>

      {/* Modales */}
      <CodigoQRGrupo
        grupo={grupoActual}
        estaAbierto={mostrarQR}
        alCerrar={() => setMostrarQR(false)}
      />

      <ModalSubirFoto
        estaAbierto={modalSubir}
        alCerrar={() => setModalSubir(false)}
        alSubir={(datos) => subirFotoGrupo(grupoActual.idGrupo, datos)}
        nombreGrupo={grupoActual.nombreGrupo}
      />

      <ModalConfigurarDrive
        estaAbierto={modalDrive}
        alCerrar={() => setModalDriveAbierto(false)}
        urlActual={grupoActual.urlVideo}
        duracionActual={grupoActual.duracionSegundos}
        alGuardar={(url, dur) => actualizarVideoDrive(grupoActual.idGrupo, url, dur)}
        nombreGrupo={grupoActual.nombreGrupo}
      />

    </div>
  );
}
