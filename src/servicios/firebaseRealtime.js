import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const firebaseConfig = {
  databaseURL: "https://walletinsals-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig, 'walletinsals-saldo');
const db = getDatabase(app);

/**
 * Escucha el saldo de un usuario en tiempo real.
 * 1 listener = 1 conexión WebSocket eficiente.
 * Solo se activa cuando el valor CAMBIA, no cada N segundos.
 * 
 * @param {string} idUsuario 
 * @param {function} callback - recibe el saldoActual
 * @returns {function} unsubscribe - llama para desconectar
 */
export function escucharSaldoUsuario(idUsuario, callback) {
  if (!idUsuario) return () => {};
  const saldoRef = ref(db, `usuarios/${idUsuario}/saldoActual`);
  
  const unsubscribe = onValue(saldoRef, (snapshot) => {
    const saldo = snapshot.val();
    if (saldo !== null && saldo !== undefined) {
      callback(Number(saldo));
    }
  }, (error) => {
    console.error("Error en listener de saldo:", error);
  });

  return () => off(saldoRef, 'value', unsubscribe);
}

/**
 * Escucha los grupos en tiempo real (para la página pública).
 * Solo cuando hay cambios en los datos de grupos.
 */
export function escucharGrupos(callback) {
  const gruposRef = ref(db, 'grupos');
  
  const unsubscribe = onValue(gruposRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(Object.values(data));
    }
  }, (error) => {
    console.error("Error en listener de grupos:", error);
  });

  return () => off(gruposRef, 'value', unsubscribe);
}
