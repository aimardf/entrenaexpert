export type Sport = 'futbol' | 'balonmano' | 'baloncesto';

export type FootballPosition =
  | 'portero'
  | 'defensa_central'
  | 'lateral'
  | 'mediocentro_defensivo'
  | 'mediocentro_ofensivo'
  | 'extremo'
  | 'delantero_centro';

export type HandballPosition =
  | 'portero'
  | 'extremo'
  | 'lateral'
  | 'central'
  | 'pivote';

export type BasketballPosition =
  | 'base'
  | 'escolta'
  | 'alero'
  | 'ala_pivot'
  | 'pivot';

export type Position = FootballPosition | HandballPosition | BasketballPosition;

export type CompetitiveLevel = 'autonomico' | 'nacional' | 'profesional';

export type Objective =
  | 'fuerza'
  | 'resistencia'
  | 'velocidad'
  | 'explosividad'
  | 'agilidad'
  | 'tecnica';

export type DayOfWeek =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

export type Equipment =
  | 'sin_material'
  | 'gimnasio_completo'
  | 'mancuernas'
  | 'bandas_elasticas'
  | 'campo_pista'
  | 'conos_escaleras_vallas'
  | 'balon';

export type FatigueLevel = 'baja' | 'moderada' | 'alta' | 'extrema';

export type PainLocation =
  | 'ninguno'
  | 'rodilla'
  | 'tobillo'
  | 'hombro'
  | 'isquiotibiales'
  | 'aductores'
  | 'espalda_lumbar'
  | 'cuadriceps'
  | 'otro';

// Estados de validación requeridos
export type ValidationStatus = 'pendiente' | 'documentado_parcialmente' | 'validado';

export interface TrainingParameters {
  sets: number | null;
  reps: string | number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  intensity: string | null;
  protocolNote?: string;
  missingVerificationNotes?: string | null; // Explica qué falta verificar si no está validado
  isDocumented: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sport: Sport;
  objectives: Objective[];
  positions: (Position | 'todas')[];
  level: CompetitiveLevel[];
  equipment: Equipment[];
  durationMinutes: number;
  trainingParameters: TrainingParameters | null;
  restrictions: string[];
  anatomicalContraindications: PainLocation[];
  sources: string[];
  validationStatus: ValidationStatus;
  associatedRules: string[];
  description: string;
  cues: string[];
}

export interface AthleteProfile {
  age: number;
  sport: Sport;
  position: Position;
  level: CompetitiveLevel;
  primaryObjective: Objective;
  secondaryObjective: Objective;
  teamTrainingDays: DayOfWeek[];
  competitionDays: DayOfWeek[];
  availableIndividualDays: DayOfWeek[];
  sessionDuration: number; // 15 to 120 in increments of 15
  equipment: Equipment[];
  hasPain: boolean;
  painLocation: PainLocation;
  painIntensity: number; // 0 to 10
  painDuringMovement: boolean; // Dolor que se manifiesta durante el movimiento deportivo
  hasActiveInjury: boolean; // Si tiene una lesión activa diagnosticada o sospechada
  injuryDetails: string;
  hasMedicalClearance: boolean; // Autorización médica formal para entrenar
  fatigue: FatigueLevel;
  perceivedRecovery: number; // 1 to 5
  freeTextRestrictions: string; // Restricciones médicas o profesionales en texto libre
}

export interface RuleAudit {
  ruleId: string;
  category: 'validacion' | 'seguridad' | 'contradiccion' | 'calendario' | 'filtrado' | 'puntuacion';
  name: string;
  description: string;
  conditionMet: boolean;
  actionTaken: string;
  severity?: 'info' | 'advertencia' | 'bloqueo';
  sources?: string[];
}

export interface ExerciseScoreBreakdown {
  exerciseId: string;
  exerciseName: string;
  sport: Sport;
  totalScore: number;
  breakdown: {
    primaryObjectiveScore: number;
    secondaryObjectiveScore: number;
    positionScore: number;
    calendarScore: number;
  };
  matchedObjectives: Objective[];
  isCompatible: boolean;
  discardReason?: string;
  validationStatus: ValidationStatus;
}

export interface DaySchedule {
  day: DayOfWeek;
  dayLabel: string;
  isMatchDay: boolean;
  isTeamTraining: boolean;
  isIndividualSession: boolean;
  microcycleStatus: 'MD' | 'MD-1' | 'MD-2' | 'MD-3' | 'MD+1' | 'MD+2' | 'Entrenamiento Equipo' | 'Descanso';
  recommendedSession?: PlannedSession;
  warnings: string[];
  explanation?: string;
}

export interface PlannedSession {
  day: DayOfWeek;
  durationMinutes: number;
  focus: string;
  intensityTarget: string;
  exercises: {
    exercise: Exercise;
    score: number;
    rationale: string;
  }[];
  unvalidatedMatchesCount: number;
  notes: string[];
}

export interface InferenceResult {
  isValid: boolean;
  validationErrors: string[];
  isBlockedBySafety: boolean;
  safetyBlockReasons: string[];
  clarificationNeeded: boolean;
  clarificationMessage?: string;
  contradictions: string[];
  weeklySchedule: DaySchedule[];
  scoredExercises: ExerciseScoreBreakdown[];
  compatibleValidatedExercises: Exercise[];
  compatiblePartiallyDocumentedExercises: Exercise[];
  compatiblePendingExercises: Exercise[];
  discardedExercises: { exercise: Exercise; reason: string }[];
  auditLogs: RuleAudit[];
  recommendationSummary: {
    individualSessionsCount: number;
    validatedExercisesPrescribed: number;
    partiallyDocumentedCount: number;
    pendingCount: number;
    hasSafetyWarnings: boolean;
    mandatoryRestrictionsOverridden: boolean; // Siempre false por diseño
  };
}

export interface TestCaseResult {
  id: number;
  title: string;
  category: string;
  inputDescription: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
  auditRuleTriggered?: string;
  notes?: string;
}
