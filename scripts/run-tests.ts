// Ejecuta la batería de casos de prueba en consola: `npm test`.
import { CASOS } from '../knowledge/casosPrueba';
import { ejecutarCaso } from '../engine/pruebas';
import { barridoExhaustivo } from '../engine/barrido';

let fallidas = 0;
for (const caso of CASOS) {
  const r = ejecutarCaso(caso);
  console.log(`${r.superada ? '✔' : '✘'} ${caso.id} [${caso.tipo}] ${caso.nombre}`);
  console.log(`   esperado: ${caso.esperadoTexto}`);
  console.log(`   obtenido: ${r.obtenidoTexto}`);
  console.log(`   reglas:   ${r.resultado.traza.map((p) => p.regla).join(' → ')}`);
  if (!r.superada) {
    fallidas++;
    r.fallos.forEach((f) => console.log(`   FALLO: ${f}`));
  }
}
console.log(`\n${CASOS.length - fallidas}/${CASOS.length} casos superados`);

const barrido = barridoExhaustivo();
console.log(`Barrido exhaustivo: ${barrido.total} combinaciones, ${barrido.errores.length} con errores`);
barrido.errores.slice(0, 10).forEach((e) => console.log(`   ${e}`));
process.exit(fallidas || barrido.errores.length ? 1 : 0);
