import { Deporte, Zona } from '../types';

export interface PerfilDeporte {
  nombre: string;
  exigencias: string;
  zonasRiesgo: Zona[];
  fuente: string;
  tecnica: string[];
  juego: string;
  resistenciaEspecifica: string;
}

// Hechos sobre cada deporte: exigencias físicas, zonas de lesión frecuentes y contenidos técnicos.
export const DEPORTES: Record<Exclude<Deporte, 'otro'>, PerfilDeporte> = {
  futbol: {
    nombre: 'Fútbol',
    exigencias: 'Esfuerzo intermitente de alta intensidad, sprints repetidos, cambios de dirección y alta demanda aeróbica.',
    zonasRiesgo: ['isquios', 'tobillo', 'rodilla'],
    fuente: 'F23',
    tecnica: ['Rondos 4v1 / 5v2', 'Conducción y pase en circuito', 'Finalización tras pase'],
    juego: 'Juego reducido 4v4 con porterías',
    resistenciaEspecifica: 'Juego reducido 4v4 en espacio grande (series de 4 min)',
  },
  baloncesto: {
    nombre: 'Baloncesto',
    exigencias: 'Esfuerzos intermitentes, saltos repetidos, aceleraciones cortas y cambios de dirección.',
    zonasRiesgo: ['tobillo', 'rodilla'],
    fuente: 'F24',
    tecnica: ['Bote con ambas manos y entradas', 'Tiro: forma y tiro tras bote', 'Posición defensiva 1v1'],
    juego: 'Juego 3v3 a medio campo',
    resistenciaEspecifica: 'Juego 3v3 continuo (series de 3 min)',
  },
  voleibol: {
    nombre: 'Voleibol',
    exigencias: 'Saltos verticales repetidos, acciones explosivas cortas y gestos por encima de la cabeza.',
    zonasRiesgo: ['tobillo', 'rodilla', 'hombro'],
    fuente: 'F26',
    tecnica: ['Recepción de antebrazos', 'Colocación', 'Ataque y bloqueo con control de saltos'],
    juego: 'Situaciones 6v6 con rotación',
    resistenciaEspecifica: 'Circuito intermitente de desplazamientos defensivos (series de 30 s)',
  },
  balonmano: {
    nombre: 'Balonmano',
    exigencias: 'Sprints, contactos, cambios de dirección y lanzamientos por encima de la cabeza.',
    zonasRiesgo: ['rodilla', 'hombro', 'tobillo'],
    fuente: 'F27',
    tecnica: ['Pase y recepción en carrera', 'Lanzamiento (volumen controlado)', 'Defensa 1v1 y desplazamientos'],
    juego: 'Contraataque 3v2 y juego reducido',
    resistenciaEspecifica: 'Contraataques continuos 3v2 (series de 3 min)',
  },
  tenis: {
    nombre: 'Tenis',
    exigencias: 'Esfuerzos intermitentes de 5–10 s, desplazamientos laterales y golpeos por encima de la cabeza.',
    zonasRiesgo: ['hombro', 'espalda'],
    fuente: 'F25',
    tecnica: ['Peloteo de fondo dirigido', 'Saque (volumen controlado)', 'Juego de pies lateral'],
    juego: 'Puntos dirigidos con objetivos tácticos',
    resistenciaEspecifica: 'Ejercicios de canasta (15–20 s de trabajo / 20–30 s de pausa)',
  },
};

export const NOMBRE_DEPORTE = (d?: Deporte, otro?: string) =>
  d === 'otro' ? otro?.trim() || 'Otro deporte' : d ? DEPORTES[d].nombre : '—';

export const NOMBRE_ZONA: Record<Zona, string> = {
  rodilla: 'rodilla',
  tobillo: 'tobillo',
  hombro: 'hombro',
  espalda: 'espalda baja',
  isquios: 'isquiotibiales',
};

// Ejercicios preventivos por zona (hechos de la base de conocimiento).
export const PREVENTIVO_ZONA: Record<Zona, { ejercicio: string; regla: string }> = {
  isquios: { ejercicio: 'Nórdico de isquiotibiales: 2–3 series de 5–8 repeticiones', regla: 'P02' },
  tobillo: { ejercicio: 'Equilibrio monopodal y sobre superficie inestable: 3 × 30 s por pierna', regla: 'P03' },
  rodilla: { ejercicio: 'Aterrizajes controlados y cambios de dirección con rodilla alineada: 3 × 6', regla: 'P04' },
  hombro: { ejercicio: 'Rotación externa con goma, Y-T-W escapulares y movilidad torácica: 2–3 × 10–12', regla: 'P05' },
  espalda: { ejercicio: 'Core antiextensión y antirrotación (plancha, Pallof press): 3 × 20–30 s', regla: 'P06' },
};

export const ID_REGLA_DEPORTE: Record<Exclude<Deporte, 'otro'>, string> = {
  futbol: 'C10',
  baloncesto: 'C11',
  voleibol: 'C12',
  balonmano: 'C13',
  tenis: 'C14',
};
