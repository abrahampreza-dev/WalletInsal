import React, { createContext, useContext, useState, useEffect } from 'react';
import { enviarPeticion } from '../servicios/conexionGas';
import { normalizarCarrera } from '../datos/carreras';

const crearCodigoQRGrupo = (idGrupo, nombreGrupo) => JSON.stringify({
  tipo: 'donacion_grupo',
  idGrupo,
  nombreGrupo
});

const ContextoUsuario = createContext();

/**
 * Adapta un grupo proveniente de Firebase (vía GAS) al formato que usa la interfaz:
 * convierte likesUsers en likes/leGusta y normaliza la carrera.
 */
const mapearGrupoDesdeServidor = (grupo, idUsuarioActual) => {
  const grupoMapeado = { ...grupo };
  grupoMapeado.especialidad = normalizarCarrera(grupoMapeado.especialidad);
  grupoMapeado.handle = grupoMapeado.handle || `@${(grupoMapeado.nombreGrupo || 'estand').toLowerCase().replace(/\s+/g, '.')}`;
  grupoMapeado.fotos = (grupoMapeado.fotos || []).map((foto) => {
    const likesUsuarios = foto.likesUsers || {};
    const nombresLikkes = Object.values(likesUsuarios).filter((v) => typeof v === 'string');
    return {
      ...foto,
      likes: typeof foto.likes === 'number' ? foto.likes : Object.keys(likesUsuarios).length,
      leGusta: Boolean(idUsuarioActual && likesUsuarios[idUsuarioActual]),
      nombresLikkes
    };
  });
  return grupoMapeado;
};

