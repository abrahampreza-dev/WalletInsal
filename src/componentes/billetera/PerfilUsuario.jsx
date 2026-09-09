import React, { useState } from 'react';
import {
  User, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  QrCode, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  LogOut,
  Edit2,
  Building2,
  Camera,
  Key
} from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import MostrarQR from './MostrarQR';
import CamaraSelfie from '../comun/CamaraSelfie';

export default function PerfilUsuario({ alIrABilletera, alIrAEstands, alConectarEstand, grupoConectado }) {
  const { usuarioActual, setUsuarioActual, subirAvatar, cerrarSesion } = usarUsuario();
  const [modalQR, setModalQR] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarNueva, setConfirmarNueva] = useState('');
  const [mensajeContrasena, setMensajeContrasena] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  if (!usuarioActual) return null;

const copiarDoc = () => {
    if (usuarioActual.numeroDocumento) {
      navigator.clipboard?.writeText(usuarioActual.numeroDocumento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const esDui = (usuarioActual.tipoDocumento || 'NIE') === 'DUI';
  const rolUsuario = esDui ? 'Visitante Verificado' : 'Alumno Verificado';
  const tituloCredencial = esDui ? 'Credencial Digital de Visitante' : 'Credencial Digital Estudiantil';

  const manejarFotoTomada = async (fotoDataUrl) => {
    const resultado = await subirAvatar(fotoDataUrl);
    if (!resultado.exito) {
      console.error('Error al subir avatar:', resultado.mensaje);
    }
  };

  const cambiarContrasena = async () => {
    setMensajeContrasena('');
    setErrorContrasena('');

    if (!contrasenaActual.trim()) {
      setErrorContrasena('Ingresa tu contraseña actual.');
      return;
    }
    if (!nuevaContrasena.trim() || nuevaContrasena.trim().length < 4) {
      setErrorContrasena('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmarNueva) {
      setErrorContrasena('Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      const { enviarPeticion } = await import('../../servicios/conexionGas');
      const respuesta = await enviarPeticion('cambiarContrasena', {
        idUsuario: usuarioActual.idUsuario,
        contrasenaActual: contrasenaActual.trim(),
        nuevaContrasena: nuevaContrasena.trim()
      });

      if (respuesta && respuesta.exito) {
        setUsuarioActual((prev) => ({ ...prev, contrasena: nuevaContrasena.trim() }));
        setMensajeContrasena('Contraseña actualizada correctamente.');
        setContrasenaActual('');
        setNuevaContrasena('');
        setConfirmarNueva('');
        setMostrarCambioContrasena(false);
      } else {
        setErrorContrasena(respuesta?.mensaje || 'Error al cambiar contraseña.');
      }
    } catch (err) {
      setErrorContrasena('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{tituloCredencial}</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {esDui
            ? 'Datos de identificación y balance del visitante.'
            : 'Datos de identificación institucional y balance del estudiante.'}
        </p>
      </div>

      {/* Tarjeta de Identidad Digital */}
      <div className="relative overflow-hidden rounded-3xl bg-[#FFFFFF] border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar con Mascota */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-50 border-2 border-[#E67A15]/40 shadow-xl">
              {usuarioActual.avatar && usuarioActual.avatar !== '/logo.png' ? (
                <img
                  src={usuarioActual.avatar}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/logo.png"
                  alt="Mascota"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => setCamaraAbierta(true)}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#E67A15] text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#E67A15]/80 transition-colors min-h-[44px] min-w-[44px]"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{usuarioActual.nombreCompleto}</h2>
                <p className="text-xs text-[#0A4D9C] font-bold">{rolUsuario} • Instituto San Luis</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs font-bold self-center sm:self-auto">
                <ShieldCheck className="w-4 h-4" />
                Billetera Verificada
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
<span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#E67A15]" />
                {usuarioActual.tipoDocumento || 'NIE'}: {usuarioActual.numeroDocumento || 'Sin documento'}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#0A4D9C]" />
                {usuarioActual.correo || 'Correo no registrado'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                Ciclo Lectivo 2026
              </span>
            </div>
          </div>

        </div>

        {/* Resumen de Fondos y QR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Saldo Disponible</span>
              <span className="text-2xl font-black text-white">
                {(usuarioActual.saldoActual || 0).toFixed(2)} <span className="text-[#E67A15] text-base">SL - BITS</span>
              </span>
            </div>
            <button
              onClick={alIrABilletera}
              className="px-3.5 py-2 rounded-xl bg-[#E67A15]/15 text-[#E67A15] hover:bg-[#E67A15] hover:text-white border border-[#E67A15]/45 text-xs font-bold transition-colors"
            >
              Ver Wallet
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Código QR Personal</span>
              <span className="text-xs text-slate-400 font-mono">Para recargas en ventanilla</span>
            </div>
            <button
              onClick={() => setModalQR(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0A4D9C]/15 text-[#0A4D9C] hover:bg-[#0A4D9C] hover:text-white border border-[#0A4D9C]/45 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Ver QR
            </button>
          </div>

        </div>

      </div>

      {/* Cambio de Contraseña */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#E67A15]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Seguridad de la Cuenta</h3>
              <p className="text-[11px] text-slate-400">Administra tu contraseña de acceso</p>
            </div>
          </div>
          <button
            onClick={() => { setMostrarCambioContrasena(!mostrarCambioContrasena); setMensajeContrasena(''); setErrorContrasena(''); }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold"
          >
            {mostrarCambioContrasena ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>

        {mensajeContrasena && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {mensajeContrasena}
          </div>
        )}

        {mostrarCambioContrasena && (
          <div className="space-y-3">
            {errorContrasena && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errorContrasena}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); cambiarContrasena(); }} className="space-y-3">
              <input type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} placeholder="Contraseña actual" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]" />
              <input type="password" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} placeholder="Nueva contraseña (mín. 4 caracteres)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]" />
              <input type="password" value={confirmarNueva} onChange={(e) => setConfirmarNueva(e.target.value)} placeholder="Confirmar nueva contraseña" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15]" />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#E67A15] hover:bg-[#D19E37] text-white font-bold text-xs shadow-md shadow-orange-500/20">
                Guardar Nueva Contraseña
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mi Estand en Explorar INSALSPACE */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-black text-white">Mi Estand en Explorar INSALSPACE</h3>
            <p className="text-xs text-slate-400">Tu proyecto técnico y su muro SPACE dentro de este perfil</p>
          </div>
        </div>

        {grupoConectado ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/45 text-xs text-emerald-600 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>
              <strong className="text-white">{grupoConectado}</strong> está conectado a tu cuenta. El panel de tu estand se muestra aquí abajo.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Conecta el estand de tu proyecto técnico para publicar fotos, videos y administrar tu muro en la red social{' '}
              <strong className="text-white">Explorar INSALSPACE</strong>.
            </p>
            <button
              onClick={alConectarEstand}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white text-xs font-bold shadow-lg shadow-orange-500/25"
            >
              <Building2 className="w-4 h-4" />
              Vincular o Registrar Proyecto
            </button>
          </div>
        )}
      </div>

      {/* Insignias y Logros Académicos */}
      <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
        <h3 className="text-base font-black text-white">Insignias y Méritos San Luis</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Excelencia Técnica</h4>
            <p className="text-[11px] text-slate-400">Promedio superior en materias prácticas de especialidad.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#0A4D9C]/15 text-[#0A4D9C] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Votante Activo Expotecnia</h4>
            <p className="text-[11px] text-slate-400">Participación en la votación de proyectos con SL - BITS.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Valores San Luis</h4>
            <p className="text-[11px] text-slate-400">Reconocimiento por conducta y compañerismo solidario.</p>
          </div>
        </div>
      </div>

      <MostrarQR
        usuario={usuarioActual}
        estaAbierto={modalQR}
        alCerrar={() => setModalQR(false)}
      />

      <CamaraSelfie
        estaAbierto={camaraAbierta}
        alCerrar={() => setCamaraAbierta(false)}
        alTomarFoto={manejarFotoTomada}
      />

    </div>
  );
}

