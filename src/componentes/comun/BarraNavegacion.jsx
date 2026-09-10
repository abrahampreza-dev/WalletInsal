import React, { useState } from 'react';
import { usarUsuario } from '../../contexto/ContextoUsuario';
import { 
  Zap, 
  Wallet, 
  Trophy, 
  LayoutGrid, 
  ShieldCheck, 
  UserPlus, 
  LogOut, 
  Menu, 
  X,
  RefreshCw
} from 'lucide-react';

export default function BarraNavegacion({ 
  seccionActiva, 
  cambiarSeccion, 
  abrirModalRegistro 
}) {
  const { usuarioActual, grupoActual, cerrarSesion, sincronizarConServidor, cargando } = usarUsuario();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const enlacesNavegacion = [
    { id: 'estands', etiqueta: 'Estands', icono: LayoutGrid },
    { id: 'ranking', etiqueta: 'Ranking', icono: Trophy },
    { id: 'billetera', etiqueta: 'Mi Billetera', icono: Wallet, requiereSesion: true },
    { id: 'grupo', etiqueta: 'Mi Estand', icono: LayoutGrid, requiereGrupo: true },
    { id: 'admin', etiqueta: 'Administración', icono: ShieldCheck },
  ];

  const manejarCambioSeccion = (idSeccion) => {
    cambiarSeccion(idSeccion);
    setMenuMovilAbierto(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0A4D9C] to-[#07366E] backdrop-blur-md border-b border-[#0A4D9C]/50 superficie-azul">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logotipo e Identidad Institucional */}
          <div 
            onClick={() => manejarCambioSeccion('estands')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E67A15] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  SL - BITS <span className="text-[#E67A15]">WALLET</span>
                </span>
                <span className="bg-[#0A4D9C]/15 text-[#0A4D9C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0A4D9C]/50">
                  2026
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Instituto Nacional San Luís • Expotecnia</p>
            </div>
          </div>

          {/* Menú de Navegación de Escritorio */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {enlacesNavegacion.map((enlace) => {
              const Icono = enlace.icono;
              const activo = seccionActiva === enlace.id;

              if (enlace.requiereSesion && !usuarioActual) return null;
              if (enlace.requiereGrupo && !grupoActual) return null;

              return (
                <button
                  key={enlace.id}
                  onClick={() => manejarCambioSeccion(enlace.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activo
                      ? 'bg-gradient-to-r from-[#E67A15] to-[#D19E37] text-white shadow-md shadow-orange-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-100'
                  }`}
                >
                  <Icono className={`w-4 h-4 ${activo ? 'text-white' : 'text-slate-400'}`} />
                  {enlace.etiqueta}
                </button>
              );
            })}
          </nav>

          {/* Acciones de Usuario y Sincronización */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Botón de Sincronización en Vivo */}
            <button
              onClick={sincronizarConServidor}
              disabled={cargando}
              title="Sincronizar datos con el servidor"
              className="p-2.5 text-slate-400 hover:text-[#0A4D9C] bg-slate-100 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0A4D9C]' : ''}`} />
            </button>

            {usuarioActual ? (
              <div className="flex items-center gap-3">
                {/* Visualizador de Saldo Rápido */}
                <div 
                  onClick={() => manejarCambioSeccion('billetera')}
                  className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl cursor-pointer hover:border-[#E67A15]/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E67A15]/15 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#E67A15] fill-[#E67A15]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block leading-none">Mi Saldo</span>
                    <span className="text-sm font-bold text-white leading-none">
                      {usuarioActual.saldoActual?.toFixed(2) || "0.00"} ⚡
                    </span>
                  </div>
                </div>

                {/* Botón Cerrar Sesión */}
                <button
                  onClick={cerrarSesion}
                  title="Cerrar sesión"
                  className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-100 hover:bg-red-500/15 rounded-xl border border-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={abrirModalRegistro}
                className="flex items-center gap-2 bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse / Entrar
              </button>
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="p-2.5 text-slate-400 bg-slate-100 rounded-xl border border-slate-200"
            >
              {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-[#0A4D9C] border-b border-[#0A4D9C]/50 px-4 pt-2 pb-6 space-y-3 superficie-azul">
          {usuarioActual && (
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Conectado como:</p>
                <p className="text-sm font-bold text-white truncate max-w-[180px]">
                  {usuarioActual.nombreCompleto}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">Saldo disponible</span>
                <span className="text-base font-extrabold text-[#E67A15]">
                  {usuarioActual.saldoActual?.toFixed(2) || "0.00"} ⚡ SL - BITS
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {enlacesNavegacion.map((enlace) => {
              const Icono = enlace.icono;
              const activo = seccionActiva === enlace.id;

              if (enlace.requiereSesion && !usuarioActual) return null;
              if (enlace.requiereGrupo && !grupoActual) return null;

              return (
                <button
                  key={enlace.id}
                  onClick={() => manejarCambioSeccion(enlace.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activo
                      ? 'bg-[#E67A15] text-white'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Icono className="w-5 h-5" />
                  {enlace.etiqueta}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
            {usuarioActual ? (
              <button
                onClick={() => {
                  cerrarSesion();
                  setMenuMovilAbierto(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 text-red-400 font-semibold text-sm border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            ) : (
              <button
                onClick={() => {
                  abrirModalRegistro();
                  setMenuMovilAbierto(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E67A15] text-white font-bold text-sm shadow-md shadow-orange-500/30"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse / Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

