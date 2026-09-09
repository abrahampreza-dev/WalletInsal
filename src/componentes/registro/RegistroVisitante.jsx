import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { User, Mail, CreditCard, Sparkles, CheckCircle2, AlertCircle, Loader2, Camera, Lock } from 'lucide-react';
import CamaraSelfie from '../comun/CamaraSelfie';

export default function RegistroVisitante({ alCompletarRegistro }) {
  const { registrarNuevoVisitante, subirAvatar, cargando } = usarUsuario();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('NIE'); // 'NIE' o 'DUI'
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [fotoSelfie, setFotoSelfie] = useState(null);
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  // Función para aplicar máscara y formato al documento
  const manejarCambioDocumento = (evento) => {
    let valor = evento.target.value;

    if (tipoDocumento === 'NIE') {
      // NIE: Solo números (usualmente de 6 a 9 dígitos)
      valor = valor.replace(/[^0-9]/g, '').slice(0, 9);
      setNumeroDocumento(valor);
    } else {
      // DUI: Formato salvadoreño 00000000-0 (8 dígitos, guion, 1 dígito)
      const digitos = valor.replace(/[^0-9]/g, '').slice(0, 9);
      if (digitos.length > 8) {
        valor = `${digitos.slice(0, 8)}-${digitos.slice(8, 9)}`;
      } else {
        valor = digitos;
      }
      setNumeroDocumento(valor);
    }
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (!nombreCompleto.trim()) {
      setMensajeError('Por favor, ingresa tu nombre completo.');
      return;
    }

    if (!correo.trim() || !correo.includes('@')) {
      setMensajeError('Ingresa un correo electrónico válido.');
      return;
    }

    const digitosDoc = numeroDocumento.replace(/[^0-9]/g, '');
    if (tipoDocumento === 'NIE' && digitosDoc.length < 5) {
      setMensajeError('El NIE debe contener al menos 5 dígitos numéricos.');
      return;
    }

    if (tipoDocumento === 'DUI' && digitosDoc.length !== 9) {
      setMensajeError('El DUI debe contener 9 dígitos (formato: 00000000-0).');
      return;
    }

    if (!contrasena.trim()) {
      setMensajeError('Debes crear una contraseña de seguridad.');
      return;
    }
    if (contrasena.length < 4) {
      setMensajeError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (contrasena !== confirmarContrasena) {
      setMensajeError('Las contraseñas no coinciden.');
      return;
    }

    const datos = {
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      contrasena: contrasena.trim()
    };

    const resultado = await registrarNuevoVisitante(datos);

    if (resultado.exito) {
      setMensajeExito(resultado.mensaje || '¡Registro completado exitosamente!');
      if (fotoSelfie && resultado.usuario && resultado.usuario.idUsuario) {
        subirAvatar(fotoSelfie, resultado.usuario.idUsuario);
      }
      setTimeout(() => {
        if (alCompletarRegistro) alCompletarRegistro();
      }, 1200);
    } else {
      setMensajeError(resultado.mensaje || 'Ocurrió un error al procesar el registro.');
    }
  };

  return (
    <>
    <form onSubmit={manejarEnvio} className="space-y-5">
      
      {/* Banner de Regalo de Bienvenida */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E67A15]/15 via-amber-500/10 to-[#D19E37]/5 border border-[#E67A15]/50 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#E67A15]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#E67A15]" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#E67A15] uppercase tracking-wider">
            ¡Bono de Bienvenida Automático!
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Al registrar tu NIE o DUI recibirás <span className="font-bold text-[#E67A15]">1.00 ⚡ SL - BITS</span> de saldo inicial para apoyar los proyectos de la Expotecnia 2026.
          </p>
        </div>
      </div>

      {/* Foto de perfil opcional */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
          {fotoSelfie ? (
            <img src={fotoSelfie} alt="Tu foto" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-slate-300" />
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Foto de Perfil</p>
          <p className="text-[10px] text-slate-400">Opcional: toma una selfie</p>
          <button
            type="button"
            onClick={() => setCamaraAbierta(true)}
            className="mt-1 px-3 py-2 rounded-lg bg-[#0A4D9C]/10 border border-[#0A4D9C]/45 text-[#0A4D9C] text-[10px] font-bold flex items-center gap-1 min-h-[36px]"
          >
            <Camera className="w-3 h-3" />
            {fotoSelfie ? 'Cambiar foto' : 'Tomar selfie'}
          </button>
        </div>
      </div>

      {/* Mensajes de Alerta */}
      {mensajeError && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/45 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          {mensajeError}
        </div>
      )}

      {mensajeExito && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {mensajeExito}
        </div>
      )}

      {/* Campo: Nombre Completo */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Nombre Completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ej. Mario Alberto Henríquez"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15] focus:ring-1 focus:ring-[#E67A15] transition-colors"
          />
        </div>
      </div>

      {/* Campo: Correo Electrónico */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@sanluis.edu.sv"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15] focus:ring-1 focus:ring-[#E67A15] transition-colors"
          />
        </div>
      </div>

      {/* Selector de Tipo de Documento */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Tipo de Asistente
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setTipoDocumento('NIE');
              setNumeroDocumento('');
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
              tipoDocumento === 'NIE'
                ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] border-[#E67A15] text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-800'
            }`}
          >
            Estudiante (NIE)
          </button>

          <button
            type="button"
            onClick={() => {
              setTipoDocumento('DUI');
              setNumeroDocumento('');
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
              tipoDocumento === 'DUI'
                ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] border-[#E67A15] text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-800'
            }`}
          >
            Público General (DUI)
          </button>
        </div>
      </div>

      {/* Campo: Número de Documento (NIE o DUI con máscara) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            {tipoDocumento === 'NIE' ? 'Número de NIE' : 'Número de DUI'}
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            {tipoDocumento === 'NIE' ? 'Solo números' : 'Formato con guion'}
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={numeroDocumento}
            onChange={manejarCambioDocumento}
            placeholder={tipoDocumento === 'NIE' ? 'Ej. 7482910' : '00000000-0'}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-white font-mono placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15] focus:ring-1 focus:ring-[#E67A15] transition-colors"
          />
        </div>
      </div>

      {/* Contraseña de seguridad */}
      <div className="p-4 rounded-2xl bg-[#0A4D9C]/5 border border-[#0A4D9C]/30 space-y-3">
        <div className="flex items-center gap-2 text-[#0A4D9C]">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Contraseña de Seguridad</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Protege tu billetera. Otros usuarios no podrán transferir bits desde tu cuenta sin esta contraseña.
        </p>
        <div className="space-y-2">
          <input
            type="password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Crea una contraseña (mín. 4 caracteres)"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C] focus:ring-1 focus:ring-[#0A4D9C] transition-colors"
          />
          <input
            type="password"
            required
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            placeholder="Confirma tu contraseña"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C] focus:ring-1 focus:ring-[#0A4D9C] transition-colors"
          />
        </div>
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={cargando}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
      >
        {cargando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verificando datos y creando billetera...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Registrarse y Reclamar Bono
          </>
        )}
      </button>

    </form>

    <CamaraSelfie
      estaAbierto={camaraAbierta}
      alCerrar={() => setCamaraAbierta(false)}
      alTomarFoto={(foto) => setFotoSelfie(foto)}
    />
    </>
  );
}

