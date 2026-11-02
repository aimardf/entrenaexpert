# SportExpert · Sistema Experto Determinista de Entrenamiento Deportivo

- **Aplicación (Google AI Studio):** https://ai.studio/apps/916ce17a-34c6-4d60-aedb-0e04edde43fe
- **Repositorio:** https://github.com/aimardf/entrenaexpert

**SportExpert** es una aplicación web basada en un sistema experto determinista mediante reglas de inferencia **SI-ENTONCES** (*IF-THEN*), concebida para la prescripción de entrenamientos personalizados y seguros a deportistas federados adultos en **fútbol**, **balonmano** y **baloncesto**.

A diferencia de modelos generativos o chatbots que inventan cargas de trabajo y fuentes bibliográficas, SportExpert aplica una arquitectura algorítmica de **cero invención**, garantizando que las restricciones obligatorias de seguridad deportiva, el estado físico y el calendario competitivo prevalezcan en todo momento sobre cualquier puntuación matemática.

---

## 1. Objetivo y Usuarios

### Objetivo
Prescribir microciclos de acondicionamiento físico individualizado y seguro complementario al entrenamiento colectivo, respetando estrictamente la carga competitiva (partidos oficiales), los días de equipo, el equipamiento accesible y el perfil osteomuscular del atleta.

### Usuarios
- **Deportistas federados adultos (mayores de 18 años)** en categorías autonómicas, nacionales o profesionales de fútbol, balonmano y baloncesto.
- **Preparadores físicos y entrenadores** que requieren auditar de forma transparente el razonamiento metodológico de cada prescripción, los descartes efectuados y las reglas de seguridad activadas.

---

## 2. Tecnologías Utilizadas

- **Framework:** React 19 (SPA moderna orientada a componentes funcionales y hooks).
- **Tipado Estricto:** TypeScript 5.8+ con interfaces completas de dominio y chequeo en tiempo de compilación.
- **Estilos y Diseño:** Tailwind CSS v4 con arquitectura en modo oscuro (*slate/emerald/cyan*), tarjetas técnicas e iconografía vectorial deportiva.
- **Iconos y Animaciones:** Lucide React y Motion para micro-interacciones de alta fidelidad.
- **Herramienta de Compilación:** Vite 8.
- **Ejecución de Pruebas:** Node.js con `tsx` para la ejecución instantánea del motor experto en línea de comandos y en interfaz.

---

## 3. Arquitectura del Proyecto

El código está desacoplado en módulos especializados para garantizar la mantenibilidad y la explicabilidad del sistema:

```
├── README.md                      # Documentación completa y manual de auditoría
├── package.json                   # Dependencias y scripts de compilación/ejecución
├── index.html                     # Entrada HTML con metadatos y tipografía Plus Jakarta Sans
├── src/
│   ├── types/
│   │   └── index.ts               # Tipos, interfaces del perfil, ejercicios y auditoría
│   ├── knowledge/
│   │   ├── rules.ts               # Base de conocimiento declarativa de reglas SI-ENTONCES
│   │   └── exercises.ts           # Catálogo integral de 60 ejercicios y estados de validación
│   ├── engine/
│   │   └── inferenceEngine.ts     # Motor determinista por etapas (Forward Chaining)
│   ├── tests/
│   │   ├── testSuite.ts           # Definición de los 15 escenarios formales de prueba
│   │   └── runTests.ts            # Script CLI ejecutable para verificación determinista
│   ├── components/
│   │   ├── Navbar.tsx             # Barra superior con navegación y acceso a pruebas
│   │   ├── HomeHero.tsx           # Pantalla de bienvenida y llamada a la acción
│   │   ├── HowItWorks.tsx         # Explicación interactiva del motor de inferencia
│   │   ├── AthleteForm.tsx        # Formulario del deportista con selectores de prueba
│   │   ├── RecommendationView.tsx # Presentación del plan semanal y avisos
│   │   ├── WeeklyCalendar.tsx     # Microciclo visual de 7 días (equipo, partido, individual)
│   │   ├── SessionDetailModal.tsx # Ficha técnica de ejercicio con cues y dosificación
│   │   ├── KnowledgeCatalog.tsx   # Explorador y filtrado de los 60 ejercicios
│   │   ├── InferenceAuditView.tsx # Consola de auditoría de reglas y matriz de scoring
│   │   ├── TestSuiteView.tsx      # Panel interactivo de ejecución de pruebas en UI
│   │   └── SafetyDisclaimer.tsx   # Aviso deontológico y límites de seguridad clínica
│   ├── App.tsx                    # Orquestador principal de estado y vistas
│   └── main.tsx                   # Punto de montaje React DOM
```

