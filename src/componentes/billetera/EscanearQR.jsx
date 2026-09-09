import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Scan } from 'lucide-react';

export default function EscanearQR({ estaAbierto, alCerrar, alEscanear }) {
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const [escaneando, setEscaneando] = useState(false);

  useEffect(() => {
    if (!estaAbierto) {
      detenerScanner();
      return;
    }

    const iniciarScanner = async () => {
      try {
        setError('');
        setEscaneando(true);

        const scanner = new Html5Qrcode('qr-reader-container');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            try {
              const datos = JSON.parse(decodedText);
              if (datos.tipo === 'pago_estudiante' && datos.idUsuario) {
                alEscanear(datos.idUsuario);
                detenerScanner();
                alCerrar();
              } else if (datos.tipo === 'donacion_grupo' && datos.idGrupo) {
                alEscanear(datos.idGrupo);
                detenerScanner();
                alCerrar();
              } else {
                alEscanear(decodedText);
                detenerScanner();
                alCerrar();
              }
            } catch {
              alEscanear(decodedText);
              detenerScanner();
              alCerrar();
            }
          },
          () => {}
        );
      } catch (err) {
        setError('No se pudo iniciar la cámara. Verifica los permisos.');
        setEscaneando(false);
      }
    };

    iniciarScanner();

    return () => detenerScanner();
  }, [estaAbierto]);

  const detenerScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setEscaneando(false);
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#E67A15]" />
            <h3 className="text-sm font-black text-slate-800">Escanear QR</h3>
          </div>
          <button onClick={() => { detenerScanner(); alCerrar(); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div id="qr-reader-container" ref={containerRef} className="rounded-2xl overflow-hidden bg-slate-900 min-h-[250px]" />

          {escaneando && (
            <p className="text-center text-xs text-slate-400 animate-pulse">
              Apunta la cámara al código QR...
            </p>
          )}

          <button
            onClick={() => { detenerScanner(); alCerrar(); }}
            className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}