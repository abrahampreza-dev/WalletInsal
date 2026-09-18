import React, { useState, memo } from 'react';
import { Image as IconoImagen } from 'lucide-react';

/**
 * Componente de Imagen Optimizada de Alto Rendimiento
 * - Carga perezosa nativa (loading="lazy")
 * - Decodificación asíncrona fuera del hilo principal (decoding="async")
 * - Placeholder skeleton suave para prevenir Cumulative Layout Shift (CLS)
 * - Transición fluida con aceleración por GPU
 * - Fallback inteligente a /logo.png en caso de error o enlaces rotos
 */
function ImagenOptimizadaComponente({
  src,
  alt = '',
  className = 'w-full h-full object-cover',
  contenedorClassName = '',
  prioritaria = false,
  fallbackSrc = '/logo.png',
  mostrarIconoEsqueleto = false,
  ...restoProps
}) {
  const [cargada, setCargada] = useState(false);
  const [error, setError] = useState(false);

  const fuenteFinal = error || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden ${contenedorClassName}`}>
      {/* Esqueleto de carga (Shimmer skeleton) para evitar saltos de diseño CLS */}
      {!cargada && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse flex items-center justify-center pointer-events-none z-0"
          aria-hidden="true"
        >
          {mostrarIconoEsqueleto && (
            <IconoImagen className="w-6 h-6 text-slate-300 opacity-60" />
          )}
        </div>
      )}

      {/* Imagen real con decodificación asíncrona y carga optimizada */}
      <img
        src={fuenteFinal}
        alt={alt}
        loading={prioritaria ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setCargada(true)}
        onError={(e) => {
          if (!error) {
            setError(true);
            e.target.onerror = null;
            e.target.src = fallbackSrc;
          }
          setCargada(true);
        }}
        className={`${className} transform-gpu transition-opacity duration-300 ease-out ${
          cargada ? 'opacity-100' : 'opacity-0'
        }`}
        {...restoProps}
      />
    </div>
  );
}

export const ImagenOptimizada = memo(ImagenOptimizadaComponente);
export default ImagenOptimizada;
