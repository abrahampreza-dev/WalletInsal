import React, { useState } from 'react';
import { LockKeyhole, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function AccesoAdmin() {
  const { iniciarSesionAdmin, cargando } = usarUsuario();
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');

  const enviar = async (evento) => {
    evento.preventDefault();
    setError('');
    const respuesta = await iniciarSesionAdmin(clave);
    if (!respuesta.exito) setError(respuesta.mensaje);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <form onSubmit={enviar} className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4D9C]/15 border border-[#0A4D9C]/45 text-[#0A4D9C] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel Institucional · Gestión General de Billetera SL-BITS
          </div>
          <h1 className="text-xl font-black text-slate-800">Acceso Administrativo</h1>
          <p className="text-xs text-slate-400">Portal exclusivo para personal docente y técnico autorizado</p>
        </div>
        {error && <p className="text-xs text-red-600 bg-red-500/15 border border-red-500/45 rounded-xl p-3">{error}</p>}
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type={verClave ? "text" : "password"}
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Clave de seguridad administrativa"
            className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#0A4D9C]"
          />
          <button
            type="button"
            onClick={() => setVerClave(!verClave)}
            className="absolute top-1/2 -translate-y-1/2 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
            aria-label={verClave ? "Ocultar clave" : "Mostrar clave"}
          >
            {verClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button disabled={cargando} className="w-full py-3 rounded-xl bg-[#0A4D9C] hover:bg-[#07366E] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0A4D9C]/30">
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Autenticar e Ingresar
        </button>
      </form>
    </div>
  );
}