---

## 4. Motor de Inferencia: Etapas de Evaluación

El motor sigue un pipeline determinista secuencial irreversible. **Las restricciones obligatorias de seguridad y compatibilidad se evalúan antes de cualquier cómputo de puntuación**:

```
[Datos del Perfil]
       │
       ▼
[Etapa 1: Validación Inicial] ──────────► (Bloqueo si menor de 18 años o datos incoherentes)
       │
       ▼
[Etapa 2: Filtros Duros de Seguridad] ──► (Safety Hold si hay lesión no autorizada,
       │                                   dolor agudo o texto libre no interpretable)
       ▼
[Etapa 3: Planificación de Microciclo] ─► (Inviolabilidad de Match Day y respeto de días de equipo)
       │
       ▼
[Etapa 4: Filtrado Anatómico y Recursos] (Descarte por material, demarcación o dolor en movimiento)
       │
       ▼
[Etapa 5: Scoring Ponderado] ───────────► (Cálculo matemático sobre ejercicios que superaron etapas 1-4)
       │
       ▼
[Etapa 6: Criterio Estricto de Validación] (Solo ejercicios "validado" pasan a la sesión)
       │
       ▼
[Etapa 7: Asignación al Calendario] ───► (Sin fallbacks artificiales; explicación si no hay candidatos)
```

### Detalle de las Etapas

1. **Etapa 1: Validación de Datos de Entrada**
   - Comprueba edad mínima obligatoria (18 años).
   - Verifica que el objetivo principal y el secundario sean diferentes.
   - Exige disponibilidad individual declarada y material seleccionado.

2. **Etapa 2: Restricciones Obligatorias de Seguridad (Hard Constraints)**
   - **Lesión activa sin autorización (`REG-SEG-01`):** Si hay lesión reportada y `hasMedicalClearance: false`, se bloquea por completo la prescripción física.
   - **Dolor severo (`REG-SEG-02`):** Escala EVA ≥ 7 suspende preventivamente el entrenamiento autónomo.
   - **Restricción en texto libre (`REG-SEG-03`):** Cualquier indicación médica o técnica en texto libre que no sea una confirmación explícita de ausencia de limitaciones activa una parada preventiva (*Safety Hold*) y solicita aclaración médica. **No depende únicamente de palabras clave fijas**.
   - **Fatiga extrema (`REG-SEG-04`):** Detiene la asignación de entrenamientos autónomos por prudencia deportiva y sugiere valorar la recuperación con el club.

3. **Etapa 3: Microciclo y Calendario Competitivo**
   - **Inviolabilidad del partido (`REG-CAL-01`):** Nunca se agendan sesiones individuales en días de competición oficial.
   - **Respeto al equipo (`REG-CAL-02`):** Los días de entrenamiento colectivo no se sobrescriben.
   - **Víspera de partido MD-1 (`REG-CAL-03`):** Se vetan ejercicios excéntricos fatigantes o de volumen alto; solo activación reactiva corta.
   - **Día posterior MD+1 (`REG-CAL-04`):** Se excluyen pliometrías de alto impacto o sobrecargas pesadas.

4. **Etapa 4: Filtrado Anatómico y de Material**
   - **Dolor en movimiento (`REG-FIL-03`):** Si el atleta declara dolor articular/muscular en movimiento, se descartan de forma estricta todos los ejercicios cuya cadena cinética coincida con la zona afectada (ej. dolor en rodilla elimina *Drop Jumps*, sentadillas pesadas y saltos reactivos).
   - **Material disponible (`REG-FIL-02`):** Se descarta cualquier ejercicio que requiera equipamiento no disponible.

5. **Etapa 5: Puntuación Ponderada de Ejercicios Compatibles**
   - **Objetivo Principal:** +50 puntos.
   - **Objetivo Secundario:** +25 puntos.
   - **Posición Deportiva:** +15 puntos (específica del puesto) o +10 puntos (transversal a todas las posiciones).
   - **Compatibilidad con Microciclo:** +10 puntos.
   *(Nota: Los pesos son decisiones de diseño de la interfaz y no constantes científicas).*

