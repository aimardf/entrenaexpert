export interface ExpertRule {
  id: string;
  category: 'validacion' | 'seguridad' | 'contradiccion' | 'calendario' | 'filtrado' | 'puntuacion';
  name: string;
  description: string;
  antecedent: string; // SI (IF)
  consequent: string; // ENTONCES (THEN)
  isBlocking: boolean;
  sources: string[];
}

export const EXPERT_RULES: ExpertRule[] = [
  // 1. REGLAS DE VALIDACIÓN E INTEGRIDAD DE DATOS
  {
    id: 'REG-VAL-01',
    category: 'validacion',
    name: 'Mayoría de edad federada y rango admitido',
    description: 'El sistema solo admite deportistas federados adultos en el rango de 18 a 65 años con número entero válido.',
    antecedent: 'SI la edad del deportista es inferior a 18 años, superior a 65 años o no es un número entero válido',
    consequent: 'ENTONCES denegar de inmediato la generación del plan de entrenamiento.',
    isBlocking: true,
    sources: [
      'Lloyd RS et al. (2014) Position statement on youth resistance training: the 2014 International Consensus. Br J Sports Med 48:498-505',
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-VAL-02',
    category: 'validacion',
    name: 'Completitud de datos esenciales',
    description: 'Debe proporcionarse toda la información requerida (deporte, puesto, nivel, objetivos y equipamiento).',
    antecedent: 'SI falta alguno de los datos esenciales del perfil deportivo',
    consequent: 'ENTONCES suspender la inferencia y solicitar al deportista que complete los campos pendientes.',
    isBlocking: true,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-VAL-03',
    category: 'validacion',
    name: 'Disparidad de objetivos',
    description: 'El objetivo principal y secundario deben ser distintos para permitir una priorización coherente.',
    antecedent: 'SI el objetivo principal es idéntico al objetivo secundario',
    consequent: 'ENTONCES bloquear la inferencia y solicitar la selección de objetivos diferenciados.',
    isBlocking: true,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-VAL-04',
    category: 'validacion',
    name: 'Disponibilidad temporal individual',
    description: 'Debe existir al menos un día disponible para planificar sesiones complementarias.',
    antecedent: 'SI no se seleccionan días disponibles para entrenar individualmente',
    consequent: 'ENTONCES no planificar ninguna sesión individual y notificar ausencia de disponibilidad.',
    isBlocking: true,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-VAL-05',
    category: 'validacion',
    name: 'Duración de sesión dentro de rango fisiológico',
    description: 'La sesión debe ubicarse entre 15 y 120 minutos en intervalos discretos de 15.',
    antecedent: 'SI la duración < 15 min o > 120 min o no es múltiplo de 15',
    consequent: 'ENTONCES rechazar el parámetro de duración por incompatibilidad metodológica.',
    isBlocking: true,
    sources: [
      'American College of Sports Medicine (2021) ACSM’s Guidelines for Exercise Testing and Prescription, 11th ed.',
    ],
  },
  {
    id: 'REG-VAL-06',
    category: 'validacion',
    name: 'Criterio estricto de validación completa',
    description: 'Solo ejercicios con estado "validado" y parámetros documentados pueden prescribirse.',
    antecedent: 'SI el ejercicio tiene estado "pendiente" O "documentado_parcialmente"',
    consequent: 'ENTONCES no incluir en la rutina activa; clasificar en el catálogo explicativo con indicación de qué falta verificar.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },

  // 2. REGLAS DE CONTRADICCIÓN EN DATOS
  {
    id: 'REG-CON-01',
    category: 'contradiccion',
    name: 'Contradicción en el dolor declarado',
    description: 'Detecta incoherencias entre declarar ausencia de dolor y registrar una localización distinta de "ninguno" o intensidad mayor que cero.',
    antecedent: 'SI hasPain es falso pero painLocation es distinto de "ninguno" o painIntensity es mayor que 0',
    consequent: 'ENTONCES no generar el plan, registrar la contradicción, marcar la recomendación como no válida y solicitar aclaración al usuario sobre si tiene dolor o no.',
    isBlocking: true,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },

  // 3. REGLAS OBLIGATORIAS DE SEGURIDAD (HARD CONSTRAINTS)
  {
    id: 'REG-SEG-01',
    category: 'seguridad',
    name: 'Lesión activa sin autorización médica formal',
    description: 'Si existe lesión activa y el deportista carece de autorización médica para entrenar, no se puede pautar ejercicio físico.',
    antecedent: 'SI el deportista declara lesión activa Y NO cuenta con autorización médica explícita para entrenar',
    consequent: 'ENTONCES SUSPENDER de forma preventiva la recomendación de entrenamientos físicos y aconsejar valoración con los profesionales sanitarios del club.',
    isBlocking: true,
    sources: [
      'Ardern CL et al. (2016) 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med 50:853-864',
    ],
  },
  {
    id: 'REG-SEG-02',
    category: 'seguridad',
    name: 'Dolor durante movimientos deportivos o dolor agudo (EVA >= 7)',
    description: 'El dolor que se manifiesta en el gesto motriz o con intensidad severa exige prudencia extrema.',
    antecedent: 'SI presenta dolor agudo (EVA >= 7) O dolor durante el movimiento deportivo',
    consequent: 'ENTONCES descartar automáticamente todos los ejercicios que involucren la cadena cinética de la zona afectada o suspender la sesión si la afectación es sistémica.',
    isBlocking: true,
    sources: [
      'Silbernagel KG et al. (2007) Continued sporting activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med 35(6):897-906',
      'Ardern CL et al. (2016) Br J Sports Med 50:853-864',
    ],
  },
  {
    id: 'REG-SEG-03',
    category: 'seguridad',
    name: 'Restricciones profesionales en texto libre no interpretables con seguridad',
    description: 'Si el deportista introduce restricciones médicas o de preparador en texto libre que no puedan interpretarse con seguridad determinista.',
    antecedent: 'SI existen restricciones en texto libre que contengan indicaciones clínicas o profesionales que no puedan interpretarse de forma unívoca y segura',
    consequent: 'ENTONCES activar parada de seguridad (Safety Hold), solicitar aclaración o suspender la recomendación.',
    isBlocking: true,
    sources: [
      'Warburton DER et al. PAR-Q+ (Physical Activity Readiness Questionnaire for Everyone), eparmedx.com',
      'ACSM (2021) Guidelines for Exercise Testing and Prescription, 11th ed.',
    ],
  },
  {
    id: 'REG-SEG-04',
    category: 'seguridad',
    name: 'Protección ante fatiga elevada y recuperación deficiente',
    description: 'Evitar sobreentrenamiento agudo y riesgo lesional ante fatiga acumulada excesiva.',
    antecedent: 'SI la fatiga es "extrema" O (fatiga "alta" con recuperación percibida <= 2 sobre 5)',
    consequent: 'ENTONCES VETAR cualquier sesión de alta intensidad, fuerza máxima o pliometría reactiva; ante fatiga extrema, suspender la recomendación autónoma por prudencia y aconsejar valoración con el club.',
    isBlocking: false,
    sources: [
      'Meeusen R et al. (2013) Prevention, diagnosis and treatment of the overtraining syndrome: joint consensus statement of the ECSS and the ACSM. Med Sci Sports Exerc 45(1):186-205',
    ],
  },
  {
    id: 'REG-SEG-05',
    category: 'seguridad',
    name: 'Delimitación deontológica: Prohibición de diagnóstico y rehabilitación',
    description: 'El sistema es un asesor de acondicionamiento para deportistas sanos, no una herramienta clínica.',
    antecedent: 'SIEMPRE',
    consequent: 'ENTONCES no realizar diagnósticos patológicos ni pautas de rehabilitación lesional.',
    isBlocking: false,
    sources: [
      'Ley 44/2003 de ordenación de las profesiones sanitarias (BOE)',
    ],
  },

  // 4. REGLAS DE CALENDARIO Y GESTIÓN DE CARGA (MICROCICLO)
  {
    id: 'REG-CAL-01',
    category: 'calendario',
    name: 'Inviolabilidad del día de partido (Match Day)',
    description: 'Bajo ninguna circunstancia se añadirán sesiones individuales en días de competición oficial.',
    antecedent: 'SI un día está marcado como día de competición oficial (partido)',
    consequent: 'ENTONCES prohibir la inclusión de cualquier sesión individual en ese día.',
    isBlocking: false,
    sources: [
      'Bompa TO, Haff GG (2009) Periodization: Theory and Methodology of Training, 5th ed.',
      'Mujika I, Padilla S (2003) Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc 35(7):1182-1187',
    ],
  },
  {
    id: 'REG-CAL-02',
    category: 'calendario',
    name: 'Respeto a la disponibilidad declarada y entrenamientos colectivos',
    description: 'Nunca programar en días no marcados como disponibles por el atleta.',
    antecedent: 'SI un día de la semana no figura en los días disponibles para entrenar individualmente',
    consequent: 'ENTONCES no asignar ninguna sesión en dicho día.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-CAL-03',
    category: 'calendario',
    name: 'Regulación de víspera de partido (MD-1)',
    description: 'En MD-1 solo se permiten activaciones neuromusculares cortas (<=30 min) sin daño muscular excéntrico ni volumen fatigante.',
    antecedent: 'SI una sesión individual coincide con MD-1',
    consequent: 'ENTONCES vetar ejercicios de fuerza pesada, hipertrofia o series al fallo; limitar a velocidad reactiva corta o técnica.',
    isBlocking: false,
    sources: [
      'Bompa TO, Haff GG (2009) Periodization: Theory and Methodology of Training, 5th ed.',
      'Mujika I, Padilla S (2003) Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc 35(7):1182-1187',
    ],
  },
  {
    id: 'REG-CAL-04',
    category: 'calendario',
    name: 'Regulación post-competición (MD+1)',
    description: 'En MD+1 se prioriza la regeneración celular y la descarga articular.',
    antecedent: 'SI una sesión individual coincide con MD+1',
    consequent: 'ENTONCES excluir ejercicios pliométricos de alto impacto y sprints máximos.',
    isBlocking: false,
    sources: [
      'Nédélec M et al. (2012) Recovery in soccer: part I – post-match fatigue and time course of recovery. Sports Med 42(12):997-1015',
    ],
  },
  {
    id: 'REG-CAL-05',
    category: 'calendario',
    name: 'Prohibición de elusión de restricciones por falta de ejercicios (Anti-Fallback Peligroso)',
    description: 'Si en un día del calendario no quedan ejercicios válidos y compatibles, no se debe reintroducir ningún ejercicio descartado.',
    antecedent: 'SI no existen ejercicios válidos compatibles para una sesión',
    consequent: 'ENTONCES mostrar una explicación clara y dejar la sesión sin prescribir, sin recurrir a fallbacks que violen restricciones.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },

  // 5. REGLAS DE FILTRADO DETERMINISTA
  {
    id: 'REG-FIL-01',
    category: 'filtrado',
    name: 'Filtro por deporte federado',
    description: 'Excluye de forma estricta ejercicios de otros deportes.',
    antecedent: 'SI el deporte del ejercicio no coincide con el deporte federado del atleta',
    consequent: 'ENTONCES descartar el ejercicio.',
    isBlocking: false,
    sources: [
      'Haff GG, Triplett NT (2016) Essentials of Strength Training and Conditioning, 4th ed. NSCA',
    ],
  },
  {
    id: 'REG-FIL-02',
    category: 'filtrado',
    name: 'Filtro por equipamiento indispensable',
    description: 'El deportista debe disponer de todo el material requerido por el ejercicio.',
    antecedent: 'SI el ejercicio requiere material que el deportista no posee',
    consequent: 'ENTONCES descartar el ejercicio.',
    isBlocking: false,
    sources: [
      'Haff GG, Triplett NT (2016) Essentials of Strength Training and Conditioning, 4th ed. NSCA',
    ],
  },
  {
    id: 'REG-FIL-03',
    category: 'filtrado',
    name: 'Filtro por contraindicación anatómica',
    description: 'Excluye ejercicios que estresen zonas con dolor reportado.',
    antecedent: 'SI el deportista tiene molestia en una zona y el ejercicio está contraindicado para esa zona',
    consequent: 'ENTONCES descartar el ejercicio.',
    isBlocking: false,
    sources: [
      'Silbernagel KG et al. (2007) Continued sporting activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med 35(6):897-906',
      'Ardern CL et al. (2016) Br J Sports Med 50:853-864',
    ],
  },
  {
    id: 'REG-FIL-04',
    category: 'filtrado',
    name: 'Filtro por nivel competitivo',
    description: 'Adecuación de la complejidad técnica al nivel del deportista.',
    antecedent: 'SI el nivel del deportista no está habilitado en el ejercicio',
    consequent: 'ENTONCES descartar el ejercicio.',
    isBlocking: false,
    sources: [
      'Haff GG, Triplett NT (2016) Essentials of Strength Training and Conditioning, 4th ed. NSCA',
    ],
  },

  // 6. REGLAS DE PUNTUACIÓN PONDERADA (SOLO TRAS SUPERAR FILTROS OBLIGATORIOS)
  {
    id: 'REG-SCO-01',
    category: 'puntuacion',
    name: 'Ponderación por objetivo principal (+50 pts)',
    description: 'Bonifica el ejercicio que atiende directamente la capacidad prioritaria.',
    antecedent: 'SI el ejercicio compatible incluye el objetivo principal',
    consequent: 'ENTONCES sumar 50 puntos.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-SCO-02',
    category: 'puntuacion',
    name: 'Ponderación por objetivo secundario (+25 pts)',
    description: 'Bonifica el ejercicio que desarrolla la capacidad sinérgica.',
    antecedent: 'SI el ejercicio compatible incluye el objetivo secundario',
    consequent: 'ENTONCES sumar 25 puntos.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-SCO-03',
    category: 'puntuacion',
    name: 'Ponderación por posición táctica (+15 pts)',
    description: 'Bonifica la especificidad biomecánica del puesto deportivo.',
    antecedent: 'SI el ejercicio compatible es específico para la posición del atleta (15 pts) o transversal para todas (10 pts)',
    consequent: 'ENTONCES sumar 15 o 10 puntos correspondientes.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
  {
    id: 'REG-SCO-04',
    category: 'puntuacion',
    name: 'Ponderación por adecuación al microciclo (+10 pts)',
    description: 'Bonifica la sincronización de la curva de fatiga con la distancia al partido.',
    antecedent: 'SI la curva de esfuerzo del ejercicio concuerda con la fase semanal',
    consequent: 'ENTONCES sumar 10 puntos.',
    isBlocking: false,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },

  // 7. REGLA FUNDAMENTAL DE PREVALENCIA
  {
    id: 'REG-PRI-01',
    category: 'seguridad',
    name: 'Inviolabilidad de las restricciones obligatorias',
    description: 'Una puntuación alta nunca puede anular una restricción de seguridad o filtrado.',
    antecedent: 'SIEMPRE',
    consequent: 'ENTONCES las restricciones se evalúan con carácter previo y excluyente al cálculo de puntuaciones.',
    isBlocking: true,
    sources: [
      'Decisión de diseño del sistema (justificada en la memoria)',
    ],
  },
];

export const EXPERT_RULES_MAP: Record<string, ExpertRule> = EXPERT_RULES.reduce(
  (acc, rule) => {
    acc[rule.id] = rule;
    return acc;
  },
  {} as Record<string, ExpertRule>
);

export function getRuleSources(ruleId: string): string[] {
  return EXPERT_RULES_MAP[ruleId]?.sources || ['Decisión de diseño del sistema (justificada en la memoria)'];
}
