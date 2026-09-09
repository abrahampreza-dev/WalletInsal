import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RotateCcw, Upload, Image } from 'lucide-react';

export default function CamaraSelfie({ estaAbierto, alCerrar, alTomarFoto }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [capturada, setCapturada] = useState(null);
  const [error, setError] = useState('');
  const [modo, setModo] = useState('cámara');

  const iniciarCamara = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Puedes subir una foto en su lugar.');
      setModo('subir');
    }
  }, []);

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const comprimirImagen = (dataUrl, maxAncho = 400) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxAncho) {
          height = Math.round((height * maxAncho) / width);
          width = maxAncho;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  const capturarFoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const comprimida = await comprimirImagen(dataUrl);
    setCapturada(comprimida);
    detenerCamara();
  };

  const manejarArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evento) => {
      const comprimida = await comprimirImagen(evento.target.result);
      setCapturada(comprimida);
    };
    reader.readAsDataURL(archivo);
    e.target.value = '';
  };

  const reintentar = () => {
    setCapturada(null);
    setError('');
    if (modo === 'cámara') {
      iniciarCamara();
    }
  };

  const confirmar = () => {
    if (capturada && alTomarFoto) {
      alTomarFoto(capturada);
    }
    setCapturada(null);
    setModo('cámara');
    alCerrar();
  };

  const handleCerrar = () => {
    detenerCamara();
    setCapturada(null);
    setError('');
    setModo('cámara');
    alCerrar();
  };

  const cambiarModo = (nuevoModo) => {
    detenerCamara();
    setCapturada(null);
    setError('');
    setModo(nuevoModo);
    if (nuevoModo === 'cámara') {
      setTimeout(() => iniciarCamara(), 100);
    }
  };

  React.useEffect(() => {
    if (estaAbierto && modo === 'cámara') {
      iniciarCamara();
    }
    return () => detenerCamara();
  }, [estaAbierto, modo]);

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#FFFFFF] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#E67A15]" />
            <h3 className="text-sm font-black text-slate-800">Foto de Perfil</h3>
          </div>
          <button onClick={handleCerrar} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs text-center">
              {error}
            </div>
          )}

          {!capturada && (
            <div className="flex gap-2">
              <button
                onClick={() => cambiarModo('cámara')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                  modo === 'cámara'
                    ? 'bg-[#E67A15]/15 border-[#E67A15]/50 text-[#E67A15]'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Camera className="w-4 h-4" />
                Cámara
              </button>
              <button
                onClick={() => cambiarModo('subir')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                  modo === 'subir'
                    ? 'bg-[#0A4D9C]/15 border-[#0A4D9C]/50 text-[#0A4D9C]'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Upload className="w-4 h-4" />
                Subir foto
              </button>
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3]">
            {!capturada ? (
              modo === 'cámara' ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 rounded-full border-2 border-white/40" />
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <Image className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400 font-bold">Toca para seleccionar imagen</p>
                  <p className="text-[10px] text-slate-500 mt-1">JPG, PNG o WebP (máx. 5 MB)</p>
                </div>
              )
            ) : (
              <img src={capturada} alt="Foto capturada" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={manejarArchivo}
            className="hidden"
          />

          <div className="flex gap-2">
            {!capturada ? (
              modo === 'cámara' ? (
                <button
                  onClick={capturarFoto}
                  disabled={!!error}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white font-black text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Capturar
                </button>
              ) : null
            ) : (
              <>
                <button
                  onClick={reintentar}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {modo === 'cámara' ? 'Repetir' : 'Cambiar'}
                </button>
                <button
                  onClick={confirmar}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0A4D9C] to-[#07366E] text-white font-black text-xs flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Usar esta foto
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}