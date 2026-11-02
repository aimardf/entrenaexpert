import { Bloque, Hechos, Sesion, TipoSesion } from '../types';
import { DEPORTES, ID_REGLA_DEPORTE } from '../knowledge/deportes';

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Días de entrenamiento según el número de sesiones (0 = lunes). El domingo queda libre
// (descanso o partido), de modo que siempre hay al menos un día de descanso semanal.
export const PATRONES: Record<number, number[]> = {
  1: [2],
  2: [1, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

// En competición (partido el domingo) el último día de entrenamiento es el sábado, para la activación.
export const PATRONES_COMPETICION: Record<number, number[]> = {
  1: [2],
  2: [2, 5],
  3: [1, 3, 5],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

export const patron = (n: number, competicion: boolean) => (competicion ? PATRONES_COMPETICION : PATRONES)[n] ?? [];

const esFuerza = (t: TipoSesion) => t === 'fuerza' || t === 'combinada';

/** Máximo de sesiones de fuerza que caben en el patrón dejando ≥48 h entre ellas (y nunca la víspera del partido). */
export function maxNoConsecutivos(n: number, competicion = false): number {
  const dias = patron(n, competicion).filter((d) => !(competicion && n >= 2 && d === 5));
  let ultimo = -10;
  let cuenta = 0;
  for (const d of dias) {
    if (d - ultimo >= 2) {
      cuenta++;
      ultimo = d;
    }
  }
  return cuenta;
}

/** Regla PL01: compone la lista de sesiones de la semana a partir de los hechos derivados. */
export function componerSesiones(h: Hechos): { lista: TipoSesion[]; descartadas: TipoSesion[]; fusionadas: number } {
  const n = h.diasEfectivos!;
  const lista: TipoSesion[] = ['tecnica'];
  for (let i = 0; i < h.sesionesFuerza!; i++) lista.push('fuerza');
  for (const o of h.objetivosPriorizados ?? []) {
    if (o === 'resistencia') lista.push('resistencia');
    if (o === 'velocidad') lista.push('velocidad');
    if (o === 'tecnica') lista.push('tecnica');
  }
  for (const e of h.sesionesExtra ?? []) {
    if (e === 'tecnica' || !lista.includes(e)) lista.push(e);
  }

  // Si sobran sesiones: primero se fusiona fuerza con técnica, después se descarta lo menos prioritario.
  let fusionadas = 0;
  while (lista.length > n && lista.includes('fuerza') && lista.includes('tecnica')) {
    lista.splice(lista.indexOf('fuerza'), 1);
    lista.splice(lista.indexOf('tecnica'), 1);
    lista.push('combinada');
    fusionadas++;
  }
  const ordenDescarte: TipoSesion[] = ['recuperacion', 'activacion', 'tecnica', 'velocidad', 'resistencia', 'fuerza'];
  const descartadas: TipoSesion[] = [];
  for (const t of ordenDescarte) {
    while (lista.length > n && lista.includes(t) && !(t === 'tecnica' && lista.filter((x) => x === 'tecnica' || x === 'combinada').length <= 1)) {
      lista.splice(lista.lastIndexOf(t), 1);
      descartadas.push(t);
    }
  }

  // Si faltan sesiones: se rellena con práctica específica y recuperación activa.
  const relleno: TipoSesion[] = ['tecnica', 'recuperacion'];
  let i = 0;
  while (lista.length < n) {
    lista.push(relleno[i % relleno.length]);
    i++;
  }
  return { lista, descartadas, fusionadas };
}

/** Regla PL02: coloca las sesiones en los días respetando 48 h entre fuerza y el microciclo de competición. */
export function distribuir(h: Hechos, lista: TipoSesion[]): { tipos: (TipoSesion | null)[]; convertidas: number } {
  const n = h.diasEfectivos!;
  const comp = h.periodo === 'competicion';
  const slots = [...patron(n, comp)];
  const asignado: (TipoSesion | null)[] = Array(7).fill(null);
  const pendientes = [...lista];
  const tomar = (t: TipoSesion) => {
    const i = pendientes.indexOf(t);
    if (i >= 0) pendientes.splice(i, 1);
    return i >= 0;
  };
  const libres = () => slots.filter((s) => asignado[s] === null);

  if (comp && tomar('activacion')) asignado[Math.max(...slots)] = 'activacion';
  if (comp && n >= 4 && slots.includes(0) && pendientes.includes('recuperacion')) {
    tomar('recuperacion');
    asignado[0] = 'recuperacion';
  }

  let convertidas = 0;
  const fuerzas = pendientes.filter(esFuerza);
  for (const f of fuerzas) {
    tomar(f);
    const ocupadosFuerza = asignado.map((t, i) => (t && esFuerza(t) ? i : -1)).filter((i) => i >= 0);
    const hueco = libres().find((s) => ocupadosFuerza.every((o) => Math.abs(o - s) >= 2) && !(comp && n >= 2 && s === 5));
    if (hueco !== undefined) asignado[hueco] = f;
    else {
      pendientes.push('tecnica');
      convertidas++;
    }
  }

  const orden: TipoSesion[] = ['velocidad', 'resistencia', 'tecnica', 'recuperacion', 'activacion'];
  pendientes.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
  for (const t of pendientes) {
    const s = libres()[0];
    if (s !== undefined) asignado[s] = t;
  }
  for (let d = 0; d < 7; d++) {
    if (asignado[d] === null) asignado[d] = comp && d === 6 ? 'partido' : 'descanso';
  }
  return { tipos: asignado, convertidas };
}

const r5 = (x: number) => Math.max(5, Math.round(x / 5) * 5);

const TITULOS: Record<TipoSesion, string> = {
  tecnica: 'Técnica y táctica específica',
  fuerza: 'Fuerza y prevención',
  combinada: 'Técnica + fuerza (sesión combinada)',
  resistencia: 'Resistencia específica (interválico)',
  velocidad: 'Velocidad y agilidad',
  recuperacion: 'Recuperación activa y movilidad',
  activacion: 'Activación previa al partido',
  partido: 'Partido / competición',
  descanso: 'Descanso',
};

/** Regla PL03: dimensiona cada sesión en bloques según los minutos disponibles. */
export function construirSesion(h: Hechos, tipo: TipoSesion, dia: number): Sesion {
  const m = h.minutos ?? 60;
  const perfil = h.deporte && h.deporte !== 'otro' ? DEPORTES[h.deporte] : undefined;
  const cal = m <= 30 ? 10 : m <= 45 ? 15 : 20;
  const vc = m >= 60 ? 10 : 5;
  const main = m - cal - vc;
  const calentamiento: Bloque = { nombre: 'Calentamiento preventivo', minutos: cal, contenido: [h.calentamiento ?? ''] };
  const vuelta: Bloque = { nombre: 'Vuelta a la calma', minutos: vc, contenido: ['Carrera suave y movilidad de las zonas trabajadas'] };
  const contactos = Math.round((h.contactosPliometria ?? 0) * (h.factorPliometria ?? 1));
  const pres = h.presFuerza;
  const lineaFuerza = pres ? `${pres.series} × ${pres.repeticiones} · ${pres.intensidad} · descanso ${pres.descanso}` : '';
  const tecnica = perfil?.tecnica ?? ['Práctica técnica del propio deporte guiada por el entrenador'];
  const juego = perfil?.juego ?? 'Situaciones reales de juego o competición';
  const prev = h.preventivos?.length ? h.preventivos : ['Movilidad general y core'];
  const reglasCal = [h.deporte === 'futbol' ? 'P01' : h.deporte === 'otro' ? 'P09' : 'P07'];

  let bloques: Bloque[] = [];
  let reglas: string[] = [];
  switch (tipo) {
    case 'tecnica':
      bloques = [
        calentamiento,
        { nombre: 'Técnica específica', minutos: r5(main * 0.6), contenido: tecnica },
        { nombre: 'Juego aplicado', minutos: r5(main * 0.4), contenido: [juego] },
        vuelta,
      ];
      reglas = [...reglasCal, h.deporte && h.deporte !== 'otro' ? ID_REGLA_DEPORTE[h.deporte] : 'V06'];
      break;
    case 'fuerza': {
      const conPlio = contactos > 0;
      bloques = [
        calentamiento,
        { nombre: 'Fuerza', minutos: r5(main * (conPlio ? 0.6 : 0.75)), contenido: [...(h.ejerciciosFuerza ?? []), lineaFuerza] },
        ...(conPlio
          ? [{ nombre: 'Pliometría', minutos: r5(main * 0.2), contenido: [`${contactos} contactos por sesión`, h.presPliometria ?? ''] }]
          : []),
        { nombre: 'Bloque preventivo', minutos: r5(main * (conPlio ? 0.2 : 0.25)), contenido: prev },
        vuelta,
      ];
      reglas = [...reglasCal, 'L03', h.grupoEdad === 'joven' ? 'L05' : h.grupoEdad === 'mayor' ? 'L06' : 'L04', 'L07', ...(h.reglasPreventivas ?? [])];
      break;
    }
    case 'combinada':
      bloques = [
        calentamiento,
        { nombre: 'Técnica específica', minutos: r5(main * 0.5), contenido: tecnica.slice(0, 2) },
        { nombre: 'Fuerza (2–3 ejercicios principales)', minutos: r5(main * 0.35), contenido: [...(h.ejerciciosFuerza ?? []).slice(0, 3), lineaFuerza] },
        { nombre: 'Bloque preventivo', minutos: r5(main * 0.15), contenido: prev.slice(0, 2) },
        vuelta,
      ];
      reglas = [...reglasCal, 'L03', 'PL01'];
      break;
    case 'resistencia':
      bloques = [
        calentamiento,
        {
          nombre: 'Trabajo interválico',
          minutos: r5(main),
          contenido: [perfil?.resistenciaEspecifica ?? 'Intervalos en el gesto del propio deporte', h.presAerobica ?? ''],
        },
        vuelta,
      ];
      reglas = [...reglasCal, 'L08'];
      break;
    case 'velocidad':
      bloques = [
        calentamiento,
        { nombre: 'Técnica de carrera', minutos: r5(main * 0.25), contenido: ['Skipping, talones, arrastres y aceleraciones progresivas'] },
        { nombre: 'Velocidad y cambios de dirección', minutos: r5(main * 0.75), contenido: [h.presVelocidad ?? ''] },
        vuelta,
      ];
      reglas = [...reglasCal, 'L09'];
      break;
    case 'recuperacion':
      bloques = [
        { nombre: 'Movilidad', minutos: r5(m * 0.35), contenido: ['Movilidad articular de cadera, tobillo, columna torácica y hombro'] },
        { nombre: 'Aeróbico suave', minutos: r5(m * 0.4), contenido: ['Carrera, bici o piscina a intensidad conversacional (RPE 3–4)'] },
        { nombre: 'Bloque preventivo', minutos: r5(m * 0.25), contenido: prev },
      ];
      reglas = ['PL01', ...(h.periodo === 'competicion' ? ['L11'] : h.periodo === 'fuera_temporada' ? ['L12'] : []), ...(h.objetivosPriorizados?.includes('prevencion') ? ['P08'] : [])];
      break;
    case 'activacion': {
      const t = Math.min(m, 45);
      bloques = [
        { nombre: 'Calentamiento', minutos: 15, contenido: [h.calentamiento ?? ''] },
        { nombre: 'Técnica ligera', minutos: r5((t - 15) * 0.6), contenido: tecnica.slice(0, 2) },
        { nombre: 'Activación', minutos: r5((t - 15) * 0.4), contenido: ['3–4 aceleraciones de 10 m con recuperación completa', 'Acciones a balón parado / estrategia'] },
      ];
      reglas = ['L11'];
      break;
    }
    case 'partido':
      bloques = [{ nombre: 'Competición', minutos: 0, contenido: ['Partido. Al día siguiente, recuperación activa o descanso.'] }];
      reglas = ['L11'];
      break;
    case 'descanso':
      bloques = [];
      reglas = ['L01'];
      break;
  }
  return { dia: DIAS[dia], tipo, titulo: TITULOS[tipo], bloques, reglas };
}