export function ProveedorUsuario({ children }) {
  // Usuario activo en el sistema. Se restaura desde la sesión guardada en localStorage.
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const sesionGuardada = localStorage.getItem('usuario_sl_bits');
    if (sesionGuardada) {
      try {
        return JSON.parse(sesionGuardada);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [grupoActual, setGrupoActual] = useState(() => {
    try {
      const sesion = localStorage.getItem('grupo_sl_bits');
      return sesion ? JSON.parse(sesion) : null;
    } catch { return null; }
  });

  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_sl_bits') || '');

  // Datos reales: se cargan desde Firebase vía Google Apps Script (sincronizarConServidor).
  const [listaGrupos, setListaGrupos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaBitacoras, setListaBitacoras] = useState([]);
  const [listaTransacciones, setListaTransacciones] = useState([]);

  // Notificaciones generadas únicamente a partir de eventos reales.
  const [notificaciones, setNotificaciones] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  // Expiración de sesión por inactividad (15 minutos)
  const TIEMPO_EXPIRACION = 15 * 60 * 1000; // 15 minutos
  const ULTIMA_ACTIVIDAD_KEY = 'sl_bits_ultima_actividad';

  useEffect(() => {
    if (!usuarioActual && !grupoActual && !adminToken) return;

    const actualizarActividad = () => {
      localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, String(Date.now()));
    };

    const verificarExpiracion = () => {
      const ultimaActividad = parseInt(localStorage.getItem(ULTIMA_ACTIVIDAD_KEY) || '0', 10);
      const ahora = Date.now();
      if (ultimaActividad && (ahora - ultimaActividad) > TIEMPO_EXPIRACION) {
        cerrarSesion();
        setMensajeAlerta('Tu sesión ha expirado por inactividad. Vuelve a iniciar sesión.');
      }
    };

    // Registrar actividad en eventos del usuario
    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    eventos.forEach(evt => document.addEventListener(evt, actualizarActividad, { passive: true }));

    // Verificar cada 30 segundos
    const intervalo = setInterval(verificarExpiracion, 30000);

    // Inicializar timestamp
    actualizarActividad();

    return () => {
      eventos.forEach(evt => document.removeEventListener(evt, actualizarActividad));
      clearInterval(intervalo);
    };
  }, [usuarioActual, grupoActual, adminToken]);

  // Persistencia local de la sesión y caché de lectura
  useEffect(() => {
    try {
      if (usuarioActual) localStorage.setItem('usuario_sl_bits', JSON.stringify(usuarioActual));
      else localStorage.removeItem('usuario_sl_bits');
    } catch {}
  }, [usuarioActual]);

  useEffect(() => {
    try {
      if (grupoActual) localStorage.setItem('grupo_sl_bits', JSON.stringify(grupoActual));
      else localStorage.removeItem('grupo_sl_bits');
    } catch {}
  }, [grupoActual]);

  useEffect(() => {
    try { localStorage.setItem('grupos_sl_bits', JSON.stringify(listaGrupos)); } catch {}
  }, [listaGrupos]);

  useEffect(() => {
    try { localStorage.setItem('transacciones_sl_bits', JSON.stringify(listaTransacciones)); } catch {}
  }, [listaTransacciones]);

  useEffect(() => {
    try { localStorage.setItem('usuarios_sl_bits', JSON.stringify(listaUsuarios)); } catch {}
  }, [listaUsuarios]);

  useEffect(() => {
    try { localStorage.setItem('bitacoras_sl_bits', JSON.stringify(listaBitacoras)); } catch {}
  }, [listaBitacoras]);

  // Cargar los datos oficiales desde Firebase vía Apps Script al abrir la app.
  useEffect(() => {
    sincronizarConServidor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resync periódico cada 30 segundos para mantener saldo y datos actualizados
  useEffect(() => {
    if (!usuarioActual) return;
    const intervalo = setInterval(() => {
      sincronizarConServidor();
    }, 30000);
    return () => clearInterval(intervalo);
  }, [usuarioActual]);

  // Sincronizar datos globales (grupos, transacciones, usuarios y bitácoras) con el backend.
  const sincronizarConServidor = async () => {
    setCargando(true);
    try {
      const respuesta = await enviarPeticion("obtenerTodo");

      if (respuesta && respuesta.exito && respuesta.datos) {
        if (respuesta.datos.grupos && Object.keys(respuesta.datos.grupos).length > 0) {
          const arregloGrupos = Object.values(respuesta.datos.grupos).map((grupo) =>
            mapearGrupoDesdeServidor(grupo, usuarioActual?.idUsuario)
          );
          setListaGrupos(arregloGrupos);
        }
        if (respuesta.datos.transacciones && Object.keys(respuesta.datos.transacciones).length > 0) {
          const arregloTx = Object.values(respuesta.datos.transacciones).reverse();
          setListaTransacciones(arregloTx);
        }
        if (respuesta.datos.usuarios && Object.keys(respuesta.datos.usuarios).length > 0) {
          const arregloUsuarios = Object.values(respuesta.datos.usuarios);
          setListaUsuarios(arregloUsuarios);
        }
        if (respuesta.datos.bitacoras && Object.keys(respuesta.datos.bitacoras).length > 0) {
          const arregloBitacoras = Object.values(respuesta.datos.bitacoras).reverse();
          setListaBitacoras(arregloBitacoras);
        }
      }
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Subir una foto al feed del estand: se guarda en Firebase vía GAS.
  const subirFotoGrupo = async (idGrupo, datosFoto) => {
    if (!usuarioActual) return { exito: false, mensaje: "Debes iniciar sesión para subir una foto." };
    setCargando(true);
    try {
      const respuesta = await enviarPeticion("subirFotoGrupo", {
        idGrupo,
        foto: {
          id: "post_" + Date.now(),
          url: datosFoto.url,
          pie: datosFoto.pie || "",
          fecha: "Justo ahora",
          likes: 0,
          leGusta: false,
          likesUsers: {},
          comentarios: []
        }
      });

      if (respuesta && respuesta.exito && respuesta.grupo) {
        const grupoMapeado = mapearGrupoDesdeServidor(respuesta.grupo, usuarioActual?.idUsuario);
        setListaGrupos((prev) =>
          prev.map((g) => (g.idGrupo === idGrupo ? grupoMapeado : g))
        );
        if (grupoActual && grupoActual.idGrupo === idGrupo) setGrupoActual(grupoMapeado);
        return { exito: true, mensaje: respuesta.mensaje || "¡Publicación subida con éxito al feed del estand!" };
      }

      return {
        exito: false,
        mensaje: (respuesta && respuesta.mensaje) || "Ocurrió un error al intentar almacenar la imagen."
      };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Dar/quitar like a una foto: se persiste en Firebase vía GAS.
  const toggleLikeFoto = async (idGrupo, idFoto) => {
    if (!usuarioActual) return { exito: false, mensaje: 'Debes iniciar sesión para dar "Me gusta".' };

    const grupo = listaGrupos.find((g) => g.idGrupo === idGrupo);
    const foto = grupo?.fotos?.find((f) => f.id === idFoto);
    if (!foto) return { exito: false, mensaje: "La publicación consultada no se encuentra disponible." };

    setCargando(true);
    try {
      const quiereLike = !foto.leGusta;
      const respuesta = await enviarPeticion("toggleLikeFoto", {
        idGrupo,
        idFoto,
        idUsuario: usuarioActual.idUsuario,
        nombreUsuario: usuarioActual.nombre || usuarioActual.documento || usuarioActual.idUsuario,
        quiereLike
      });

      if (respuesta && respuesta.exito) {
        setListaGrupos((prev) =>
          prev.map((g) => {
            if (g.idGrupo !== idGrupo) return g;
            const fotosActualizadas = (g.fotos || []).map((f) => {
              if (f.id !== idFoto) return f;
              const nuevosNombres = quiereLike
                ? [...(f.nombresLikkes || []), usuarioActual.nombre || usuarioActual.documento || usuarioActual.idUsuario]
                : (f.nombresLikkes || []).filter((n) => n !== (usuarioActual.nombre || usuarioActual.documento || usuarioActual.idUsuario));
              return {
                ...f,
                leGusta: quiereLike,
                likes: respuesta.likes !== undefined ? respuesta.likes : Math.max(0, f.likes + (quiereLike ? 1 : -1)),
                nombresLikkes: nuevosNombres
              };
            });
            return { ...g, fotos: fotosActualizadas };
          })
        );
        return { exito: true };
      }

      return { exito: false, mensaje: (respuesta && respuesta.mensaje) || 'No fue posible registrar tu interacción en este momento.' };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Agregar comentario a una foto: se persiste en Firebase vía GAS.
  const agregarComentarioFoto = async (idGrupo, idFoto, textoComentario) => {
    if (!textoComentario.trim() || !usuarioActual) return { exito: false };

    setCargando(true);
    try {
      const respuesta = await enviarPeticion("agregarComentarioFoto", {
        idGrupo,
        idFoto,
        comentario: {
          id: "com_" + Date.now(),
          autor: usuarioActual.nombreCompleto,
          texto: textoComentario.trim(),
          hora: "Justo ahora"
        }
      });

      if (respuesta && respuesta.exito && respuesta.grupo) {
        const grupoMapeado = mapearGrupoDesdeServidor(respuesta.grupo, usuarioActual.idUsuario);
        setListaGrupos((prev) =>
          prev.map((g) => (g.idGrupo === idGrupo ? grupoMapeado : g))
        );
        return { exito: true };
      }
      return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "No se pudo procesar tu comentario. Inténtalo nuevamente." };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Actualizar video de Google Drive y duración: se persiste vía GAS.
  const actualizarVideoDrive = async (idGrupo, urlVideo, duracionSegundos = 30) => {
    let urlNormalizada = urlVideo.trim();
    if (urlNormalizada.includes('drive.google.com') && !urlNormalizada.includes('/preview')) {
      urlNormalizada = urlNormalizada.replace(/\/view(\?usp=sharing)?$/, '/preview').replace(/\/edit.*$/, '/preview');
      if (!urlNormalizada.endsWith('/preview') && urlNormalizada.includes('/file/d/')) {
        const partes = urlNormalizada.split('/file/d/');
        if (partes[1]) {
          const fileId = partes[1].split('/')[0].split('?')[0];
          urlNormalizada = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
    }

    const resultado = await actualizarGrupo({
      idGrupo,
      urlVideo: urlNormalizada,
      duracionSegundos: parseInt(duracionSegundos || 30, 10)
    });

    if (!resultado.exito) {
      return { exito: false, mensaje: resultado.mensaje };
    }
    return { exito: true, urlNormalizada };
  };

  // Actualiza la configuración multimedia de un grupo (requiere la clave del equipo).
  const actualizarGrupo = async (datos) => {
    if (!grupoActual || grupoActual.idGrupo !== datos.idGrupo || !grupoActual.claveAcceso) {
      return { exito: false, mensaje: "No tienes una sesión de equipo autorizada para editar este estand." };
    }

    setCargando(true);
    try {
      const respuesta = await enviarPeticion("actualizarGrupo", {
        idGrupo: datos.idGrupo,
        claveAcceso: grupoActual.claveAcceso,
        urlFoto: datos.urlFoto ?? grupoActual.urlFoto ?? "",
        urlVideo: datos.urlVideo ?? grupoActual.urlVideo ?? "",
        duracionSegundos: parseInt(datos.duracionSegundos ?? grupoActual.duracionSegundos ?? 30, 10)
      });

      if (respuesta && respuesta.exito && respuesta.grupo) {
        const grupoMapeado = mapearGrupoDesdeServidor(
          { ...respuesta.grupo, claveAcceso: grupoActual.claveAcceso },
          usuarioActual?.idUsuario
        );
        setListaGrupos((prev) => prev.map((g) => (g.idGrupo === datos.idGrupo ? grupoMapeado : g)));
        setGrupoActual(grupoMapeado);
        return { exito: true, grupo: grupoMapeado };
      }

      return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "No se pudo guardar la configuración." };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Donación o voto a un estand: se valida y registra en Firebase vía GAS.
  const realizarDonacion = async (idGrupo, monto, contrasenaUsuario) => {
    if (!usuarioActual) {
      return { exito: false, mensaje: "Por favor, ingresa a tu cuenta para realizar un apoyo con SL-BITS." };
    }

    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) {
      return { exito: false, mensaje: "Ingresa un monto válido mayor a 0." };
    }
    if (montoNum < 0.01) return { exito: false, mensaje: "El monto mínimo es 0.01 SL-BITS." };
    if (!contrasenaUsuario) return { exito: false, mensaje: "Debes ingresar tu contraseña para confirmar la donación." };

    const idTransaccionUnico = "TX_DONAR_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    setCargando(true);
    try {
      const respuestaServidor = await enviarPeticion("procesarDonacion", {
        idUsuario: usuarioActual.idUsuario,
        idGrupo,
        monto: montoNum,
        idTransaccion: idTransaccionUnico,
        contrasena: contrasenaUsuario
      });

      if (!respuestaServidor || respuestaServidor.exito !== true) {
        return {
          exito: false,
          mensaje: (respuestaServidor && respuestaServidor.mensaje) || "No se pudo procesar la donación."
        };
      }

      if (respuestaServidor.transaccion) {
        setListaTransacciones((prev) => [
          { ...respuestaServidor.transaccion, categoria: "donacion" },
          ...prev.filter((tx) => tx.idTransaccion !== respuestaServidor.transaccion.idTransaccion)
        ]);
      }

      if (respuestaServidor.nuevoSaldoUsuario !== undefined) {
        setUsuarioActual((prev) => ({ ...prev, saldoActual: respuestaServidor.nuevoSaldoUsuario }));
      }

      // Sincronizar para reflejar el nuevo total del grupo.
      await sincronizarConServidor();

      return { exito: true, mensaje: respuestaServidor.mensaje };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Transferencia de SL-BITS a un compañero, comercio o estand: se valida en Firebase vía GAS.
  const enviarBits = async (destinatario, monto, concepto = "Transferencia directa", contrasenaUsuario) => {
    if (!usuarioActual) return { exito: false, mensaje: "No hay sesión activa." };

    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) return { exito: false, mensaje: "La cantidad transferida debe ser mayor a 0.00 SL-BITS." };
    if (montoNum < 0.01) return { exito: false, mensaje: "El monto mínimo de transferencia es 0.01 SL-BITS." };
    if (!destinatario || !destinatario.trim()) return { exito: false, mensaje: "Indique el destinatario de la transacción." };

    if (!contrasenaUsuario) return { exito: false, mensaje: "Debes ingresar tu contraseña para confirmar la transferencia." };

    const idTransaccionUnico = "TX_ENVIO_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    setCargando(true);
    try {
      const respuesta = await enviarPeticion("transferirBits", {
        idEmisor: usuarioActual.idUsuario,
        destinatario: destinatario.trim(),
        monto: montoNum,
        concepto: concepto || "Transferencia directa",
        contrasena: contrasenaUsuario,
        idTransaccion: idTransaccionUnico
      });

      if (!respuesta || respuesta.exito !== true) {
        return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "Ocurrió un inconveniente al transferir los SL-BITS." };
      }

      if (respuesta.nuevoSaldoEmisor !== undefined) {
        setUsuarioActual((prev) => ({ ...prev, saldoActual: respuesta.nuevoSaldoEmisor }));
      }
      if (respuesta.nuevoSaldoReceptor !== undefined && respuesta.transaccion) {
        const idReceptor = respuesta.transaccion.idReceptor;
        setListaUsuarios((prev) =>
          prev.map((u) => (u.idUsuario === idReceptor ? { ...u, saldoActual: respuesta.nuevoSaldoReceptor } : u))
        );
      }
      if (respuesta.transaccion) {
        setListaTransacciones((prev) => [
          { ...respuesta.transaccion, categoria: "envio" },
          ...prev.filter((tx) => tx.idTransaccion !== respuesta.transaccion.idTransaccion)
        ]);
      }
      if (respuesta.nuevoTotalGrupo !== undefined && respuesta.esDonacionGrupo) {
        setListaGrupos((prev) =>
          prev.map((g) => (g.idGrupo === destinatario ? { ...g, totalRecaudado: respuesta.nuevoTotalGrupo } : g))
        );
      }

      return { exito: true, mensaje: respuesta.mensaje };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  const subirAvatar = async (imagenBase64, idUsuarioExplicito) => {
    const idAUsar = idUsuarioExplicito || (usuarioActual && usuarioActual.idUsuario);
    if (!idAUsar) return { exito: false, mensaje: "No hay sesión activa." };

    setCargando(true);
    try {
      const respuesta = await enviarPeticion("subirAvatar", {
        idUsuario: idAUsar,
        imagenBase64: imagenBase64
      });

      if (respuesta && respuesta.exito && respuesta.urlAvatar) {
        setUsuarioActual((prev) => prev ? { ...prev, avatar: respuesta.urlAvatar } : prev);
        return { exito: true, urlAvatar: respuesta.urlAvatar };
      }

      return {
        exito: false,
        mensaje: (respuesta && respuesta.mensaje) || "No se pudo subir la foto de perfil."
      };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Registro de visitante: se crea en Firebase vía GAS con bono real de 1.00 SL-BITS.
  const registrarNuevoVisitante = async (datosFormulario) => {
    setCargando(true);
    try {
      const respuestaServidor = await enviarPeticion("registrarVisitante", {
        nombreCompleto: datosFormulario.nombreCompleto,
        correo: datosFormulario.correo,
        tipoDocumento: datosFormulario.tipoDocumento,
        numeroDocumento: datosFormulario.numeroDocumento,
        contrasena: datosFormulario.contrasena || ""
      });

      if (!respuestaServidor || respuestaServidor.exito !== true) {
        return {
          exito: false,
          mensaje: (respuestaServidor && respuestaServidor.mensaje) || "Inconveniente al procesar la solicitud de registro."
        };
      }

      const nuevoUsuario = {
        ...respuestaServidor.usuario,
        avatar: "/logo.png"
      };
      setUsuarioActual(nuevoUsuario);

      // Bono de bienvenida registrado por el propio backend; lo reflejamos en el historial local.
      if (respuestaServidor.usuario.idUsuario) {
        const txBono = {
          idTransaccion: "TX_BONO_" + Date.now(),
          tipo: "bono_bienvenida",
          idEmisor: "SISTEMA_INSTITUTO_SAN_LUIS",
          nombreEmisor: "Asignación Inicial de Bienvenida",
          idReceptor: nuevoUsuario.idUsuario,
          nombreReceptor: nuevoUsuario.nombreCompleto,
          monto: nuevoUsuario.saldoActual,
          fecha: new Date().toISOString(),
          categoria: "bono"
        };
        setListaTransacciones((prev) => [txBono, ...prev]);
      }

      setListaUsuarios((prev) => [nuevoUsuario, ...prev.filter((u) => u.idUsuario !== nuevoUsuario.idUsuario)]);
      return { exito: true, mensaje: `¡Registro completado correctamente! Se han abonado ${nuevoUsuario.saldoActual.toFixed(2)} SL-BITS como bono inicial a tu billetera.`, usuario: nuevoUsuario };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Registro de estand/grupo: se crea en Firebase vía GAS.
  const registrarNuevoGrupo = async (datosGrupo) => {
    setCargando(true);
    try {
      const respuestaServidor = await enviarPeticion("registrarGrupo", {
        nombreGrupo: datosGrupo.nombreGrupo,
        especialidad: datosGrupo.especialidad,
        integrantes: datosGrupo.integrantes,
        descripcion: datosGrupo.descripcion,
        urlFoto: datosGrupo.urlFoto || "",
        urlVideo: datosGrupo.urlVideo || "",
        duracionSegundos: parseInt(datosGrupo.duracionSegundos || 30, 10),
        claveAcceso: datosGrupo.claveAcceso || ""
      });

      if (!respuestaServidor || respuestaServidor.exito !== true) {
        return {
          exito: false,
          mensaje: (respuestaServidor && respuestaServidor.mensaje) || "Ocurrió un error durante la inscripción del proyecto."
        };
      }

      // El grupo se conserva con su clave en la sesión del equipo (no se envía en los datos públicos).
      const nuevoGrupo = mapearGrupoDesdeServidor(
        { ...respuestaServidor.grupo, claveAcceso: datosGrupo.claveAcceso || "" },
        null
      );
      nuevoGrupo.codigoQR = crearCodigoQRGrupo(nuevoGrupo.idGrupo, nuevoGrupo.nombreGrupo);

      setListaGrupos((prev) => [...prev.filter((g) => g.idGrupo !== nuevoGrupo.idGrupo), nuevoGrupo]);
      setGrupoActual(nuevoGrupo);
      return { exito: true, mensaje: "¡Proyecto registrado y autenticado correctamente!", grupo: nuevoGrupo };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Iniciar sesión de un equipo: verifica la clave en Firebase vía GAS.
  const iniciarSesionGrupo = async (idGrupo, claveAcceso) => {
    setCargando(true);
    try {
      const respuesta = await enviarPeticion("iniciarSesionGrupo", { idGrupo, claveAcceso });

      if (!respuesta || respuesta.exito !== true) {
        return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "No fue posible autenticar las credenciales del equipo." };
      }

      const grupoSesion = mapearGrupoDesdeServidor(respuesta.grupo, usuarioActual?.idUsuario);
      grupoSesion.claveAcceso = claveAcceso;
      setGrupoActual(grupoSesion);
      return { exito: true, grupo: grupoSesion };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Validar clave de acceso de un grupo (usado por los modales de equipo).
  const verificarClaveGrupo = async (idGrupo, claveIngresada) => iniciarSesionGrupo(idGrupo, claveIngresada);

  // Iniciar sesión administrativa: valida con el backend (PropertiesService de Apps Script).
  const iniciarSesionAdmin = async (claveAdmin) => {
    setCargando(true);
    try {
      const respuesta = await enviarPeticion("iniciarSesionAdmin", { claveAdmin });

      if (!respuesta || respuesta.exito !== true) {
        return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "Clave de acceso no válida." };
      }

      localStorage.setItem('admin_sl_bits', respuesta.token);
      setAdminToken(respuesta.token);
      return { exito: true };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Inicio de sesión de visitante / alumno con NIE/DUI y contraseña
  const iniciarSesionVisitante = async (numeroDocumento, contrasena) => {
    setCargando(true);
    try {
      const respuesta = await enviarPeticion("iniciarSesionVisitante", {
        numeroDocumento: numeroDocumento.trim(),
        contrasena: contrasena.trim()
      });

      if (!respuesta || respuesta.exito !== true) {
        return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "Error al iniciar sesión." };
      }

      const usuarioSesion = {
        ...respuesta.usuario,
        avatar: respuesta.usuario.avatar || "/logo.png"
      };
      setUsuarioActual(usuarioSesion);
      const needsPasswordChange = Boolean(respuesta.usuario.contrasenaTemporal);
      return { exito: true, usuario: usuarioSesion, contrasenaTemporal: needsPasswordChange };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Recarga de saldo en efectivo desde caja: se valida y registra en Firebase vía GAS.
  const recargarSaldoAdmin = async (criterioBusqueda, monto, motivo = "Recarga en efectivo en caja") => {
    if (!criterioBusqueda || !monto || monto <= 0) {
      return { exito: false, mensaje: "Ingresa un identificador de usuario y un monto válido." };
    }

    const requestId = "RECARGA_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    setCargando(true);
    try {
      const respuesta = await enviarPeticion("recargarSaldoAdmin", {
        criterioBusqueda: criterioBusqueda.trim(),
        montoRecarga: parseFloat(monto),
        motivo,
        adminToken,
        requestId
      });

      if (!respuesta || respuesta.exito !== true) {
        return { exito: false, mensaje: (respuesta && respuesta.mensaje) || "No se logró procesar la acreditación del saldo." };
      }

      if (respuesta.usuarioActualizado) {
        const idActualizado = respuesta.usuarioActualizado.idUsuario;
        setListaUsuarios((prev) =>
          prev.map((u) => (u.idUsuario === idActualizado ? { ...u, saldoActual: respuesta.usuarioActualizado.saldoActual } : u))
        );
        if (usuarioActual && usuarioActual.idUsuario === idActualizado) {
          setUsuarioActual((prev) => ({ ...prev, saldoActual: respuesta.usuarioActualizado.saldoActual }));
        }
      }

      await sincronizarConServidor();
      return { exito: true, mensaje: respuesta.mensaje, usuarioActualizado: respuesta.usuarioActualizado };
    } catch (error) {
      setCargando(false);
      return { exito: false, mensaje: 'Error inesperado al procesar la operación.' };
    } finally {
      setCargando(false);
    }
  };

  // Iniciar temporizador de retención de video en el servidor
  const iniciarTimerVideo = async (idGrupo) => {
    if (!usuarioActual) return { exito: false, mensaje: "Debes iniciar sesión." };
    try {
      const respuesta = await enviarPeticion("iniciarTimerVideo", {
        idUsuario: usuarioActual.idUsuario,
        idGrupo
      });
      return respuesta || { exito: false, mensaje: "No se pudo iniciar el temporizador." };
    } catch (error) {
      return { exito: false, mensaje: 'Error al iniciar temporizador.' };
    }
  };

  // Verificar retención de video en el servidor
  const verificarRetencionVideo = async (idGrupo) => {
    if (!usuarioActual) return { exito: false, retencionCumplida: false };
    try {
      const respuesta = await enviarPeticion("verificarRetencionVideo", {
        idUsuario: usuarioActual.idUsuario,
        idGrupo
      });
      return respuesta || { exito: false, retencionCumplida: false };
    } catch (error) {
      return { exito: false, retencionCumplida: false };
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuario_sl_bits');
    setGrupoActual(null);
    setAdminToken('');
    localStorage.removeItem('grupo_sl_bits');
    localStorage.removeItem('admin_sl_bits');
  };

  return (
    <ContextoUsuario.Provider
      value={{
        usuarioActual,
        setUsuarioActual,
        grupoActual,
        setGrupoActual,
        adminAutenticado: Boolean(adminToken),
        listaGrupos,
        setListaGrupos,
        listaUsuarios,
        setListaUsuarios,
        listaBitacoras,
        setListaBitacoras,
        listaTransacciones,
        notificaciones,
        setNotificaciones,
        cargando,
        mensajeAlerta,
        setMensajeAlerta,
        subirFotoGrupo,
        toggleLikeFoto,
        agregarComentarioFoto,
        actualizarVideoDrive,
        actualizarGrupo,
        realizarDonacion,
        enviarBits,
        recargarSaldoAdmin,
        subirAvatar,
        registrarNuevoVisitante,
        registrarNuevoGrupo,
        iniciarSesionGrupo,
        verificarClaveGrupo,
        iniciarSesionAdmin,
        iniciarSesionVisitante,
        sincronizarConServidor,
        iniciarTimerVideo,
        verificarRetencionVideo,
        cerrarSesion
      }}
    >
      {children}
    </ContextoUsuario.Provider>
  );
}

export function usarUsuario() {
  const contexto = useContext(ContextoUsuario);
  if (!contexto) {
    throw new Error("usarUsuario debe ser utilizado dentro de un ProveedorUsuario");
  }
  return contexto;
}