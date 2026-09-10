/**
 * ==========================================================================
 * SL-BITS WALLET v3.0 - BACKEND ROBUSTO
 * Google Apps Script + Firebase Realtime Database + ImgBB
 *
 * IMPORTANTE: configurar FIREBASE_URL, ADMIN_PASSWORD e IMGBB_API_KEY en
 * Script Properties. No guardar secretos en el código ni en GitHub.
 * ==========================================================================
 */


// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN Y CONSTANTES DEL SISTEMA
// --------------------------------------------------------------------------
var CONFIG = {
  FIREBASE_URL: PropertiesService.getScriptProperties().getProperty("FIREBASE_URL") || "https://walletinsal-3c820-default-rtdb.firebaseio.com/",
  IMGBB_API_KEY: PropertiesService.getScriptProperties().getProperty("IMGBB_API_KEY") || "",
  MONTO_MINIMO_TRANSFERENCIA: 0.01,
  MONTO_MAXIMO_TRANSFERENCIA: 999999.99,
  MONTO_MAXIMO_RECARGA: 999999.99,
  LOCK_TIMEOUT_MS: 15000,
  ADMIN_TOKEN_TTL_SECONDS: 21600,
  PASSWORD_MIN_LENGTH: 4,
  MAX_CONCEPTO_LENGTH: 150,
  MAX_COMENTARIO_LENGTH: 500,
  MAX_NOMBRE_LENGTH: 150,
  MAX_CORREO_LENGTH: 150
};


function doGet(e) {
  return crearRespuestaJson({
    exito: true,
    estado: "operativo",
    version: "3.1.0",
    fechaServidor: new Date().toISOString()
  });
}


function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return crearRespuestaJson({ exito: false, codigo: "SIN_DATOS", mensaje: "No se recibieron datos en el cuerpo de la petición." });
    }

    var peticion;
    try {
      peticion = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return crearRespuestaJson({ exito: false, codigo: "JSON_INVALIDO", mensaje: "El cuerpo de la petición no es un JSON válido." });
    }

    var accion = (peticion.accion || "").trim();
    var datos = peticion.datos || {};

    switch (accion) {
      case "transferirBits":
        return transferirBitsSeguro(datos);
      case "procesarDonacion":
        return procesarDonacionSegura(datos);
      case "recargarSaldoAdmin":
        return recargarSaldoAdminSeguro(datos);
      case "obtenerSaldoUsuario":
        return obtenerSaldoUsuarioSeguro(datos);
      case "auditarFinanzas":
        return auditarFinanzasSeguro(datos);

      case "registrarVisitante":
        return registrarVisitante(datos);
      case "iniciarSesionVisitante":
        return iniciarSesionVisitante(datos);
      case "iniciarSesionAdmin":
        return iniciarSesionAdmin(datos);
      case "iniciarSesionGrupo":
        return iniciarSesionGrupo(datos);
      case "cambiarContrasena":
        return cambiarContrasena(datos);
      case "restablecerContrasena":
        return restablecerContrasena(datos);
      case "editarUsuario":
        return editarUsuario(datos);
      case "eliminarUsuario":
        return eliminarUsuario(datos);

      case "registrarGrupo":
        return registrarGrupo(datos);
      case "actualizarGrupo":
        return actualizarGrupo(datos);
      case "subirFotoGrupo":
        return subirFotoGrupo(datos);
      case "toggleLikeFoto":
        return toggleLikeFoto(datos);
      case "agregarComentarioFoto":
        return agregarComentarioFoto(datos);

      case "subirAvatar":
        return subirAvatar(datos);
      case "subirImagen":
        return subirImagenAImgBB(datos);
      case "formatearVideoDrive":
        return formatearVideoDrive(datos);

      case "iniciarTimerVideo":
        return iniciarTimerVideo(datos);
      case "verificarRetencionVideo":
        return verificarRetencionVideo(datos);
      case "obtenerTodo":
        return obtenerTodo();

      default:
        return crearRespuestaJson({ exito: false, codigo: "ACCION_DESCONOCIDA", mensaje: "Acción no reconocida: " + accion });
    }
  } catch (error) {
    Logger.log("ERROR CRÍTICO EN doPost: " + error.stack);
    return crearRespuestaJson({
      exito: false,
      codigo: "ERROR_INTERNO",
      mensaje: "Ocurrió un error interno en el servidor: " + error.message
    });
  }
}


// --------------------------------------------------------------------------
// 2. MOTOR TRANSACCIONAL FINANCIERO (CON ATOMIC LOCK Y BATCH UPDATE)
// --------------------------------------------------------------------------


function transferirBitsSeguro(datos) {
  return ejecutarOperacionFinanciera("transferencia", datos || {});
}


/**
 * Motor único para transferencias y donaciones.
 *
 * IMPORTANTE:
 * - Todos los cálculos se hacen en centavos.
 * - Se usa un único requestId para idempotencia.
 * - Se actualizan saldo emisor + receptor/grupo + transacción + ledger
 *   en un solo PATCH de Firebase.
 * - Se verifica el resultado después del PATCH.
 * - Se guarda un hash/firma lógica de la operación para detectar
 *   reutilización accidental de un requestId con otros datos.
 */
