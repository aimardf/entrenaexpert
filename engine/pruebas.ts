import { CasoPrueba } from '../knowledge/casosPrueba';
import { Resultado } from '../types';
import { inferir } from './motor';

export interface ResultadoPrueba {
  caso: CasoPrueba;
  superada: boolean;
  fallos: string[];
  resultado: Resultado;
  obtenidoTexto: string;
}

/** Ejecuta un caso y compara lo obtenido con lo esperado. */
export function ejecutarCaso(caso: CasoPrueba): ResultadoPrueba {
  const resultado = inferir(caso.entrada);
  const { hechos, traza, mensajes } = resultado;
  const disparadas = traza.map((p) => p.regla);
  const tipos = (hechos.semana ?? []).map((s) => s.tipo);
  const e = caso.esperado;
  const fallos: string[] = [];

  if (hechos.estado !== e.estado) fallos.push(`estado: esperado ${e.estado}, obtenido ${hechos.estado}`);
  for (const r of e.disparan ?? []) if (!disparadas.includes(r)) fallos.push(`no se disparó ${r}`);
  for (const r of e.noDisparan ?? []) if (disparadas.includes(r)) fallos.push(`se disparó ${r} y no debía`);
  if (e.diasEfectivos !== undefined && hechos.diasEfectivos !== e.diasEfectivos)
    fallos.push(`días: esperado ${e.diasEfectivos}, obtenido ${hechos.diasEfectivos}`);
  if (e.sesionesFuerza !== undefined && hechos.sesionesFuerza !== e.sesionesFuerza)
    fallos.push(`sesiones de fuerza: esperado ${e.sesionesFuerza}, obtenido ${hechos.sesionesFuerza}`);
  for (const t of e.tiposIncluyen ?? []) if (!tipos.includes(t)) fallos.push(`falta sesión de tipo ${t}`);
  for (const t of e.tiposExcluyen ?? []) if (tipos.includes(t)) fallos.push(`sobra sesión de tipo ${t}`);
  for (const [dia, t] of Object.entries(e.diaTipo ?? {})) {
    const s = hechos.semana?.find((x) => x.dia === dia);
    if (s?.tipo !== t) fallos.push(`${dia}: esperado ${t}, obtenido ${s?.tipo ?? '—'}`);
  }
  if (e.mensajeContiene && !mensajes.some((m) => m.texto.includes(e.mensajeContiene!)))
    fallos.push(`ningún mensaje contiene «${e.mensajeContiene}»`);

  // Invariante de seguridad: si hay plan, nunca dos sesiones de fuerza en días consecutivos.
  const fuerzaDias = tipos.map((t, i) => (t === 'fuerza' || t === 'combinada' ? i : -1)).filter((i) => i >= 0);
  for (let i = 1; i < fuerzaDias.length; i++)
    if (fuerzaDias[i] - fuerzaDias[i - 1] < 2) fallos.push('dos sesiones de fuerza en días consecutivos');

  const plan = hechos.semana
    ? hechos.semana.filter((s) => s.tipo !== 'descanso').map((s) => `${s.dia.slice(0, 3)}: ${s.tipo}`).join(', ')
    : 'sin plan';
  const obtenidoTexto = `estado=${hechos.estado}; días=${hechos.diasEfectivos ?? '—'}; fuerza=${hechos.sesionesFuerza ?? '—'}; ${plan}`;
  return { caso, superada: fallos.length === 0, fallos, resultado, obtenidoTexto };
}