6. **Etapa 6 y 7: Rigor Metodológico y Cero Invención**
   - Solo los ejercicios con estado formal `validado` y dosificación contrastada se incorporan a las sesiones activas (`REG-VAL-06`).
   - Los ejercicios compatibles clasificados como `documentado_parcialmente` o `pendiente` se listan en el informe de auditoría con sus notas explicativas, **sin prescribirse automáticamente**.
   - Si un día no dispone de ejercicios validados compatibles, el sistema muestra una explicación transparente (`REG-CAL-05`) y **no recurre a fallbacks que violen restricciones**.

---

## 5. Reglas del Sistema Experto

| ID de Regla | Categoría | Nombre / Finalidad | Acción / Consecuente | Fuentes / Justificación |
| :--- | :--- | :--- | :--- | :--- |
| **`REG-VAL-01`** | Validación | Rango de edad admisible (18-65 años) | Bloqueo preventivo si edad < 18, edad > 65 o no entera. | Lloyd RS et al. (2014) Position statement on youth resistance training: the 2014 International Consensus. Br J Sports Med 48:498-505<br>Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-VAL-02`** | Validación | Completitud de datos esenciales | Bloqueo si faltan deporte, posición o nivel. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-VAL-03`** | Validación | Diferenciación de objetivos | Bloqueo si objetivo primario = secundario. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-VAL-04`** | Validación | Disponibilidad de días para trabajo individual | Bloqueo si no hay días individuales marcados. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-VAL-05`** | Validación | Duración admisible de la sesión (15-120 min) | Bloqueo si la duración está fuera del rango 15-120 min. | American College of Sports Medicine (2021) ACSM’s Guidelines for Exercise Testing and Prescription, 11th ed. |
| **`REG-VAL-06`** | Validación | Criterio estricto de evidencia científica | Exclusión de ejercicios no completamente validados de la prescripción. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-CON-01`** | Contradicción | Contradicción en el dolor declarado | Bloqueo (isValid: false) y solicitud de aclaración si hasPain: false con dolor activo. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-SEG-01`** | Seguridad | Lesión activa sin autorización médica | Suspensión preventiva de prescripción física autónoma. | Ardern CL et al. (2016) 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med 50:853-864 |
| **`REG-SEG-02`** | Seguridad | Dolor severo o incapacitante (EVA ≥ 7) | Suspensión preventiva para evitar sobrecarga tisular. | Silbernagel KG et al. (2007) Continued sporting activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med 35(6):897-906<br>Ardern CL et al. (2016) Br J Sports Med 50:853-864 |
| **`REG-SEG-03`** | Seguridad | Restricciones o prescripciones médicas en texto libre | Parada de seguridad (*Safety Hold*) y solicitud de aclaración. | Warburton DER et al. PAR-Q+ (Physical Activity Readiness Questionnaire for Everyone), eparmedx.com<br>ACSM (2021) Guidelines for Exercise Testing and Prescription, 11th ed. |
| **`REG-SEG-04`** | Seguridad | Fatiga extrema o recuperación insuficiente | Veto de alta intensidad; suspensión preventiva ante fatiga extrema. | Meeusen R et al. (2013) Prevention, diagnosis and treatment of the overtraining syndrome: joint consensus statement of the ECSS and the ACSM. Med Sci Sports Exerc 45(1):186-205 |
| **`REG-SEG-05`** | Seguridad | Principio deontológico de no intromisión médica | Prohibición de diagnósticos patológicos o prescripción de rehabilitación. | Ley 44/2003 de ordenación de las profesiones sanitarias (BOE) |
| **`REG-CAL-01`** | Calendario | Inviolabilidad del día de partido (Match Day) | Cero entrenamientos individuales en días de partido. | Bompa TO, Haff GG (2009) Periodization: Theory and Methodology of Training, 5th ed.<br>Mujika I, Padilla S (2003) Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc 35(7):1182-1187 |
| **`REG-CAL-02`** | Calendario | Respeto a los entrenamientos colectivos | No programar en días sin disponibilidad del atleta. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-CAL-03`** | Calendario | Ajuste en víspera de competición (MD-1) | Veto a ejercicios de daño excéntrico o volumen fatigante. | Bompa TO, Haff GG (2009) Periodization: Theory and Methodology of Training, 5th ed.<br>Mujika I, Padilla S (2003) Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc 35(7):1182-1187 |
| **`REG-CAL-04`** | Calendario | Ajuste post-competición inmediata (MD+1) | Exclusión de pliometría de impacto y sprints máximos. | Nédélec M et al. (2012) Recovery in soccer: part I – post-match fatigue and time course of recovery. Sports Med 42(12):997-1015 |
| **`REG-CAL-05`** | Calendario | Principio de no invención de entrenamientos | No inventar rutinas si faltan ejercicios validados compatibles. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-FIL-01`** | Filtrado | Coherencia con la modalidad deportiva | Descarte de ejercicios de deportes distintos. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-FIL-02`** | Filtrado | Coherencia con el equipamiento disponible | Descarte si no se dispone del material requerido. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-FIL-03`** | Filtrado | Protección anatómica ante dolor articular o muscular | Descarte determinista por contraindicación anatómica. | Silbernagel KG et al. (2007) Continued sporting activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med 35(6):897-906<br>Ardern CL et al. (2016) Br J Sports Med 50:853-864 |
| **`REG-FIL-04`** | Filtrado | Coherencia con nivel y demarcación | Ajuste a nivel competitivo y demarcación (ej. portero vs campo). | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-SCO-01`** | Scoring | Ponderación por objetivo principal | Asignación de +50 puntos. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-SCO-02`** | Scoring | Ponderación por objetivo secundario | Asignación de +25 puntos. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-SCO-03`** | Scoring | Ponderación por afinidad de puesto | Asignación de +15 puntos (específica) o +10 (todas). | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-SCO-04`** | Scoring | Ponderación por momento del microciclo | Asignación de +10 puntos por momento de la semana. | Decisión de diseño del sistema (justificada en la memoria) |
| **`REG-PRI-01`** | Prevalencia | Prevalencia incondicional de restricciones | Las restricciones obligatorias no pueden ser anuladas por puntuación. | Decisión de diseño del sistema (justificada en la memoria) |

