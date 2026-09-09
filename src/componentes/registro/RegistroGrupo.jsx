import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { enviarPeticion } from '../../servicios/conexionGas';
import { CARRERAS_INSTITUTO } from '../../datos/carreras';
import { 
  Building2, 
  Layers, 
  Users, 
  FileText, 
  Upload, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';
import CamaraSelfie from '../comun/CamaraSelfie';

export default function RegistroGrupo({ alCompletarRegistro }) {
  const { registrarNuevoGrupo, cargando } = usarUsuario();

  const [nombreGrupo, setNombreGrupo] = useState('');
  const [especialidad, setEspecialidad] = useState(CARRERAS_INSTITUTO[0]);
  const [integrantes, setIntegrantes] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlFoto, setUrlFoto] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [duracionSegundos, setDuracionSegundos] = useState('30');
  const [claveAcceso, setClaveAcceso] = useState('');
  const [verClaveAcceso, setVerClaveAcceso] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [camaraAbierta, setCamaraAbierta] = useState(false);

  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Subir imagen a ImgBB mediante el backend de Google Apps Script
  const manejarSubidaImagen = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      setMensajeError('La imagen no debe superar los 5 MB.');
      return;
    }

    setSubiendoImagen(true);
    setMensajeError('');

    const lector = new FileReader();
    lector.onload = async () => {
      const base64 = lector.result;
      const respuesta = await enviarPeticion('subirImagen', { imagenBase64: base64 });

      if (respuesta && respuesta.exito && respuesta.urlImagen) {
        setUrlFoto(respuesta.urlImagen);
        setMensajeExito('¡Imagen subida exitosamente a ImgBB!');
      } else {
        // En caso de que falle la API de ImgBB, usamos la vista previa en Base64 localmente
        setUrlFoto(base64);
        setMensajeExito('Imagen cargada localmente.');
      }
      setSubiendoImagen(false);
    };

    lector.onerror = () => {
      setMensajeError('Error al leer el archivo de imagen.');
      setSubiendoImagen(false);
    };

    lector.readAsDataURL(archivo);
  };

  // Formatear automáticamente enlace de Google Drive
  const manejarCambioVideo = (evento) => {
    const enlaceIngresado = evento.target.value;
    setUrlVideo(enlaceIngresado);

    const patronDrive = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/;
    const coincidencia = enlaceIngresado.match(patronDrive);

    if (coincidencia && coincidencia[1]) {
      const enlaceIncrustable = `https://drive.google.com/file/d/${coincidencia[1]}/preview`;
      setUrlVideo(enlaceIncrustable);
    }
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (!nombreGrupo.trim()) {
      setMensajeError('Ingresa el nombre del proyecto o estand.');
      return;
    }

    if (!integrantes.trim()) {
      setMensajeError('Detalla los nombres de los integrantes del equipo.');
      return;
    }

    if (claveAcceso.length < 6) {
      setMensajeError('La clave del grupo debe tener al menos 6 caracteres.');
      return;
    }

    const datos = {
      nombreGrupo: nombreGrupo.trim(),
      especialidad: especialidad,
      integrantes: integrantes.trim(),
      descripcion: descripcion.trim(),
      urlFoto: urlFoto.trim(),
      urlVideo: urlVideo.trim(),
      duracionSegundos: parseInt(duracionSegundos || 30, 10)
      , claveAcceso: claveAcceso
    };

    const resultado = await registrarNuevoGrupo(datos);

    if (resultado.exito) {
      setMensajeExito(resultado.mensaje || '¡Estand registrado exitosamente!');
      setTimeout(() => {
        if (alCompletarRegistro) alCompletarRegistro();
      }, 1200);
    } else {
      setMensajeError(resultado.mensaje || 'Ocurrió un error al registrar el estand.');
    }
  };

  return (
    <>
    <form onSubmit={manejarEnvio} className="space-y-4">
      
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

      {/* Campo: Nombre del Proyecto / Estand */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Nombre del Proyecto / Estand
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            placeholder="Ej. Sistema IoT de Riego Automatizado"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15]"
          />
        </div>
      </div>

      {/* Campo: Especialidad Técnica */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Especialidad Técnica
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
          <select
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#E67A15]"
          >
            {CARRERAS_INSTITUTO.map((esp) => (
              <option key={esp} value={esp} className="bg-slate-50 text-slate-800">
                {esp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campo: Integrantes */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Integrantes del Equipo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Users className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={integrantes}
            onChange={(e) => setIntegrantes(e.target.value)}
            placeholder="Ej. Juan Pérez, Karla Gómez, David Martínez"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Clave privada del grupo
        </label>
        <div className="relative">
          <input
            type={verClaveAcceso ? "text" : "password"}
            required
            minLength="6"
            value={claveAcceso}
            onChange={(e) => setClaveAcceso(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15]"
          />
          <button type="button" onClick={() => setVerClaveAcceso(!verClaveAcceso)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white" aria-label={verClaveAcceso ? "Ocultar clave" : "Mostrar clave"}>
            {verClaveAcceso ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Se usará para entrar al espacio privado del estand.</p>
      </div>

      {/* Campo: Descripción Breve */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Descripción del Proyecto
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
            <FileText className="w-4 h-4" />
          </div>
          <textarea
            rows="2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Explica brevemente el objetivo y funcionamiento técnico de tu proyecto..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E67A15] resize-none"
          />
        </div>
      </div>

      {/* Subida de Imagen (ImgBB) */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Fotografía de Portada del Estand
        </label>
        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-white cursor-pointer text-xs font-semibold transition-colors">
            {subiendoImagen ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E67A15]" />
                Subiendo a ImgBB...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-[#0A4D9C]" />
                Subir Imagen (ImgBB)
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={manejarSubidaImagen}
              className="hidden"
              disabled={subiendoImagen}
            />
          </label>
          <button
            type="button"
            onClick={() => setCamaraAbierta(true)}
            className="px-4 py-2.5 bg-[#E67A15]/15 border border-[#E67A15]/45 rounded-xl text-[#E67A15] hover:bg-[#E67A15]/25 transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <Camera className="w-4 h-4" />
            Cámara
          </button>
          {urlFoto && (
            <img 
              src={urlFoto} 
              alt="Vista previa" 
              className="w-10 h-10 rounded-lg object-cover border border-[#E67A15]"
            />
          )}
        </div>
      </div>

      {/* Video de Google Drive y Duración */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Enlace de Video (Google Drive)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Video className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={urlVideo}
              onChange={manejarCambioVideo}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-mono focus:outline-none focus:border-[#E67A15]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Duración (seg)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="15"
              max="300"
              value={duracionSegundos}
              onChange={(e) => setDuracionSegundos(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:border-[#E67A15]"
            />
          </div>
        </div>
      </div>

      {/* Botón Guardar Estand */}
      <button
        type="submit"
        disabled={cargando || subiendoImagen}
        className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {cargando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registrando estand técnico...
          </>
        ) : (
          <>
            <Building2 className="w-4 h-4" />
            Comentar Estand en Expotecnia 2026
          </>
        )}
      </button>

    </form>

    <CamaraSelfie
      estaAbierto={camaraAbierta}
      alCerrar={() => setCamaraAbierta(false)}
      alTomarFoto={async (foto) => {
        const respuesta = await enviarPeticion('subirImagen', { imagenBase64: foto });
        if (respuesta && respuesta.exito && respuesta.urlImagen) {
          setUrlFoto(respuesta.urlImagen);
        } else {
          setUrlFoto(foto);
        }
      }}
    />
    </>
  );
}
