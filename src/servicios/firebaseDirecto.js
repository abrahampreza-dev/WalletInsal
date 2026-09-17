const FIREBASE_URL = "https://walletinsals-default-rtdb.firebaseio.com";

export async function firebaseLeer(ruta) {
  const resp = await fetch(`${FIREBASE_URL}/${ruta}.json`);
  if (!resp.ok) throw new Error(`Firebase read error: ${resp.status}`);
  return resp.json();
}

export async function firebaseEscribir(ruta, datos) {
  const resp = await fetch(`${FIREBASE_URL}/${ruta}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!resp.ok) throw new Error(`Firebase write error: ${resp.status}`);
  return resp.json();
}

export async function firebasePATCH(ruta, datos) {
  const resp = await fetch(`${FIREBASE_URL}/${ruta}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!resp.ok) throw new Error(`Firebase PATCH error: ${resp.status}`);
  return resp.json();
}