---

## 6. Estado Real del Catálogo de 60 Ejercicios

Para cumplir con el principio de **cero invención de parámetros ni fuentes científicas**, cada ejercicio se clasifica en función del soporte documental específico disponible:

- **Total de Ejercicios:** 60 (20 en Fútbol, 20 en Balonmano, 20 en Baloncesto).
- **Validados (`validado`): 5 ejercicios (8.3%)**
  - Cuentan con ensayos de intervención prospectivos y controlados (RCTs) específicos que determinan la dosificación cerrada de series, repeticiones, descansos e intensidad:
    1. `FUT-01`: *Nordic Hamstring Curl* (Petersen et al., 2011 BJSM; FIFA 11+ Bizzini & Dvorak 2015).
    2. `FUT-02`: *Copenhagen Adduction Exercise* (Harøy et al., 2019 BJSM).
    3. `BAL-01`: *Rotación externa de hombro con banda elástica a 90°* (Andersson et al., 2017 BJSM, EHF).
    4. `BAL-02`: *Lanzamiento en suspensión con recepción amortiguada* (Myklebust et al., 2003 Scand J Med Sci Sports, Norwegian ACL Handball Protocol).
    5. `BAS-02`: *Isometría contra pared (Wall-Sit) a 60° para tendón rotuliano* (Rio et al., 2015 BJSM).
- **Documentados Parcialmente (`documentado_parcialmente`): 37 ejercicios (61.7%)**
  - Apoyados en manuales federativos formativos (RFEF, RFEBM, FEB), guías de la NSCA, estudios electromiográficos agudos (EMG) o análisis cinemáticos descriptivos. Al carecer de consenso prospectivo cerrado sobre dosificación óptima para deportistas federados, sus parámetros se muestran de forma orientativa y no se prescriben automáticamente sin supervisión humana.
- **Pendientes de Protocolo (`pendiente`): 18 ejercicios (30.0%)**
  - Tareas técnico-tácticas y de acondicionamiento complementario cuyos parámetros de volumen y descanso dependen de la periodización individual y no están protocolizados en la literatura científica deportiva.

---

## 7. Suite de Pruebas Reproducibles (17 Escenarios, 17/17 Passed)

SportExpert incluye una suite automatizada ejecutable tanto por línea de comandos como en la interfaz gráfica (`/tests`), que verifica de forma determinista 17 escenarios críticos:

