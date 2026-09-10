import React, { useState, useEffect } from 'react';
import { ProveedorUsuario, usarUsuario } from './contexto/ContextoUsuario';
import ErrorBoundary from './componentes/comun/ErrorBoundary';
import SidebarNavegacion from './componentes/comun/SidebarNavegacion';
import InicioPublico from './componentes/publico/InicioPublico';
import DashboardPrincipal from './componentes/dashboard/DashboardPrincipal';
import ListaEstands from './componentes/estands/ListaEstands';
import PerfilInstagramGrupo from './componentes/estands/PerfilInstagramGrupo';
import TablaPosiciones from './componentes/ranking/TablaPosiciones';
import MiBilletera from './componentes/billetera/MiBilletera';
import PerfilUsuario from './componentes/billetera/PerfilUsuario';
import PanelAdmin from './componentes/administracion/PanelAdmin';
import AccesoAdmin from './componentes/administracion/AccesoAdmin';
import PanelGrupo from './componentes/administracion/PanelGrupo';
import VentanaRegistro from './componentes/registro/VentanaRegistro';
import ModalEnviarBits from './componentes/billetera/ModalEnviarBits';
import ModalRecibirBits from './componentes/billetera/ModalRecibirBits';
import ModalRecompensas from './componentes/billetera/ModalRecompensas';
import { Menu, X, PanelLeftClose, PanelLeftOpen, AlertCircle } from 'lucide-react';

const APP_VERSION = '1.5.0';

