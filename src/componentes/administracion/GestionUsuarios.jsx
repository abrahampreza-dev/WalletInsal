import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import {
  Users, Search, Edit2, Trash2, Save, X, DollarSign,
  AlertCircle, CheckCircle2, User, Mail, FileText, Shield, Key
} from 'lucide-react';
import { ModalConfirmacion, ModalInput, ModalAlerta } from '../comun/ModalProfesional';

export default function GestionUsuarios() {
  const { listaUsuarios, setListaUsuarios, listaGrupos, sincronizarConServidor, adminToken } = usarUsuario();
  const [busqueda, setBusqueda] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editSaldo, setEditSaldo] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Modales
  const [modalEliminar, setModalEliminar] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [modalReset, setModalReset] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState(null);
  const [modalAlerta, setModalAlerta] = useState({ abierto: false, titulo: '', mensaje: '', tipo: 'info' });

  const usuariosFiltrados = listaUsuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    return (
      (u.nombreCompleto || '').toLowerCase().includes(texto) ||
      (u.numeroDocumento || '').includes(texto) ||
      (u.idUsuario || '').toLowerCase().includes(texto) ||
      (u.correo || '').toLowerCase().includes(texto)
    );
  });

  const iniciarEdicion = (u) => {
    setUsuarioEditando(u.idUsuario);
    setEditNombre(u.nombreCompleto || '');
    setEditCorreo(u.correo || '');
    setEditSaldo(String(u.saldoActual || 0));
    setMensajeExito('');
    setMensajeError('');
  };

  const cancelarEdicion = () => {
    setUsuarioEditando(null);
    setEditNombre('');
    setEditCorreo('');
    setEditSaldo('');
  };

  const guardarEdicion = async (u) => {
    setMensajeExito('');
    setMensajeError('');

    if (!editNombre.trim()) {
      setMensajeError('El nombre no puede estar vacío.');
      return;
    }

    const saldoNum = parseFloat(editSaldo);
    if (isNaN(saldoNum) || saldoNum < 0) {
      setMensajeError('El saldo debe ser un número positivo.');
      return;
    }

    try {
      const { enviarPeticion } = await import('../../servicios/conexionGas');
      const respuesta = await enviarPeticion('editarUsuario', {
        idUsuario: u.idUsuario,
        nombreCompleto: editNombre.trim(),
        correo: editCorreo.trim(),
        saldoActual: saldoNum,
        adminToken
      });

      if (respuesta && respuesta.exito) {
        setMensajeExito('Usuario actualizado correctamente.');
        setListaUsuarios((prev) => prev.map((usr) => usr.idUsuario === u.idUsuario ? { ...usr, nombreCompleto: editNombre.trim(), correo: editCorreo.trim(), saldoActual: saldoNum } : usr));
        cancelarEdicion();
      } else {
        setMensajeError(respuesta?.mensaje || 'Error al actualizar.');
      }
    } catch (err) {
      setMensajeError('Error de conexión con el servidor.');
    }
  };

  const eliminarUsuario = async (u) => {
    setUsuarioEliminar(u);
    setModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    const u = usuarioEliminar;
    setModalEliminar(false);
    setUsuarioEliminar(null);
    setMensajeExito('');
    setMensajeError('');

    try {
      const { enviarPeticion } = await import('../../servicios/conexionGas');
      const respuesta = await enviarPeticion('eliminarUsuario', { idUsuario: u.idUsuario, adminToken });

      if (respuesta && respuesta.exito) {
        setMensajeExito('Usuario eliminado.');
        setListaUsuarios((prev) => prev.filter((usr) => usr.idUsuario !== u.idUsuario));
      } else {
        setMensajeError(respuesta?.mensaje || 'Error al eliminar.');
      }
    } catch (err) {
      setMensajeError('Error de conexión con el servidor.');
    }
  };

  const restablecerContrasena = async (u) => {
    setUsuarioReset(u);
    setModalReset(true);
  };

  const confirmarReset = async (nuevaClave) => {
    const u = usuarioReset;
    setModalReset(false);
    setUsuarioReset(null);
    setMensajeExito('');
    setMensajeError('');

    if (!nuevaClave || nuevaClave.trim().length < 4) {
      setModalAlerta({ abierto: true, titulo: 'Contraseña inválida', mensaje: 'La contraseña debe tener al menos 4 caracteres.', tipo: 'peligro' });
      return;
    }

    try {
      const { enviarPeticion } = await import('../../servicios/conexionGas');
      const respuesta = await enviarPeticion('restablecerContrasena', {
        idUsuario: u.idUsuario,
        nuevaContrasena: nuevaClave.trim()
      });

      if (respuesta && respuesta.exito) {
        setModalAlerta({
          abierto: true,
          titulo: 'Contraseña restablecida',
          mensaje: `La nueva contraseña de "${u.nombreCompleto}" es: "${nuevaClave.trim()}". El usuario deberá cambiarla al iniciar sesión. Comunícasela.`,
          tipo: 'exito'
        });
      } else {
        setMensajeError(respuesta?.mensaje || 'Error al restablecer contraseña.');
      }
    } catch (err) {
      setMensajeError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#0A4D9C]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Gestión de Usuarios</h3>
          <p className="text-xs text-slate-400">{listaUsuarios.length} usuarios registrados</p>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/45 text-emerald-600 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {mensajeError}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, NIE/DUI, ID o correo..."
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
        />
      </div>

      <div className="space-y-3 max-h-[50vh] sm:max-h-[500px] overflow-y-auto pr-1">
        {usuariosFiltrados.length === 0 && (
          <p className="text-center text-slate-400 text-xs py-6">No se encontraron usuarios.</p>
        )}
        {usuariosFiltrados.map((u) => (
          <div key={u.idUsuario} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            {usuarioEditando === u.idUsuario ? (
              <form onSubmit={(e) => { e.preventDefault(); guardarEdicion(u); }} className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                  <Edit2 className="w-3 h-3" /> Editando usuario
                </div>
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
                  placeholder="Nombre completo"
                />
                <input
                  value={editCorreo}
                  onChange={(e) => setEditCorreo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
                  placeholder="Correo electrónico"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Saldo:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editSaldo}
                    onChange={(e) => setEditSaldo(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
                  />
                  <span className="text-[10px] text-slate-400">SL-BITS</span>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 rounded-lg bg-[#0A4D9C] text-white text-xs font-bold flex items-center justify-center gap-1">
                    <Save className="w-3 h-3" /> Guardar
                  </button>
                  <button type="button" onClick={cancelarEdicion} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1">
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#0A4D9C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{u.nombreCompleto}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{u.idUsuario}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => iniciarEdicion(u)} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-[#0A4D9C] hover:bg-[#0A4D9C]/10" title="Editar">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => restablecerContrasena(u)} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-[#E67A15] hover:bg-[#E67A15]/10" title="Restablecer contraseña">
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => eliminarUsuario(u)} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <FileText className="w-3 h-3" /> {u.tipoDocumento}: {u.numeroDocumento}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3 h-3" /> {u.correo || 'Sin correo'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-[#E67A15]" />
                    <span className="font-black text-[#E67A15]">{parseFloat(u.saldoActual || 0).toFixed(2)} SL-BITS</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Shield className="w-3 h-3" /> {u.tipoDocumento === 'NIE' ? 'alumno' : (u.rol || 'visitante')}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <ModalConfirmacion
        estaAbierto={modalEliminar}
        alCerrar={() => { setModalEliminar(false); setUsuarioEliminar(null); }}
        alConfirmar={confirmarEliminar}
        titulo="Eliminar usuario"
        mensaje={`¿Estás seguro de eliminar a "${usuarioEliminar?.nombreCompleto}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        tipo="peligro"
      />

      <ModalInput
        estaAbierto={modalReset}
        alCerrar={() => { setModalReset(false); setUsuarioReset(null); }}
        alConfirmar={confirmarReset}
        titulo="Restablecer contraseña"
        mensaje={`Ingresa la nueva contraseña temporal para "${usuarioReset?.nombreCompleto}". El usuario deberá cambiarla al iniciar sesión.`}
        placeholder="Nueva contraseña (mín. 4 caracteres)"
        valorInicial="1234"
        tipo="text"
        textoConfirmar="Restablecer"
      />

      <ModalAlerta
        estaAbierto={modalAlerta.abierto}
        alCerrar={() => setModalAlerta({ abierto: false, titulo: '', mensaje: '', tipo: 'info' })}
        titulo={modalAlerta.titulo}
        mensaje={modalAlerta.mensaje}
        tipo={modalAlerta.tipo}
      />
    </div>
  );
}