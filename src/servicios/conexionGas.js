/**
 * ==========================================================================
 * SERVICIO DE CONEXIÓN CON GOOGLE APPS SCRIPT (GAS)
 * ==========================================================================
 * Permite enviar peticiones HTTP POST hacia el Web App de Google Apps Script.
 */

const URL_API_GAS = import.meta.env.VITE_GAS_API_URL || "https://script.google.com/macros/s/REEMPLAZAR_CON_URL_REAL/exec";

/**
 * Envía una petición POST con la acción y los datos requeridos al backend
 * @param {string} accion - Nombre de la operación (ej. "registrarVisitante", "procesarDonacion")
 * @param {object} datos - Objeto con los parámetros de la acción
 * @returns {Promise<object>} Respuesta del servidor en formato JSON
 */
export async function enviarPeticion(accion, datos = {}) {
  try {
    const cuerpoPeticion = {
      accion: accion,
      datos: datos
    };

    const respuesta = await fetch(URL_API_GAS, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(cuerpoPeticion),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en la petición: Código de estado ${respuesta.status}`);
    }

    const datosJson = await respuesta.json();
    return datosJson;

  } catch (error) {
    console.error("Error al comunicarse con Google Apps Script:", error);
    
    // Si la URL es la de ejemplo o la red falla, proveemos un mensaje claro y seguro
    return {
      exito: false,
      mensaje: `No se pudo conectar con el servidor: ${error.message}. Verifica la conexión a Internet o la URL del Web App en el archivo .env.`,
      error: error.message
    };
  }
}
