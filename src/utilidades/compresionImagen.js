/**
 * ==========================================================================
 * UTILIDAD DE COMPRESIÓN Y OPTIMIZACIÓN DE IMÁGENES EN CLIENTE
 * ==========================================================================
 * Reduce drásticamente el peso de las imágenes (ej. 8MB -> ~150KB)
 * en el navegador usando Canvas nativo antes de la transmisión de datos.
 */

/**
 * Convierte un número de bytes a una cadena legible (B, KB, MB)
 * @param {number} bytes 
 * @returns {string}
 */
export function formatearPeso(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Comprime y redimensiona una imagen en el navegador
 * @param {File|Blob|string} entrada - Archivo de imagen, Blob o Data URL
 * @param {object} opciones - Opciones de configuración
 * @param {number} [opciones.maxAncho=1280] - Ancho máximo permitido en píxeles
 * @param {number} [opciones.maxAlto=1280] - Alto máximo permitido en píxeles
 * @param {number} [opciones.calidad=0.8] - Calidad de compresión (0.1 a 1.0)
 * @param {string} [opciones.formato='image/webp'] - Formato de salida preferido
 * @returns {Promise<object>} Objeto con imagen comprimida, dataUrl, y métricas
 */
export async function comprimirImagen(entrada, opciones = {}) {
  const {
    maxAncho = 900,
    maxAlto = 900,
    calidad = 0.70,
    formato = 'image/webp'
  } = opciones;

  let bytesOriginales = 0;
  if (entrada instanceof Blob || entrada instanceof File) {
    bytesOriginales = entrada.size;
  }

  // Cargar imagen en un elemento Image
  const img = await new Promise((resolve, reject) => {
    const imagenElemento = new Image();
    imagenElemento.onload = () => resolve(imagenElemento);
    imagenElemento.onerror = (err) => reject(new Error('No se pudo decodificar la imagen: ' + err));

    if (typeof entrada === 'string') {
      imagenElemento.src = entrada;
      // Estimar peso original si es base64
      if (entrada.startsWith('data:')) {
        bytesOriginales = Math.round((entrada.length * 3) / 4);
      }
    } else if (entrada instanceof Blob || entrada instanceof File) {
      const urlTemporal = URL.createObjectURL(entrada);
      imagenElemento.src = urlTemporal;
      imagenElemento.onload = () => {
        URL.revokeObjectURL(urlTemporal);
        resolve(imagenElemento);
      };
    } else {
      reject(new Error('Tipo de entrada no admitido para compresión de imagen.'));
    }
  });

  // Calcular nuevas dimensiones manteniendo la relación de aspecto
  let ancho = img.naturalWidth || img.width;
  let alto = img.naturalHeight || img.height;

  if (ancho > maxAncho || alto > maxAlto) {
    const ratio = Math.min(maxAncho / ancho, maxAlto / alto);
    ancho = Math.round(ancho * ratio);
    alto = Math.round(alto * ratio);
  }

  // Dibujar en canvas optimizado
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d', { alpha: false });

  // Fondo blanco para evitar fondos negros si el formato no soporta transparencia
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, ancho, alto);

  // Renderizar imagen reescalada con interpolación suavizada
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, ancho, alto);

  // Probar exportar en WebP; si el navegador no lo soporta, usar JPEG
  let formatoFinal = formato;
  let dataUrl = canvas.toDataURL(formatoFinal, calidad);
  if (!dataUrl.startsWith(`data:${formatoFinal}`)) {
    formatoFinal = 'image/jpeg';
    dataUrl = canvas.toDataURL(formatoFinal, calidad);
  }

  // Crear Blob a partir del Canvas
  const blob = await new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      formatoFinal,
      calidad
    );
  });

  const bytesComprimidos = blob ? blob.size : Math.round((dataUrl.length * 3) / 4);
  const porcentajeAhorro = bytesOriginales > 0
    ? Math.max(0, Math.round(((bytesOriginales - bytesComprimidos) / bytesOriginales) * 100))
    : 0;

  // Extraer base64 pura (sin prefijo "data:image/...;base64,") para envíos de API
  const base64Pura = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  return {
    archivo: blob,
    dataUrl,
    base64Pura,
    ancho,
    alto,
    formato: formatoFinal,
    bytesOriginales,
    bytesComprimidos,
    pesoOriginal: formatearPeso(bytesOriginales),
    pesoComprimido: formatearPeso(bytesComprimidos),
    porcentajeAhorro
  };
}