function ContenidoPrincipal() {
  const { usuarioActual, grupoActual, adminAutenticado, mensajeAlerta, setMensajeAlerta } = usarUsuario();

  // Si hay usuario autenticado entra directo a su wallet; si no, al área pública
  const [seccionActiva, setSeccionActiva] = useState(() => {
    try {
      const valor = localStorage.getItem('slbits_seccion');
      return valor && typeof valor === 'string' ? valor : 'inicio_publico';
    } catch { return 'inicio_publico'; }
  });
  const [grupoInstagramSeleccionado, setGrupoInstagramSeleccionado] = useState(() => {
    try {
      const valor = localStorage.getItem('slbits_grupo_instagram');
      return valor && typeof valor === 'string' ? valor : null;
    } catch { return null; }
  });
  
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [pestanaRegistroInicial, setPestanaRegistroInicial] = useState('visitante');
  const [modalEnviarAbierto, setModalEnviarAbierto] = useState(false);
  const [modalRecibirAbierto, setModalRecibirAbierto] = useState(false);
  const [modalRecompensasAbierto, setModalRecompensasAbierto] = useState(false);
  const [drawerMovilAbierto, setDrawerMovilAbierto] = useState(false);
  const [sidebarCerrada, setSidebarCerrada] = useState(false);

  const seccionesValidas = ['inicio_publico', 'wallet_dashboard', 'estands', 'instagram_perfil', 'ranking', 'billetera', 'historial', 'perfil', 'admin'];

  // Un visitante (sin sesión) solo puede ver Inicio y el Muro SPACE
  const seccionesPrivadas = ['wallet_dashboard', 'billetera', 'historial', 'ranking', 'perfil'];
  useEffect(() => {
    if (!seccionesValidas.includes(seccionActiva)) {
      setSeccionActiva('inicio_publico');
      return;
    }
    if (!usuarioActual && seccionesPrivadas.includes(seccionActiva)) {
      setSeccionActiva('inicio_publico');
    }
  }, [usuarioActual, seccionActiva]);

  // Persistir sección y grupo en localStorage
  useEffect(() => {
    try {
      if (seccionActiva && typeof seccionActiva === 'string') {
        localStorage.setItem('slbits_seccion', seccionActiva);
      }
    } catch {}
  }, [seccionActiva]);

  useEffect(() => {
    try {
      if (grupoInstagramSeleccionado && typeof grupoInstagramSeleccionado === 'string') {
        localStorage.setItem('slbits_grupo_instagram', grupoInstagramSeleccionado);
      } else {
        localStorage.removeItem('slbits_grupo_instagram');
      }
    } catch {}
  }, [grupoInstagramSeleccionado]);

  // Bloquear el scroll del fondo mientras el cajón móvil está abierto
  useEffect(() => {
    document.body.style.overflow = drawerMovilAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerMovilAbierto]);

  const abrirRegistro = (pestana = 'visitante') => {
    setPestanaRegistroInicial(pestana);
    setModalRegistroAbierto(true);
  };

  // Abrir directamente la página estilo SPACE de un grupo
  const abrirPerfilInstagramGrupo = (idGrupo) => {
    setGrupoInstagramSeleccionado(idGrupo);
    setSeccionActiva('instagram_perfil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarSeccion = (idSeccion) => {
    setSeccionActiva(idSeccion);
    setDrawerMovilAbierto(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-[#1E293B] selection:bg-[#E67A15] selection:text-white font-sans">
      
      {/* Banner de alerta (sesión expirada, etc.) */}
      {mensajeAlerta && (
        <div className="fixed top-0 left-0 right-0 z-[100] p-3 bg-amber-500 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{mensajeAlerta}</span>
          </div>
          <button onClick={() => setMensajeAlerta(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* 1. Sidebar Fijo de Escritorio (ocupa toda la altura) */}
      {!sidebarCerrada && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <SidebarNavegacion
            seccionActiva={seccionActiva}
            cambiarSeccion={cambiarSeccion}
            abrirModalEnviar={() => setModalEnviarAbierto(true)}
            abrirModalRecibir={() => setModalRecibirAbierto(true)}
            abrirModalRecompensas={() => setModalRecompensasAbierto(true)}
            abrirModalRegistro={() => abrirRegistro('visitante')}
          />
        </div>
      )}

      {/* 2. Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Barra Superior de Escritorio: colapsar/expandir la barra lateral */}
        <header className="hidden lg:flex sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCerrada(!sidebarCerrada)}
              aria-label={sidebarCerrada ? "Abrir menú" : "Cerrar menú"}
              className="p-2 rounded-xl bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-colors"
            >
              {sidebarCerrada ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#0A4D9C] border border-[#E67A15]/40 flex items-center justify-center font-black text-white text-xs">
                SL
              </div>
              <div>
                <span className="text-xs font-black text-[#1E293B] uppercase block leading-none">
                  WALLET <span className="text-[#E67A15]">INSAL</span>
                </span>
                <span className="text-[10px] text-[#64748B] font-medium">1° DESARROLLO DE SOFTWARE "B" 2026</span>
              </div>
            </div>
          </div>

          {usuarioActual && (
            <span className="text-xs font-black text-[#E67A15] bg-[#FFF1E6] px-2.5 py-1 rounded-xl border border-[#FFCB99]">
              {usuarioActual.saldoActual?.toFixed(2)} SL - BITS
            </span>
          )}
        </header>

        {/* Barra Superior Móvil */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-sm">
          <div 
            onClick={() => cambiarSeccion('inicio_publico')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#0A4D9C] border border-[#E67A15]/40 flex items-center justify-center font-black text-white text-xs">
              SL
            </div>
            <div>
              <span className="text-xs font-black text-[#1E293B] uppercase block leading-none">
                WALLET <span className="text-[#E67A15]">INSAL</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-medium">1° DESARROLLO DE SOFTWARE 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usuarioActual ? (
              <span className="text-xs font-black text-[#E67A15] bg-[#FFF1E6] px-2.5 py-1 rounded-xl border border-[#FFCB99]">
                {usuarioActual.saldoActual?.toFixed(2)} SL - BITS
              </span>
            ) : (
              <button
                onClick={() => abrirRegistro('visitante')}
                className="text-xs font-bold text-white bg-[#E67A15] hover:bg-[#C8640C] px-4 py-2.5 rounded-xl shadow-md transition-colors min-h-[44px]"
              >
                Acceder / Registrarse
              </button>
            )}

            <button
              onClick={() => setDrawerMovilAbierto(!drawerMovilAbierto)}
              className="p-2 rounded-xl bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0]"
            >
              {drawerMovilAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Menú Lateral Móvil (cajón con fondo oscurecido) */}
        {drawerMovilAbierto && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerMovilAbierto(false)}
            />
            <SidebarNavegacion
              alCerrar={() => setDrawerMovilAbierto(false)}
              seccionActiva={seccionActiva}
              cambiarSeccion={cambiarSeccion}
              abrirModalEnviar={() => {
                setModalEnviarAbierto(true);
                setDrawerMovilAbierto(false);
              }}
              abrirModalRecibir={() => {
                setModalRecibirAbierto(true);
                setDrawerMovilAbierto(false);
              }}
              abrirModalRecompensas={() => {
                setModalRecompensasAbierto(true);
                setDrawerMovilAbierto(false);
              }}
              abrirModalRegistro={() => {
                abrirRegistro('visitante');
                setDrawerMovilAbierto(false);
              }}
            />
          </div>
        )}

        {/* Vistas Dinámicas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* A. Vista Inicio */}
          {seccionActiva === 'inicio_publico' && (
            <InicioPublico
              alAbrirRegistro={() => abrirRegistro('visitante')}
              alAbrirPerfilInstagram={abrirPerfilInstagramGrupo}
              alIrARanking={() => cambiarSeccion('ranking')}
              alIrABilletera={() => cambiarSeccion('wallet_dashboard')}
            />
          )}

          {/* B. Vista Mi Wallet Privada */}
          {seccionActiva === 'wallet_dashboard' && (
            <DashboardPrincipal
              alIrAEstands={() => cambiarSeccion('estands')}
              alIrAHistorial={() => cambiarSeccion('billetera')}
              alIrAPerfil={() => cambiarSeccion('perfil')}
              alAbrirEstand={abrirPerfilInstagramGrupo}
            />
          )}

          {/* C. Vista Muro SPACE / Estands */}
          {seccionActiva === 'estands' && (
            <ListaEstands
              alAbrirRegistro={() => abrirRegistro('visitante')}
              alAbrirPerfilInstagram={abrirPerfilInstagramGrupo}
            />
          )}

          {/* D. Vista SPACE: Perfil del Estand */}
          {seccionActiva === 'instagram_perfil' && (
            <PerfilInstagramGrupo
              idGrupo={grupoInstagramSeleccionado}
              alVolver={() => cambiarSeccion('estands')}
            />
          )}

          {/* E. Vista Ranking Oficial */}
          {seccionActiva === 'ranking' && (
            <TablaPosiciones />
          )}

          {/* F. Vista Mi Billetera */}
          {seccionActiva === 'billetera' && (
            <MiBilletera
              alIrAEstands={() => cambiarSeccion('estands')}
              alIrARecargar={() => setModalEnviarAbierto(true)}
            />
          )}

          {/* G. Vista Historial */}
          {seccionActiva === 'historial' && (
            <MiBilletera
              alIrAEstands={() => cambiarSeccion('estands')}
              alIrARecargar={() => cambiarSeccion('billetera')}
            />
          )}

          {/* H. Vista Perfil Estudiantil */}
          {seccionActiva === 'perfil' && (
            <div className="space-y-10">
              <PerfilUsuario
                alIrABilletera={() => cambiarSeccion('billetera')}
                alIrAEstands={() => cambiarSeccion('estands')}
                alConectarEstand={() => abrirRegistro('accesoGrupo')}
                grupoConectado={grupoActual?.nombreGrupo || null}
              />
              {grupoActual && (
                <PanelGrupo alVerPerfilInstagram={abrirPerfilInstagramGrupo} />
              )}
            </div>
          )}

          {/* J. Vista Administración */}
          {seccionActiva === 'admin' && (
            adminAutenticado ? <PanelAdmin /> : <AccesoAdmin />
          )}

        </main>

        {/* Pie de página institucional en tema claro */}
        <footer className="bg-white border-t border-[#D19E37]/60 py-6 px-4 text-center text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E67A15] flex items-center justify-center text-white font-bold text-xs">
                ⚡
              </div>
              <span className="font-bold text-[#1E293B]">SL - BITS Wallet • Instituto Nacional San Luís</span>
            </div>

            <p className="text-[#64748B] text-xs">
              Formando valores, construimos futuro.
            </p>

            <div className="flex items-center gap-1 text-[#64748B]">
              <span>1° Desarrollo de Software "B" 2026  •  EA Preza Group</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-[#64748B]">v{APP_VERSION}</span>
            </div>
          </div>
        </footer>

      </div>

      {/* MODALES GLOBALES */}
      <ModalEnviarBits
        estaAbierto={modalEnviarAbierto}
        alCerrar={() => setModalEnviarAbierto(false)}
      />

      <ModalRecibirBits
        estaAbierto={modalRecibirAbierto}
        alCerrar={() => setModalRecibirAbierto(false)}
      />

      <ModalRecompensas
        estaAbierto={modalRecompensasAbierto}
        alCerrar={() => setModalRecompensasAbierto(false)}
      />

      <VentanaRegistro
        key={pestanaRegistroInicial}
        estaAbierto={modalRegistroAbierto}
        pestanaInicial={pestanaRegistroInicial}
        alCerrar={() => setModalRegistroAbierto(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProveedorUsuario>
        <ContenidoPrincipal />
      </ProveedorUsuario>
    </ErrorBoundary>
  );
}