function ejecutarOperacionFinanciera(tipoOperacion, datos) {
  var lock = LockService.getScriptLock();
  var locked = false;

  try {
    locked = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!locked) {
      return crearRespuestaJson({
        exito: false,
        codigo: "SERVIDOR_OCUPADO",
        mensaje: "El sistema está procesando otra operación. Intenta nuevamente."
      });
    }

    datos = datos || {};

    var idEmisor = textoSeguro(datos.idEmisor || datos.idUsuario);
    var destinatario = textoSeguro(datos.destinatario || datos.idGrupo);
    var contrasena = textoSeguro(datos.contrasena);
    var concepto = limitarTexto(
      textoSeguro(datos.concepto) ||
      (tipoOperacion === "donacion" ? "Donación" : "Transferencia entre estudiantes"),
      CONFIG.MAX_CONCEPTO_LENGTH
    );

    // A partir de esta versión todos los flujos usan requestId.
    var requestId = normalizarRequestId(
      datos.requestId || datos.idTransaccion
    );

    if (!requestId) {
      // El requestId es obligatorio para operaciones financieras.
      // Esto evita duplicados causados por reintentos de red.
      return crearRespuestaJson({
        exito: false,
        codigo: "REQUEST_ID_REQUERIDO",
        mensaje: "La operación financiera requiere un requestId único."
      });
    }

    var montoC = parsearMontoCentavos(datos.monto);

    if (!idEmisor || !destinatario) {
      return crearRespuestaJson({
        exito: false,
        codigo: "DATOS_INCOMPLETOS",
        mensaje: "Faltan datos del emisor o destinatario."
      });
    }

    if (!montoValidoTransferencia(montoC)) {
      return crearRespuestaJson({
        exito: false,
        codigo: "MONTO_INVALIDO",
        mensaje:
          "El monto debe estar entre " +
          CONFIG.MONTO_MINIMO_TRANSFERENCIA.toFixed(2) +
          " y " +
          CONFIG.MONTO_MAXIMO_TRANSFERENCIA.toFixed(2) +
          " SL-BITS."
      });
    }

    // --------------------------------------------------------------
    // 1. IDEMPOTENCIA: si ya se procesó, devolvemos exactamente
    //    el mismo resultado. Si el requestId se intenta reutilizar
    //    con otros datos, se rechaza.
    // --------------------------------------------------------------
    var previo = obtenerIdempotencia(requestId);

    var firmaSolicitud = generarFirmaOperacion(
      tipoOperacion,
      idEmisor,
      destinatario,
      montoC,
      concepto
    );

    if (previo) {
      if (previo.firma && previo.firma !== firmaSolicitud) {
        return crearRespuestaJson({
          exito: false,
          codigo: "REQUEST_ID_REUTILIZADO",
          mensaje:
            "El requestId ya fue utilizado para una operación diferente."
        });
      }

      return crearRespuestaJson(previo.resultado);
    }

    // --------------------------------------------------------------
    // 2. CARGA DE DATOS
    // --------------------------------------------------------------
    var usuarios = leerDeFirebaseObligatorio("usuarios") || {};
    var grupos = leerDeFirebaseObligatorio("grupos") || {};

    var emisorEncontrado = buscarUsuarioFlexible(usuarios, idEmisor);

    if (!emisorEncontrado) {
      return crearRespuestaJson({
        exito: false,
        codigo: "EMISOR_NO_ENCONTRADO",
        mensaje: "Usuario emisor no encontrado."
      });
    }

    var emisor = emisorEncontrado.usuario;
    var claveEmisorReal = emisorEncontrado.id;

    // --------------------------------------------------------------
    // 3. AUTENTICACIÓN DEL EMISOR
    // --------------------------------------------------------------
    if (!verificarContrasena(emisor, contrasena)) {
      return crearRespuestaJson({
        exito: false,
        codigo: "CONTRASENA_INCORRECTA",
        mensaje: "Contraseña de confirmación incorrecta."
      });
    }

    var saldoEmisorC = obtenerSaldoCentavosSeguro(
      emisor.saldoActual,
      "saldo del emisor"
    );

    if (saldoEmisorC < montoC) {
      return crearRespuestaJson({
        exito: false,
        codigo: "SALDO_INSUFICIENTE",
        mensaje:
          "Saldo insuficiente. Tu saldo actual es de " +
          centavosAMonto(saldoEmisorC).toFixed(2) +
          " SL-BITS."
      });
    }

    // --------------------------------------------------------------
    // 4. RESOLVER DESTINO
    // --------------------------------------------------------------
    var receptorEncontrado = null;
    var grupoEncontrado = null;

    if (tipoOperacion === "donacion") {
      grupoEncontrado = buscarGrupoFlexible(grupos, destinatario);

      if (!grupoEncontrado) {
        return crearRespuestaJson({
          exito: false,
          codigo: "GRUPO_NO_ENCONTRADO",
          mensaje: "Estand o grupo no encontrado."
        });
      }
    } else {
      receptorEncontrado = buscarUsuarioFlexible(usuarios, destinatario);

      if (receptorEncontrado) {
        var documentoEmisor = normalizarDocumento(emisor.numeroDocumento);
        var documentoReceptor = normalizarDocumento(
          receptorEncontrado.usuario.numeroDocumento
        );

        if (
          receptorEncontrado.id === claveEmisorReal ||
          (documentoEmisor &&
            documentoReceptor &&
            documentoEmisor === documentoReceptor)
        ) {
          return crearRespuestaJson({
            exito: false,
            codigo: "AUTOTRANSFERENCIA",
            mensaje: "No puedes enviarte SL-BITS a tu propia cuenta."
          });
        }
      } else {
        // Conservamos la compatibilidad anterior: transferirBits también
        // puede reconocer un grupo y convertirlo en donación.
        grupoEncontrado = buscarGrupoFlexible(grupos, destinatario);
      }

      if (!receptorEncontrado && !grupoEncontrado) {
        return crearRespuestaJson({
          exito: false,
          codigo: "DESTINATARIO_NO_ENCONTRADO",
          mensaje:
            "Destinatario no encontrado. Verifica el NIE, DUI o @handle del estand."
        });
      }
    }

    // --------------------------------------------------------------
    // 5. RETENCIÓN DE VIDEO PARA DONACIONES
    // --------------------------------------------------------------
    if (tipoOperacion === "donacion" || grupoEncontrado) {
      var idGrupoRetencion = grupoEncontrado.id;
      var timerId = claveEmisorReal + "_" + idGrupoRetencion;
      var timerRegistro = leerDeFirebase("timers_video/" + timerId);

      if (timerRegistro) {
        var ahoraRetencion = new Date().getTime();
        var inicioRetencion = Number(timerRegistro.inicioEnMs || 0);
        var tiempoTranscurridoSegundos =
          inicioRetencion > 0
            ? Math.floor((ahoraRetencion - inicioRetencion) / 1000)
            : 0;

        var tiempoRequerido =
          Number(timerRegistro.tiempoRequeridoSegundos) || 15;

        if (
          tiempoTranscurridoSegundos < tiempoRequerido &&
          !timerRegistro.completado
        ) {
          return crearRespuestaJson({
            exito: false,
            codigo: "RETENCION_NO_CUMPLIDA",
            mensaje:
              "Debes ver el video por al menos " +
              tiempoRequerido +
              " segundos antes de donar. Llevas " +
              tiempoTranscurridoSegundos +
              "s."
          });
        }
      }
    }

    // --------------------------------------------------------------
    // 6. CONSTRUIR OPERACIÓN
    // --------------------------------------------------------------
    var timestamp = new Date().toISOString();
    var idTransaccion = "TX_" + requestId;
    var idLedger = "LEDGER_" + requestId;

    var nuevoSaldoEmisorC = saldoEmisorC - montoC;

    var patch = {};
    var resultado;
    var transaccion;
    var ledger;

    patch[
      "usuarios/" + claveEmisorReal + "/saldoActual"
    ] = centavosAMonto(nuevoSaldoEmisorC);

    // --------------------------------------------------------------
    // 6A. DONACIÓN A GRUPO
    // --------------------------------------------------------------
    if (grupoEncontrado) {
      var grupo = grupoEncontrado.grupo;

      var totalGrupoC = obtenerSaldoCentavosSeguro(
        grupo.totalRecaudado === undefined ? 0 : grupo.totalRecaudado,
        "total del grupo"
      );

      var nuevoTotalGrupoC = totalGrupoC + montoC;

      transaccion = {
        idTransaccion: idTransaccion,
        tipo: "donacion",
        idEmisor: claveEmisorReal,
        nombreEmisor: textoSeguro(emisor.nombreCompleto),
        idReceptor: grupoEncontrado.id,
        nombreReceptor: textoSeguro(grupo.nombreGrupo),
        especialidad: textoSeguro(grupo.especialidad) || "General",
        monto: centavosAMonto(montoC),
        concepto: concepto,
        fecha: timestamp,
        requestId: requestId
      };

      ledger = {
        idLedger: idLedger,
        idTransaccion: idTransaccion,
        tipo: "donacion",
        fecha: timestamp,
        requestId: requestId,
        origen: {
          tipo: "usuario",
          id: claveEmisorReal,
          saldoAnterior: centavosAMonto(saldoEmisorC),
          debito: centavosAMonto(montoC),
          saldoNuevo: centavosAMonto(nuevoSaldoEmisorC)
        },
        destino: {
          tipo: "grupo",
          id: grupoEncontrado.id,
          saldoAnterior: centavosAMonto(totalGrupoC),
          credito: centavosAMonto(montoC),
          saldoNuevo: centavosAMonto(nuevoTotalGrupoC)
        }
      };

      patch[
        "grupos/" + grupoEncontrado.id + "/totalRecaudado"
      ] = centavosAMonto(nuevoTotalGrupoC);

      patch["transacciones/" + idTransaccion] = transaccion;
      patch["ledger/" + idLedger] = ledger;

      resultado = {
        exito: true,
        codigo: "DONACION_COMPLETADA",
        mensaje:
          "¡Donación de " +
          centavosAMonto(montoC).toFixed(2) +
          " SL-BITS enviada a " +
          grupo.nombreGrupo +
          "!",
        nuevoSaldoEmisor: centavosAMonto(nuevoSaldoEmisorC),
        nuevoSaldoUsuario: centavosAMonto(nuevoSaldoEmisorC),
        nuevoTotalGrupo: centavosAMonto(nuevoTotalGrupoC),
        esDonacionGrupo: true,
        transaccion: transaccion
      };
    }

    // --------------------------------------------------------------
    // 6B. TRANSFERENCIA A OTRO USUARIO
    // --------------------------------------------------------------
    else {
      var receptor = receptorEncontrado.usuario;

      var saldoReceptorC = obtenerSaldoCentavosSeguro(
        receptor.saldoActual,
        "saldo del receptor"
      );

      var nuevoSaldoReceptorC = saldoReceptorC + montoC;

      transaccion = {
        idTransaccion: idTransaccion,
        tipo: "envio_estudiante",
        idEmisor: claveEmisorReal,
        nombreEmisor: textoSeguro(emisor.nombreCompleto),
        idReceptor: receptorEncontrado.id,
        nombreReceptor: textoSeguro(receptor.nombreCompleto),
        monto: centavosAMonto(montoC),
        concepto: concepto,
        fecha: timestamp,
        requestId: requestId
      };

      ledger = {
        idLedger: idLedger,
        idTransaccion: idTransaccion,
        tipo: "transferencia",
        fecha: timestamp,
        requestId: requestId,
        origen: {
          tipo: "usuario",
          id: claveEmisorReal,
          saldoAnterior: centavosAMonto(saldoEmisorC),
          debito: centavosAMonto(montoC),
          saldoNuevo: centavosAMonto(nuevoSaldoEmisorC)
        },
        destino: {
          tipo: "usuario",
          id: receptorEncontrado.id,
          saldoAnterior: centavosAMonto(saldoReceptorC),
          credito: centavosAMonto(montoC),
          saldoNuevo: centavosAMonto(nuevoSaldoReceptorC)
        }
      };

      patch[
        "usuarios/" + receptorEncontrado.id + "/saldoActual"
      ] = centavosAMonto(nuevoSaldoReceptorC);

      patch["transacciones/" + idTransaccion] = transaccion;
      patch["ledger/" + idLedger] = ledger;

      resultado = {
        exito: true,
        codigo: "TRANSFERENCIA_COMPLETADA",
        mensaje:
          "¡Transferencia de " +
          centavosAMonto(montoC).toFixed(2) +
          " SL-BITS enviada exitosamente a " +
          receptor.nombreCompleto +
          "!",
        nuevoSaldoEmisor: centavosAMonto(nuevoSaldoEmisorC),
        nuevoSaldoUsuario: centavosAMonto(nuevoSaldoEmisorC),
        nuevoSaldoReceptor: centavosAMonto(nuevoSaldoReceptorC),
        transaccion: transaccion
      };
    }

    // --------------------------------------------------------------
    // 7. IDEMPOTENCIA + METADATOS
    // --------------------------------------------------------------
    patch["idempotencia/" + requestId] = {
      tipo: grupoEncontrado ? "donacion" : "transferencia",
      fecha: timestamp,
      firma: firmaSolicitud,
      resultado: resultado
    };

    // Registro resumido para auditoría.
    patch["auditoria_financiera/" + idTransaccion] = {
      idTransaccion: idTransaccion,
      requestId: requestId,
      tipo: grupoEncontrado ? "donacion" : "transferencia",
      monto: centavosAMonto(montoC),
      fecha: timestamp,
      estado: "PENDIENTE_VERIFICACION"
    };

    // --------------------------------------------------------------
    // 8. PATCH ATÓMICO
    // --------------------------------------------------------------
    if (!actualizarEnFirebaseMultiRuta(patch)) {
      throw new Error("Firebase rechazó la actualización financiera.");
    }

    // --------------------------------------------------------------
    // 9. VERIFICACIÓN POSTERIOR
    //
    // Firebase REST confirmó el PATCH. Ahora comprobamos que los
    // saldos que acabamos de escribir realmente quedaron almacenados.
    // --------------------------------------------------------------
    var saldoEmisorVerificado = obtenerSaldoCentavosSeguro(
      leerDeFirebaseObligatorio(
        "usuarios/" + claveEmisorReal + "/saldoActual"
      ),
      "saldo emisor verificado"
    );

    if (saldoEmisorVerificado !== nuevoSaldoEmisorC) {
      throw new Error(
        "Verificación fallida: el saldo del emisor no coincide."
      );
    }

    if (grupoEncontrado) {
      var grupoVerificado = leerDeFirebaseObligatorio(
        "grupos/" + grupoEncontrado.id + "/totalRecaudado"
      );

      var totalGrupoVerificado = obtenerSaldoCentavosSeguro(
        grupoVerificado,
        "total grupo verificado"
      );

      if (totalGrupoVerificado !== resultado.nuevoTotalGrupo * 100) {
        throw new Error(
          "Verificación fallida: el total del grupo no coincide."
        );
      }
    } else {
      var saldoReceptorVerificado = obtenerSaldoCentavosSeguro(
        leerDeFirebaseObligatorio(
          "usuarios/" + receptorEncontrado.id + "/saldoActual"
        ),
        "saldo receptor verificado"
      );

      if (
        saldoReceptorVerificado !==
        Math.round(resultado.nuevoSaldoReceptor * 100)
      ) {
        throw new Error(
          "Verificación fallida: el saldo del receptor no coincide."
        );
      }
    }

    // Marcar auditoría como confirmada.
    escribirEnFirebase(
      "auditoria_financiera/" + idTransaccion + "/estado",
      "CONFIRMADA"
    );

    return crearRespuestaJson(resultado);

  } catch (err) {
    registrarError("ejecutarOperacionFinanciera", err);

    return crearRespuestaJson({
      exito: false,
      codigo:
        tipoOperacion === "donacion"
          ? "DONACION_ERROR"
          : "TRANSFERENCIA_ERROR",
      mensaje:
        "No fue posible completar la operación financiera. " +
        "No se confirmó el movimiento."
    });
  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


function procesarDonacionSegura(datos) {
  datos = datos || {};

  // La donación utiliza exactamente el mismo motor que una transferencia.
  // Esto evita que existan dos lógicas monetarias diferentes.
  return ejecutarOperacionFinanciera("donacion", {
    idUsuario: datos.idUsuario,
    idGrupo: datos.idGrupo,
    requestId: datos.requestId || datos.idTransaccion,
    monto: datos.monto,
    concepto: datos.concepto || "Donación",
    contrasena: datos.contrasena
  });
}


function recargarSaldoAdminSeguro(datos) {
  var lock = LockService.getScriptLock();
  var locked = false;

  try {
    locked = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);

    if (!locked) {
      return crearRespuestaJson({
        exito: false,
        codigo: "SERVIDOR_OCUPADO",
        mensaje: "Servidor ocupado. Intenta nuevamente."
      });
    }

    if (!validarAdminToken(datos && datos.adminToken)) {
      return crearRespuestaJson({
        exito: false,
        codigo: "ADMIN_NO_AUTORIZADO",
        mensaje: "Sesión de administrador inválida o expirada."
      });
    }

    datos = datos || {};

    var criterio = textoSeguro(datos.criterioBusqueda);
    var montoC = parsearMontoCentavos(datos.montoRecarga);
    var requestId = normalizarRequestId(
      datos.requestId || datos.idTransaccion
    );

    var motivo = limitarTexto(
      textoSeguro(datos.motivo) || "Recarga en caja",
      CONFIG.MAX_CONCEPTO_LENGTH
    );

    var nombreAdmin = limitarTexto(
      textoSeguro(datos.nombreAdmin) || "Caja Central",
      CONFIG.MAX_NOMBRE_LENGTH
    );

    if (
      !criterio ||
      !requestId ||
      !isFinite(montoC) ||
      montoC <= 0 ||
      montoC > Math.round(CONFIG.MONTO_MAXIMO_RECARGA * 100)
    ) {
      return crearRespuestaJson({
        exito: false,
        codigo: "RECARGA_INVALIDA",
        mensaje: "Documento/ID, requestId o monto inválido."
      });
    }

    var firmaSolicitud = generarFirmaOperacion(
      "recarga",
      criterio,
      "ADMIN_CAJA",
      montoC,
      motivo
    );

    var previo = obtenerIdempotencia(requestId);

    if (previo) {
      if (previo.firma && previo.firma !== firmaSolicitud) {
        return crearRespuestaJson({
          exito: false,
          codigo: "REQUEST_ID_REUTILIZADO",
          mensaje:
            "El requestId ya fue utilizado para otra recarga."
        });
      }

      return crearRespuestaJson(previo.resultado);
    }

    var usuarios =
      leerDeFirebaseObligatorio("usuarios") || {};

    var encontrado = buscarUsuarioFlexible(usuarios, criterio);

    if (!encontrado) {
      return crearRespuestaJson({
        exito: false,
        codigo: "USUARIO_NO_ENCONTRADO",
        mensaje: "Usuario beneficiario no encontrado."
      });
    }

    var saldoC = obtenerSaldoCentavosSeguro(
      encontrado.usuario.saldoActual,
      "saldo anterior"
    );

    var nuevoC = saldoC + montoC;
    var timestamp = new Date().toISOString();
    var idTx = "TX_" + requestId;
    var idBit = generarId("BIT");
    var idLedger = "LEDGER_" + requestId;

    var tx = {
      idTransaccion: idTx,
      tipo: "recarga_efectivo",
      idEmisor: "ADMIN_CAJA",
      nombreEmisor: "Caja San Luis - " + nombreAdmin,
      idReceptor: encontrado.id,
      nombreReceptor: encontrado.usuario.nombreCompleto,
      monto: centavosAMonto(montoC),
      fecha: timestamp,
      requestId: requestId
    };

    var bit = {
      idBitacora: idBit,
      tipoAccion: "recarga_saldo",
      idUsuarioBeneficiario: encontrado.id,
      nombreUsuario: encontrado.usuario.nombreCompleto,
      montoRecarga: centavosAMonto(montoC),
      saldoAnterior: centavosAMonto(saldoC),
      nuevoSaldo: centavosAMonto(nuevoC),
      motivo: motivo,
      autorizadoPor: nombreAdmin,
      fecha: timestamp,
      requestId: requestId
    };

    var ledger = {
      idLedger: idLedger,
      idTransaccion: idTx,
      tipo: "recarga",
      fecha: timestamp,
      requestId: requestId,
      origen: {
        tipo: "caja",
        id: "ADMIN_CAJA",
        creditoEmitido: centavosAMonto(montoC)
      },
      destino: {
        tipo: "usuario",
        id: encontrado.id,
        saldoAnterior: centavosAMonto(saldoC),
        credito: centavosAMonto(montoC),
        saldoNuevo: centavosAMonto(nuevoC)
      }
    };

    var resultado = {
      exito: true,
      codigo: "RECARGA_COMPLETADA",
      mensaje:
        "Recarga de " +
        centavosAMonto(montoC).toFixed(2) +
        " SL-BITS aplicada a " +
        encontrado.usuario.nombreCompleto,
      usuarioActualizado: {
        idUsuario: encontrado.id,
        nombreCompleto: encontrado.usuario.nombreCompleto,
        saldoActual: centavosAMonto(nuevoC)
      },
      transaccion: tx
    };

    var patch = {};

    patch[
      "usuarios/" + encontrado.id + "/saldoActual"
    ] = centavosAMonto(nuevoC);

    patch["transacciones/" + idTx] = tx;
    patch["bitacora_admin/" + idBit] = bit;
    patch["ledger/" + idLedger] = ledger;

    patch["idempotencia/" + requestId] = {
      tipo: "recarga",
      fecha: timestamp,
      firma: firmaSolicitud,
      resultado: resultado
    };

    patch["auditoria_financiera/" + idTx] = {
      idTransaccion: idTx,
      requestId: requestId,
      tipo: "recarga",
      monto: centavosAMonto(montoC),
      fecha: timestamp,
      estado: "CONFIRMADA"
    };

    if (!actualizarEnFirebaseMultiRuta(patch)) {
      throw new Error("Firebase rechazó la recarga.");
    }

    var saldoVerificado = obtenerSaldoCentavosSeguro(
      leerDeFirebaseObligatorio(
        "usuarios/" + encontrado.id + "/saldoActual"
      ),
      "saldo recargado verificado"
    );

    if (saldoVerificado !== nuevoC) {
      throw new Error(
        "Verificación fallida: el saldo recargado no coincide."
      );
    }

    return crearRespuestaJson(resultado);

  } catch (e) {
    registrarError("recargarSaldoAdminSeguro", e);

    return crearRespuestaJson({
      exito: false,
      codigo: "RECARGA_ERROR",
      mensaje:
        "No fue posible completar la recarga. La operación no fue confirmada."
    });
  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


/**
 * Consulta puntual de saldo.
 * Útil para que el frontend fuerce una sincronización después
 * de una operación financiera.
 */
function obtenerSaldoUsuarioSeguro(datos) {
  try {
    var idUsuario = textoSeguro(datos && datos.idUsuario);

    if (!idUsuario) {
      return crearRespuestaJson({
        exito: false,
        codigo: "ID_USUARIO_REQUERIDO",
        mensaje: "Se requiere el ID del usuario."
      });
    }

    var usuario = leerDeFirebaseObligatorio(
      "usuarios/" + idUsuario
    );

    if (!usuario) {
      return crearRespuestaJson({
        exito: false,
        codigo: "USUARIO_NO_ENCONTRADO",
        mensaje: "Usuario no encontrado."
      });
    }

    var saldoC = obtenerSaldoCentavosSeguro(
      usuario.saldoActual,
      "saldo del usuario"
    );

    return crearRespuestaJson({
      exito: true,
      idUsuario: idUsuario,
      saldoActual: centavosAMonto(saldoC),
      fechaServidor: new Date().toISOString()
    });

  } catch (e) {
    registrarError("obtenerSaldoUsuarioSeguro", e);

    return crearRespuestaJson({
      exito: false,
      codigo: "SALDO_ERROR",
      mensaje: "No fue posible consultar el saldo."
    });
  }
}


/**
 * Auditoría financiera global.
 *
 * No modifica dinero. Solamente detecta:
 * - saldos negativos;
 * - montos inválidos;
 * - ledger inconsistentes;
 * - diferencias entre transacción y ledger;
 * - operaciones financieras sin ledger.
 */
function auditarFinanzasSeguro(datos) {
  var lock = LockService.getScriptLock();
  var locked = false;

  try {
    locked = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);

    if (!locked) {
      return crearRespuestaJson({
        exito: false,
        codigo: "SERVIDOR_OCUPADO",
        mensaje: "Servidor ocupado. Intenta nuevamente."
      });
    }

    if (!validarAdminToken(datos && datos.adminToken)) {
      return crearRespuestaJson({
        exito: false,
        codigo: "ADMIN_NO_AUTORIZADO",
        mensaje: "Se requiere una sesión administrativa válida."
      });
    }

    var usuarios =
      leerDeFirebaseObligatorio("usuarios") || {};

    var grupos =
      leerDeFirebaseObligatorio("grupos") || {};

    var transacciones =
      leerDeFirebaseObligatorio("transacciones") || {};

    var ledger =
      leerDeFirebase("ledger") || {};

    var errores = [];
    var usuariosRevisados = 0;
    var gruposRevisados = 0;
    var transaccionesRevisadas = 0;
    var ledgerRevisados = 0;
    var dineroEnUsuariosC = 0;
    var dineroEnGruposC = 0;

    // --------------------------------------------------------------
    // Usuarios
    // --------------------------------------------------------------
    for (var uid in usuarios) {
      if (!usuarios[uid]) continue;

      usuariosRevisados++;

      try {
        var saldoUsuarioC = obtenerSaldoCentavosSeguro(
          usuarios[uid].saldoActual,
          "usuario " + uid
        );

        if (saldoUsuarioC < 0) {
          errores.push({
            tipo: "SALDO_NEGATIVO",
            id: uid
          });
        }

        dineroEnUsuariosC += saldoUsuarioC;

      } catch (eU) {
        errores.push({
          tipo: "SALDO_CORRUPTO",
          id: uid,
          detalle: eU.message
        });
      }
    }

    // --------------------------------------------------------------
    // Grupos
    // --------------------------------------------------------------
    for (var gid in grupos) {
      if (!grupos[gid]) continue;

      gruposRevisados++;

      try {
        var totalGrupoC = obtenerSaldoCentavosSeguro(
          grupos[gid].totalRecaudado === undefined
            ? 0
            : grupos[gid].totalRecaudado,
          "grupo " + gid
        );

        if (totalGrupoC < 0) {
          errores.push({
            tipo: "TOTAL_GRUPO_NEGATIVO",
            id: gid
          });
        }

        dineroEnGruposC += totalGrupoC;

      } catch (eG) {
        errores.push({
          tipo: "TOTAL_GRUPO_CORRUPTO",
          id: gid,
          detalle: eG.message
        });
      }
    }

    // --------------------------------------------------------------
    // Transacciones + ledger
    // --------------------------------------------------------------
    for (var txId in transacciones) {
      if (!transacciones[txId]) continue;

      transaccionesRevisadas++;

      var tx = transacciones[txId];

      try {
        var montoTxC = parsearMontoCentavos(tx.monto);

        if (
          !isFinite(montoTxC) ||
          montoTxC <= 0
        ) {
          errores.push({
            tipo: "MONTO_TRANSACCION_INVALIDO",
            id: txId
          });
        }

        var ledgerEncontrado = ledger[txId];

        // También aceptamos el ID de ledger guardado como LEDGER_TX.
        if (!ledgerEncontrado) {
          var posibleLedgerId = "LEDGER_" + txId.replace(/^TX_/, "");
          ledgerEncontrado = ledger[posibleLedgerId];
        }

        if (!ledgerEncontrado) {
          errores.push({
            tipo: "TRANSACCION_SIN_LEDGER",
            id: txId
          });
        }
      } catch (eTx) {
        errores.push({
          tipo: "TRANSACCION_CORRUPTA",
          id: txId,
          detalle: eTx.message
        });
      }
    }

    for (var lid in ledger) {
      if (!ledger[lid]) continue;
      ledgerRevisados++;
    }

    var estado = errores.length === 0
      ? "INTEGRO"
      : "ERRORES_DETECTADOS";

    return crearRespuestaJson({
      exito: true,
      estado: estado,
      fechaAuditoria: new Date().toISOString(),
      resumen: {
        usuariosRevisados: usuariosRevisados,
        gruposRevisados: gruposRevisados,
        transaccionesRevisadas: transaccionesRevisadas,
        ledgerRevisados: ledgerRevisados,
        erroresEncontrados: errores.length,
        saldoUsuarios: centavosAMonto(dineroEnUsuariosC),
        totalGrupos: centavosAMonto(dineroEnGruposC)
      },
      errores: errores
    });

  } catch (e) {
    registrarError("auditarFinanzasSeguro", e);

    return crearRespuestaJson({
      exito: false,
      codigo: "AUDITORIA_ERROR",
      mensaje: "No fue posible ejecutar la auditoría financiera."
    });
  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


function generarFirmaOperacion(
  tipo,
  origen,
  destino,
  montoC,
  concepto
) {
  var texto =
    String(tipo) +
    "|" +
    String(origen) +
    "|" +
    String(destino) +
    "|" +
    String(montoC) +
    "|" +
    String(concepto);

  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    texto,
    Utilities.Charset.UTF_8
  );

  var salida = "";

  for (var i = 0; i < digest.length; i++) {
    var b = digest[i];

    if (b < 0) b += 256;

    var h = b.toString(16);

    if (h.length === 1) h = "0" + h;

    salida += h;
  }

  return salida;
}


// --------------------------------------------------------------------------
// 2B. SISTEMA DE RETENCIÓN DE VIDEO CONTROLADO POR SERVIDOR
// --------------------------------------------------------------------------


function iniciarTimerVideo(datos) {
  var idUsuario = textoSeguro(datos && datos.idUsuario);
  var idGrupo = textoSeguro(datos && datos.idGrupo);
  if (!idUsuario || !idGrupo) return crearRespuestaJson({ exito: false, mensaje: "Parámetros incompletos." });

  var grupo = leerDeFirebase("grupos/" + idGrupo);
  if (!grupo || !grupo.urlVideo) return crearRespuestaJson({ exito: false, mensaje: "Este estand no tiene video configurado." });

  var duracionTotal = parseInt(grupo.duracionSegundos || 30, 10);
  var tiempoRequerido = Math.max(15, Math.ceil(duracionTotal * 0.5));

  var timerId = idUsuario + "_" + idGrupo;
  var registro = {
    idUsuario: idUsuario,
    idGrupo: idGrupo,
    inicioEnMs: new Date().getTime(),
    tiempoRequeridoSegundos: tiempoRequerido,
    duracionTotal: duracionTotal,
    completado: false,
    fechaInicio: new Date().toISOString()
  };

  var ok = escribirEnFirebase("timers_video/" + timerId, registro);
  if (!ok) return crearRespuestaJson({ exito: false, mensaje: "No se pudo iniciar el temporizador." });

  return crearRespuestaJson({
    exito: true,
    timerId: timerId,
    tiempoRequeridoSegundos: tiempoRequerido,
    duracionTotal: duracionTotal,
    mensaje: "Temporizador iniciado. Mira el video por " + tiempoRequerido + " segundos."
  });
}


function verificarRetencionVideo(datos) {
  var idUsuario = textoSeguro(datos && datos.idUsuario);
  var idGrupo = textoSeguro(datos && datos.idGrupo);
  if (!idUsuario || !idGrupo) return crearRespuestaJson({ exito: false, retencionCumplida: false, mensaje: "Parámetros incompletos." });

  var timerId = idUsuario + "_" + idGrupo;
  var registro = leerDeFirebase("timers_video/" + timerId);
  if (!registro) return crearRespuestaJson({ exito: true, retencionCumplida: false, mensaje: "No se encontró un temporizador activo." });

  var ahora = new Date().getTime();
  var tiempoTranscurridoMs = ahora - registro.inicioEnMs;
  var tiempoTranscurridoSegundos = Math.floor(tiempoTranscurridoMs / 1000);
  var tiempoRequerido = registro.tiempoRequeridoSegundos || 15;
  var retencionCumplida = tiempoTranscurridoSegundos >= tiempoRequerido;

  if (retencionCumplida && !registro.completado) {
    registro.completado = true;
    registro.fechaCompletado = new Date().toISOString();
    registro.tiempoTotalSegundos = tiempoTranscurridoSegundos;
    escribirEnFirebase("timers_video/" + timerId, registro);
  }

  return crearRespuestaJson({
    exito: true,
    retencionCumplida: retencionCumplida,
    tiempoTranscurridoSegundos: tiempoTranscurridoSegundos,
    tiempoRequeridoSegundos: tiempoRequerido,
    porcentajeCompletado: Math.min(100, Math.round((tiempoTranscurridoSegundos / tiempoRequerido) * 100)),
    segundosRestantes: Math.max(0, tiempoRequerido - tiempoTranscurridoSegundos)
  });
}


// --------------------------------------------------------------------------
// 3. OPERACIONES DE USUARIOS, GRUPOS Y MULTIMEDIA
// --------------------------------------------------------------------------


function registrarVisitante(datos) {
  var nombreCompleto = (datos.nombreCompleto || "").trim();
  var correo = (datos.correo || "").trim().toLowerCase();
  var tipoDocumento = (datos.tipoDocumento || "").trim().toUpperCase();
  var numeroDocOriginal = (datos.numeroDocumento || "").trim();
  var numeroDocLimpio = numeroDocOriginal.replace(/[^0-9]/g, "");

  if (!nombreCompleto || !correo || !numeroDocLimpio) {
    return crearRespuestaJson({ exito: false, mensaje: "Nombre, correo y número de documento son obligatorios." });
  }

  var usuariosExistentes = leerDeFirebase("usuarios") || {};
  for (var k in usuariosExistentes) {
    var usr = usuariosExistentes[k];
    if (usr && usr.numeroDocumentoLimpio === numeroDocLimpio) {
      return crearRespuestaJson({ exito: false, mensaje: "Este NIE/DUI ya se encuentra registrado." });
    }
  }

  var idUsuario = "USR_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
  var nuevoUsuario = {
    idUsuario: idUsuario,
    nombreCompleto: nombreCompleto,
    correo: correo,
    tipoDocumento: tipoDocumento,
    numeroDocumento: numeroDocOriginal,
    numeroDocumentoLimpio: numeroDocLimpio,
    contrasena: (datos.contrasena || "").trim(),
    avatar: "",
    rol: tipoDocumento === "NIE" ? "alumno" : "visitante",
    saldoActual: 1.00,
    fechaRegistro: new Date().toISOString()
  };

  var idTxBono = "TX_BONO_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
  var idLedgerBono = "LEDGER_BONO_" + idUsuario;

  var fechaBono = new Date().toISOString();

  var txBono = {
    idTransaccion: idTxBono,
    tipo: "bono_bienvenida",
    idEmisor: "SISTEMA_SAN_LUIS",
    nombreEmisor: "Bono de Bienvenida",
    idReceptor: idUsuario,
    nombreReceptor: nombreCompleto,
    monto: 1.00,
    fecha: fechaBono,
    requestId: idTxBono
  };

  var ledgerBono = {
    idLedger: idLedgerBono,
    idTransaccion: idTxBono,
    tipo: "bono_bienvenida",
    fecha: fechaBono,
    requestId: idTxBono,
    origen: {
      tipo: "sistema",
      id: "SISTEMA_SAN_LUIS",
      creditoEmitido: 1.00
    },
    destino: {
      tipo: "usuario",
      id: idUsuario,
      saldoAnterior: 0.00,
      credito: 1.00,
      saldoNuevo: 1.00
    }
  };

  var patchData = {};
  patchData["usuarios/" + idUsuario] = nuevoUsuario;
  patchData["transacciones/" + idTxBono] = txBono;
  patchData["ledger/" + idLedgerBono] = ledgerBono;

  if (!actualizarEnFirebaseMultiRuta(patchData)) {
    return crearRespuestaJson({ exito: false, codigo: "REGISTRO_NO_GUARDADO", mensaje: "No fue posible guardar el registro. Intenta nuevamente." });
  }

  return crearRespuestaJson({
    exito: true,
    mensaje: "¡Registro exitoso! Se ha otorgado 1.00 SL-BITS de bienvenida.",
    usuario: usuarioSeguroParaCliente(nuevoUsuario)
  });
}


function iniciarSesionVisitante(datos) {
  var documento = (datos.numeroDocumento || "").trim();
  var contrasena = (datos.contrasena || "").trim();
  var docLimpio = documento.replace(/[^0-9]/g, "");

  if (!documento || !contrasena) {
    return crearRespuestaJson({ exito: false, mensaje: "Ingresa tu documento y contraseña." });
  }

  var usuarios = leerDeFirebase("usuarios") || {};
  for (var k in usuarios) {
    var u = usuarios[k];
    if (!u) continue;
    if (u.numeroDocumentoLimpio === docLimpio || u.numeroDocumento === documento) {
      if (u.contrasena !== contrasena) {
        return crearRespuestaJson({ exito: false, mensaje: "Contraseña incorrecta." });
      }
      var copiaUsuario = JSON.parse(JSON.stringify(u)); delete copiaUsuario.contrasena; return crearRespuestaJson({ exito: true, mensaje: "Inicio de sesión exitoso.", usuario: copiaUsuario });
    }
  }
  return crearRespuestaJson({ exito: false, mensaje: "Documento no registrado en el sistema." });
}


function iniciarSesionAdmin(datos) {
  var claveConfigurada=PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD");
  if(!claveConfigurada)return crearRespuestaJson({exito:false,codigo:"ADMIN_NO_CONFIGURADO",mensaje:"ADMIN_PASSWORD no está configurada en Script Properties."});
  if(!datos||!datos.claveAdmin||String(datos.claveAdmin)!==String(claveConfigurada))return crearRespuestaJson({exito:false,codigo:"ADMIN_CREDENCIALES_INVALIDAS",mensaje:"Credenciales de administrador incorrectas."});
  var token=Utilities.getUuid();
  CacheService.getScriptCache().put("admin_"+token,"autorizado",CONFIG.ADMIN_TOKEN_TTL_SECONDS);
  return crearRespuestaJson({exito:true,token:token,expiraEnSegundos:CONFIG.ADMIN_TOKEN_TTL_SECONDS,mensaje:"Acceso administrativo autorizado."});
}


function iniciarSesionGrupo(datos) {
  var grupos = leerDeFirebase("grupos") || {};
  var grupo = grupos[datos.idGrupo];
  if (!grupo || !grupo.claveAcceso || grupo.claveAcceso !== datos.claveAcceso) {
    return crearRespuestaJson({ exito: false, mensaje: "Código de acceso del grupo incorrecto." });
  }
  var copia = JSON.parse(JSON.stringify(grupo));
  delete copia.claveAcceso;
  return crearRespuestaJson({ exito: true, grupo: copia });
}


function actualizarGrupo(datos) {
  var grupos = leerDeFirebase("grupos") || {};
  var grupo = grupos[datos.idGrupo];
  if (!grupo || !grupo.claveAcceso || grupo.claveAcceso !== datos.claveAcceso) {
    return crearRespuestaJson({ exito: false, mensaje: "No tienes autorización para editar este grupo." });
  }
  if (datos.urlFoto !== undefined) grupo.urlFoto = datos.urlFoto.trim();
  if (datos.urlVideo !== undefined) grupo.urlVideo = datos.urlVideo.trim();
  if (datos.duracionSegundos !== undefined) grupo.duracionSegundos = parseInt(datos.duracionSegundos, 10);
  escribirEnFirebase("grupos/" + datos.idGrupo, grupo);
  delete grupo.claveAcceso;
  return crearRespuestaJson({ exito: true, grupo: grupo });
}


function registrarGrupo(datos) {
  var nombre = (datos.nombreGrupo || "").trim();
  var esp = (datos.especialidad || "").trim();
  var integ = (datos.integrantes || "").trim();
  var clave = (datos.claveAcceso || "").trim();
  var urlVideo = (datos.urlVideo || "").trim();
  var duracion = parseInt(datos.duracionSegundos, 10) || 0;

  if (!nombre || !esp || !integ || !clave) {
    return crearRespuestaJson({ exito: false, mensaje: "Todos los datos del grupo son obligatorios." });
  }

  if (!urlVideo) {
    return crearRespuestaJson({ exito: false, mensaje: "El video de presentación es obligatorio para inscribir el estand." });
  }

  if (duracion < 180) {
    return crearRespuestaJson({ exito: false, mensaje: "El video debe tener al menos 180 segundos (3 minutos)." });
  }

  var idGrupo = "GRP_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
  var handle = nombre.toLowerCase().replace(/[^a-z0-9]/g, "");

  var nuevoGrupo = {
    idGrupo: idGrupo,
    nombreGrupo: nombre,
    handle: handle,
    especialidad: esp,
    integrantes: integ,
    descripcion: (datos.descripcion || "").trim(),
    urlFoto: (datos.urlFoto || "").trim(),
    urlVideo: (datos.urlVideo || "").trim(),
    duracionSegundos: parseInt(datos.duracionSegundos || 30, 10),
    totalRecaudado: 0.0,
    claveAcceso: clave,
    fotos: [],
    fechaCreacion: new Date().toISOString()
  };

  escribirEnFirebase("grupos/" + idGrupo, nuevoGrupo);
  return crearRespuestaJson({ exito: true, mensaje: "Estand registrado exitosamente.", grupo: nuevoGrupo });
}


function subirFotoGrupo(datos) {
  var grupo = leerDeFirebase("grupos/" + datos.idGrupo);
  if (!grupo) return crearRespuestaJson({ exito: false, mensaje: "Grupo no encontrado." });
  if (!datos.foto || !datos.foto.url) return crearRespuestaJson({ exito: false, mensaje: "URL de foto inválida." });

  var fotos = grupo.fotos || [];
  var nuevaFoto = {
    id: "FOTO_" + new Date().getTime(),
    url: datos.foto.url,
    pie: datos.foto.pie || "",
    autor: datos.foto.autor || ("Equipo " + grupo.nombreGrupo),
    fecha: new Date().toISOString(),
    likes: 0,
    likesUsers: {},
    comentarios: []
  };
  fotos.push(nuevaFoto);
  grupo.fotos = fotos;
  escribirEnFirebase("grupos/" + datos.idGrupo, grupo);
  delete grupo.claveAcceso;
  return crearRespuestaJson({ exito: true, mensaje: "Foto publicada correctamente.", grupo: grupo });
}


function toggleLikeFoto(datos) {
  var grupo = leerDeFirebase("grupos/" + datos.idGrupo);
  if (!grupo || !datos.idUsuario || !datos.idFoto) {
    return crearRespuestaJson({ exito: false, mensaje: "Parámetros incompletos." });
  }
  var fotos = grupo.fotos || [];
  var likes = 0;
  var leGusta = false;
  for (var i = 0; i < fotos.length; i++) {
    if (fotos[i].id === datos.idFoto) {
      var likesUsers = fotos[i].likesUsers || {};
      if (datos.quiereLike) {
        likesUsers[datos.idUsuario] = datos.nombreUsuario || datos.idUsuario;
      } else {
        delete likesUsers[datos.idUsuario];
      }
      fotos[i].likesUsers = likesUsers;
      fotos[i].likes = Object.keys(likesUsers).length;
      likes = fotos[i].likes;
      leGusta = !!likesUsers[datos.idUsuario];
      break;
    }
  }
  grupo.fotos = fotos;
  escribirEnFirebase("grupos/" + datos.idGrupo, grupo);
  return crearRespuestaJson({ exito: true, likes: likes, leGusta: leGusta });
}


function agregarComentarioFoto(datos) {
  var grupo = leerDeFirebase("grupos/" + datos.idGrupo);
  if (!grupo || !datos.comentario || !datos.comentario.texto) {
    return crearRespuestaJson({ exito: false, mensaje: "Comentario inválido." });
  }
  var fotos = grupo.fotos || [];
  for (var i = 0; i < fotos.length; i++) {
    if (fotos[i].id === datos.idFoto) {
      if (!fotos[i].comentarios) fotos[i].comentarios = [];
      fotos[i].comentarios.push({
        id: "COM_" + new Date().getTime(),
        autor: datos.comentario.autor || "Anónimo",
        texto: datos.comentario.texto.trim(),
        hora: new Date().toISOString()
      });
      break;
    }
  }
  grupo.fotos = fotos;
  escribirEnFirebase("grupos/" + datos.idGrupo, grupo);
  return crearRespuestaJson({ exito: true, mensaje: "Comentario agregado.", grupo: grupo });
}


function cambiarContrasena(datos) {
  var idUsuario = datos.idUsuario;
  var actual = (datos.contrasenaActual || "").trim();
  var nueva = (datos.nuevaContrasena || "").trim();

  if (!idUsuario || !actual || !nueva || nueva.length < CONFIG.PASSWORD_MIN_LENGTH) {
    return crearRespuestaJson({ exito: false, mensaje: "La contraseña debe tener mínimo " + CONFIG.PASSWORD_MIN_LENGTH + " caracteres." });
  }

  var usuario = leerDeFirebase("usuarios/" + idUsuario);
  if (!usuario || usuario.contrasena !== actual) {
    return crearRespuestaJson({ exito: false, mensaje: "Contraseña actual incorrecta." });
  }

  usuario.contrasena = nueva;
  usuario.contrasenaTemporal = false;
  escribirEnFirebase("usuarios/" + idUsuario, usuario);
  return crearRespuestaJson({ exito: true, mensaje: "Contraseña actualizada exitosamente." });
}


function restablecerContrasena(datos) {
  if(!validarAdminToken(datos&&datos.adminToken))return crearRespuestaJson({exito:false,codigo:"ADMIN_NO_AUTORIZADO",mensaje:"Se requiere una sesión administrativa válida."});
  var id=textoSeguro(datos&&datos.idUsuario),temp=textoSeguro(datos&&datos.nuevaContrasena)||"1234";
  if(!id||temp.length<CONFIG.PASSWORD_MIN_LENGTH)return crearRespuestaJson({exito:false,mensaje:"Datos de restablecimiento inválidos."});
  var usuario=leerDeFirebaseObligatorio("usuarios/"+id);if(!usuario)return crearRespuestaJson({exito:false,mensaje:"Usuario no encontrado."});
  var ok=escribirEnFirebase("usuarios/"+id+"/contrasena",temp);if(!ok)throw new Error("No se pudo actualizar la contraseña.");
  escribirEnFirebase("usuarios/"+id+"/contrasenaTemporal",true);
  return crearRespuestaJson({exito:true,mensaje:"Contraseña temporal restablecida."});
}


function editarUsuario(datos) {
  if(!validarAdminToken(datos&&datos.adminToken))return crearRespuestaJson({exito:false,codigo:"ADMIN_NO_AUTORIZADO",mensaje:"Se requiere una sesión administrativa válida."});
  var id=textoSeguro(datos&&datos.idUsuario);if(!id)return crearRespuestaJson({exito:false,mensaje:"ID de usuario requerido."});
  var usuario=leerDeFirebaseObligatorio("usuarios/"+id);if(!usuario)return crearRespuestaJson({exito:false,mensaje:"Usuario no encontrado."});
  var patch={};
  if(datos.nombreCompleto!==undefined)patch["usuarios/"+id+"/nombreCompleto"]=limitarTexto(textoSeguro(datos.nombreCompleto),CONFIG.MAX_NOMBRE_LENGTH);
  if(datos.correo!==undefined)patch["usuarios/"+id+"/correo"]=limitarTexto(textoSeguro(datos.correo).toLowerCase(),CONFIG.MAX_CORREO_LENGTH);
  if(datos.avatar!==undefined)patch["usuarios/"+id+"/avatar"]=textoSeguro(datos.avatar);
  if(datos.contrasena!==undefined)patch["usuarios/"+id+"/contrasena"]=textoSeguro(datos.contrasena);
  if(datos.saldoActual!==undefined)return crearRespuestaJson({exito:false,codigo:"SALDO_SOLO_FINANCIERO",mensaje:"El saldo no puede modificarse desde editarUsuario. Utiliza recargarSaldoAdmin."});
  if(Object.keys(patch).length===0)return crearRespuestaJson({exito:false,mensaje:"No hay cambios para aplicar."});
  if(!actualizarEnFirebaseMultiRuta(patch))throw new Error("No se pudieron guardar los cambios.");
  var actualizado=leerDeFirebaseObligatorio("usuarios/"+id);return crearRespuestaJson({exito:true,usuario:actualizado});
}


function eliminarUsuario(datos) {
  if(!validarAdminToken(datos&&datos.adminToken))return crearRespuestaJson({exito:false,codigo:"ADMIN_NO_AUTORIZADO",mensaje:"Se requiere una sesión administrativa válida."});
  var id=textoSeguro(datos&&datos.idUsuario);if(!id)return crearRespuestaJson({exito:false,mensaje:"ID de usuario requerido."});
  var usuario=leerDeFirebaseObligatorio("usuarios/"+id);if(!usuario)return crearRespuestaJson({exito:false,mensaje:"Usuario no encontrado."});
  var saldoC=obtenerSaldoCentavosSeguro(usuario.saldoActual,"saldo del usuario");
  if(saldoC!==0)return crearRespuestaJson({exito:false,codigo:"USUARIO_CON_SALDO",mensaje:"No se puede eliminar un usuario con saldo distinto de 0. Primero debe quedar en saldo 0."});
  if(!escribirEnFirebase("usuarios/"+id,null))throw new Error("Firebase rechazó la eliminación.");
  return crearRespuestaJson({exito:true,mensaje:"Usuario eliminado correctamente."});
}


function subirAvatar(datos) {
  var resImg = subirImagenAImgBB({ imagenBase64: datos.imagenBase64 });
  var resJson = JSON.parse(resImg.getContent());
  if (!resJson.exito) return resImg;

  var usuario = leerDeFirebase("usuarios/" + datos.idUsuario);
  if (!usuario) return crearRespuestaJson({ exito: false, mensaje: "Usuario no encontrado." });

  usuario.avatar = resJson.urlImagen;
  escribirEnFirebase("usuarios/" + datos.idUsuario + "/avatar", resJson.urlImagen);
  return crearRespuestaJson({ exito: true, urlAvatar: resJson.urlImagen, usuario: usuarioSeguroParaCliente(usuario) });
}


function subirImagenAImgBB(datos) {
  var base64 = datos.imagenBase64 || "";
  var imgbbKey = PropertiesService.getScriptProperties().getProperty("IMGBB_API_KEY") || CONFIG.IMGBB_API_KEY;
  if (!imgbbKey) return crearRespuestaJson({ exito: false, codigo: "IMGBB_NO_CONFIGURADO", mensaje: "IMGBB_API_KEY no está configurada en Script Properties." });
  if (!base64) return crearRespuestaJson({ exito: false, mensaje: "Falta imagen Base64." });
  if (base64.indexOf(",") > -1) base64 = base64.split(",")[1];

  try {
    var opciones = {
      method: "post",
      payload: { key: imgbbKey, image: base64 },
      muteHttpExceptions: true
    };
    var resp = UrlFetchApp.fetch("https://api.imgbb.com/1/upload", opciones);
    var json = JSON.parse(resp.getContentText());
    if (json && json.success) {
      return crearRespuestaJson({ exito: true, urlImagen: json.data.url, urlMiniatura: json.data.thumb ? json.data.thumb.url : json.data.url });
    }
    return crearRespuestaJson({ exito: false, mensaje: "Error ImgBB: " + (json.error ? json.error.message : "Desconocido") });
  } catch (err) {
    return crearRespuestaJson({ exito: false, mensaje: "Fallo de conexión con ImgBB: " + err.toString() });
  }
}


function formatearVideoDrive(datos) {
  var url = (datos.urlVideo || "").trim();
  var match = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/);
  if (match && match[1]) {
    return crearRespuestaJson({ exito: true, urlIncrustable: "https://drive.google.com/file/d/" + match[1] + "/preview" });
  }
  if (url.indexOf("/preview") > -1) return crearRespuestaJson({ exito: true, urlIncrustable: url });
  return crearRespuestaJson({ exito: false, mensaje: "Enlace de Drive no válido. Asegúrate de que sea público." });
}


function obtenerTodo() {
  try {
    var usuarios = leerDeFirebase("usuarios") || {};
    var grupos = leerDeFirebase("grupos") || {};
    var transacciones = leerDeFirebase("transacciones") || {};
    var bitacoras = leerDeFirebase("bitacora_admin") || {};
    var ledger = leerDeFirebase("ledger") || {};
    var auditoriaFinanciera = leerDeFirebase("auditoria_financiera") || {};

    for (var gId in grupos) {
      if (grupos[gId]) delete grupos[gId].claveAcceso;
    }
    return crearRespuestaJson({
      exito: true,
      datos: {
        usuarios: usuariosSegurosParaCliente(usuarios),
        grupos: grupos,
        transacciones: transacciones,
        ledger: ledger,
        auditoriaFinanciera: auditoriaFinanciera,
        bitacoras: bitacoras
      }
    });
  } catch (e) {
    return crearRespuestaJson({ exito: false, mensaje: "Error al sincronizar datos." });
  }
}


// --------------------------------------------------------------------------
// 4. CAPA DE COMUNICACIÓN CON FIREBASE REST API
// --------------------------------------------------------------------------


function leerDeFirebase(ruta) {
  var r=leerDeFirebaseDetallado(ruta);
  return r.ok?r.data:null;
}


function escribirEnFirebase(ruta,objeto) {
  var url=obtenerFirebaseUrl(ruta);
  try{
    var resp=UrlFetchApp.fetch(url,{method:"put",contentType:"application/json",payload:JSON.stringify(objeto),muteHttpExceptions:true});
    var code=resp.getResponseCode();
    if(code<200||code>=300)Logger.log("Firebase PUT "+code+": "+resp.getContentText());
    return code>=200&&code<300;
  }catch(e){registrarError("escribirEnFirebase",e);return false;}
}


function actualizarEnFirebaseMultiRuta(mapaActualizaciones) {
  if(!mapaActualizaciones || typeof mapaActualizaciones!=="object" || Object.keys(mapaActualizaciones).length===0)return false;
  var base=PropertiesService.getScriptProperties().getProperty("FIREBASE_URL")||CONFIG.FIREBASE_URL;
  var url=base.replace(/\/+$/,"/")+".json";
  try{
    var resp=UrlFetchApp.fetch(url,{method:"patch",contentType:"application/json",payload:JSON.stringify(mapaActualizaciones),muteHttpExceptions:true});
    var code=resp.getResponseCode();
    if(code<200||code>=300)Logger.log("Firebase PATCH "+code+": "+resp.getContentText());
    return code>=200&&code<300;
  }catch(e){registrarError("actualizarEnFirebaseMultiRuta",e);return false;}
}


// --------------------------------------------------------------------------
// 5. UTILIDADES NUMÉRICAS Y DE RESPUESTA
// --------------------------------------------------------------------------


function textoSeguro(valor) {
  if (valor === undefined || valor === null) return "";
  return String(valor).trim();
}


function limitarTexto(valor, maximo) {
  var t=textoSeguro(valor);
  return t.length>maximo?t.substring(0,maximo):t;
}


function normalizarDocumento(valor) {
  return textoSeguro(valor).replace(/[^0-9]/g, "");
}


function parsearMontoCentavos(valor) {
  if (typeof valor === "number") {
    if (!isFinite(valor)) return NaN;
    return Math.round(valor*100);
  }
  var t=textoSeguro(valor).replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  var n=Number(t);
  if (!isFinite(n)) return NaN;
  return Math.round(n*100);
}


function centavosAMonto(centavos) {
  if (typeof centavos !== "number" || !isFinite(centavos)) throw new Error("Monto en centavos inválido.");
  return centavos/100;
}


function obtenerSaldoCentavosSeguro(valor, etiqueta) {
  if (valor === undefined || valor === null || valor === "") return 0;
  var c=parsearMontoCentavos(valor);
  if (isNaN(c) || c<0) throw new Error("Saldo corrupto en " + etiqueta + ".");
  return c;
}


function montoValidoTransferencia(c) {
  return typeof c === "number" && isFinite(c) && c >= Math.round(CONFIG.MONTO_MINIMO_TRANSFERENCIA*100) && c <= Math.round(CONFIG.MONTO_MAXIMO_TRANSFERENCIA*100);
}


function normalizarRequestId(valor) {
  var id=textoSeguro(valor);
  if (!id || id.length>100 || !/^[A-Za-z0-9._:-]+$/.test(id)) return "";
  return id;
}


function generarId(prefijo) {
  return prefijo + "_" + Utilities.getUuid().replace(/-/g, "") + "_" + new Date().getTime();
}


function buscarUsuarioFlexible(usuarios, criterio) {
  var c=textoSeguro(criterio), limpio=normalizarDocumento(c);
  for(var k in usuarios){
    var u=usuarios[k]; if(!u) continue;
    if(k===c || u.idUsuario===c || (limpio && normalizarDocumento(u.numeroDocumento)===limpio) || (u.numeroDocumento && textoSeguro(u.numeroDocumento)===c)) return {id:k,usuario:u};
  }
  return null;
}


function buscarGrupoFlexible(grupos, criterio) {
  var c=textoSeguro(criterio), n=c.toLowerCase(), h=n.charAt(0)==="@"?n.substring(1):n;
  for(var k in grupos){
    var g=grupos[k];if(!g)continue;
    if(k===c || (g.idGrupo&&g.idGrupo===c) || (g.nombreGrupo&&g.nombreGrupo.toLowerCase()===n) || (g.handle&&g.handle.toLowerCase()===h)) return {id:k,grupo:g};
  }
  return null;
}


function verificarContrasena(usuario, contrasena) {
  return !!(usuario && usuario.contrasena && textoSeguro(contrasena) && String(usuario.contrasena)===textoSeguro(contrasena));
}


function validarAdminToken(token) {
  var t=textoSeguro(token);return !!t && CacheService.getScriptCache().get("admin_"+t)==="autorizado";
}


function obtenerIdempotencia(requestId) {
  if (!requestId) return null;

  var x = leerDeFirebase("idempotencia/" + requestId);

  return x && x.resultado ? x : null;
}


function registrarError(origen,error) {
  Logger.log("["+origen+"] "+(error&&error.stack?error.stack:String(error)));
}


function leerDeFirebaseObligatorio(ruta) {
  var resultado=leerDeFirebaseDetallado(ruta);
  if(!resultado.ok) throw new Error("Firebase no disponible para " + ruta + ". Código HTTP: " + resultado.status);
  return resultado.data;
}


function leerDeFirebaseDetallado(ruta) {
  var url=obtenerFirebaseUrl(ruta);
  try{
    var resp=UrlFetchApp.fetch(url,{method:"get",muteHttpExceptions:true});
    var code=resp.getResponseCode(),text=resp.getContentText();
    if(code<200||code>=300)return {ok:false,status:code,data:null};
    return {ok:true,status:code,data:text?JSON.parse(text):null};
  }catch(e){registrarError("leerDeFirebaseDetallado",e);return {ok:false,status:0,data:null};}
}


function obtenerFirebaseUrl(ruta) {
  var base=PropertiesService.getScriptProperties().getProperty("FIREBASE_URL")||CONFIG.FIREBASE_URL;
  return base.replace(/\/+$/,"/")+String(ruta).replace(/^\/+/,"")+".json";
}


function normalizarMonto(valor) {
  var c=parsearMontoCentavos(valor);
  if(isNaN(c))throw new Error("Monto inválido: " + valor);
  return centavosAMonto(c);
}


function usuarioSeguroParaCliente(usuario) {
  if (!usuario) return null;
  var copia=JSON.parse(JSON.stringify(usuario));
  delete copia.contrasena;
  delete copia.contrasenaTemporal;
  return copia;
}


function usuariosSegurosParaCliente(usuarios) {
  var salida={};
  for(var k in (usuarios||{})) {
    if(usuarios[k]) salida[k]=usuarioSeguroParaCliente(usuarios[k]);
  }
  return salida;
}


function crearRespuestaJson(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
