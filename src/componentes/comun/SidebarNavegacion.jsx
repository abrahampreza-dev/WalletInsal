import React from 'react';
import { 
  Globe, 
  Wallet, 
  Send, 
  Download, 
  Clock, 
  GraduationCap, 
  User, 
  Settings, 
  LogOut, 
  Grid, 
  Trophy, 
  UserPlus,
  LockKeyhole,
  X
} from 'lucide-react';
import { usarUsuario } from '../../contexto/ContextoUsuario';

export default function SidebarNavegacion({ 
  seccionActiva, 
  cambiarSeccion, 
  abrirModalEnviar, 
  abrirModalRecibir, 
  abrirModalRecompensas,
  abrirModalRegistro,
  alCerrar
}) {
  const { usuarioActual, adminAutenticado, cerrarSesion } = usarUsuario();

  const menuNavegacion = [
    { id: 'inicio_publico', etiqueta: 'Inicio', icono: Globe, tipo: 'nav' },
    { id: 'estands', etiqueta: 'Muro SPACE', icono: Grid, tipo: 'nav' },
  ];

  const menuWallet = [
    { id: 'wallet_dashboard', etiqueta: 'Mi Wallet', icono: Wallet, tipo: 'nav', requiereLogin: true },
    { id: 'enviar', etiqueta: 'Enviar', icono: Send, tipo: 'accion', accion: abrirModalEnviar, requiereLogin: true },
    { id: 'recibir', etiqueta: 'Recibir', icono: Download, tipo: 'accion', accion: abrirModalRecibir, requiereLogin: true },
    { id: 'billetera', etiqueta: 'Historial', icono: Clock, tipo: 'nav', requiereLogin: true },
    { id: 'ranking', etiqueta: 'Ranking', icono: Trophy, tipo: 'nav', requiereLogin: true },
    { id: 'perfil', etiqueta: 'Mi Perfil', icono: User, tipo: 'nav', requiereLogin: true },
  ];

  const menuAdmin = [
    { id: 'admin', etiqueta: 'Panel Administrativo', icono: Settings, tipo: 'nav' },
    { id: 'recompensas', etiqueta: 'Recompensas', icono: GraduationCap, tipo: 'accion', accion: abrirModalRecompensas },
  ];

  const gruposMenu = [
    { titulo: 'Navegación', items: menuNavegacion, visible: true },
    { titulo: 'Mi Wallet', items: menuWallet, visible: Boolean(usuarioActual) },
    { titulo: 'Administración', items: menuAdmin, visible: adminAutenticado },
  ];

  const clicEnItem = (item) => {
    if (item.requiereLogin && !usuarioActual) {
      abrirModalRegistro();
      return;
    }
    if (item.tipo === 'accion' && item.accion) {
      item.accion();
    } else {
      cambiarSeccion(item.id);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0A4D9C] border-r border-white/10 flex flex-col justify-between flex-shrink-0 z-40 overflow-y-auto overflow-x-hidden select-none superficie-azul">
      
      {/* Glow decorativo dorado */}
      <div className="absolute top-1/3 -left-16 -translate-y-1/2 w-60 h-60 rounded-full bg-[#D19E37]/20 blur-3xl pointer-events-none" />

      <div className="p-6 space-y-6 z-10">
        
        {/* Logotipo e Identidad Institucional Oficial */}
        <div 
          onClick={() => cambiarSeccion('inicio_publico')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {alCerrar && (
            <button
              onClick={(e) => { e.stopPropagation(); alCerrar(); }}
              aria-label="Cerrar menú"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border-2 border-[#D19E37]/50 shadow-lg shadow-black/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <img
              src="/logo.png"
              alt="Mascota Instituto San Luis"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-black text-white uppercase tracking-tight block leading-tight">
              INSTITUTO <span className="text-[#D19E37]">SAN LUIS</span>
            </span>
            <p className="text-[10px] text-white/75 font-medium leading-tight mt-0.5">
              Formando valores, construimos futuro.
            </p>
          </div>
        </div>

        {/* Menú de Navegación por Grupos */}
        <nav className="space-y-5 pt-1">
          {gruposMenu.filter((g) => g.visible).map((grupo) => (
            <div key={grupo.titulo}>
              <p className="text-[10px] font-black text-[#D19E37]/90 uppercase tracking-[0.2em] px-3.5 mb-1.5">
                {grupo.titulo}
              </p>
              <div className="space-y-1.5">
                {grupo.items.map((item) => {
                  const Icono = item.icono;
                  const esActivo = seccionActiva === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => clicEnItem(item)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 ${
                        esActivo
                          ? 'bg-[#E67A15] text-white shadow-lg shadow-black/30'
                          : 'text-white/85 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icono className={`w-4 h-4 ${esActivo ? 'text-white' : 'text-white/85'}`} />
                        <span>{item.etiqueta}</span>
                      </div>

                      {item.requiereLogin && !usuarioActual && (
                        <span className="text-[10px] bg-white/15 text-[#D19E37] px-1.5 py-0.5 rounded border border-white/40">
                          Acceso
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* Pie del Sidebar: Cerrar Sesión o Registrarse */}
      <div className="p-6 border-t border-white/30 z-10 space-y-3">
        {usuarioActual ? (
          <div className="space-y-2">
            <div className="p-2.5 bg-white/15 rounded-2xl border border-white/30 flex items-center justify-between text-xs">
              <div className="truncate max-w-[120px]">
                <span className="text-[10px] text-white/75 block font-medium">Billetera Activa</span>
                <span className="font-bold text-white truncate block">{usuarioActual.nombreCompleto}</span>
              </div>
              <span className="text-xs font-black text-[#D19E37]">
                {usuarioActual.saldoActual?.toFixed(2)} ⚡
              </span>
            </div>

            {!adminAutenticado && (
              <button
                onClick={() => cambiarSeccion('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[11px] text-white/85 hover:text-white hover:bg-white/20 transition-colors min-h-[44px]"
              >
                <LockKeyhole className="w-3.5 h-3.5" />
                Acceso administrativo
              </button>
            )}

            <button
              onClick={cerrarSesion}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-2.5 rounded-2xl bg-white/15 border border-white/30 text-center">
              <span className="text-[10px] text-[#D19E37] font-bold block uppercase">Acceso de invitado</span>
              <p className="text-[11px] text-white/75">Regístrate para donar SL - BITS y votar</p>
            </div>

            <button
              onClick={abrirModalRegistro}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E67A15] to-[#D19E37] hover:from-[#E67A15] hover:to-[#D19E37] text-white font-bold text-xs shadow-lg shadow-black/25 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Iniciar Sesión / Registro
            </button>

            <button
              onClick={() => cambiarSeccion('admin')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-[11px] text-white/85 hover:text-white hover:bg-white/20 transition-colors"
            >
              <LockKeyhole className="w-3.5 h-3.5" />
              Acceso administrativo
            </button>
          </div>
        )}
      </div>

    </aside>
  );
}