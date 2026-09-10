import React, { useState } from 'react';
import ImagenMascota from '../comun/ImagenMascota';
import { 
  Zap, 
  Send, 
  Download, 
  Scan, 
  Clock, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Bell, 
  ChevronDown, 
  ShoppingBag, 
  PlusCircle, 
  Star, 
  Shield, 
  ArrowRight,
  Grid,
  BookOpen,
  Trophy,
  Heart
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import ModalEnviarBits from '../billetera/ModalEnviarBits';
import ModalRecibirBits from '../billetera/ModalRecibirBits';
import ModalEscanearQR from '../billetera/ModalEscanearQR';

export default function DashboardPrincipal({ alIrAEstands, alIrAHistorial, alIrAPerfil, alAbrirEstand }) {
const { 
    usuarioActual, 
    grupoActual, 
    listaTransacciones, 
    notificaciones, 
    cerrarSesion 
  } = usarUsuario();

  const [modalEnviar, setModalEnviar] = useState(false);
  const [modalRecibir, setModalRecibir] = useState(false);
  const [modalEscanear, setModalEscanear] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const saldo = usuarioActual?.saldoActual !== undefined ? usuarioActual.saldoActual : 0;
  const codigoQRValor = usuarioActual
    ? JSON.stringify({
        tipo: 'pago_estudiante',
        idUsuario: usuarioActual.idUsuario,
        nombre: usuarioActual.nombreCompleto
      })
    : null;

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(usuarioActual?.numeroDocumento || "");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartirCodigo = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi Código SL - BITS - Instituto Nacional San Luís',
        text: `Transfiéreme SL - BITS usando mi código estudiantil: ${usuarioActual?.numeroDocumento || ""}`
      }).catch(() => {});
    } else {
      copiarCodigo();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* 1. Encabezado Superior de Bienvenida con Notificaciones y Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            ¡Hola, {usuarioActual?.nombreCompleto?.split(' ')[0] || "Estudiante"}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Te damos la bienvenida al panel principal de tu billetera digital.
          </p>
        </div>

        {/* Acciones de la esquina superior derecha */}
        <div className="flex items-center gap-3 relative">
          
          {/* Campana de Notificaciones con Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setMostrarNotificaciones(!mostrarNotificaciones);
                setMostrarMenuUsuario(false);
              }}
              className="p-3 rounded-2xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notificaciones.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E67A15] text-[10px] font-black text-white flex items-center justify-center border-2 border-[#FFFFFF]">
                  {notificaciones.length}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {mostrarNotificaciones && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFFFFF] border border-slate-200 rounded-3xl p-4 shadow-2xl z-50 space-y-3 max-w-[calc(100vw-2rem)]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">Notificaciones</span>
                  <span className="text-[10px] text-[#E67A15] font-bold">{notificaciones.length} nuevas</span>
                </div>
                <div className="space-y-2">
                  {notificaciones.map((n) => (
                    <div key={n.id} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{n.titulo}</p>
                      <p className="text-[11px] text-slate-400">{n.mensaje}</p>
                      <span className="text-[10px] text-slate-400 block">{n.tiempo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menú de Usuario / Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setMostrarMenuUsuario(!mostrarMenuUsuario);
                setMostrarNotificaciones(false);
              }}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 border border-[#E67A15]/40">
                <img
                  src="/logo.png"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
<span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {usuarioActual?.nombreCompleto}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown de Usuario */}
            {mostrarMenuUsuario && (
              <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-slate-200 rounded-3xl p-3 shadow-2xl z-50 space-y-1 max-w-[calc(100vw-2rem)]">
<div className="p-2 border-b border-slate-200 mb-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{usuarioActual?.nombreCompleto}</p>
                </div>
                <button
                  onClick={() => {
                    setMostrarMenuUsuario(false);
                    alIrAEstands();
                  }}
                  className="w-full text-left p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-100"
                >
Explorar Muro SPACE
                </button>
                <button
                  onClick={cerrarSesion}
                  className="w-full text-left p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Tarjeta Hero Principal con Saldo y Mascota del Ciervo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] border border-[#0A4D9C]/40 shadow-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 superficie-azul">
        
        {/* Glow de fondo anaranjado */}
        <div className="absolute right-10 -bottom-20 w-72 h-72 rounded-full bg-[#D19E37]/15 blur-3xl pointer-events-none" />

        <div className="space-y-4 z-10 text-center sm:text-left">
          <span className="text-xs font-bold text-white/85 uppercase tracking-widest block">
            Saldo disponible
          </span>

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <span className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {saldo.toFixed(2)}
            </span>
<div className="flex items-center gap-2 bg-white/15 border border-white/40 px-3.5 py-1.5 rounded-2xl">
              <div className="w-6 h-6 rounded-full bg-[#E67A15] flex items-center justify-center text-white text-xs font-black shadow-md shadow-black/30">
                ⚡
              </div>
              <span className="text-lg font-black text-[#D19E37] tracking-wider">
                SL - BITS
              </span>
            </div>
          </div>

          <p className="text-xs text-white/85 max-w-md">
            Sistema oficial de votación y donaciones de la Expotecnia 2026. Apoya a los proyectos que más te gusten y canjea tus recompensas.
          </p>
        </div>

        {/* Mascota del Ciervo en la tarjeta */}
        <div className="relative z-10 flex-shrink-0">
<div className="w-56 sm:w-72 rounded-3xl overflow-hidden border-2 border-[#D19E37]/50 shadow-2xl shadow-black/20 bg-white">
            <ImagenMascota
              className="w-full h-auto block"
              alt="Mascota Ciervo San Luis"
            />
          </div>
        </div>

      </div>

      {/* 3. Barra de Botones de Acción Rápida (Enviar, Recibir, Escanear, Historial) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Enviar */}
        <button
          onClick={() => setModalEnviar(true)}
          className="p-5 rounded-3xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 hover:border-[#E67A15]/60 flex flex-col items-center justify-center gap-2 transition-all group shadow-lg transform hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#E67A15]/15 border border-[#E67A15]/50 flex items-center justify-center text-[#E67A15] group-hover:scale-110 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-800">Enviar</span>
          <span className="text-[11px] text-slate-400">Envía SL - BITS</span>
        </button>

        {/* Recibir */}
        <button
          onClick={() => setModalRecibir(true)}
          className="p-5 rounded-3xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 hover:border-[#0A4D9C]/60 flex flex-col items-center justify-center gap-2 transition-all group shadow-lg transform hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0A4D9C]/15 border border-[#0A4D9C]/50 flex items-center justify-center text-[#0A4D9C] group-hover:scale-110 transition-transform">
            <Download className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-800">Recibir</span>
          <span className="text-[11px] text-slate-400">Recibe SL - BITS</span>
        </button>

        {/* Escanear */}
        <button
          onClick={() => setModalEscanear(true)}
          className="p-5 rounded-3xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 hover:border-purple-500/60 flex flex-col items-center justify-center gap-2 transition-all group shadow-lg transform hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <Scan className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-800">Escanear</span>
          <span className="text-[11px] text-slate-400">Escanea QR</span>
        </button>

        {/* Historial */}
        <button
          onClick={alIrAHistorial}
          className="p-5 rounded-3xl bg-[#FFFFFF] hover:bg-slate-100 border border-slate-200 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-2 transition-all group shadow-lg transform hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/45 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-sm font-black text-slate-800">Historial</span>
          <span className="text-[11px] text-slate-400">Ver movimientos</span>
        </button>

      </div>

      {/* 4. Grid Principal: Actividad Reciente + Mi Estand + Recibir Fondeo / SL-BITS + Tarjeta Valores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Actividad Reciente */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-base font-black text-slate-800">Actividad reciente</h3>
              <button
                onClick={alIrAHistorial}
                className="text-xs font-bold text-[#E67A15] hover:underline"
              >
                Ver todo
              </button>
            </div>

            {/* Lista de transacciones exactas */}
            <div className="divide-y divide-slate-200/60 pt-2">
              {listaTransacciones.slice(0, 5).map((tx) => {
                const esNegativo = tx.tipo === 'pago_comercio' || tx.tipo === 'donacion' || tx.tipo === 'envio_estudiante';
                
                let IconoTx = Send;
                let bgIcono = "bg-[#0A4D9C]/15 text-[#0A4D9C]";
                if (tx.categoria === 'recarga') {
                  IconoTx = PlusCircle;
                  bgIcono = "bg-emerald-500/15 text-emerald-600";
                } else if (tx.categoria === 'tienda') {
                  IconoTx = ShoppingBag;
                  bgIcono = "bg-indigo-500/10 text-indigo-400";
                } else if (tx.categoria === 'premio') {
                  IconoTx = Star;
                  bgIcono = "bg-amber-500/10 text-amber-600";
                } else if (tx.categoria === 'comunitaria') {
                  IconoTx = Users;
                  bgIcono = "bg-[#E67A15]/15 text-[#E67A15]";
                }

                return (
                  <div key={tx.idTransaccion} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${bgIcono} flex items-center justify-center flex-shrink-0`}>
                        <IconoTx className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{tx.nombreReceptor || tx.nombreEmisor}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.fecha).toLocaleString('es-SV', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black ${esNegativo ? 'text-slate-400' : 'text-emerald-600'}`}>
                        {esNegativo ? '-' : '+'} {parseFloat(tx.monto).toFixed(2)} SL - BITS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={alIrAHistorial}
            className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-400 hover:text-white border border-slate-200 flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <span>Ver todo el historial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

{/* Columna Central: Mi Estand Explorar INSALSPACE */}
        <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 border-b border-slate-200 pb-4">
              Mi Estand Explorar INSALSPACE
            </h3>

            <div className="space-y-4 pt-4">
              {grupoActual ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estand conectado</span>
                  <p className="text-xs font-bold text-slate-800">{grupoActual.nombreGrupo}</p>
                  <p className="text-[11px] text-slate-400">
                    {grupoActual.especialidad}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Recaudado:{' '}
                    <strong className="text-[#E67A15]">{Number(grupoActual.totalRecaudado || 0).toFixed(2)} SL - BITS</strong>
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Aún no tienes estand conectado</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Conecta o registra el estand de tu proyecto técnico para publicar fotos, videos y administrar tu muro en la red social Explorar INSALSPACE.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={alIrAPerfil}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <Grid className="w-4 h-4" />
            Administrar mi estand
          </button>
        </div>

        {/* Columna Derecha: Recibir Fondeo / SL-BITS con QR y Tarjeta de Valores */}
        <div className="space-y-6">
          
          {/* Card: Recibir Fondeo / SL-BITS con QR */}
          <div className="bg-[#FFFFFF] border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-black text-slate-800 text-left">Recibir Fondeo / SL-BITS</h3>
            <span className="text-[11px] text-slate-400 block font-medium">Tu código QR</span>

            {/* Código QR estilizado con ciervo */}
            <div className="p-4 bg-white rounded-3xl inline-block shadow-xl border-4 border-[#E67A15]/45">
              <QRCodeSVG
                value={codigoQRValor}
                size={140}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Comparte tu código para recibir SL - BITS
            </p>

            <div className="space-y-2">
              <button
                onClick={compartirCodigo}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir código
              </button>

              <button
                onClick={copiarCodigo}
                className="w-full py-2.5 rounded-2xl bg-transparent hover:bg-slate-100 text-slate-400 hover:text-white font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? '¡Código Copiado!' : 'Copiar código'}
              </button>
            </div>
          </div>

          {/* Card: SL - BITS Valores Institucionales */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A4D9C] via-[#0A4D9C] to-[#07366E] border border-[#0A4D9C]/40 p-5 shadow-2xl space-y-3 superficie-azul">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-base font-black text-[#D19E37] tracking-wider block">
                  SL - BITS
                </span>
                <p className="text-xs font-bold text-white leading-tight">
                  Más que una moneda, son los valores que nos impulsan.
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E67A15]/40 bg-slate-50 flex-shrink-0">
                <img src="/logo.png" alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Badges de Valores */}
            <div className="pt-2 border-t border-white/40 flex items-center justify-between text-[10px] text-white/85 font-medium">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Valores</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Educación</span>
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Logro</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Amistad</span>
            </div>

          </div>

        </div>

      </div>

      {/* 5. Banner de Pie de Página Oficial de SL - BITS */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-[#E67A15]" />
          <span>
            <strong className="text-slate-800">SL - BITS</strong> es la moneda oficial del Instituto Nacional San Luís.
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Úsala, gana y crece con ella. Expotecnia 2026.
        </span>
      </div>

{/* MODALES */}
      <ModalEnviarBits
        estaAbierto={modalEnviar}
        alCerrar={() => setModalEnviar(false)}
      />

      <ModalRecibirBits
        estaAbierto={modalRecibir}
        alCerrar={() => setModalRecibir(false)}
      />

<ModalEscanearQR
        estaAbierto={modalEscanear}
        alCerrar={() => setModalEscanear(false)}
        alEscanearGrupo={(idGrupo) => alAbrirEstand(idGrupo)}
      />

    </div>
  );
}

