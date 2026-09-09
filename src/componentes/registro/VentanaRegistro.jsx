import React, { useState } from 'react';
import { X, Building2, LockKeyhole, Eye, EyeOff, LogIn, AlertCircle, Key } from 'lucide-react';
import RegistroVisitante from './RegistroVisitante';
import RegistroGrupo from './RegistroGrupo';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { ModalAlerta } from '../comun/ModalProfesional';

export default function VentanaRegistro({ estaAbierto, alCerrar, pestanaInicial = 'visitante' }) {
  const [pestanaActiva, setPestanaActiva] = useState(pestanaInicial);
  const [modoVisitante, setModoVisitante] = useState('login');
  const { listaGrupos, iniciarSesionGrupo, iniciarSesionVisitante, setUsuarioActual } = usarUsuario();

  // Login visitante
  const [documentoLogin, setDocumentoLogin] = useState('');
  const [claveLogin, setClaveLogin] = useState('');
  const [verClaveLogin, setVerClaveLogin] = useState(false);
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [mensajeLogin, setMensajeLogin] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // Forzar cambio de contraseña
  const [cambioForzado, setCambioForzado] = useState(false);
  const [nuevaClaveForzada, setNuevaClaveForzada] = useState('');
  const [confirmarClaveForzada, setConfirmarClaveForzada] = useState('');
  const [errorCambioForzado, setErrorCambioForzado] = useState('');
  const [cargandoCambio, setCargandoCambio] = useState(false);
  const [modalExitoCambio, setModalExitoCambio] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Acceso grupo
  const [idGrupo, setIdGrupo] = useState('');
  const [claveGrupo, setClaveGrupo] = useState('');
  const [verClaveGrupo, setVerClaveGrupo] = useState(false);
  const [mensajeGrupo, setMensajeGrupo] = useState('');
  const [cargandoGrupo, setCargandoGrupo] = useState(false);

  const accederVisitante = async (evento) => {
    evento.preventDefault();
    setCargandoLogin(true);
    setErrorLogin('');
    setMensajeLogin('');

    const resultado = await iniciarSesionVisitante(documentoLogin, claveLogin);
    setCargandoLogin(false);

    if (resultado.exito) {
      setUsuarioLogueado(resultado.usuario);
      if (resultado.contrasenaTemporal) {
        setCambioForzado(true);
        setMensajeLogin('');
      } else {
        setMensajeLogin('Inicio de sesión exitoso. Redirigiendo...');
        setTimeout(() => alCerrar(), 800);
      }
    } else {
      setErrorLogin(resultado.mensaje);
    }
  };

  const guardarNuevaClaveForzada = async () => {
    setErrorCambioForzado('');
    if (!nuevaClaveForzada.trim() || nuevaClaveForzada.trim().length < 4) {
      setErrorCambioForzado('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (nuevaClaveForzada !== confirmarClaveForzada) {
      setErrorCambioForzado('Las contraseñas no coinciden.');
      return;
    }

    setCargandoCambio(true);
    try {
      const { enviarPeticion } = await import('../../servicios/conexionGas');
      const respuesta = await enviarPeticion('cambiarContrasena', {
        idUsuario: usuarioLogueado?.idUsuario,
        contrasenaActual: claveLogin.trim(),
        nuevaContrasena: nuevaClaveForzada.trim()
      });
      setCargandoCambio(false);

      if (respuesta && respuesta.exito) {
        setUsuarioActual((prev) => prev ? { ...prev, contrasena: nuevaClaveForzada.trim(), contrasenaTemporal: false } : prev);
        setModalExitoCambio(true);
        setCambioForzado(false);
      } else {
        setErrorCambioForzado(respuesta?.mensaje || 'Error al cambiar contraseña.');
      }
    } catch (err) {
      setCargandoCambio(false);
      setErrorCambioForzado('Error de conexión con el servidor.');
    }
  };

  const accederGrupo = async (evento) => {
    evento.preventDefault();
    setCargandoGrupo(true);
    try {
      const resultado = await iniciarSesionGrupo(idGrupo.trim(), claveGrupo);
      setMensajeGrupo(resultado.exito ? 'Acceso concedido. Ya puedes ver tu estand en Mi Perfil.' : resultado.mensaje);
    } finally {
      setCargandoGrupo(false);
    }
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Encabezado */}
        <div className="p-6 pb-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-800">Acceso al Sistema</h3>
            <p className="text-xs text-slate-400">Expotecnia 2026 — Billetera Digital SL-BITS</p>
          </div>
          <button onClick={alCerrar} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setPestanaActiva('visitante'); setMensajeLogin(''); setErrorLogin(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                pestanaActiva === 'visitante' ? 'bg-[#0A4D9C] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Visitante
            </button>
            <button
              onClick={() => { setPestanaActiva('accesoGrupo'); setMensajeGrupo(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                pestanaActiva === 'accesoGrupo' ? 'bg-[#0A4D9C] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LockKeyhole className="w-4 h-4" />
              Acceso grupo
            </button>
            <button
              onClick={() => setPestanaActiva('grupo')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                pestanaActiva === 'grupo' ? 'bg-[#0A4D9C] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Estand
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* VISITANTE / ALUMNO */}
          {pestanaActiva === 'visitante' && (
            <>
              {cambioForzado ? (
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center mb-3">
                      <Key className="w-7 h-7 text-[#E67A15]" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Cambio de Contraseña Obligatorio</h4>
                    <p className="text-[11px] text-slate-400">Tu contraseña fue restablecida. Debes crear una nueva para continuar.</p>
                  </div>

                  {errorCambioForzado && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorCambioForzado}
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); guardarNuevaClaveForzada(); }} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
                      <input type="password" required value={nuevaClaveForzada} onChange={(e) => setNuevaClaveForzada(e.target.value)} placeholder="Mínimo 4 caracteres" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#E67A15]" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
                      <input type="password" required value={confirmarClaveForzada} onChange={(e) => setConfirmarClaveForzada(e.target.value)} placeholder="Repite la contraseña" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#E67A15]" />
                    </div>

                    <button type="submit" disabled={cargandoCambio} className="w-full py-3 rounded-xl bg-[#E67A15] hover:bg-[#D19E37] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                      {cargandoCambio ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Key className="w-4 h-4" />}
                      {cargandoCambio ? 'Guardando...' : 'Guardar y Continuar'}
                    </button>
                  </form>
                </div>
              ) : modoVisitante === 'login' ? (
                <form onSubmit={accederVisitante} className="space-y-4">
                  <div className="text-center pb-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center mb-3">
                      <LogIn className="w-7 h-7 text-[#0A4D9C]" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Iniciar Sesión</h4>
                    <p className="text-[11px] text-slate-400">Ingresa con tu NIE o DUI y contraseña</p>
                  </div>

                  {errorLogin && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorLogin}
                    </div>
                  )}
                  {mensajeLogin && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs text-center">
                      {mensajeLogin}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">NIE o DUI</label>
                    <input
                      type="text"
                      required
                      value={documentoLogin}
                      onChange={(e) => setDocumentoLogin(e.target.value)}
                      placeholder="Ingresa tu NIE o DUI"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contraseña</label>
                    <div className="relative">
                      <input
                        type={verClaveLogin ? "text" : "password"}
                        required
                        value={claveLogin}
                        onChange={(e) => setClaveLogin(e.target.value)}
                        placeholder="Tu contraseña de seguridad"
                        className="w-full px-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C]"
                      />
                      <button type="button" onClick={() => setVerClaveLogin(!verClaveLogin)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700">
                        {verClaveLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button disabled={cargandoLogin} className="w-full py-3 rounded-xl bg-[#0A4D9C] hover:bg-[#07366E] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {cargandoLogin ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <LogIn className="w-4 h-4" />}
                    {cargandoLogin ? 'Verificando...' : 'Iniciar Sesión'}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={() => { setModoVisitante('registro'); setErrorLogin(''); setMensajeLogin(''); }} className="text-[#E67A15] font-bold hover:underline">
                      Registrarme ahora
                    </button>
                  </p>
                </form>
              ) : (
                <>
                  <RegistroVisitante alCompletarRegistro={alCerrar} />
                  <p className="text-center text-xs text-slate-400 mt-4">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => { setModoVisitante('login'); setErrorLogin(''); }} className="text-[#0A4D9C] font-bold hover:underline">
                      Iniciar sesión
                    </button>
                  </p>
                </>
              )}
            </>
          )}

          {/* ACCESO GRUPO */}
          {pestanaActiva === 'accesoGrupo' && (
            <form onSubmit={accederGrupo} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center mb-3">
                  <LockKeyhole className="w-7 h-7 text-[#E67A15]" />
                </div>
                <h4 className="text-sm font-black text-slate-800">Acceso de Equipo</h4>
                <p className="text-[11px] text-slate-400">Selecciona tu estand e ingresa la clave privada</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Código del grupo</label>
                <select required value={idGrupo} onChange={(e) => setIdGrupo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm">
                  <option value="">Selecciona tu estand</option>
                  {listaGrupos.map((grupo) => (
                    <option key={grupo.idGrupo} value={grupo.idGrupo}>{grupo.nombreGrupo} ({grupo.idGrupo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clave privada</label>
                <div className="relative">
                  <input type={verClaveGrupo ? "text" : "password"} required value={claveGrupo} onChange={(e) => setClaveGrupo(e.target.value)} placeholder="Contraseña del equipo" className="w-full px-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C]" />
                  <button type="button" onClick={() => setVerClaveGrupo(!verClaveGrupo)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700">
                    {verClaveGrupo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mensajeGrupo && <p className={`text-xs rounded-xl p-3 ${mensajeGrupo.includes('concedido') ? 'text-emerald-600 bg-emerald-500/15 border border-emerald-500/45' : 'text-rose-600 bg-rose-500/10 border border-rose-500/30'}`}>{mensajeGrupo}</p>}

              <button disabled={cargandoGrupo} className="w-full py-3 rounded-xl bg-[#E67A15] hover:bg-[#D19E37] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-orange-500/20">
                {cargandoGrupo ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <LockKeyhole className="w-4 h-4" />}
                {cargandoGrupo ? 'Verificando...' : 'Entrar a Mi Estand'}
              </button>
            </form>
          )}

          {/* ESTAND / GRUPO - Registro */}
          {pestanaActiva === 'grupo' && (
            <>
              <RegistroGrupo alCompletarRegistro={alCerrar} />
            </>
          )}

        </div>
      </div>

      <ModalAlerta
        estaAbierto={modalExitoCambio}
        alCerrar={() => { setModalExitoCambio(false); alCerrar(); }}
        titulo="Contraseña actualizada"
        mensaje="Tu contraseña se actualizó correctamente. Ya puedes usar la plataforma con tu nueva contraseña."
        tipo="exito"
      />
    </div>
  );
}