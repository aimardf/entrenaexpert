import {
  AthleteProfile,
  DayOfWeek,
  DaySchedule,
  Exercise,
  ExerciseScoreBreakdown,
  InferenceResult,
  PlannedSession,
  RuleAudit,
} from '../types';
import { EXERCISES_DATABASE } from '../knowledge/exercises';
import { getRuleSources } from '../knowledge/rules';

const DAYS_ORDER: DayOfWeek[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

// Palabras clave de alarma médica o restricción profesional que impiden interpretación segura automática
const MEDICAL_ALARM_KEYWORDS = [
  'rotura',
  'fisura',
  'fractura',
  'inmovilizad',
  'inmovilizac',
  'quirurg',
  'cirugia',
  'operad',
  'rehabilitac',
  'baja medica',
  'prohibido',
  'prohibicion',
  'contraindicad',
  'recaida',
  'inflamacion aguda',
  'derrame',
  'desgarro',
  'menisco roto',
  'cruzado roto',
];

function finalizeAuditLogs(logs: RuleAudit[]): RuleAudit[] {
  return logs.map((log) => ({
    ...log,
    sources: log.sources && log.sources.length > 0 ? log.sources : getRuleSources(log.ruleId),
  }));
}

export function runInferenceEngine(profile: AthleteProfile): InferenceResult {
  const auditLogs: RuleAudit[] = [];
  const validationErrors: string[] = [];
  const safetyBlockReasons: string[] = [];
  const contradictions: string[] = [];

  let isBlockedBySafety = false;
  let clarificationNeeded = false;
  let clarificationMessage: string | undefined = undefined;

  // =========================================================================
  // ETAPA 1: VALIDACIONES DE INTEGRIDAD DE DATOS (EJECUTADAS EN PRIMER LUGAR)
  // =========================================================================

  // REG-VAL-01: Verificación estricta de edad (18-65 años, número entero válido)
  if (
    typeof profile.age !== 'number' ||
    isNaN(profile.age) ||
    !Number.isInteger(profile.age) ||
    profile.age > 65
  ) {
    validationErrors.push('La edad indicada está fuera del rango admitido (18-65 años)');
    auditLogs.push({
      ruleId: 'REG-VAL-01',
      category: 'validacion',
      name: 'Mayoría de edad federada y rango admitido',
      description: 'Verificación de edad en rango 18-65 años y número entero válido.',
      conditionMet: true,
      actionTaken:
        'BLOQUEO INMEDIATO: Denegada la generación del plan de entrenamiento. La edad indicada está fuera del rango admitido (18-65 años).',
      severity: 'bloqueo',
      sources: getRuleSources('REG-VAL-01'),
    });
  } else if (profile.age < 18) {
    validationErrors.push(
      'El deportista tiene ' +
        (profile.age || 0) +
        ' años. SportExpert solo genera recomendaciones para deportistas federados adultos (mínimo 18 años).'
    );
    auditLogs.push({
      ruleId: 'REG-VAL-01',
      category: 'validacion',
      name: 'Mayoría de edad federada y rango admitido',
      description: 'Verificación de edad >= 18 años.',
      conditionMet: true,
      actionTaken: 'BLOQUEO INMEDIATO: Denegada la generación del plan de entrenamiento para menores de edad.',
      severity: 'bloqueo',
      sources: getRuleSources('REG-VAL-01'),
    });
  } else {
    auditLogs.push({
      ruleId: 'REG-VAL-01',
      category: 'validacion',
      name: 'Mayoría de edad federada y rango admitido',
      description: 'Verificación de edad en rango 18-65 años.',
      conditionMet: false,
      actionTaken: 'Criterio superado: Deportista adulto federado (' + profile.age + ' años).',
      severity: 'info',
      sources: getRuleSources('REG-VAL-01'),
    });
  }

  // REG-VAL-02: Completitud de datos esenciales
  const missingFields: string[] = [];
  if (!profile.sport) missingFields.push('deporte');
  if (!profile.position) missingFields.push('posición');
  if (!profile.level) missingFields.push('nivel competitivo');
  if (!profile.primaryObjective) missingFields.push('objetivo principal');
  if (!profile.secondaryObjective) missingFields.push('objetivo secundario');
  if (!profile.equipment || profile.equipment.length === 0) missingFields.push('equipamiento disponible');

  if (missingFields.length > 0) {
    validationErrors.push('Faltan datos esenciales del perfil: ' + missingFields.join(', ') + '.');
    auditLogs.push({
      ruleId: 'REG-VAL-02',
      category: 'validacion',
      name: 'Completitud de datos esenciales',
      description: 'Comprobación de que no falten campos críticos en el perfil.',
      conditionMet: true,
      actionTaken: 'BLOQUEO: Solicitud de completitud para los campos ' + missingFields.join(', ') + '.',
      severity: 'bloqueo',
    });
  }

  // REG-VAL-03: Disparidad de objetivos
  if (profile.primaryObjective && profile.secondaryObjective && profile.primaryObjective === profile.secondaryObjective) {
    validationErrors.push(
      'El objetivo principal y el secundario son idénticos (' +
        profile.primaryObjective +
        '). Deben seleccionarse dos capacidades distintas.'
    );
    auditLogs.push({
      ruleId: 'REG-VAL-03',
      category: 'validacion',
      name: 'Disparidad de objetivos',
      description: 'El objetivo secundario debe complementar al principal.',
      conditionMet: true,
      actionTaken: 'BLOQUEO: Objetivos idénticos no permiten ponderación diferencial.',
      severity: 'bloqueo',
    });
  }

  // REG-VAL-04: Disponibilidad temporal
  if (!profile.availableIndividualDays || profile.availableIndividualDays.length === 0) {
    validationErrors.push('No se ha seleccionado ningún día disponible para realizar sesiones individuales.');
    auditLogs.push({
      ruleId: 'REG-VAL-04',
      category: 'validacion',
      name: 'Disponibilidad temporal individual',
      description: 'Debe haber al menos 1 día disponible en la semana.',
      conditionMet: true,
      actionTaken: 'BLOQUEO: Sin días disponibles para planificar sesiones.',
      severity: 'bloqueo',
    });
  }

  // REG-VAL-05: Duración de sesión en rango fisiológico
  if (
    typeof profile.sessionDuration !== 'number' ||
    profile.sessionDuration < 15 ||
    profile.sessionDuration > 120 ||
    profile.sessionDuration % 15 !== 0
  ) {
    validationErrors.push('La duración de sesión debe estar entre 15 y 120 minutos, en múltiplos de 15.');
    auditLogs.push({
      ruleId: 'REG-VAL-05',
      category: 'validacion',
      name: 'Duración de sesión dentro de rango fisiológico',
      description: 'Comprobación de rango 15-120 min en intervalos de 15.',
      conditionMet: true,
      actionTaken: 'BLOQUEO: Parámetro de duración inválido (' + profile.sessionDuration + ' min).',
      severity: 'bloqueo',
    });
  }

  // Si hay errores de validación de datos, detener inmediatamente antes de cualquier cálculo
  if (validationErrors.length > 0) {
    return {
      isValid: false,
      validationErrors,
      isBlockedBySafety: false,
      safetyBlockReasons: [],
      clarificationNeeded: false,
      contradictions: [],
      weeklySchedule: [],
      scoredExercises: [],
      compatibleValidatedExercises: [],
      compatiblePartiallyDocumentedExercises: [],
      compatiblePendingExercises: [],
      discardedExercises: [],
      auditLogs: finalizeAuditLogs(auditLogs),
      recommendationSummary: {
        individualSessionsCount: 0,
        validatedExercisesPrescribed: 0,
        partiallyDocumentedCount: 0,
        pendingCount: 0,
        hasSafetyWarnings: true,
        mandatoryRestrictionsOverridden: false,
      },
    };
  }

  // REG-CON-01: Contradicción en el dolor declarado
  const hasPainContradiction =
    !profile.hasPain &&
    ((profile.painLocation && profile.painLocation !== 'ninguno') ||
      (typeof profile.painIntensity === 'number' && profile.painIntensity > 0));

  if (hasPainContradiction) {
    const contradictionMsg =
      'Contradicción en el dolor declarado: Se ha indicado que no existe dolor (hasPain: false), pero se ha especificado una localización (' +
      profile.painLocation +
      ') o una intensidad de dolor (' +
      profile.painIntensity +
      '/10) mayor que 0. Por favor, aclare si tiene dolor o no antes de continuar.';

    contradictions.push(contradictionMsg);
    clarificationNeeded = true;
    clarificationMessage =
      'Por favor, aclare si tiene dolor o no: existe una contradicción entre declarar ausencia de dolor (hasPain: false) y registrar una localización (' +
      profile.painLocation +
      ') o una intensidad de dolor (' +
      profile.painIntensity +
      '/10) mayor que cero.';

    auditLogs.push({
      ruleId: 'REG-CON-01',
      category: 'contradiccion',
      name: 'Contradicción en el dolor declarado',
      description: 'Detección de incoherencia entre declarar ausencia de dolor y registrar localización o intensidad > 0.',
      conditionMet: true,
      actionTaken:
        'BLOQUEO POR CONTRADICCIÓN: Recomendación marcada como no válida. Se solicita al usuario que aclare si tiene dolor o no.',
      severity: 'bloqueo',
      sources: getRuleSources('REG-CON-01'),
    });

    return {
      isValid: false,
      validationErrors: [],
      isBlockedBySafety: false,
      safetyBlockReasons: [],
      clarificationNeeded: true,
      clarificationMessage,
      contradictions,
      weeklySchedule: [],
      scoredExercises: [],
      compatibleValidatedExercises: [],
      compatiblePartiallyDocumentedExercises: [],
      compatiblePendingExercises: [],
      discardedExercises: [],
      auditLogs: finalizeAuditLogs(auditLogs),
      recommendationSummary: {
        individualSessionsCount: 0,
        validatedExercisesPrescribed: 0,
        partiallyDocumentedCount: 0,
        pendingCount: 0,
        hasSafetyWarnings: true,
        mandatoryRestrictionsOverridden: false,
      },
    };
  }

  // =========================================================================
  // ETAPA 2: RESTRICCIONES OBLIGATORIAS DE SEGURIDAD (HARD CONSTRAINTS)
  //          EJECUTADAS ESTRICTAMENTE ANTES DE PUNTUAR
  // =========================================================================

  // REG-SEG-01: Lesión activa sin autorización médica para entrenar
  if (profile.hasActiveInjury && !profile.hasMedicalClearance) {
    isBlockedBySafety = true;
    const detailMsg = profile.injuryDetails ? ' ("' + profile.injuryDetails + '")' : '';
    safetyBlockReasons.push(
      'El deportista declara una lesión activa' +
        detailMsg +
        ' sin contar con autorización médica formal para entrenar. SportExpert no prescribe entrenamiento físico ante lesiones activas no autorizadas por el equipo médico o fisioterapéutico.'
    );
    auditLogs.push({
      ruleId: 'REG-SEG-01',
      category: 'seguridad',
      name: 'Lesión activa sin autorización médica formal',
      description: 'Prohibición estricta de prescripción física si hay lesión activa sin alta o autorización médica.',
      conditionMet: true,
      actionTaken:
        'SUSPENSIÓN PREVENTIVA: No se genera entrenamiento físico ante lesión activa sin autorización médica. Se aconseja acudir a los profesionales sanitarios del club.',
      severity: 'bloqueo',
    });
  }

  // REG-SEG-02: Dolor severo (EVA >= 7)
  if (profile.hasPain && profile.painIntensity >= 7) {
    isBlockedBySafety = true;
    safetyBlockReasons.push(
      'Dolor agudo/severo reportado (' +
        profile.painIntensity +
        '/10 en ' +
        profile.painLocation +
        '). Nivel de dolor clínico incompatible con prescripción de rendimiento deportivo autónomo.'
    );
    auditLogs.push({
      ruleId: 'REG-SEG-02',
      category: 'seguridad',
      name: 'Bloqueo por dolor severo (EVA >= 7)',
      description: 'Bandera roja clínica ante dolor agudo en escala EVA.',
      conditionMet: true,
      actionTaken: 'BLOQUEO ESTRICTO: Se suspende la recomendación de ejercicios para prevenir daño tisular.',
      severity: 'bloqueo',
    });
  }

  // REG-SEG-03: Restricciones en texto libre que no pueden interpretarse con seguridad
  if (profile.freeTextRestrictions && profile.freeTextRestrictions.trim().length > 0) {
    const rawText = profile.freeTextRestrictions.trim();
    const normalizeStr = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const normalizedText = normalizeStr(rawText);

    // Expresiones explícitas que declaran ausencia de restricciones
    const explicitNegatives = [
      'ninguna',
      'ninguno',
      'sin restricciones',
      'no tengo',
      'nada',
      'no',
      'sin problemas',
      'ningun problema',
      'n/a',
      'na',
      '-',
      'ninguna restriccion',
      'sin restricciones medicas',
      'sin lesion',
      'sin dolor',
      'ningun dolor',
      'todo bien',
      'apto',
    ];

    const isExplicitlyEmptyOrNegative =
      normalizedText.length === 0 || explicitNegatives.includes(normalizedText);

    if (!isExplicitlyEmptyOrNegative) {
      // El usuario ha indicado una restricción médica o profesional en texto libre.
      // Dado que el lenguaje natural libre no puede ser interpretado algorítmicamente con
      // absoluta certeza y seguridad clínica, no se depende únicamente de un listado de palabras clave:
      // se activa una parada preventiva prudente (Safety Hold) y se solicita aclaración profesional.
      isBlockedBySafety = true;
      clarificationNeeded = true;

      const foundAlarms = MEDICAL_ALARM_KEYWORDS.filter((keyword) =>
        normalizedText.includes(normalizeStr(keyword))
      );

      const alarmDetail =
        foundAlarms.length > 0
          ? ' (términos clínicos identificados: ' + foundAlarms.join(', ') + ')'
          : '';

      clarificationMessage =
        'Se ha indicado una restricción médica o profesional en texto libre: "' +
        rawText +
        '"' +
        alarmDetail +
        '. Al tratarse de indicaciones en lenguaje natural que no pueden interpretarse algorítmicamente con absoluta seguridad determinista, SportExpert detiene preventivamente la generación del plan de entrenamiento. Por favor, solicita aclaración o indicaciones precisas al equipo médico o de fisioterapia de tu club antes de continuar.';
      safetyBlockReasons.push(clarificationMessage);

      auditLogs.push({
        ruleId: 'REG-SEG-03',
        category: 'seguridad',
        name: 'Restricción profesional en texto libre no interpretable con seguridad',
        description: 'Indicaciones médicas o de preparador en texto libre no computables de forma unívoca.',
        conditionMet: true,
        actionTaken:
          'PARADA PREVENTIVA (Safety Hold): Detención de la recomendación y solicitud de aclaración profesional ante restricciones en texto libre.',
        severity: 'bloqueo',
      });
    } else {
      auditLogs.push({
        ruleId: 'REG-SEG-03',
        category: 'seguridad',
        name: 'Restricción profesional en texto libre analizada',
        description: 'Revisión preventiva de notas de texto libre.',
        conditionMet: false,
        actionTaken: 'Campo de texto libre sin restricciones limitantes declaradas ("' + rawText + '").',
        severity: 'info',
      });
    }
  }

  // REG-SEG-04: Fatiga muy elevada o recuperación deficiente
  let forceLowIntensityOnly = false;
  if (profile.fatigue === 'extrema') {
    isBlockedBySafety = true;
    safetyBlockReasons.push(
      'Fatiga extrema reportada. En este nivel de agotamiento, la asimilación del entrenamiento se compromete severamente y se eleva significativamente el riesgo de sobrecarga o lesión. Por prudencia deportiva y seguridad, SportExpert suspende la recomendación de entrenamientos autónomos y aconseja consultar con los servicios técnicos o de salud de su club para valorar su estado de recuperación.'
    );
    auditLogs.push({
      ruleId: 'REG-SEG-04',
      category: 'seguridad',
      name: 'Protección ante fatiga extrema sistémica',
      description: 'La fatiga extrema impide la asimilación adecuada de cargas y multiplica el riesgo de sobrecarga.',
      conditionMet: true,
      actionTaken:
        'SUSPENSIÓN PREVENTIVA: Se detiene la recomendación de entrenamiento autónomo ante fatiga extrema. Se aconseja valoración con los profesionales del club.',
      severity: 'bloqueo',
    });
  } else if (profile.fatigue === 'alta' && profile.perceivedRecovery <= 2) {
    forceLowIntensityOnly = true;
    contradictions.push(
      'Fatiga alta con recuperación insuficiente (recuperación ' +
        profile.perceivedRecovery +
        '/5). El motor excluye automáticamente cualquier ejercicio de alta intensidad, fuerza máxima o pliometría reactiva por prudencia deportiva.'
    );
    auditLogs.push({
      ruleId: 'REG-SEG-04',
      category: 'seguridad',
      name: 'Veto de alta intensidad por fatiga elevada y baja recuperación',
      description: 'Fatiga alta combinada con baja recuperación percibida.',
      conditionMet: true,
      actionTaken:
        'ADAPTACIÓN RESTRICTIVA OBLIGATORIA: Exclusión de esfuerzos submáximos o de impacto por prudencia de carga.',
      severity: 'advertencia',
    });
  }

  // REG-SEG-05: Recordatorio de principio de no intromisión médica
  auditLogs.push({
    ruleId: 'REG-SEG-05',
    category: 'seguridad',
    name: 'Delimitación deontológica: Prohibición de diagnóstico',
    description: 'SportExpert no realiza diagnósticos ni rehabilitación.',
    conditionMet: true,
    actionTaken: 'Garantía aplicada: Recomendaciones supeditadas a deportistas sin contraindicación médica.',
    severity: 'info',
  });

  // Si existe cualquier bloqueo de seguridad, DETENER antes de calcular puntuaciones
  if (isBlockedBySafety) {
    return {
      isValid: true,
      validationErrors: [],
      isBlockedBySafety: true,
      safetyBlockReasons,
      clarificationNeeded,
      clarificationMessage,
      contradictions,
      weeklySchedule: [],
      scoredExercises: [],
      compatibleValidatedExercises: [],
      compatiblePartiallyDocumentedExercises: [],
      compatiblePendingExercises: [],
      discardedExercises: [],
      auditLogs: finalizeAuditLogs(auditLogs),
      recommendationSummary: {
        individualSessionsCount: 0,
        validatedExercisesPrescribed: 0,
        partiallyDocumentedCount: 0,
        pendingCount: 0,
        hasSafetyWarnings: true,
        mandatoryRestrictionsOverridden: false,
      },
    };
  }

  // =========================================================================
  // ETAPA 3: REGLAS DE CALENDARIO, COMPETICIÓN Y DISPONIBILIDAD
  // =========================================================================

  // REG-CAL-01: Prohibición de sesión individual en día de partido (MD)
  const conflictingMatchDays = profile.availableIndividualDays.filter((d) =>
    profile.competitionDays.includes(d)
  );
  if (conflictingMatchDays.length > 0) {
    const formattedConflict = conflictingMatchDays.map((d) => DAY_LABELS[d]).join(', ');
    contradictions.push(
      'Se seleccionó disponibilidad en día de competición (' +
        formattedConflict +
        '). Por regla inviolable REG-CAL-01, no se programará ninguna sesión individual en día de partido.'
    );
    auditLogs.push({
      ruleId: 'REG-CAL-01',
      category: 'calendario',
      name: 'Inviolabilidad del día de partido (Match Day)',
      description: 'Prohibición de añadir sesiones complementarias en día de competición.',
      conditionMet: true,
      actionTaken: 'Descartada cualquier sesión individual en ' + formattedConflict + ' para evitar depleción y sobrecarga.',
      severity: 'advertencia',
    });
  }

  // Construcción del microciclo semanal de 7 días
  const weeklySchedule: DaySchedule[] = DAYS_ORDER.map((day, idx) => {
    const isMatchDay = profile.competitionDays.includes(day);
    const isTeamTraining = profile.teamTrainingDays.includes(day);
    const isRequestedIndividual = profile.availableIndividualDays.includes(day);

    let microcycleStatus: DaySchedule['microcycleStatus'] = isMatchDay
      ? 'MD'
      : isTeamTraining
      ? 'Entrenamiento Equipo'
      : 'Descanso';

    // Determinar proximidad al partido
    for (const matchDay of profile.competitionDays) {
      const matchIdx = DAYS_ORDER.indexOf(matchDay);
      const diff = (idx - matchIdx + 7) % 7;

      if (diff === 6) microcycleStatus = 'MD-1';
      else if (diff === 5) microcycleStatus = 'MD-2';
      else if (diff === 1) microcycleStatus = 'MD+1';
      else if (diff === 2) microcycleStatus = 'MD+2';
      else if (diff === 3 || diff === 4) microcycleStatus = 'MD-3';
    }

    const warnings: string[] = [];
    let isIndividualSession = false;

    // REG-CAL-02: Respeto absoluto a la disponibilidad declarada
    if (!isRequestedIndividual) {
      // Si el deportista NO marcó este día como disponible, JAMÁS se programa sesión
      isIndividualSession = false;
    } else if (isMatchDay) {
      // Si marcó disponible pero es partido, REG-CAL-01 lo veta
      isIndividualSession = false;
      warnings.push('Sesión individual bloqueada: Día de competición oficial (Match Day).');
    } else {
      isIndividualSession = true;

      if (isTeamTraining) {
        warnings.push('Coincide con entrenamiento del equipo: Carga complementaria acotada para evitar sobreuso.');
        auditLogs.push({
          ruleId: 'REG-CAL-02',
          category: 'calendario',
          name: 'Coexistencia con sesión de equipo (' + DAY_LABELS[day] + ')',
          description: 'Ajuste de volumen por coincidencia con sesión colectiva.',
          conditionMet: true,
          actionTaken: 'Se limita el volumen complementario individual para preservar la frescura.',
          severity: 'info',
        });
      }

      if (microcycleStatus === 'MD-1') {
        warnings.push('Víspera de partido (MD-1): Solo autorizada activación reactiva corta sin daño excéntrico.');
        auditLogs.push({
          ruleId: 'REG-CAL-03',
          category: 'calendario',
          name: 'Regulación de víspera de partido (MD-1 en ' + DAY_LABELS[day] + ')',
          description: 'Evitar fatiga muscular residual 24 horas antes de competir.',
          conditionMet: true,
          actionTaken: 'Vetados ejercicios con alta fatiga excéntrica o fallo neuromuscular.',
          severity: 'advertencia',
        });
      } else if (microcycleStatus === 'MD+1') {
        warnings.push('Día post-partido (MD+1): Prioridad absoluta de regeneración y movilidad.');
        auditLogs.push({
          ruleId: 'REG-CAL-04',
          category: 'calendario',
          name: 'Regulación post-competición (MD+1 en ' + DAY_LABELS[day] + ')',
          description: 'Descarga miofascial y recuperación activa.',
          conditionMet: true,
          actionTaken: 'Vetados ejercicios de alto impacto y sprints máximos.',
          severity: 'info',
        });
      }
    }

    return {
      day,
      dayLabel: DAY_LABELS[day],
      isMatchDay,
      isTeamTraining,
      isIndividualSession,
      microcycleStatus,
      warnings,
    };
  });

  // =========================================================================
  // ETAPA 4: FILTRADO DETERMINISTA DE EJERCICIOS (REGLAS OBLIGATORIAS)
  // =========================================================================

  const discardedExercises: { exercise: Exercise; reason: string }[] = [];
  const compatibleExercises: Exercise[] = [];

  EXERCISES_DATABASE.forEach((exercise) => {
    // REG-FIL-01: Filtro por deporte federado
    if (exercise.sport !== profile.sport) {
      discardedExercises.push({
        exercise,
        reason:
          'Descarte por Regla REG-FIL-01: El ejercicio pertenece a ' +
          exercise.sport +
          ' y el jugador está federado en ' +
          profile.sport +
          '.',
      });
      return;
    }

    // REG-FIL-03: Filtro por contraindicación anatómica o dolor durante el movimiento
    if (profile.hasPain && profile.painLocation !== 'ninguno') {
      const isContraindicated = exercise.anatomicalContraindications.includes(profile.painLocation);
      if (isContraindicated) {
        discardedExercises.push({
          exercise,
          reason:
            'Descarte por Regla REG-FIL-03: Contraindicado para molestia reportada en ' +
            profile.painLocation +
            (profile.painDuringMovement ? ' (con dolor durante el movimiento)' : '') +
            '.',
        });
        auditLogs.push({
          ruleId: 'REG-FIL-03',
          category: 'filtrado',
          name: 'Filtro anatómico: ' + exercise.name,
          description: 'Exclusión preventiva por molestia en ' + profile.painLocation,
          conditionMet: true,
          actionTaken: 'Ejercicio ' + exercise.name + ' excluido para no sobrecargar ' + profile.painLocation + '.',
          severity: 'advertencia',
        });
        return;
      }
    }

    // REG-FIL-02: Filtro por equipamiento indispensable
    const hasRequiredEquipment = exercise.equipment.every((item) => {
      if (item === 'sin_material') return true;
      return profile.equipment.includes(item);
    });

    if (!hasRequiredEquipment) {
      const missing = exercise.equipment
        .filter((eq) => eq !== 'sin_material' && !profile.equipment.includes(eq))
        .join(', ');
      discardedExercises.push({
        exercise,
        reason: 'Descarte por Regla REG-FIL-02: Requiere equipamiento no accesible (' + missing + ').',
      });
      return;
    }

    // REG-FIL-04: Filtro por nivel competitivo
    if (!exercise.level.includes(profile.level)) {
      discardedExercises.push({
        exercise,
        reason:
          'Descarte por Regla REG-FIL-04: Complejidad técnica no apta para nivel ' +
          profile.level +
          '.',
      });
      return;
    }

    // REG-FIL-04b: Filtro de demarcación exclusiva (guardameta vs jugador de campo)
    const isExclusiveGoalkeeperExercise =
      exercise.positions.length === 1 && exercise.positions[0] === 'portero';
    if (isExclusiveGoalkeeperExercise && profile.position !== 'portero') {
      discardedExercises.push({
        exercise,
        reason:
          'Descarte por Regla REG-FIL-04: Ejercicio específico de guardameta no aplicable a jugador de campo (' +
          profile.position +
          ').',
      });
      return;
    }

    const isFieldPlayerOnlyExercise =
      !exercise.positions.includes('todas') &&
      !exercise.positions.includes('portero') &&
      profile.position === 'portero';
    if (isFieldPlayerOnlyExercise) {
      discardedExercises.push({
        exercise,
        reason:
          'Descarte por Regla REG-FIL-04: Ejercicio específico de jugador de campo no aplicable a portero.',
      });
      return;
    }

    // Si la fatiga es alta y la recuperación deficiente, vetar ejercicios de fuerza pesada o alta potencia
    if (forceLowIntensityOnly) {
      const isHighIntensity =
        exercise.objectives.includes('explosividad') ||
        (exercise.trainingParameters?.intensity &&
          exercise.trainingParameters.intensity.toLowerCase().includes('máxim'));
      if (isHighIntensity) {
        discardedExercises.push({
          exercise,
          reason:
            'Descarte por Regla REG-SEG-04: Ejercicio de alta exigencia neuromuscular contraindicado por fatiga acumulada elevada.',
        });
        return;
      }
    }

    // El ejercicio ha superado TODOS los filtros obligatorios
    compatibleExercises.push(exercise);
  });

  // =========================================================================
  // ETAPA 5: PUNTUACIÓN PONDERADA (CALCULADA EXCLUSIVAMENTE TRAS LOS FILTROS)
  // =========================================================================
  // - Objetivo principal: 50 puntos
  // - Objetivo secundario: 25 puntos
  // - Posición deportiva: 15 puntos (15 específica / 10 transversal 'todas')
  // - Compatibilidad microciclo: 10 puntos

  const scoredExercises: ExerciseScoreBreakdown[] = compatibleExercises.map((exercise) => {
    let primaryObjectiveScore = 0;
    let secondaryObjectiveScore = 0;
    let positionScore = 0;
    let calendarScore = 0;

    const matchedObjectives = exercise.objectives.filter(
      (obj) => obj === profile.primaryObjective || obj === profile.secondaryObjective
    );

    // REG-SCO-01: Objetivo principal (+50)
    if (exercise.objectives.includes(profile.primaryObjective)) {
      primaryObjectiveScore = 50;
    }

    // REG-SCO-02: Objetivo secundario (+25)
    if (exercise.objectives.includes(profile.secondaryObjective)) {
      secondaryObjectiveScore = 25;
    }

    // REG-SCO-03: Posición deportiva (+15 o +10)
    if (exercise.positions.includes(profile.position)) {
      positionScore = 15;
    } else if (exercise.positions.includes('todas')) {
      positionScore = 10;
    }

    // REG-SCO-04: Calendario (+10)
    const hasCentralDays = weeklySchedule.some(
      (s) => s.isIndividualSession && s.microcycleStatus !== 'MD-1'
    );
    if (hasCentralDays || exercise.objectives.includes('tecnica')) {
      calendarScore = 10;
    }

    const totalScore = primaryObjectiveScore + secondaryObjectiveScore + positionScore + calendarScore;

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sport: exercise.sport,
      totalScore,
      breakdown: {
        primaryObjectiveScore,
        secondaryObjectiveScore,
        positionScore,
        calendarScore,
      },
      matchedObjectives,
      isCompatible: true,
      validationStatus: exercise.validationStatus,
    };
  });

  // Ordenar de mayor a menor puntuación
  scoredExercises.sort((a, b) => b.totalScore - a.totalScore);

  // =========================================================================
  // ETAPA 6: APLICACIÓN DEL CRITERIO ESTRICTO DE VALIDACIÓN CIENTÍFICA
  // =========================================================================
  // REG-VAL-06: Solo ejercicios con validationStatus === 'validado' pueden prescribirse
  const compatibleValidatedExercises: Exercise[] = [];
  const compatiblePartiallyDocumentedExercises: Exercise[] = [];
  const compatiblePendingExercises: Exercise[] = [];

  scoredExercises.forEach((scored) => {
    const ex = compatibleExercises.find((e) => e.id === scored.exerciseId);
    if (!ex) return;

    if (ex.validationStatus === 'validado' && ex.trainingParameters && ex.trainingParameters.isDocumented) {
      compatibleValidatedExercises.push(ex);
    } else if (ex.validationStatus === 'documentado_parcialmente') {
      compatiblePartiallyDocumentedExercises.push(ex);
    } else {
      compatiblePendingExercises.push(ex);
    }
  });

  if (compatiblePartiallyDocumentedExercises.length > 0 || compatiblePendingExercises.length > 0) {
    auditLogs.push({
      ruleId: 'REG-VAL-06',
      category: 'validacion',
      name: 'Exclusión obligatoria de ejercicios no completamente validados',
      description: 'Por rigor metodológico, no se prescriben ejercicios con parámetros no contrastados.',
      conditionMet: true,
      actionTaken:
        'Se retienen ' +
        compatiblePartiallyDocumentedExercises.length +
        ' ejercicios parcialmente documentados y ' +
        compatiblePendingExercises.length +
        ' ejercicios pendientes para transparencia explicativa.',
      severity: 'info',
    });
  }

  // =========================================================================
  // ETAPA 7: ASIGNACIÓN A SESIONES DEL CALENDARIO SIN FALLBACKS PELIGROSOS
  // =========================================================================
  // REG-CAL-05: Si no hay ejercicios válidos compatibles, NO recurrir a fallbacks
  // que violen restricciones obligatorias.

  const targetMinutes = profile.sessionDuration;
  let rotationIndex = 0;

  weeklySchedule.forEach((daySchedule) => {
    if (!daySchedule.isIndividualSession) return;

    const isMD1 = daySchedule.microcycleStatus === 'MD-1';

    // Filtrar candidatos estrictos para este día específico
    const validPoolForDay = compatibleValidatedExercises.filter((ex) => {
      if (isMD1) {
        // En MD-1 solo activación neuromuscular, velocidad corta o técnica sin fatiga excéntrica
        return (
          !ex.restrictions.includes('Evitar en MD-1') &&
          !ex.restrictions.includes('Prohibido en MD-1') &&
          (ex.objectives.includes('velocidad') ||
            ex.objectives.includes('tecnica') ||
            ex.objectives.includes('agilidad'))
        );
      }
      return true;
    });

    // REGLA CRÍTICA: ELIMINACIÓN DE FALLBACK PELIGROSO
    // Si validPoolForDay está vacío, NO reintroducir ejercicios descartados o no validados
    if (validPoolForDay.length === 0) {
      daySchedule.explanation =
        'No hay ejercicios completamente validados compatibles para las restricciones de este día (' +
        daySchedule.microcycleStatus +
        '). Por principio de seguridad metodológica, no se ha forzado ninguna recomendación artificial.';
      daySchedule.recommendedSession = undefined;
      return;
    }

    const selectedForSession: {
      exercise: Exercise;
      score: number;
      rationale: string;
    }[] = [];

    let accumulatedMinutes = 0;
    const startIndex = rotationIndex % validPoolForDay.length;
    const orderedPool = [
      ...validPoolForDay.slice(startIndex),
      ...validPoolForDay.slice(0, startIndex),
    ];

    for (const ex of orderedPool) {
      if (accumulatedMinutes + ex.durationMinutes <= targetMinutes + 5) {
        const scoreInfo = scoredExercises.find((s) => s.exerciseId === ex.id);
        const scoreVal = scoreInfo ? scoreInfo.totalScore : 50;

        let rationale = 'Superó todos los filtros obligatorios. Puntuación: ' + scoreVal + ' pts (';
        const parts: string[] = [];
        if (scoreInfo?.breakdown.primaryObjectiveScore) {
          parts.push('+' + scoreInfo.breakdown.primaryObjectiveScore + ' obj. principal ' + profile.primaryObjective);
        }
        if (scoreInfo?.breakdown.secondaryObjectiveScore) {
          parts.push('+' + scoreInfo.breakdown.secondaryObjectiveScore + ' obj. secundario ' + profile.secondaryObjective);
        }
        if (scoreInfo?.breakdown.positionScore) {
          parts.push('+' + scoreInfo.breakdown.positionScore + ' afinidad a ' + profile.position);
        }
        if (scoreInfo?.breakdown.calendarScore) {
          parts.push('+' + scoreInfo.breakdown.calendarScore + ' microciclo ' + daySchedule.microcycleStatus);
        }
        rationale += parts.join(', ') + ').';

        selectedForSession.push({
          exercise: ex,
          score: scoreVal,
          rationale,
        });

        accumulatedMinutes += ex.durationMinutes;
        rotationIndex++;
      }

      if (accumulatedMinutes >= targetMinutes) break;
    }

    if (selectedForSession.length > 0) {
      const plannedSession: PlannedSession = {
        day: daySchedule.day,
        durationMinutes: accumulatedMinutes,
        focus: isMD1
          ? 'Activación reactiva precompetitiva (MD-1)'
          : 'Desarrollo de ' + profile.primaryObjective + ' y ' + profile.secondaryObjective,
        intensityTarget: isMD1
          ? 'Activación neuromuscular sin fatiga residual'
          : 'Intensidad fisiológicamente fundamentada según protocolos validados',
        exercises: selectedForSession,
        unvalidatedMatchesCount:
          compatiblePartiallyDocumentedExercises.length + compatiblePendingExercises.length,
        notes: [
          'Duración acumulada de ejercicios principales: ' + accumulatedMinutes + ' minutos.',
          'Realizar 8-10 minutos de calentamiento dinámico articular y carrera progresiva.',
          'Respetar estrictamente los descansos entre series pautados en cada ficha técnica.',
        ],
      };
      daySchedule.recommendedSession = plannedSession;
    } else {
      daySchedule.explanation =
        'La duración disponible (' +
        targetMinutes +
        ' min) no se pudo completar con ejercicios compatibles sin violar restricciones.';
    }
  });

  const activeSessions = weeklySchedule.filter(
    (s) => s.isIndividualSession && s.recommendedSession && s.recommendedSession.exercises.length > 0
  );
  const totalPrescribed = activeSessions.reduce(
    (acc, s) => acc + (s.recommendedSession?.exercises.length || 0),
    0
  );

  return {
    isValid: true,
    validationErrors: [],
    isBlockedBySafety: false,
    safetyBlockReasons: [],
    clarificationNeeded: false,
    clarificationMessage: undefined,
    contradictions,
    weeklySchedule,
    scoredExercises,
    compatibleValidatedExercises,
    compatiblePartiallyDocumentedExercises,
    compatiblePendingExercises,
    discardedExercises,
    auditLogs: finalizeAuditLogs(auditLogs),
    recommendationSummary: {
      individualSessionsCount: activeSessions.length,
      validatedExercisesPrescribed: totalPrescribed,
      partiallyDocumentedCount: compatiblePartiallyDocumentedExercises.length,
      pendingCount: compatiblePendingExercises.length,
      hasSafetyWarnings: contradictions.length > 0 || profile.hasPain,
      mandatoryRestrictionsOverridden: false, // Siempre false: nunca se eluden
    },
  };
}
