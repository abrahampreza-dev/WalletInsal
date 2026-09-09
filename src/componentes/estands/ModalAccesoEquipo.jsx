import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function ModalAccesoEquipo({ estaAbierto, alCerrar, grupo, alAutenticado }) {
  const { verificarClaveGrupo } = usarUsuario();
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  if (!estaAbierto || !grupo) return null;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    const res = await verificarClaveGrupo(grupo.idGrupo, clave.trim());
    if (res.exito) {
      setExito('Credencial confirmada. Módulo de edición activado.');
      setTimeout(() => {
        setClave('');
        setExito('');
        alCerrar();
        if (alAutenticado) alAutenticado();
      }, 700);
    } else {
      setError(res.mensaje || 'La contraseña ingresada no es válida.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center text-[#E67A15]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Panel de Edición del Estand</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">{grupo.nombreGrupo}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={manejarEnvio} className="p-6 space-y-4">
          
          <div className="text-xs text-slate-400 leading-relaxed">
            El público general puede visualizar el contenido. Para <strong>gestionar publicaciones o modificar el video explicativo</strong>, ingrese la credencial del grupo.
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              {error}
            </div>
          )}

          {exito && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              {exito}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Credencial de Acceso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={verClave ? "text" : "password"}
                required
                autoFocus
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Ingrese la contraseña asignada..."
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]"
              />
              <button
                type="button"
                onClick={() => setVerClave(!verClave)}
                className="absolute top-1/2 -translate-y-1/2 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                aria-label={verClave ? "Ocultar clave" : "Mostrar clave"}
              >
                {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Autenticar e Ingresar al Panel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
