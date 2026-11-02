import { Entrada, Hechos, Mensaje, PasoTraza, Regla, Resultado } from '../types';
import { REGLAS } from '../knowledge/reglas';

const MAX_CICLOS = 200;

/**
 * Motor de inferencia por encadenamiento hacia delante.
 * Ciclo reconocer-actuar: 1) se calcula la agenda (reglas cuya condición se cumple y que no se han
 * disparado aún: refracción), 2) se resuelve el conflicto eligiendo la de mayor prioridad,
 * 3) se ejecuta su acción sobre la memoria de trabajo y se registra en la traza.
 * Termina cuando la agenda queda vacía o una regla ordena detenerse.
 */
export function inferir(entrada: Entrada, reglas: Regla[] = REGLAS): Resultado {
  const hechos: Hechos = JSON.parse(JSON.stringify(entrada));
  const traza: PasoTraza[] = [];
  const mensajes: Mensaje[] = [];
  const disparadas = new Set<string>();
  let detenido = false;

  for (let ciclo = 0; ciclo < MAX_CICLOS && !detenido; ciclo++) {
    const agenda = reglas.filter((r) => !disparadas.has(r.id) && r.si(hechos));
    if (agenda.length === 0) break;
    const regla = agenda.reduce((a, b) => (b.prioridad > a.prioridad ? b : a));

    const antes = JSON.stringify(hechos);
    const previo: Hechos = JSON.parse(antes);
    regla.entonces(hechos, {
      avisar: (gravedad, texto) => mensajes.push({ gravedad, texto, regla: regla.id }),
      detener: () => {
        detenido = true;
      },
    });
    disparadas.add(regla.id);

    const nuevos = Object.keys(hechos).filter(
      (k) => JSON.stringify((hechos as Record<string, unknown>)[k]) !== JSON.stringify((previo as Record<string, unknown>)[k]),
    );
    traza.push({ orden: traza.length + 1, regla: regla.id, nombre: regla.nombre, categoria: regla.categoria, hechosNuevos: nuevos });
  }

  return { hechos, traza, mensajes, detenido };
}
