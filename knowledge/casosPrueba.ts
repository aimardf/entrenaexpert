import { Entrada, Hechos, TipoSesion } from '../types';

export interface CasoPrueba {
  id: string;
  tipo: 'Habitual' | 'Difícil';
  nombre: string;
  entrada: Entrada;
  esperadoTexto: string;
  esperado: {
    estado: Hechos['estado'];
    disparan?: string[];
    noDisparan?: string[];
    diasEfectivos?: number;
    sesionesFuerza?: number;
    tiposIncluyen?: TipoSesion[];
    tiposExcluyen?: TipoSesion[];
    mensajeContiene?: string;
    diaTipo?: Record<string, TipoSesion>;
  };
}

const base: Entrada = { sinLesiones: true, molestias: [], dolorAgudo: false, parqRiesgo: false, gimnasio: true, minutos: 60 };

// Batería de pruebas reproducible: se ejecuta en la pestaña «Pruebas» y con `npm test`.
export const CASOS: CasoPrueba[] = [
  {
    id: 'H01',
    tipo: 'Habitual',
    nombre: 'Futbolista adulto intermedio en pretemporada',
    entrada: { ...base, deporte: 'futbol', edad: 24, nivel: 'intermedio', objetivos: ['resistencia', 'velocidad'], dias: 4, periodo: 'pretemporada' },
    esperadoTexto: 'Plan de 4 días con FIFA 11+, nórdicos (isquios), 2 sesiones de fuerza separadas ≥48 h, sesión de resistencia y de velocidad.',
    esperado: { estado: 'ok', disparan: ['C02', 'C10', 'P01', 'P02', 'L04', 'L10', 'PL02'], diasEfectivos: 4, sesionesFuerza: 2, tiposIncluyen: ['resistencia', 'velocidad'] },
  },
  {
    id: 'H02',
    tipo: 'Habitual',
    nombre: 'Jugadora de baloncesto de 16 años en competición',
    entrada: { ...base, deporte: 'baloncesto', edad: 16, nivel: 'principiante', objetivos: ['tecnica', 'fuerza'], dias: 3, periodo: 'competicion' },
    esperadoTexto: 'Grupo joven: fuerza técnica y supervisada (L05). Competición: fuerza limitada a 2, partido el domingo y activación el día previo.',
    esperado: { estado: 'ok', disparan: ['C01', 'C11', 'L05', 'L11', 'P07'], noDisparan: ['L04'], diasEfectivos: 3, sesionesFuerza: 2, tiposIncluyen: ['partido', 'activacion'], diaTipo: { Sábado: 'activacion' } },
  },
  {
    id: 'H03',
    tipo: 'Habitual',
    nombre: 'Voleibol avanzado con molestia de hombro',
    entrada: { ...base, deporte: 'voleibol', edad: 27, nivel: 'avanzado', objetivos: ['fuerza', 'velocidad'], dias: 5, periodo: 'fuera_temporada', sinLesiones: false, molestias: ['hombro'] },
    esperadoTexto: 'Adaptación de hombro (sin press por encima de la cabeza, press landmine), preventivo de hombro y 3 sesiones de fuerza.',
    esperado: { estado: 'ok', disparan: ['C12', 'A03', 'P05', 'A07', 'L12'], diasEfectivos: 5, sesionesFuerza: 3 },
  },
  {
    id: 'H04',
    tipo: 'Habitual',
    nombre: 'Tenista de 40 años sin gimnasio',
    entrada: { ...base, deporte: 'tenis', edad: 40, nivel: 'intermedio', objetivos: ['resistencia', 'prevencion'], dias: 3, periodo: 'fuera_temporada', gimnasio: false },
    esperadoTexto: 'Ejercicios con peso corporal y gomas (A06), preventivos de hombro y espalda, calentamiento neuromuscular con hombro.',
    esperado: { estado: 'ok', disparan: ['C14', 'A06', 'P05', 'P06', 'P07', 'P08'], noDisparan: ['A07'], diasEfectivos: 3 },
  },
  {
    id: 'H05',
    tipo: 'Habitual',
    nombre: 'Balonmano en competición con molestia de rodilla',
    entrada: { ...base, deporte: 'balonmano', edad: 22, nivel: 'intermedio', objetivos: ['fuerza'], dias: 4, periodo: 'competicion', sinLesiones: false, molestias: ['rodilla'] },
    esperadoTexto: 'Pliometría reducida al 50 % (50 contactos), fuerza limitada a 2 por competición, recuperación el lunes y activación el sábado.',
    esperado: { estado: 'ok', disparan: ['C13', 'A01', 'P04', 'L11'], sesionesFuerza: 2, tiposIncluyen: ['recuperacion', 'activacion', 'partido'], diaTipo: { Lunes: 'recuperacion', Sábado: 'activacion', Domingo: 'partido' } },
  },
  {
    id: 'H06',
    tipo: 'Habitual',
    nombre: 'Persona de 67 años que juega al fútbol caminando',
    entrada: { ...base, deporte: 'futbol', edad: 67, nivel: 'principiante', objetivos: ['fuerza', 'prevencion'], dias: 3, periodo: 'fuera_temporada' },
    esperadoTexto: 'Grupo mayor: fuerza moderada, equilibrio añadido, sin pliometría de alto impacto.',
    esperado: { estado: 'ok', disparan: ['C03', 'L06', 'P01'], noDisparan: ['L04', 'L05'], diasEfectivos: 3 },
  },
  {
    id: 'D01',
    tipo: 'Difícil',
    nombre: 'Datos incompletos (sin edad ni días)',
    entrada: { ...base, deporte: 'futbol', nivel: 'intermedio', objetivos: ['fuerza'] },
    esperadoTexto: 'No genera plan e indica que faltan edad y días disponibles.',
    esperado: { estado: 'incompleto', disparan: ['V01'], noDisparan: ['PL01'], mensajeContiene: 'edad, días disponibles' },
  },
  {
    id: 'D02',
    tipo: 'Difícil',
    nombre: 'Contradicción: «sin lesiones» y molestia de tobillo',
    entrada: { ...base, deporte: 'baloncesto', edad: 20, nivel: 'intermedio', objetivos: ['fuerza'], dias: 3, sinLesiones: true, molestias: ['tobillo'] },
    esperadoTexto: 'Detecta la contradicción y pide aclararla; no genera plan.',
    esperado: { estado: 'contradiccion', disparan: ['V02'], noDisparan: ['PL01'] },
  },
  {
    id: 'D03',
    tipo: 'Difícil',
    nombre: 'Cribado médico positivo (PAR-Q+)',
    entrada: { ...base, deporte: 'tenis', edad: 55, nivel: 'principiante', objetivos: ['resistencia'], dias: 3, parqRiesgo: true },
    esperadoTexto: 'Bloquea el plan y recomienda valoración médica.',
    esperado: { estado: 'bloqueado', disparan: ['S01'], noDisparan: ['V00', 'PL01'], mensajeContiene: 'médico' },
  },
  {
    id: 'D04',
    tipo: 'Difícil',
    nombre: 'Dolor agudo actual',
    entrada: { ...base, deporte: 'futbol', edad: 19, nivel: 'avanzado', objetivos: ['velocidad'], dias: 5, dolorAgudo: true },
    esperadoTexto: 'Bloquea el plan y deriva a fisioterapeuta o médico deportivo.',
    esperado: { estado: 'bloqueado', disparan: ['S02'], noDisparan: ['PL01'], mensajeContiene: 'fisioterapeuta' },
  },
  {
    id: 'D05',
    tipo: 'Difícil',
    nombre: 'Principiante que quiere entrenar 7 días',
    entrada: { ...base, deporte: 'baloncesto', edad: 30, nivel: 'principiante', objetivos: ['fuerza', 'resistencia'], dias: 7, periodo: 'fuera_temporada' },
    esperadoTexto: 'Combinación incompatible: reduce a 4 días y avisa del motivo.',
    esperado: { estado: 'ok', disparan: ['L01'], diasEfectivos: 4, mensajeContiene: 'máximo recomendado es 4' },
  },
  {
    id: 'D06',
    tipo: 'Difícil',
    nombre: 'Niño de 9 años',
    entrada: { ...base, deporte: 'futbol', edad: 9, nivel: 'principiante', objetivos: ['tecnica'], dias: 2 },
    esperadoTexto: 'Fuera del alcance: no genera plan y da la recomendación general de la OMS.',
    esperado: { estado: 'fuera_de_alcance', disparan: ['V04'], noDisparan: ['PL01'] },
  },
  {
    id: 'D07',
    tipo: 'Difícil',
    nombre: 'Deporte no previsto (rugby)',
    entrada: { ...base, deporte: 'otro', deporteOtro: 'Rugby', edad: 23, nivel: 'intermedio', objetivos: ['fuerza'], dias: 3, periodo: 'pretemporada' },
    esperadoTexto: 'Caso no previsto: plan de condición física general con aviso; sin reglas específicas de deporte.',
    esperado: { estado: 'ok', disparan: ['V06', 'P09', 'PL03'], noDisparan: ['C10', 'C11', 'P01'] },
  },
  {
    id: 'D08',
    tipo: 'Difícil',
    nombre: 'Fuerza y resistencia con solo 2 días',
    entrada: { ...base, deporte: 'futbol', edad: 28, nivel: 'intermedio', objetivos: ['fuerza', 'resistencia'], dias: 2, periodo: 'fuera_temporada' },
    esperadoTexto: 'Avisa del efecto interferencia y fusiona sesiones para que quepan en 2 días.',
    esperado: { estado: 'ok', disparan: ['L14', 'PL01'], diasEfectivos: 2, tiposIncluyen: ['combinada'] },
  },
  {
    id: 'D09',
    tipo: 'Difícil',
    nombre: 'Un solo día por semana y nivel avanzado',
    entrada: { ...base, deporte: 'voleibol', edad: 33, nivel: 'avanzado', objetivos: ['fuerza'], dias: 1 },
    esperadoTexto: 'Avisa de frecuencia insuficiente (L02) e incoherencia con el nivel (K01); plan de 1 sesión combinada.',
    esperado: { estado: 'ok', disparan: ['L02', 'K01'], diasEfectivos: 1, sesionesFuerza: 1, tiposIncluyen: ['combinada'] },
  },
  {
    id: 'D10',
    tipo: 'Difícil',
    nombre: 'Tres objetivos a la vez',
    entrada: { ...base, deporte: 'balonmano', edad: 21, nivel: 'intermedio', objetivos: ['velocidad', 'fuerza', 'resistencia'], dias: 4, periodo: 'fuera_temporada' },
    esperadoTexto: 'Prioriza los dos primeros objetivos y avisa.',
    esperado: { estado: 'ok', disparan: ['V05'], tiposIncluyen: ['velocidad'], tiposExcluyen: ['resistencia'] },
  },
  {
    id: 'D11',
    tipo: 'Difícil',
    nombre: 'Edad imposible (150 años)',
    entrada: { ...base, deporte: 'tenis', edad: 150, nivel: 'intermedio', objetivos: ['tecnica'], dias: 3 },
    esperadoTexto: 'Rechaza el dato por estar fuera de rango.',
    esperado: { estado: 'incompleto', disparan: ['V03'], noDisparan: ['V00'] },
  },
  {
    id: 'D12',
    tipo: 'Difícil',
    nombre: 'Objetivo velocidad con molestia de isquiotibiales',
    entrada: { ...base, deporte: 'futbol', edad: 25, nivel: 'avanzado', objetivos: ['velocidad'], dias: 5, periodo: 'fuera_temporada', sinLesiones: false, molestias: ['isquios'] },
    esperadoTexto: 'Conflicto resuelto a favor de la seguridad: sprints al 80–90 % (A05, K02).',
    esperado: { estado: 'ok', disparan: ['A05', 'K02', 'P02'], mensajeContiene: '80–90 %' },
  },
  {
    id: 'D13',
    tipo: 'Difícil',
    nombre: 'Datos opcionales sin responder',
    entrada: { deporte: 'baloncesto', edad: 35, nivel: 'intermedio', objetivos: ['resistencia'], dias: 3 },
    esperadoTexto: 'Asume 60 min, fuera de temporada, sin gimnasio y sin molestias, lo comunica y genera el plan.',
    esperado: { estado: 'ok', disparan: ['V07', 'A06', 'PL03'], mensajeContiene: 'se ha supuesto' },
  },
  {
    id: 'D14',
    tipo: 'Difícil',
    nombre: 'Joven que se declara avanzado',
    entrada: { ...base, deporte: 'balonmano', edad: 15, nivel: 'avanzado', objetivos: ['fuerza'], dias: 5, periodo: 'fuera_temporada' },
    esperadoTexto: 'La edad prevalece sobre el nivel: prescripción juvenil (L05) y aviso K04; fuerza máx. 3.',
    esperado: { estado: 'ok', disparan: ['K04', 'L05'], noDisparan: ['L04'], sesionesFuerza: 3 },
  },
];
