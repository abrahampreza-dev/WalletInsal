import React, { useState } from 'react';
import { X, Save, Users, Layers, FileText, Building2 } from 'lucide-react';
import { CARRERAS_INSTITUTO } from '../../datos/carreras';

export default function ModalEditarPerfilGrupo({ estaAbierto, alCerrar, grupo, alGuardar }) {
  const [nombreGrupo, setNombreGrupo] = useState(grupo?.nombreGrupo || '');
  const [especialidad, setEspecialidad] = useState(grupo?.especialidad || '');
  const [descripcion, setDescripcion] = useState(grupo?.descripcion || '');
  const [integrantes, setIntegrantes] = useState(grupo?.integrantes || '');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  if (!estaAbierto || !grupo) return null;

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');
    try {
      const resultado = await alGuardar({
        idGrupo: grupo.idGrupo,
        nombreGrupo: nombreGrupo.trim(),
        especialidad: especialidad.trim(),
        descripcion: descripcion.trim(),
        integrantes: integrantes.trim()
      });
      if (resultado?.exito) {
        setMensaje('¡Perfil actualizado con éxito!');
        setTimeout(() => { setMensaje(''); alCerrar(); }, 1200);
      } else {
        setMensaje(resultado?.mensaje || 'No se pudo guardar.');
      }
    } catch (err) {
      setMensaje('Error inesperado al guardar.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A4D9C] to-[#07366E] flex items-center justify-center text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Editar Información del Estand</h3>
              <p className="text-xs text-slate-400">{grupo.nombreGrupo}</p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={manejarGuardar} className="p-6 overflow-y-auto space-y-4">
          
          {mensaje && (
            <div className={`p-3 rounded-xl text-xs font-semibold text-center ${
              mensaje.includes('éxito')
                ? 'bg-emerald-500/15 border border-emerald-500/45 text-emerald-600'
                : 'bg-red-500/15 border border-red-500/45 text-red-300'
            }`}>
              {mensaje}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Building2 className="inline w-3.5 h-3.5 mr-1.5 text-[#0A4D9C]" />
              Nombre del Proyecto / Estand
            </label>
            <input
              type="text"
              required
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
              placeholder="Nombre del proyecto"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Layers className="inline w-3.5 h-3.5 mr-1.5 text-[#0A4D9C]" />
              Carrera / Especialidad
            </label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0A4D9C]"
            >
              <option value="">Selecciona una carrera</option>
              {CARRERAS_INSTITUTO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              <FileText className="inline w-3.5 h-3.5 mr-1.5 text-[#0A4D9C]" />
              Descripción del Proyecto
            </label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0A4D9C] resize-none"
              placeholder="Describe tu proyecto, objetivos, innovación..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Users className="inline w-3.5 h-3.5 mr-1.5 text-[#E67A15]" />
              Integrantes del Equipo
            </label>
            <textarea
              rows={2}
              value={integrantes}
              onChange={(e) => setIntegrantes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E67A15] resize-none"
              placeholder="Nombres completos de los integrantes"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0A4D9C] to-[#07366E] hover:from-[#07366E] hover:to-[#0A4D9C] text-white text-xs font-extrabold shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
