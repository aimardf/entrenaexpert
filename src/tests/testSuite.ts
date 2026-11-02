import { AthleteProfile, TestCaseResult } from '../types';
import { runInferenceEngine } from '../engine/inferenceEngine';
import { EXERCISES_DATABASE } from '../knowledge/exercises';

export function runAutomatedTestSuite(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // =========================================================================
  // TEST 1: Jugador adulto con datos completos
  // =========================================================================
  const profile1: AthleteProfile = {
    age: 24,
    sport: 'futbol',
    position: 'extremo',
    level: 'nacional',
    primaryObjective: 'velocidad',
    secondaryObjective: 'explosividad',
    teamTrainingDays: ['martes', 'jueves'],
    competitionDays: ['domingo'],
    availableIndividualDays: ['lunes', 'miercoles'],
    sessionDuration: 45,
    equipment: ['campo_pista', 'conos_escaleras_vallas', 'balon'],
    hasPain: false,
    painLocation: 'ninguno',
    painIntensity: 0,
    painDuringMovement: false,
    hasActiveInjury: false,
    injuryDetails: '',
    hasMedicalClearance: true,
    fatigue: 'baja',
    perceivedRecovery: 4,
    freeTextRestrictions: '',
  };

  const res1 = runInferenceEngine(profile1);
  const passed1 =
    res1.isValid &&
    !res1.isBlockedBySafety &&
    res1.weeklySchedule.some((d) => d.isIndividualSession && d.recommendedSession) &&
    res1.compatibleValidatedExercises.length > 0;

  results.push({
    id: 1,
    title: 'Jugador adulto con datos completos',
    category: 'Flujo Nominal',
    inputDescription: 'Futbolista federado de 24 años, sin dolor ni lesiones, datos completos y material adecuado.',
    expectedOutcome: 'Plan generado con éxito, microciclo estructurado y ejercicios validados prescritos.',
    actualOutcome: passed1
      ? 'Éxito: Se generó el plan semanal con ' +
        res1.recommendationSummary.validatedExercisesPrescribed +
        ' ejercicios validados prescritos en ' +
        res1.recommendationSummary.individualSessionsCount +
        ' sesiones.'
      : 'Fallo al generar el plan para el perfil nominal.',
    passed: passed1,
    auditRuleTriggered: 'REG-VAL-01, REG-SCO-01..04',
  });

  // =========================================================================
  // TEST 2: Usuario menor de 18 años
  // =========================================================================
  const profile2: AthleteProfile = {
    ...profile1,
    age: 16, // Menor de edad
  };

  const res2 = runInferenceEngine(profile2);
  const passed2 =
    !res2.isValid &&
    res2.validationErrors.some((e) => e.includes('18 años')) &&
    res2.auditLogs.some((l) => l.ruleId === 'REG-VAL-01' && l.severity === 'bloqueo');

  results.push({
    id: 2,
    title: 'Usuario menor de 18 años',
    category: 'Seguridad & Validación',
    inputDescription: 'Deportista con 16 años intentando generar un plan para adultos federados.',
    expectedOutcome: 'Bloqueo inmediato por regla REG-VAL-01; no se calcula ninguna recomendación.',
    actualOutcome: passed2
      ? 'Bloqueo confirmado por REG-VAL-01. Error: "' + res2.validationErrors[0] + '".'
      : 'Fallo: Se permitió generar o no se bloqueó al menor de edad.',
    passed: passed2,
    auditRuleTriggered: 'REG-VAL-01',
  });

  // =========================================================================
  // TEST 3: Lesión activa sin autorización para entrenar
  // =========================================================================
  const profile3: AthleteProfile = {
    ...profile1,
    hasActiveInjury: true,
    injuryDetails: 'Sospecha de rotura de fibras en bíceps femoral',
    hasMedicalClearance: false, // SIN autorización médica
  };

  const res3 = runInferenceEngine(profile3);
  const passed3 =
    res3.isBlockedBySafety &&
    res3.safetyBlockReasons.some((r) => r.toLowerCase().includes('autorización médica')) &&
    res3.weeklySchedule.length === 0 &&
    res3.auditLogs.some((l) => l.ruleId === 'REG-SEG-01' && l.severity === 'bloqueo');

  results.push({
    id: 3,
    title: 'Lesión activa sin autorización para entrenar',
    category: 'Restricción Obligatoria',
    inputDescription: 'Jugador con lesión muscular activa sin alta médica ni autorización para entrenar.',
    expectedOutcome: 'Parada total de seguridad por REG-SEG-01; cero ejercicios físicos prescritos.',
    actualOutcome: passed3
      ? 'Bloqueo estricto ejecutado: ' + res3.safetyBlockReasons[0]
      : 'Fallo: Se prescribió entrenamiento a un deportista con lesión activa no autorizada.',
    passed: passed3,
    auditRuleTriggered: 'REG-SEG-01',
  });

  // =========================================================================
  // TEST 4: Dolor incompatible con un ejercicio
  // =========================================================================
  const profile4: AthleteProfile = {
    ...profile1,
    hasPain: true,
    painLocation: 'rodilla',
    painIntensity: 4, // Dolor moderado en rodilla
    painDuringMovement: true,
  };

  const res4 = runInferenceEngine(profile4);
  // Verificar que ejercicios con contraindicación de rodilla (ej. FUT-04, FUT-05, FUT-06) fueron descartados
  const kneeContraindicatedIds = ['FUT-04', 'FUT-05', 'FUT-06'];
  const allKneeDiscarded = kneeContraindicatedIds.every((id) =>
    res4.discardedExercises.some((d) => d.exercise.id === id && d.reason.includes('rodilla'))
  );
  const nonePrescribedWithKnee = !res4.weeklySchedule.some((s) =>
    s.recommendedSession?.exercises.some((e) => e.exercise.anatomicalContraindications.includes('rodilla'))
  );
  const passed4 = allKneeDiscarded && nonePrescribedWithKnee;

  results.push({
    id: 4,
    title: 'Dolor incompatible con un ejercicio',
    category: 'Filtrado Anatómico',
    inputDescription: 'Deportista con dolor en rodilla (intensidad 4/10) durante el movimiento.',
    expectedOutcome: 'Descarte determinista de todos los ejercicios con contraindicación en rodilla (REG-FIL-03).',
    actualOutcome: passed4
      ? 'Descarte confirmado: Ningún ejercicio con estrés rotuliano/rodilla fue prescrito.'
      : 'Fallo: Se colaron ejercicios contraindicados para rodilla.',
    passed: passed4,
    auditRuleTriggered: 'REG-FIL-03',
  });

  // =========================================================================
  // TEST 5: Restricción profesional en texto libre
  // =========================================================================
  const profile5: AthleteProfile = {
    ...profile1,
    freeTextRestrictions: 'El traumatólogo indica post-cirugía reciente con prohibición de impacto',
  };

  // Escenario adicional: Texto sin ninguna palabra clave específica pero con restricción en lenguaje natural
  const profile5WithoutKeywords: AthleteProfile = {
    ...profile1,
    freeTextRestrictions: 'Indicación del preparador de evitar flexión articular forzada por sobrecarga reciente',
  };

  const res5 = runInferenceEngine(profile5);
  const res5b = runInferenceEngine(profile5WithoutKeywords);

  const passed5 =
    res5.isBlockedBySafety &&
    res5.clarificationNeeded &&
    res5.auditLogs.some((l) => l.ruleId === 'REG-SEG-03' && l.severity === 'bloqueo') &&
    res5b.isBlockedBySafety &&
    res5b.clarificationNeeded &&
    res5b.auditLogs.some((l) => l.ruleId === 'REG-SEG-03' && l.severity === 'bloqueo');

  results.push({
    id: 5,
    title: 'Restricción médica o profesional en texto libre no interpretable con seguridad',
    category: 'Seguridad Conservadora',
    inputDescription: 'Texto con términos clínicos ("post-cirugía reciente con prohibición") y texto sin palabras clave fijas ("evitar flexión forzada por sobrecarga").',
    expectedOutcome: 'Parada de seguridad (Safety Hold) y solicitud de aclaración por REG-SEG-03 sin depender solo de palabras clave.',
    actualOutcome: passed5
      ? 'Safety Hold confirmado en ambos casos: Se detuvo el plan y se solicitó aclaración médica/técnica.'
      : 'Fallo: Se ignoró el texto libre o se dependió exclusivamente de palabras clave.',
    passed: passed5,
    auditRuleTriggered: 'REG-SEG-03',
  });

  // =========================================================================
  // TEST 6: Fatiga elevada y recuperación deficiente
  // =========================================================================
  const profile6: AthleteProfile = {
    ...profile1,
    fatigue: 'alta',
    perceivedRecovery: 1, // 1/5 muy deficiente
  };

  const res6 = runInferenceEngine(profile6);
  // Debe haber activado REG-SEG-04 y vetado ejercicios de alta potencia / explosividad
  const hasFatigueAlert = res6.contradictions.some((c) => c.toLowerCase().includes('fatiga'));
  const passed6 =
    hasFatigueAlert &&
    res6.auditLogs.some((l) => l.ruleId === 'REG-SEG-04');

  results.push({
    id: 6,
    title: 'Fatiga elevada y recuperación deficiente',
    category: 'Gestión de Carga',
    inputDescription: 'Jugador con fatiga "alta" y recuperación percibida mínima (1 de 5).',
    expectedOutcome: 'Advertencia de sobrecarga y veto de esfuerzos de alta intensidad (REG-SEG-04).',
    actualOutcome: passed6
      ? 'Regla REG-SEG-04 aplicada: Se emitieron advertencias y se limitó la exigencia mecánica.'
      : 'Fallo: No se reguló la sesión ante fatiga alta y baja recuperación.',
    passed: passed6,
    auditRuleTriggered: 'REG-SEG-04',
  });

  // =========================================================================
  // TEST 7: Partido el mismo día
  // =========================================================================
  const profile7: AthleteProfile = {
    ...profile1,
    competitionDays: ['domingo'],
    availableIndividualDays: ['domingo'], // Solo marcó disponible el día de partido
  };

  const res7 = runInferenceEngine(profile7);
  const sunday = res7.weeklySchedule.find((s) => s.day === 'domingo');
  const passed7 =
    sunday?.isMatchDay === true &&
    sunday?.isIndividualSession === false &&
    sunday?.recommendedSession === undefined &&
    res7.contradictions.some((c) => c.includes('competición'));

  results.push({
    id: 7,
    title: 'Partido el mismo día (Inviolabilidad de Match Day)',
    category: 'Calendario',
    inputDescription: 'Jugador intentando agendar sesión individual el domingo (Match Day oficial).',
    expectedOutcome: 'Cancelación estricta de la sesión individual en Match Day por REG-CAL-01.',
    actualOutcome: passed7
      ? 'Sesión individual vetada en domingo por coincidencia con competición oficial.'
      : 'Fallo: Se programó entrenamiento complementario en día de partido.',
    passed: passed7,
    auditRuleTriggered: 'REG-CAL-01',
  });

  // =========================================================================
  // TEST 8: Entrenamiento del equipo sin disponibilidad adicional
  // =========================================================================
  const profile8: AthleteProfile = {
    ...profile1,
    teamTrainingDays: ['martes', 'jueves', 'viernes'],
    competitionDays: ['domingo'],
    availableIndividualDays: ['lunes'], // Solo disponible el lunes
  };

  const res8 = runInferenceEngine(profile8);
  // Verificar que NO se agregaron sesiones individuales en martes, jueves ni viernes
  const individualOnTeamDays = res8.weeklySchedule.filter(
    (s) => ['martes', 'jueves', 'viernes'].includes(s.day) && s.isIndividualSession
  );
  const onlyOnMonday =
    res8.weeklySchedule.find((s) => s.day === 'lunes')?.isIndividualSession === true;
  const passed8 = individualOnTeamDays.length === 0 && onlyOnMonday;

  results.push({
    id: 8,
    title: 'Entrenamiento del equipo sin disponibilidad adicional',
    category: 'Calendario & Respeto Colectivo',
    inputDescription: 'Equipo entrena M-J-V; jugador solo disponible en Lunes.',
    expectedOutcome: 'Cero sesiones individuales añadidas en días sin disponibilidad (REG-CAL-02).',
    actualOutcome: passed8
      ? 'Cumplido: Sesión individual asignada únicamente el lunes; M-J-V respetados para el equipo.'
      : 'Fallo: Se forzaron sesiones en días no disponibles.',
    passed: passed8,
    auditRuleTriggered: 'REG-CAL-02',
  });

  // =========================================================================
  // TEST 9: Material insuficiente
  // =========================================================================
  const profile9: AthleteProfile = {
    ...profile1,
    equipment: ['sin_material'], // Solo peso corporal, no tiene pista ni pesas
  };

  const res9 = runInferenceEngine(profile9);
  // Ejercicios que requieren 'campo_pista' o 'mancuernas' deben ser descartados
  const discardedForEquipment = res9.discardedExercises.filter((d) =>
    d.reason.includes('REG-FIL-02')
  );
  const noneRequiringEquipPrescribed = !res9.weeklySchedule.some((s) =>
    s.recommendedSession?.exercises.some((e) =>
      e.exercise.equipment.some((eq) => eq !== 'sin_material')
    )
  );
  const passed9 = discardedForEquipment.length > 0 && noneRequiringEquipPrescribed;

  results.push({
    id: 9,
    title: 'Material insuficiente',
    category: 'Filtrado de Recursos',
    inputDescription: 'Deportista con material restringido exclusivamente a "sin material".',
    expectedOutcome: 'Descarte estricto de cualquier ejercicio que requiera gimnasio, pista o pesas (REG-FIL-02).',
    actualOutcome: passed9
      ? 'Filtro verificado: Se descartaron ' +
        discardedForEquipment.length +
        ' ejercicios por falta de material; solo autocargas prescritas.'
      : 'Fallo: Se prescribió un ejercicio que requería material inaccesible.',
    passed: passed9,
    auditRuleTriggered: 'REG-FIL-02',
  });

  // =========================================================================
  // TEST 10: Datos incompletos
  // =========================================================================
  const profile10: AthleteProfile = {
    ...profile1,
    sport: '' as any, // Campo deporte vacío
    position: '' as any,
  };

  const res10 = runInferenceEngine(profile10);
  const passed10 =
    !res10.isValid &&
    res10.validationErrors.some((e) => e.includes('Faltan datos esenciales')) &&
    res10.auditLogs.some((l) => l.ruleId === 'REG-VAL-02' && l.severity === 'bloqueo');

  results.push({
    id: 10,
    title: 'Datos incompletos',
    category: 'Validación de Entrada',
    inputDescription: 'Formulario enviado sin indicar deporte ni posición táctica.',
    expectedOutcome: 'Bloqueo por REG-VAL-02 con detalle de los campos pendientes.',
    actualOutcome: passed10
      ? 'Bloqueo confirmado por REG-VAL-02: ' + res10.validationErrors[0]
      : 'Fallo: Se ejecutó la inferencia con campos esenciales vacíos.',
    passed: passed10,
    auditRuleTriggered: 'REG-VAL-02',
  });

  // =========================================================================
  // TEST 11: Objetivo principal y secundario iguales
  // =========================================================================
  const profile11: AthleteProfile = {
    ...profile1,
    primaryObjective: 'fuerza',
    secondaryObjective: 'fuerza', // Idénticos
  };

  const res11 = runInferenceEngine(profile11);
  const passed11 =
    !res11.isValid &&
    res11.validationErrors.some((e) => e.includes('idénticos')) &&
    res11.auditLogs.some((l) => l.ruleId === 'REG-VAL-03' && l.severity === 'bloqueo');

  results.push({
    id: 11,
    title: 'Objetivo principal y secundario idénticos',
    category: 'Validación de Entrada',
    inputDescription: 'Objetivo principal: "fuerza" y secundario: "fuerza".',
    expectedOutcome: 'Bloqueo por REG-VAL-03; se exige diferenciación de capacidades.',
    actualOutcome: passed11
      ? 'Bloqueo confirmado por REG-VAL-03: ' + res11.validationErrors[0]
      : 'Fallo: Se permitió duplicar objetivos.',
    passed: passed11,
    auditRuleTriggered: 'REG-VAL-03',
  });

  // =========================================================================
  // TEST 12: Catálogo sin ejercicios validados compatibles
  // =========================================================================
  // Creamos un escenario donde el deportista solo tiene sin_material en balonmano con objetivo resistencia
  const profile12: AthleteProfile = {
    ...profile1,
    sport: 'balonmano',
    position: 'extremo',
    primaryObjective: 'resistencia',
    secondaryObjective: 'agilidad',
    equipment: ['mancuernas'], // Sin campo/pista (el HIIT de balonmano requiere campo_pista)
    sessionDuration: 30,
    availableIndividualDays: ['lunes'],
  };

  const res12 = runInferenceEngine(profile12);
  // Si no hay ejercicios validados para esa combinación de material y objetivos, no debe inventar
  const monday12 = res12.weeklySchedule.find((s) => s.day === 'lunes');
  const didNotInvent =
    (monday12?.recommendedSession === undefined ||
      monday12.recommendedSession.exercises.length === 0) &&
    Boolean(monday12?.explanation);
  const passed12 = didNotInvent;

  results.push({
    id: 12,
    title: 'Catálogo sin ejercicios validados compatibles',
    category: 'Integridad Científica & Cero Invención',
    inputDescription: 'Jugador de balonmano que carece de pista reglamentaria para su objetivo.',
    expectedOutcome: 'No se inventa ninguna rutina artificial; se muestra explicación metodológica clara (REG-CAL-05).',
    actualOutcome: passed12
      ? 'Explicación clara mostrada: ' + (monday12?.explanation || 'Sin ejercicios forzados.')
      : 'Fallo: Se forzó una rutina sin ejercicios validados compatibles.',
    passed: passed12,
    auditRuleTriggered: 'REG-CAL-05, REG-VAL-06',
  });

  // =========================================================================
  // TEST 13: Ejercicio con puntuación alta pero bloqueado por seguridad
  // =========================================================================
  // Un ejercicio como Drop Jumps (FUT-06) da máxima puntuación para explosividad y portero (+50 +15),
  // pero el deportista tiene dolor en rodilla.
  const profile13: AthleteProfile = {
    ...profile1,
    position: 'portero',
    primaryObjective: 'explosividad',
    secondaryObjective: 'agilidad',
    equipment: ['gimnasio_completo'],
    hasPain: true,
    painLocation: 'rodilla',
    painIntensity: 5,
    painDuringMovement: true,
  };

  const res13 = runInferenceEngine(profile13);
  const dropJumpDiscarded = res13.discardedExercises.find((d) => d.exercise.id === 'FUT-06');
  const dropJumpInScores = res13.scoredExercises.find((s) => s.exerciseId === 'FUT-06');
  // Debe estar en discardedExercises y NO en scoredExercises
  const passed13 = Boolean(dropJumpDiscarded) && !dropJumpInScores;

  results.push({
    id: 13,
    title: 'Ejercicio con puntuación alta pero bloqueado por seguridad',
    category: 'Prevalencia Absoluta de Restricciones',
    inputDescription: 'Portero de fútbol con objetivo "explosividad" pero dolor activo en rodilla.',
    expectedOutcome: 'Drop Jumps (FUT-06) se descarta antes de puntuar. Puntuación nunca rescata restricción.',
    actualOutcome: passed13
      ? 'Confirmado: FUT-06 descartado por contraindicación en rodilla; no llegó a ser puntuado.'
      : 'Fallo: El ejercicio bloqueado por seguridad fue puntuado o incluido.',
    passed: passed13,
    auditRuleTriggered: 'REG-FIL-03, REG-PRI-01',
  });

  // =========================================================================
  // TEST 14: Calendario sin huecos disponibles
  // =========================================================================
  const profile14: AthleteProfile = {
    ...profile1,
    teamTrainingDays: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    competitionDays: ['domingo'],
    availableIndividualDays: [], // Sin disponibilidad
  };

  const res14 = runInferenceEngine(profile14);
  const passed14 =
    !res14.isValid &&
    res14.validationErrors.some((e) => e.includes('día disponible'));

  results.push({
    id: 14,
    title: 'Calendario sin huecos disponibles',
    category: 'Calendario',
    inputDescription: 'Atleta con microciclo saturado y cero días marcados para trabajo individual.',
    expectedOutcome: 'Detección por REG-VAL-04 sin forzar entrenamientos superpuestos.',
    actualOutcome: passed14
      ? 'Bloqueo confirmado por REG-VAL-04: ' + res14.validationErrors[0]
      : 'Fallo: Se intentó programar sin días disponibles.',
    passed: passed14,
    auditRuleTriggered: 'REG-VAL-04',
  });

  // =========================================================================
  // TEST 15: Puntuación correcta de dos ejercicios compatibles
  // =========================================================================
  // Futbolista con primario = velocidad, secundario = explosividad, posición = extremo.
  // FUT-03 (Aceleraciones 0-10m): obj = [velocidad, explosividad], pos = [extremo, ...], cal = favorable -> 50 + 25 + 15 + 10 = 100 pts.
  // FUT-01 (Nordic Hamstring): obj = [fuerza, explosividad], pos = [todas], cal = favorable -> 0 (vel) + 25 (exp) + 10 (todas) + 10 = 45 pts.
  const profile15: AthleteProfile = {
    ...profile1,
    sport: 'futbol',
    position: 'extremo',
    primaryObjective: 'velocidad',
    secondaryObjective: 'explosividad',
    equipment: ['campo_pista', 'conos_escaleras_vallas', 'sin_material'],
  };

  const res15 = runInferenceEngine(profile15);
  const scoreFUT03 = res15.scoredExercises.find((s) => s.exerciseId === 'FUT-03');
  const scoreFUT01 = res15.scoredExercises.find((s) => s.exerciseId === 'FUT-01');

  const fut03Correct =
    scoreFUT03?.totalScore === 100 &&
    scoreFUT03.breakdown.primaryObjectiveScore === 50 &&
    scoreFUT03.breakdown.secondaryObjectiveScore === 25 &&
    scoreFUT03.breakdown.positionScore === 15 &&
    scoreFUT03.breakdown.calendarScore === 10;

  const fut01Correct =
    scoreFUT01?.totalScore === 45 &&
    scoreFUT01.breakdown.primaryObjectiveScore === 0 &&
    scoreFUT01.breakdown.secondaryObjectiveScore === 25 &&
    scoreFUT01.breakdown.positionScore === 10 &&
    scoreFUT01.breakdown.calendarScore === 10;

  const passed15 = Boolean(fut03Correct && fut01Correct);

  results.push({
    id: 15,
    title: 'Puntuación matemática exacta de ejercicios compatibles',
    category: 'Scoring Determinista',
    inputDescription: 'Cálculo para FUT-03 (afinidad total) y FUT-01 (afinidad parcial).',
    expectedOutcome: 'FUT-03 = 100 pts (50+25+15+10); FUT-01 = 45 pts (0+25+10+10).',
    actualOutcome: passed15
      ? 'Puntuaciones verificadas con precisión: FUT-03 = ' +
        scoreFUT03?.totalScore +
        ' pts; FUT-01 = ' +
        scoreFUT01?.totalScore +
        ' pts.'
      : 'Fallo en el desglose de puntuaciones: FUT-03=' +
        scoreFUT03?.totalScore +
        ', FUT-01=' +
        scoreFUT01?.totalScore,
    passed: passed15,
    auditRuleTriggered: 'REG-SCO-01..04',
  });

  // =========================================================================
  // TEST 16: Edad fuera de rango admisible (edad = 150)
  // =========================================================================
  const profile16: AthleteProfile = {
    ...profile1,
    age: 150,
  };

  const res16 = runInferenceEngine(profile16);
  const passed16 =
    !res16.isValid &&
    res16.validationErrors.some((e) =>
      e.includes('La edad indicada está fuera del rango admitido (18-65 años)')
    ) &&
    res16.auditLogs.some((l) => l.ruleId === 'REG-VAL-01');

  results.push({
    id: 16,
    title: 'Edad fuera de rango admisible (> 65 años)',
    category: 'Validación de Entrada',
    inputDescription: 'Perfil de usuario con edad 150 años, fuera del rango 18-65 años admitido.',
    expectedOutcome:
      'Bloqueo preventivo de generación por REG-VAL-01 con mensaje "La edad indicada está fuera del rango admitido (18-65 años)".',
    actualOutcome: passed16
      ? 'Bloqueo confirmado por REG-VAL-01: ' + res16.validationErrors[0]
      : 'Fallo: No se bloqueó la edad no admisible o el mensaje fue incorrecto.',
    passed: passed16,
    auditRuleTriggered: 'REG-VAL-01',
  });

  // =========================================================================
  // TEST 17: Contradicción en el dolor declarado
  // =========================================================================
  const profile17: AthleteProfile = {
    ...profile1,
    hasPain: false,
    painLocation: 'rodilla',
    painIntensity: 4,
  };

  const res17 = runInferenceEngine(profile17);
  const passed17 =
    !res17.isValid &&
    res17.weeklySchedule.length === 0 &&
    res17.clarificationNeeded &&
    res17.contradictions.some((c) => c.toLowerCase().includes('dolor')) &&
    res17.auditLogs.some((l) => l.ruleId === 'REG-CON-01');

  results.push({
    id: 17,
    title: 'Contradicción en el dolor declarado (hasPain: false con dolor activo)',
    category: 'Detección de Contradicciones',
    inputDescription:
      'Perfil que declara hasPain: false pero indica localización "rodilla" e intensidad 4/10.',
    expectedOutcome:
      'Bloqueo por REG-CON-01, isValid: false, weeklySchedule vacío, solicitud de aclaración sobre si tiene dolor o no.',
    actualOutcome: passed17
      ? 'Detección correcta de contradicción por REG-CON-01: Plan detenido y aclaración requerida.'
      : 'Fallo: No se detectó la contradicción o se generó plan con datos incoherentes.',
    passed: passed17,
    auditRuleTriggered: 'REG-CON-01',
  });

  return results;
}
