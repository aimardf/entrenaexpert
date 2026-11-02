import { Deporte, Entrada, Nivel, Objetivo, Periodo } from '../types';
import { inferir } from './motor';

const DEPORTES: Deporte[] = ['futbol', 'baloncesto', 'voleibol', 'balonmano', 'tenis', 'otro'];
const NIVELES: Nivel[] = ['principiante', 'intermedio', 'avanzado'];
const PERIODOS: Periodo[] = ['pretemporada', 'competicion', 'fuera_temporada'];
const OBJETIVOS: Objetivo[] = ['resistencia', 'fuerza', 'velocidad', 'tecnica', 'prevencion'];

/**
 * Recorre todas las combinaciones válidas de entrada y comprueba invariantes del plan:
 * estado válido, 7 días, nº de días de entrenamiento = días efectivos, ≥48 h entre fuerza,
 * nunca fuerza la víspera del partido y siempre al menos un día sin entrenar.
 */
export function barridoExhaustivo(): { total: number; errores: string[] } {
  const errores: string[] = [];
  let total = 0;
  const pares: Objetivo[][] = [];
  OBJETIVOS.forEach((a, i) => {
    pares.push([a]);
    OBJETIVOS.slice(i + 1).forEach((b) => pares.push([a, b]));
  });
  for (const deporte of DEPORTES)
    for (const nivel of NIVELES)
      for (const periodo of PERIODOS)
        for (const objetivos of pares)
          for (let dias = 1; dias <= 7; dias++)
            for (const edad of [14, 30, 70])
              for (const minutos of [30, 60, 90]) {
                total++;
                const entrada: Entrada = { deporte, nivel, periodo, objetivos, dias, edad, minutos, gimnasio: dias % 2 === 0, sinLesiones: true, molestias: [], dolorAgudo: false, parqRiesgo: false };
                const id = `${deporte}/${nivel}/${periodo}/${objetivos.join('+')}/${dias}d/${edad}a/${minutos}min`;
                try {
                  const { hechos } = inferir(entrada);
                  const semana = hechos.semana;
                  if (hechos.estado !== 'ok' || !semana || !hechos.planListo) {
                    errores.push(`${id}: sin plan`);
                    continue;
                  }
                  const tipos = semana.map((s) => s.tipo);
                  const entreno = tipos.filter((t) => t !== 'descanso' && t !== 'partido').length;
                  if (semana.length !== 7) errores.push(`${id}: la semana no tiene 7 días`);
                  if (entreno !== hechos.diasEfectivos) errores.push(`${id}: ${entreno} sesiones para ${hechos.diasEfectivos} días`);
                  if (!tipos.some((t) => t === 'descanso' || t === 'partido')) errores.push(`${id}: sin día libre`);
                  const f = tipos.map((t, i) => (t === 'fuerza' || t === 'combinada' ? i : -1)).filter((i) => i >= 0);
                  for (let i = 1; i < f.length; i++) if (f[i] - f[i - 1] < 2) errores.push(`${id}: fuerza en días consecutivos`);
                  if (periodo === 'competicion' && (tipos[5] === 'fuerza' || tipos[5] === 'combinada')) errores.push(`${id}: fuerza la víspera del partido`);
                  for (const s of semana) {
                    const suma = s.bloques.reduce((a, b) => a + b.minutos, 0);
                    if (['tecnica', 'fuerza', 'resistencia', 'velocidad', 'combinada'].includes(s.tipo) && Math.abs(suma - minutos) > 10)
                      errores.push(`${id}: ${s.dia} suma ${suma} min de ${minutos}`);
                  }
                } catch (e) {
                  errores.push(`${id}: excepción ${(e as Error).message}`);
                }
              }
  return { total, errores };
}
