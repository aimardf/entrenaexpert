// Tipos compartidos por la base de conocimiento, el motor de inferencia y la interfaz.

export type Deporte = 'futbol' | 'baloncesto' | 'voleibol' | 'balonmano' | 'tenis' | 'otro';
export type Nivel = 'principiante' | 'intermedio' | 'avanzado';
export type Objetivo = 'resistencia' | 'fuerza' | 'velocidad' | 'tecnica' | 'prevencion';
export type Periodo = 'pretemporada' | 'competicion' | 'fuera_temporada';
export type Zona = 'rodilla' | 'tobillo' | 'hombro' | 'espalda' | 'isquios';
export type GrupoEdad = 'joven' | 'adulto' | 'mayor';

/** Respuestas del usuario (hechos iniciales). Todo es opcional para poder razonar con datos incompletos. */
export interface Entrada {
  deporte?: Deporte;
  deporteOtro?: string;
  edad?: number;
  nivel?: Nivel;
  objetivos?: Objetivo[];
  dias?: number;
  minutos?: number;
  periodo?: Periodo;
  sinLesiones?: boolean;
  molestias?: Zona[];
  dolorAgudo?: boolean;
  parqRiesgo?: boolean;
  gimnasio?: boolean;
}

export type TipoSesion =
  | 'tecnica'
  | 'fuerza'
  | 'combinada'
  | 'resistencia'
  | 'velocidad'
  | 'recuperacion'
  | 'activacion'
  | 'partido'
  | 'descanso';

export interface Bloque {
  nombre: string;
  minutos: number;
  contenido: string[];
}

export interface Sesion {
  dia: string;
  tipo: TipoSesion;
  titulo: string;
  bloques: Bloque[];
  reglas: string[];
}

export interface PrescripcionFuerza {
  series: string;
  repeticiones: string;
  intensidad: string;
  descanso: string;
}

/** Memoria de trabajo: hechos iniciales + hechos derivados por las reglas. */
export interface Hechos extends Entrada {
  estado?: 'ok' | 'incompleto' | 'bloqueado' | 'contradiccion' | 'fuera_de_alcance';
  faltan?: string[];
  supuestos?: string[];
  grupoEdad?: GrupoEdad;
  perfilDeporte?: string;
  zonasRiesgo?: Zona[];
  objetivosPriorizados?: Objetivo[];
  diasEfectivos?: number;
  sesionesFuerza?: number;
  presFuerza?: PrescripcionFuerza;
  presPliometria?: string;
  factorPliometria?: number;
  presAerobica?: string;
  presVelocidad?: string;
  calentamiento?: string;
  preventivos?: string[];
  reglasPreventivas?: string[];
  sesionesExtra?: TipoSesion[];
  contactosPliometria?: number;
  adaptaciones?: string[];
  ejerciciosFuerza?: string[];
  listaSesiones?: TipoSesion[];
  semana?: Sesion[];
  planListo?: boolean;
}

export type Gravedad = 'info' | 'aviso' | 'conflicto' | 'bloqueo';

export interface Mensaje {
  gravedad: Gravedad;
  texto: string;
  regla: string;
}

export type Categoria =
  | 'Validación'
  | 'Seguridad'
  | 'Clasificación'
  | 'Carga'
  | 'Prevención'
  | 'Adaptación'
  | 'Conflicto'
  | 'Planificación';

export interface Contexto {
  avisar: (gravedad: Gravedad, texto: string) => void;
  detener: () => void;
}

export interface Regla {
  id: string;
  nombre: string;
  categoria: Categoria;
  /** Mayor prioridad se dispara antes (resolución de conflictos de la agenda). */
  prioridad: number;
  /** Texto legible SI ... ENTONCES ... */
  descripcion: string;
  fuentes: string[];
  si: (h: Hechos) => boolean;
  entonces: (h: Hechos, ctx: Contexto) => void;
}

export interface PasoTraza {
  orden: number;
  regla: string;
  nombre: string;
  categoria: Categoria;
  hechosNuevos: string[];
}

export interface Resultado {
  hechos: Hechos;
  traza: PasoTraza[];
  mensajes: Mensaje[];
  detenido: boolean;
}

export interface Fuente {
  id: string;
  cita: string;
  url?: string;
  uso: string;
}
