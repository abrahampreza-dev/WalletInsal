export const CARRERAS_INSTITUTO = [
  'Bachillerato General',
  'Bachillerato Técnico Vocacional en Desarrollo de Software',
  'Bachillerato Técnico Vocacional en Diseño Gráfico',
  'Bachillerato Técnico Vocacional Administrativo Contable',
  'Bachillerato Técnico Productivo en Salud y Bienestar Social',
  'Bachillerato Técnico Productivo en Sistemas Eléctricos y Energías Renovables',
  'Bachillerato Técnico Productivo en Logística Comercial y Global'
];

const CARRERA_EQUIVALENTE = {
  'Desarrollo de Software': CARRERAS_INSTITUTO[1],
  'Diseño Gráfico': CARRERAS_INSTITUTO[2],
  'Sistemas Eléctricos': CARRERAS_INSTITUTO[5],
  'Salud': CARRERAS_INSTITUTO[4],
  'Logistica y Aduanas': CARRERAS_INSTITUTO[6],
  'Logística y Aduanas': CARRERAS_INSTITUTO[6],
  'Contable': CARRERAS_INSTITUTO[3],
  'Mecatrónica y Robótica': CARRERAS_INSTITUTO[5]
};

export function normalizarCarrera(carrera) {
  return CARRERA_EQUIVALENTE[carrera] || carrera || CARRERAS_INSTITUTO[0];
}
