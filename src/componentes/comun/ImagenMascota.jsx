import React, { useState, useEffect } from 'react';

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ImagenMascota({ className = '', alt = 'Mascota Instituto San Luis' }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let activo = true;
    const probar = (indice) => {
      if (!activo || indice >= EXTENSIONES.length) return;
      const img = new Image();
      img.onload = () => { if (activo) setUrl('/mascota' + EXTENSIONES[indice]); };
      img.onerror = () => probar(indice + 1);
      img.src = '/mascota' + EXTENSIONES[indice];
    };
    probar(0);
    return () => { activo = false; };
  }, []);

  if (!url) {
    return (
      <div className={`${className} flex items-center justify-center bg-white min-h-40`} aria-label={alt}>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mascota</span>
      </div>
    );
  }

  return <img src={url} alt={alt} className={className} />;
}