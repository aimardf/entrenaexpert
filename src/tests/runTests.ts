import { runAutomatedTestSuite } from './testSuite';

console.log('===============================================================');
console.log(' SPORTEXPERT: SUITE AUTOMATIZADA DE PRUEBAS DEL MOTOR EXPERTO ');
console.log('===============================================================\n');

const startTime = Date.now();
const results = runAutomatedTestSuite();
const durationMs = Date.now() - startTime;

let passedCount = 0;
let failedCount = 0;

results.forEach((test) => {
  const statusSymbol = test.passed ? '✓ PASSED' : '✗ FAILED';
  console.log(`[Test #${test.id.toString().padStart(2, '0')}] ${statusSymbol}: ${test.title}`);
  console.log(`  Categoría:   ${test.category}`);
  console.log(`  Entrada:     ${test.inputDescription}`);
  console.log(`  Esperado:    ${test.expectedOutcome}`);
  console.log(`  Obtenido:    ${test.actualOutcome}`);
  if (test.auditRuleTriggered) {
    console.log(`  Reglas:      ${test.auditRuleTriggered}`);
  }
  console.log('---------------------------------------------------------------');

  if (test.passed) {
    passedCount++;
  } else {
    failedCount++;
  }
});

console.log(`\nResumen de ejecución: ${passedCount} aprobadas, ${failedCount} fallidas de ${results.length} pruebas.`);
console.log(`Tiempo total: ${durationMs}ms`);
console.log('Estado final: ' + (failedCount === 0 ? 'TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO' : 'EXISTEN FALLOS'));

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