1. **Test #01:** Jugador adulto con datos completos (Flujo nominal, prescripción estructurada).
2. **Test #02:** Deportista menor de 18 años (Bloqueo inmediato por `REG-VAL-01`).
3. **Test #03:** Lesión activa sin autorización para entrenar (Parada de seguridad por `REG-SEG-01`).
4. **Test #04:** Dolor articular en movimiento (Descarte determinista de rodilla por `REG-FIL-03`).
5. **Test #05:** Restricción en texto libre no interpretable (Safety Hold por `REG-SEG-03` con y sin palabras clave).
6. **Test #06:** Fatiga alta y recuperación deficiente (Veto de esfuerzos máximos por `REG-SEG-04`).
7. **Test #07:** Coincidencia en día de partido (Inviolabilidad de Match Day por `REG-CAL-01`).
8. **Test #08:** Respeto al entrenamiento colectivo (No invasión de días de club por `REG-CAL-02`).
9. **Test #09:** Material limitado a calistenia / autocarga (Filtro de recursos por `REG-FIL-02`).
10. **Test #10:** Omisión de campos esenciales (Bloqueo de validación por `REG-VAL-02`).
11. **Test #11:** Objetivo principal y secundario idénticos (Detección por `REG-VAL-03`).
12. **Test #12:** Ausencia de ejercicios validados compatibles (Cero invención por `REG-CAL-05`).
13. **Test #13:** Ejercicio con puntuación alta bloqueado por seguridad (Prevalencia absoluta de `REG-PRI-01`).
14. **Test #14:** Calendario sin días individuales disponibles (Detección por `REG-VAL-04`).
15. **Test #15:** Puntuación matemática exacta ponderada (Verificación formal de `REG-SCO-01..04`).
16. **Test #16:** Edad fuera de rango admisible (Edad = 150 años, bloqueo por `REG-VAL-01`).
17. **Test #17:** Contradicción en dolor declarado (hasPain: false con dolor activo, bloqueo por `REG-CON-01`).

---

## 8. Limitaciones que Siguen Pendientes

1. **Interpretación de Texto Libre no Estructurado:** El sistema no utiliza modelos de procesamiento de lenguaje natural (NLP) no deterministas para intentar "adivinar" diagnósticos a partir de redacciones libres; ante cualquier texto médico ambiguo, detiene la prescripción por seguridad.
2. **Monitoreo de Carga Interna Fisiológica:** La valoración de la fatiga se basa en escalas subjetivas validadas (RPE, EVA, escala de recuperación 1-5) y no en telemetría continua de frecuencia cardíaca (HRV) ni dispositivos GPS.
3. **Periodización a Largo Plazo:** La herramienta modela el microciclo semanal competitivo (7 días), dejando para futuras versiones la orquestación de mesociclos y macrociclos de pretemporada o transición.
4. **Ampliación del Catálogo Validado:** Solo 5 ejercicios cuentan con RCTs de dosis cerrada verificada en literatura; los 55 restantes requieren futuras investigaciones prospectivas de intervención antes de considerarse validados.

---

## 9. Instrucciones para Ejecutar SportExpert

### Requisitos Previos
- **Node.js:** Versión 18.0 o superior instalada.
- **npm:** Gestor de paquetes incluido con Node.js.

### Instalación de Dependencias
```bash
npm install
```

### Ejecución de la Suite de Pruebas en Consola
Para comprobar formalmente el comportamiento determinista del motor experto:
```bash
npx tsx src/tests/runTests.ts
```
*Salida esperada:*
```
Resumen de ejecución: 17 aprobadas, 0 fallidas de 17 pruebas.
Estado final: TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO
```

### Ejecución del Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará accesible en el navegador en `http://localhost:3000`.

### Verificación de Tipos y Compilación para Producción
```bash
npm run lint
npm run build
```

---

## 10. Descargo de Responsabilidad Deontológico

SportExpert es una herramienta tecnológica de asesoramiento y prescripción de acondicionamiento físico orientada a deportistas federados sanos. **No realiza diagnósticos clínicos, no prescribe reposos médicos ni sustituye el juicio de médicos deportivos, fisioterapeutas o traumatólogos colegiados.** Ante cualquier molestia aguda o sospecha de patología, el deportista debe ser derivado a los servicios médicos de su club o federación.
