# EntrenaExpert · Sistema experto de planes de entrenamiento deportivo

EntrenaExpert es un **sistema experto basado en reglas** que genera un plan semanal de entrenamiento para **fútbol, baloncesto, voleibol, balonmano y tenis**. Pregunta por el deporte, la edad, el nivel, los objetivos, los días disponibles, el momento de la temporada y las molestias, y devuelve un plan día a día **explicando qué reglas y qué fuentes justifican cada decisión**.

- **Aplicación publicada:** _pega aquí el enlace público de Google AI Studio_
- **Vídeo demostrativo:** _enlace privado para el docente_

## 1. Objetivo y destinatarios

| | |
|---|---|
| **Problema** | Muchos deportistas aficionados y entrenadores de base planifican la semana «a ojo»: entrenan demasiados días, no dejan 48 h entre sesiones de fuerza, olvidan la prevención de lesiones o no adaptan la carga a la edad. |
| **Decisión que apoya** | Qué sesiones hacer cada día de la semana, con qué carga y qué ejercicios preventivos incluir. |
| **Usuarios** | Deportistas desde 12 años (aficionados y federados) y entrenadores de clubes amateur que necesitan una propuesta inicial justificada. |
| **Fuera de alcance** | Menores de 12 años, personas con cribado médico positivo o dolor agudo, rehabilitación de lesiones, nutrición y deportes no incluidos (estos reciben solo condición física general). |
| **Criterio de éxito** | Los 20 casos de prueba dan el resultado esperado, ninguna combinación de entrada rompe las reglas de seguridad (barrido de 51.030 combinaciones) y cada sesión muestra las reglas que la justifican. |

## 2. Acceso y uso

1. Abre la aplicación publicada (no requiere registro ni clave).
2. En **Asistente**, responde a las preguntas. Los objetivos admiten **selección múltiple (1 o 2, por orden de prioridad)** y las molestias admiten varias zonas.
3. Pulsa **Generar plan**. Verás:
   - el estado (plan generado, faltan datos, contradicción, bloqueo por seguridad o fuera de alcance);
   - los avisos y conflictos, cada uno con el código de la regla que lo produjo;
   - las conclusiones intermedias (grupo de edad, días efectivos, prescripción de fuerza, pliometría, etc.);
   - el plan de lunes a domingo, con bloques, minutos y los códigos de regla de cada sesión (pasa el ratón para leer la regla);
   - la **traza** del motor: reglas disparadas en orden y hechos que añadió cada una, más las fuentes citadas.
4. En **Base de conocimiento** se consultan todas las reglas, los hechos de cada deporte y las fuentes.
5. En **Pruebas** se ejecutan los 20 casos y se compara lo esperado con lo obtenido. «Abrir» carga el caso en el asistente.

### Ejemplo de uso

Entrada: balonmano, 22 años, intermedio, objetivo fuerza, 4 días, 60 min, en competición, molestia de rodilla, con gimnasio.

Resultado: lunes recuperación activa, martes fuerza y prevención, jueves técnica + fuerza, sábado activación y domingo partido. La pliometría baja de 100 a 50 contactos por la molestia de rodilla (regla **A01**), la fuerza se limita a 2 sesiones por estar en competición (**L03**, fuente F18) y el calentamiento es neuromuscular con activación de hombro (**P07**).

## 3. Ejecución local y configuración

Requisitos: Node.js 18 o superior. No hace falta base de datos, ni API key, ni variables de entorno.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 20 casos de prueba + barrido exhaustivo de 51.030 combinaciones
npm run build      # versión de producción en dist/
```

### Publicación desde Google AI Studio

El proyecto sigue la estructura de las apps de Google AI Studio (Build): `index.html`, `index.tsx`, `App.tsx`, `metadata.json`, `package.json` y `vite.config.ts` en la raíz.

1. En [aistudio.google.com](https://aistudio.google.com) → **Build**, crea una app nueva e importa estos archivos (subiendo el ZIP del proyecto o conectando este repositorio de GitHub).
2. Comprueba en la vista previa que funcionan las pestañas Asistente y Pruebas (deben salir 20/20).
3. Pulsa **Deploy / Publish** (Cloud Run) y copia la URL pública en este README.
4. Abre la URL en una ventana de incógnito para comprobar que una persona externa puede usarla.

La aplicación **no llama a Gemini ni a ninguna API**, así que no hay claves que proteger.

## 4. Tecnologías y arquitectura

| Tecnología | Por qué |
|---|---|
| **TypeScript** | Tipos estrictos para hechos, reglas y resultados: los errores en la base de conocimiento se detectan al compilar. |
| **React 19** | Interfaz con formularios, selección múltiple y paneles de explicación; es el stack por defecto de Google AI Studio. |
| **Vite** | Servidor de desarrollo y compilación; el mismo que usa AI Studio. |
| **tsx** | Ejecuta la batería de pruebas en consola sin compilar. |
| **Sin almacenamiento** | No se guardan datos personales: todo se calcula en el navegador. La base de conocimiento está en código (versionada en Git). |
| **Sin LLM en tiempo de ejecución** | El razonamiento es determinista y explicable; un LLM solo se usó para diseñar y documentar. |

```
┌────────────────────┐    Entrada     ┌───────────────────────────┐
│ Interfaz (React)   │ ─────────────▶ │ Motor de inferencia        │
│ components/        │                │ engine/motor.ts            │
│  Formulario        │                │ encadenamiento hacia       │
│  Resultado ◀───────┼── Resultado ── │ delante + agenda por       │
│  BaseConocimiento  │  (hechos,      │ prioridad + refracción     │
│  Pruebas           │   traza,       └─────────────┬─────────────┘
└────────────────────┘   mensajes)                  │ lee / dispara
                                                    ▼
                       ┌────────────────────────────────────────────┐
                       │ Base de conocimiento  knowledge/           │
                       │  reglas.ts   55 reglas SI…ENTONCES          │
                       │  deportes.ts hechos de cada deporte         │
                       │  fuentes.ts  28 fuentes                     │
                       │  casosPrueba.ts 20 casos                    │
                       └────────────────────────────────────────────┘
       Memoria de trabajo: objeto `Hechos` (entrada + hechos derivados)
       Planificador (engine/planificador.ts): funciones auxiliares de PL01–PL03
```

### Los 5 componentes del sistema experto

| Componente | Dónde |
|---|---|
| Base de conocimiento (hechos + reglas) | `knowledge/reglas.ts`, `knowledge/deportes.ts`, `knowledge/fuentes.ts` |
| Motor de inferencia | `engine/motor.ts` (+ `engine/planificador.ts`) |
| Memoria de trabajo | objeto `Hechos` en `types.ts` |
| Interfaz de usuario | `components/Formulario.tsx`, `App.tsx` |
| Módulo de explicación | `components/Resultado.tsx` (avisos con regla, códigos por sesión, traza y fuentes) |

### Cómo razona el motor

1. Copia la entrada en la memoria de trabajo.
2. Calcula la **agenda**: reglas cuya condición se cumple y que aún no se han disparado (refracción).
3. Resuelve el conflicto eligiendo la regla de **mayor prioridad**: validación y seguridad (90–100) → clasificación (80) → carga (64–70) → prevención (59–60) → adaptaciones (54–55) → conflictos (50) → planificación (18–20).
4. Ejecuta la acción, registra en la traza los hechos nuevos y vuelve al paso 2.
5. Para cuando la agenda está vacía o una regla de bloqueo ordena detenerse (datos incompletos, contradicción, riesgo médico, fuera de alcance).

## 5. Conocimiento: hechos, reglas y fuentes

**Hechos de entrada:** deporte, edad, nivel, objetivos (1–2), días, minutos, periodo, molestias (varias), dolor agudo, cribado PAR-Q+, gimnasio.
**Hechos derivados:** grupo de edad, perfil y zonas de riesgo del deporte, días efectivos, nº de sesiones de fuerza, prescripción de fuerza/pliometría/resistencia/velocidad, calentamiento, ejercicios preventivos, adaptaciones, lista de sesiones y semana.
**Conclusión:** plan semanal de 7 días con bloques y minutos, o un mensaje razonado de por qué no se genera.

### Reglas

| ID | Regla | Categoría | Prioridad | SI … ENTONCES … | Fuentes |
|---|---|---|---|---|---|
| V01 | Datos obligatorios incompletos | Validación | 100 | SI falta deporte, edad, nivel, días disponibles u objetivo ENTONCES no se genera plan y se indica qué datos faltan. | D01 |
| V03 | Datos fuera de rango | Validación | 99 | SI edad < 5 o > 100, o días fuera de 1–7, o minutos fuera de 20–150 ENTONCES el dato se considera inválido y se pide corregirlo. | D01 |
| S01 | Cribado médico positivo (PAR-Q+) | Seguridad | 98 | SI el usuario responde SÍ a la pregunta de riesgo cardiovascular (PAR-Q+) ENTONCES no se genera plan y se recomienda valoración médica antes de entrenar. | F04, F03 |
| S02 | Dolor agudo o lesión no recuperada | Seguridad | 97 | SI el usuario tiene dolor agudo o una lesión sin recuperar ENTONCES no se genera plan y se deriva a fisioterapeuta o médico deportivo. | F20 |
| V02 | Contradicción en lesiones | Validación | 96 | SI el usuario marca "sin lesiones ni molestias" Y a la vez marca alguna zona con molestias ENTONCES hay una contradicción y se pide aclararla. | D01 |
| V04 | Edad fuera del alcance (menores de 12) | Validación | 95 | SI edad < 12 ENTONCES el caso queda fuera del alcance: se recomienda actividad multideportiva y juego (≥60 min/día) supervisado por un entrenador. | F01, D01 |
| V05 | Demasiados objetivos | Conflicto | 94 | SI hay más de 2 objetivos ENTONCES se priorizan los 2 primeros y se avisa (más objetivos diluyen el estímulo). | F17 |
| V06 | Deporte no previsto | Validación | 93 | SI el deporte no está en la base de conocimiento ENTONCES se genera solo un plan de condición física general, sin reglas específicas del deporte, y se avisa. | D01 |
| V07 | Datos opcionales asumidos | Validación | 92 | SI faltan datos opcionales ENTONCES se asumen valores prudentes (60 min, fuera de temporada, sin molestias, sin gimnasio) y se informa de ello. | D01 |
| V00 | Datos válidos | Validación | 90 | SI los datos están completos, en rango y sin contradicciones ENTONCES estado = válido y se inicia el razonamiento. | D01 |
| C01 | Grupo de edad: joven | Clasificación | 80 | SI 12 ≤ edad ≤ 17 ENTONCES grupo de edad = joven. | F01, F14 |
| C02 | Grupo de edad: adulto | Clasificación | 80 | SI 18 ≤ edad ≤ 64 ENTONCES grupo de edad = adulto. | F01 |
| C03 | Grupo de edad: mayor | Clasificación | 80 | SI edad ≥ 65 ENTONCES grupo de edad = mayor. | F01, F21 |
| C10 | Perfil del fútbol | Clasificación | 80 | SI deporte = Fútbol ENTONCES perfil = "Esfuerzo intermitente de alta intensidad, sprints repetidos, cambios de dirección y alta demanda aeróbica." y zonas de riesgo = isquiotibiales, tobillo, rodilla. | F23 |
| C11 | Perfil del baloncesto | Clasificación | 80 | SI deporte = Baloncesto ENTONCES perfil = "Esfuerzos intermitentes, saltos repetidos, aceleraciones cortas y cambios de dirección." y zonas de riesgo = tobillo, rodilla. | F24 |
| C12 | Perfil del voleibol | Clasificación | 80 | SI deporte = Voleibol ENTONCES perfil = "Saltos verticales repetidos, acciones explosivas cortas y gestos por encima de la cabeza." y zonas de riesgo = tobillo, rodilla, hombro. | F26 |
| C13 | Perfil del balonmano | Clasificación | 80 | SI deporte = Balonmano ENTONCES perfil = "Sprints, contactos, cambios de dirección y lanzamientos por encima de la cabeza." y zonas de riesgo = rodilla, hombro, tobillo. | F27 |
| C14 | Perfil del tenis | Clasificación | 80 | SI deporte = Tenis ENTONCES perfil = "Esfuerzos intermitentes de 5–10 s, desplazamientos laterales y golpeos por encima de la cabeza." y zonas de riesgo = hombro, espalda baja. | F25 |
| L01 | Días máximos según nivel | Carga | 70 | SI nivel = principiante ENTONCES máx. 4 días; intermedio máx. 5; avanzado máx. 6; mayores máx. 5. Siempre queda ≥1 día de descanso. Si el usuario pide más, se reduce y se avisa. | F02, F15 |
| L02 | Frecuencia insuficiente | Carga | 69 | SI días = 1 ENTONCES el plan es solo de mantenimiento y se avisa de que no alcanza las recomendaciones mínimas (fuerza ≥2 días/semana). | F01 |
| L03 | Número de sesiones de fuerza | Carga | 68 | SI nivel = principiante o intermedio ENTONCES 2 sesiones de fuerza; avanzado 3. +1 si el objetivo es fuerza. En competición máx. 2 (mantenimiento). Jóvenes máx. 3. Nunca más de las que permitan 48 h entre ellas. | F02, F18, F01 |
| L04 | Prescripción de fuerza por nivel (adultos) | Carga | 67 | SI adulto ENTONCES principiante: 1–3 × 8–12 al 60–70 % 1RM; intermedio: 3–4 × 6–12 al 70–80 %; avanzado: 3–6 × 3–8 al 80–90 %. | F02 |
| L05 | Prescripción de fuerza en jóvenes | Carga | 67 | SI grupo = joven ENTONCES prioridad a la técnica: 1–3 × 8–15 con cargas ligeras-moderadas (RPE ≤ 7) y supervisión cualificada, sea cual sea el nivel declarado. | F14 |
| L06 | Prescripción de fuerza en mayores | Carga | 67 | SI grupo = mayor ENTONCES 1–3 × 8–12 a intensidad moderada (RPE 5–7) e incluir equilibrio en ≥3 días por semana. | F21, F01 |
| L07 | Volumen de pliometría | Carga | 66 | SI principiante ENTONCES 80 contactos/sesión de baja intensidad; intermedio 100; avanzado 120. SI mayor ENTONCES sin pliometría de alto impacto. | F15, F21 |
| L08 | Prescripción de resistencia interválica | Carga | 66 | SI principiante ENTONCES intervalos largos 4 × 3 min (RPE 7) con 2 min de pausa; intermedio 2 × 8 × 15 s/15 s; avanzado juego reducido + 3 × 10 × 30 s/30 s. Mayores: continuo moderado. | F16, F21 |
| L09 | Prescripción de velocidad y agilidad | Carga | 66 | SI principiante ENTONCES 6 aceleraciones de 10–20 m; intermedio 8; avanzado 10 + cambios de dirección reactivos. Recuperación completa (≥90 s). | F15 |
| L10 | Pretemporada | Carga | 65 | SI periodo = pretemporada ENTONCES se prioriza construir base aeróbica y fuerza: se añade una sesión de resistencia. | F17 |
| L11 | Microciclo de competición | Carga | 65 | SI periodo = competición ENTONCES partido el domingo, el día previo es de activación (volumen bajo, intensidad alta y breve) y, con ≥4 días, el lunes es de recuperación. | F17, F22 |
| L12 | Fuera de temporada | Carga | 65 | SI periodo = fuera de temporada Y días ≥ 4 ENTONCES se incluye una sesión de recuperación activa. | F17 |
| L13 | Sesión corta con varios objetivos | Conflicto | 64 | SI minutos ≤ 30 Y hay 2 objetivos ENTONCES los bloques se comprimen y se recomienda centrarse en el primer objetivo. | F17 |
| L14 | Efecto interferencia fuerza-resistencia | Conflicto | 64 | SI objetivos incluyen fuerza Y resistencia Y días ≤ 3 ENTONCES se avisa del efecto interferencia y se recomienda separar ambos estímulos el máximo posible. | F19 |
| P01 | Calentamiento FIFA 11+ (fútbol) | Prevención | 60 | SI deporte = fútbol ENTONCES el calentamiento de cada sesión es el programa FIFA 11+ (carrera, fuerza, pliometría y equilibrio, ≈20 min). | F05, F06 |
| P07 | Calentamiento neuromuscular (otros deportes) | Prevención | 60 | SI deporte ∈ {baloncesto, voleibol, balonmano, tenis} ENTONCES calentamiento neuromuscular: activación, equilibrio, aterrizajes y cambios de dirección (+ hombro en deportes de lanzamiento o golpeo). | F07, F12 |
| P09 | Calentamiento general (deporte no previsto) | Prevención | 60 | SI deporte no previsto ENTONCES calentamiento general RAMP: elevar temperatura, activar, movilizar y potenciar. | F15 |
| P02 | Prevención: isquiotibiales | Prevención | 60 | SI isquiotibiales es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "Nórdico de isquiotibiales: 2–3 series de 5–8 repeticiones" al bloque preventivo. | F08 |
| P03 | Prevención: tobillo | Prevención | 60 | SI tobillo es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "Equilibrio monopodal y sobre superficie inestable: 3 × 30 s por pierna" al bloque preventivo. | F09, F10 |
| P04 | Prevención: rodilla | Prevención | 60 | SI rodilla es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "Aterrizajes controlados y cambios de dirección con rodilla alineada: 3 × 6" al bloque preventivo. | F11 |
| P05 | Prevención: hombro | Prevención | 60 | SI hombro es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "Rotación externa con goma, Y-T-W escapulares y movilidad torácica: 2–3 × 10–12" al bloque preventivo. | F12 |
| P06 | Prevención: espalda baja | Prevención | 60 | SI espalda baja es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "Core antiextensión y antirrotación (plancha, Pallof press): 3 × 20–30 s" al bloque preventivo. | F13 |
| P08 | Objetivo prevención de lesiones | Prevención | 59 | SI objetivo = prevención ENTONCES se añade una sesión de recuperación con bloque preventivo y el bloque preventivo aparece en todas las sesiones. | F06, F07 |
| A01 | Molestia de rodilla | Adaptación | 55 | SI molestia en rodilla ENTONCES reducir la pliometría al 50 %, evitar saltos en profundidad y trabajar sentadilla en rango sin dolor. | F11, F20 |
| A02 | Molestia de tobillo | Adaptación | 55 | SI molestia en tobillo ENTONCES reducir la pliometría al 50 % y priorizar equilibrio; valorar tobillera o vendaje funcional. | F10 |
| A03 | Molestia de hombro | Adaptación | 55 | SI molestia en hombro ENTONCES evitar press por encima de la cabeza con carga alta y limitar el volumen de lanzamientos, remates o saques. | F12 |
| A04 | Molestia de espalda baja | Adaptación | 55 | SI molestia lumbar ENTONCES evitar cargas axiales máximas; usar variantes goblet o unilaterales y reforzar el core. | F13 |
| A05 | Molestia de isquiotibiales | Adaptación | 55 | SI molestia en isquiotibiales ENTONCES los sprints se hacen al 80–90 % de la velocidad máxima y progresan solo sin dolor. | F08, F20 |
| A06 | Ejercicios sin gimnasio | Adaptación | 54 | SI no hay acceso a gimnasio ENTONCES los ejercicios de fuerza se hacen con peso corporal, gomas elásticas o mancuernas ligeras. | F02, F15 |
| A07 | Ejercicios con gimnasio | Adaptación | 54 | SI hay gimnasio ENTONCES ejercicios básicos multiarticulares; SI molestia lumbar ENTONCES sentadilla goblet en vez de trasera; SI molestia de hombro ENTONCES press landmine en vez de press militar. | F02, F15 |
| K01 | Nivel avanzado con poca frecuencia | Conflicto | 50 | SI nivel = avanzado Y días ≤ 2 ENTONCES posible incoherencia: se mantiene el nivel pero se avisa de que la carga semanal será baja. | F02 |
| K02 | Objetivo velocidad con molestia de isquiotibiales | Conflicto | 50 | SI objetivo = velocidad Y molestia en isquiotibiales ENTONCES conflicto: la seguridad prevalece y la velocidad máxima queda limitada (regla A05). | F08, F20 |
| K03 | Persona mayor con objetivo de velocidad | Conflicto | 50 | SI grupo = mayor Y objetivo = velocidad ENTONCES se reinterpreta como agilidad y equilibrio, sin sprints máximos. | F21 |
| K04 | Joven que se declara avanzado | Conflicto | 50 | SI grupo = joven Y nivel = avanzado ENTONCES la edad prevalece sobre el nivel en la prescripción de fuerza (regla L05). | F14 |
| PL01 | Composición de la semana | Planificación | 20 | SI se conocen días, sesiones de fuerza, objetivos y periodo ENTONCES se forma la lista de sesiones; si no caben, se fusiona fuerza con técnica y después se descarta lo menos prioritario. | F17, F02 |
| PL02 | Distribución semanal y 48 h entre fuerza | Planificación | 19 | SI hay lista de sesiones ENTONCES se colocan en la semana dejando ≥48 h entre sesiones de fuerza, el domingo libre (o partido) y la activación el día previo al partido. | F02, F17, F22 |
| PL03 | Plan completo | Planificación | 18 | SI la semana está construida ENTONCES el plan se da por concluido y se presenta con su explicación. | D01 |

### Vacíos y contradicciones detectados en el conocimiento

- **Edad frente a nivel:** un joven «avanzado» pediría cargas altas según ACSM (F02), pero el consenso juvenil (F14) recomienda cargas moderadas. Se resuelve con prioridad a la seguridad: **K04** + **L05**.
- **Velocidad con molestia de isquiotibiales:** el objetivo pide sprints máximos y la prevención pide prudencia. Prevalece la seguridad: **K02** + **A05**.
- **Fuerza + resistencia con pocos días:** riesgo de interferencia (F19); se avisa y se separan los estímulos: **L14**.
- **Mayores y velocidad:** se reinterpreta como agilidad y equilibrio (F21): **K03**.
- **Vacío: deportes no incluidos.** No hay perfil de exigencias: solo se aplican reglas generales y se avisa (**V06**, **P09**).
- **Vacío: menores de 12 años.** La evidencia sobre planificación específica es escasa y la OMS recomienda juego variado: fuera de alcance (**V04**).
- **Vacío: día de partido.** El usuario no indica qué día compite; se asume domingo y se avisa (**L11**).
- **Valores por defecto:** si faltan datos opcionales se asumen los más prudentes y se informa (**V07**).

### Fuentes

- **F01** Bull FC, et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med, 54, 1451–1462. https://doi.org/10.1136/bjsports-2020-102955 — *Grupos de edad, mínimos semanales de actividad, fuerza ≥2 días y equilibrio en mayores.*
- **F02** American College of Sports Medicine (2009). Progression models in resistance training for healthy adults. Med Sci Sports Exerc, 41(3), 687–708. https://doi.org/10.1249/MSS.0b013e3181915670 — *Frecuencia, series, repeticiones e intensidad de fuerza por nivel; 48 h entre sesiones del mismo grupo muscular.*
- **F03** American College of Sports Medicine (2021). ACSM’s Guidelines for Exercise Testing and Prescription (11.ª ed.). Wolters Kluwer. — *Principio FITT, cribado previo al ejercicio y derivación médica.*
- **F04** Warburton DER, Jamnik V, Bredin SSD, Gledhill N. The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+). https://eparmedx.com/ — *Pregunta de cribado de riesgo cardiovascular antes de iniciar un programa.*
- **F05** Soligard T, et al. (2008). Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial. BMJ, 337, a2469. https://doi.org/10.1136/bmj.a2469 — *Eficacia del calentamiento FIFA 11+ en fútbol.*
- **F06** Bizzini M, Dvorak J (2015). FIFA 11+: an effective programme to prevent football injuries in various player groups worldwide—a narrative review. Br J Sports Med, 49(9), 577–579. https://doi.org/10.1136/bjsports-2015-094765 — *Estructura del FIFA 11+ (≈20 min, ≥2 veces por semana).*
- **F07** Emery CA, Roy TO, Whittaker JL, Nettel-Aguirre A, van Mechelen W (2015). Neuromuscular training injury prevention strategies in youth sport: a systematic review and meta-analysis. Br J Sports Med, 49(13), 865–870. https://doi.org/10.1136/bjsports-2015-094639 — *Calentamientos neuromusculares en deportes de equipo distintos del fútbol.*
- **F08** van Dyk N, Behan FP, Whiteley R (2019). Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries. Br J Sports Med, 53(21), 1362–1370. https://doi.org/10.1136/bjsports-2018-100045 — *Ejercicio nórdico para isquiotibiales.*
- **F09** Hupperets MDW, Verhagen EALM, van Mechelen W (2009). Effect of unsupervised home based proprioceptive training on recurrences of ankle sprain: randomised controlled trial. BMJ, 339, b2684. https://doi.org/10.1136/bmj.b2684 — *Entrenamiento propioceptivo de tobillo.*
- **F10** Doherty C, et al. (2017). Treatment and prevention of acute and recurrent ankle sprain: an overview of systematic reviews with meta-analysis. Br J Sports Med, 51(2), 113–125. https://doi.org/10.1136/bjsports-2016-096178 — *Prevención de esguince recurrente: equilibrio y soporte externo.*
- **F11** Webster KE, Hewett TE (2018). Meta-analysis of meta-analyses of anterior cruciate ligament injury reduction training programs. J Orthop Res, 36(10), 2696–2708. https://doi.org/10.1002/jor.24043 — *Entrenamiento neuromuscular (aterrizajes, cambios de dirección) para la rodilla.*
- **F12** Andersson SH, Bahr R, Clarsen B, Myklebust G (2017). Preventing overuse shoulder injuries among throwing athletes: a cluster-randomised controlled trial in 660 elite handball players. Br J Sports Med, 51(14), 1073–1080. https://doi.org/10.1136/bjsports-2016-096226 — *Programa preventivo de hombro (rotación externa, escápula, movilidad torácica).*
- **F13** Steffens D, et al. (2016). Prevention of low back pain: a systematic review and meta-analysis. JAMA Intern Med, 176(2), 199–208. https://doi.org/10.1001/jamainternmed.2015.7431 — *El ejercicio (fuerza + control motor) reduce episodios de dolor lumbar.*
- **F14** Lloyd RS, et al. (2014). Position statement on youth resistance training: the 2014 International Consensus. Br J Sports Med, 48(7), 498–505. https://doi.org/10.1136/bjsports-2013-092952 — *Fuerza en jóvenes: técnica primero, cargas ligeras-moderadas, supervisión cualificada.*
- **F15** Haff GG, Triplett NT (eds.) (2016). Essentials of Strength Training and Conditioning (4.ª ed.). NSCA / Human Kinetics. — *Volumen de pliometría (contactos por sesión), estructura de sesión y velocidad.*
- **F16** Buchheit M, Laursen PB (2013). High-intensity interval training, solutions to the programming puzzle: Part I. Sports Med, 43(5), 313–338. https://doi.org/10.1007/s40279-013-0029-x — *Formatos de entrenamiento interválico (intervalos largos, cortos, juegos reducidos).*
- **F17** Bompa TO, Haff GG (2009). Periodization: Theory and Methodology of Training (5.ª ed.). Human Kinetics. — *Objetivos de cada periodo de la temporada (pretemporada, competición, transición).*
- **F18** Rønnestad BR, Nymark BS, Raastad T (2011). Effects of in-season strength maintenance training frequency in professional soccer players. J Strength Cond Res, 25(10), 2653–2660. https://doi.org/10.1519/JSC.0b013e31822dcd96 — *En competición, 1–2 sesiones de fuerza bastan para mantener ganancias.*
- **F19** Wilson JM, et al. (2012). Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises. J Strength Cond Res, 26(8), 2293–2307. https://doi.org/10.1519/JSC.0b013e31823a3e2d — *Efecto interferencia al combinar fuerza y resistencia.*
- **F20** Ardern CL, et al. (2016). 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med, 50(14), 853–864. https://doi.org/10.1136/bjsports-2016-096278 — *La vuelta al entrenamiento tras lesión debe decidirla un profesional sanitario.*
- **F21** Chodzko-Zajko WJ, et al. (2009). ACSM position stand: Exercise and physical activity for older adults. Med Sci Sports Exerc, 41(7), 1510–1530. https://doi.org/10.1249/MSS.0b013e3181a0c95c — *Prescripción para mayores de 65: fuerza moderada, equilibrio, impacto controlado.*
- **F22** Mujika I, Padilla S (2003). Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc, 35(7), 1182–1187. https://doi.org/10.1249/01.MSS.0000074448.73931.11 — *Reducir volumen manteniendo intensidad antes de competir.*
- **F23** Stølen T, Chamari K, Castagna C, Wisløff U (2005). Physiology of soccer: an update. Sports Med, 35(6), 501–536. https://doi.org/10.2165/00007256-200535060-00004 — *Perfil de exigencias del fútbol.*
- **F24** Ziv G, Lidor R (2009). Physical attributes, physiological characteristics, on-court performances and nutritional strategies of female and male basketball players. Sports Med, 39(7), 547–568. https://doi.org/10.2165/00007256-200939070-00003 — *Perfil de exigencias del baloncesto.*
- **F25** Kovacs MS (2007). Tennis physiology: training the competitive athlete. Sports Med, 37(3), 189–198. https://doi.org/10.2165/00007256-200737030-00001 — *Perfil de exigencias del tenis.*
- **F26** Sheppard JM, Gabbett TJ, Stanganelli LC (2009). An analysis of playing positions in elite men’s volleyball: considerations for competition demands and physiologic characteristics. J Strength Cond Res, 23(6), 1858–1866. — *Perfil de exigencias del voleibol.*
- **F27** Karcher C, Buchheit M (2014). On-court demands of elite handball, with special reference to playing positions. Sports Med, 44(6), 797–814. https://doi.org/10.1007/s40279-014-0164-z — *Perfil de exigencias del balonmano.*
- **D01** Decisión de diseño del autor (alcance del sistema), justificada en la memoria. — *Límites del alcance: edades, deportes cubiertos y valores por defecto.*

> Se ha comprobado en PubMed y en las revistas que los artículos citados existen con ese título, autores y año.

## 6. Pruebas

Se ejecutan con `npm test` o desde la pestaña **Pruebas** de la app. Además del resultado esperado de cada caso, el programa comprueba siempre una invariante de seguridad: nunca hay dos sesiones de fuerza en días consecutivos.

| ID | Tipo | Caso | Entrada | Esperado | Obtenido | Reglas disparadas | ✔ |
|---|---|---|---|---|---|---|---|
| H01 | Habitual | Futbolista adulto intermedio en pretemporada | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=24, nivel=intermedio, objetivos=resistencia+velocidad, dias=4, periodo=pretemporada | Plan de 4 días con FIFA 11+, nórdicos (isquios), 2 sesiones de fuerza separadas ≥48 h, sesión de resistencia y de velocidad. | estado=ok; días=4; fuerza=2; Lun: fuerza, Mar: velocidad, Jue: combinada, Vie: resistencia | V00 → C02 → C10 → L01 → L03 → L04 → L07 → L08 → L09 → L10 → P01 → P02 → P03 → P04 → A07 → PL01 → PL02 → PL03 | ✔ |
| H02 | Habitual | Jugadora de baloncesto de 16 años en competición | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=baloncesto, edad=16, nivel=principiante, objetivos=tecnica+fuerza, dias=3, periodo=competicion | Grupo joven: fuerza técnica y supervisada (L05). Competición: fuerza limitada a 2, partido el domingo y activación el día previo. | estado=ok; días=3; fuerza=2; Mar: combinada, Jue: combinada, Sáb: activacion, Dom: partido | V00 → C01 → C11 → L01 → L03 → L05 → L07 → L08 → L09 → L11 → P07 → P03 → P04 → A07 → PL01 → PL02 → PL03 | ✔ |
| H03 | Habitual | Voleibol avanzado con molestia de hombro | sinLesiones=false, molestias=hombro, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=voleibol, edad=27, nivel=avanzado, objetivos=fuerza+velocidad, dias=5, periodo=fuera_temporada | Adaptación de hombro (sin press por encima de la cabeza, press landmine), preventivo de hombro y 3 sesiones de fuerza. | estado=ok; días=5; fuerza=3; Lun: fuerza, Mar: velocidad, Mié: fuerza, Vie: combinada, Sáb: recuperacion | V00 → C02 → C12 → L01 → L03 → L04 → L07 → L08 → L09 → L12 → P07 → P03 → P04 → P05 → A03 → A07 → PL01 → PL02 → PL03 | ✔ |
| H04 | Habitual | Tenista de 40 años sin gimnasio | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=false, minutos=60, deporte=tenis, edad=40, nivel=intermedio, objetivos=resistencia+prevencion, dias=3, periodo=fuera_temporada | Ejercicios con peso corporal y gomas (A06), preventivos de hombro y espalda, calentamiento neuromuscular con hombro. | estado=ok; días=3; fuerza=2; Lun: fuerza, Mié: combinada, Vie: resistencia | V00 → C02 → C14 → L01 → L03 → L04 → L07 → L08 → L09 → P07 → P05 → P06 → P08 → A06 → PL01 → PL02 → PL03 | ✔ |
| H05 | Habitual | Balonmano en competición con molestia de rodilla | sinLesiones=false, molestias=rodilla, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=balonmano, edad=22, nivel=intermedio, objetivos=fuerza, dias=4, periodo=competicion | Pliometría reducida al 50 % (50 contactos), fuerza limitada a 2 por competición, recuperación el lunes y activación el sábado. | estado=ok; días=4; fuerza=2; Lun: recuperacion, Mar: fuerza, Jue: combinada, Sáb: activacion, Dom: partido | V00 → C02 → C13 → L01 → L03 → L04 → L07 → L08 → L09 → L11 → P07 → P03 → P04 → P05 → A01 → A07 → PL01 → PL02 → PL03 | ✔ |
| H06 | Habitual | Persona de 67 años que juega al fútbol caminando | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=67, nivel=principiante, objetivos=fuerza+prevencion, dias=3, periodo=fuera_temporada | Grupo mayor: fuerza moderada, equilibrio añadido, sin pliometría de alto impacto. | estado=ok; días=3; fuerza=3; Lun: fuerza, Mié: fuerza, Vie: combinada | V00 → C03 → C10 → L01 → L03 → L06 → L07 → L08 → L09 → P01 → P02 → P03 → P04 → P08 → A07 → PL01 → PL02 → PL03 | ✔ |
| D01 | Difícil | Datos incompletos (sin edad ni días) | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, nivel=intermedio, objetivos=fuerza | No genera plan e indica que faltan edad y días disponibles. | estado=incompleto; días=—; fuerza=—; sin plan | V01 | ✔ |
| D02 | Difícil | Contradicción: «sin lesiones» y molestia de tobillo | sinLesiones=true, molestias=tobillo, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=baloncesto, edad=20, nivel=intermedio, objetivos=fuerza, dias=3 | Detecta la contradicción y pide aclararla; no genera plan. | estado=contradiccion; días=—; fuerza=—; sin plan | V02 | ✔ |
| D03 | Difícil | Cribado médico positivo (PAR-Q+) | sinLesiones=true, dolorAgudo=false, parqRiesgo=true, gimnasio=true, minutos=60, deporte=tenis, edad=55, nivel=principiante, objetivos=resistencia, dias=3 | Bloquea el plan y recomienda valoración médica. | estado=bloqueado; días=—; fuerza=—; sin plan | S01 | ✔ |
| D04 | Difícil | Dolor agudo actual | sinLesiones=true, dolorAgudo=true, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=19, nivel=avanzado, objetivos=velocidad, dias=5 | Bloquea el plan y deriva a fisioterapeuta o médico deportivo. | estado=bloqueado; días=—; fuerza=—; sin plan | S02 | ✔ |
| D05 | Difícil | Principiante que quiere entrenar 7 días | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=baloncesto, edad=30, nivel=principiante, objetivos=fuerza+resistencia, dias=7, periodo=fuera_temporada | Combinación incompatible: reduce a 4 días y avisa del motivo. | estado=ok; días=4; fuerza=2; Lun: fuerza, Mar: resistencia, Jue: combinada, Vie: recuperacion | V00 → C02 → C11 → L01 → L03 → L04 → L07 → L08 → L09 → L12 → P07 → P03 → P04 → A07 → PL01 → PL02 → PL03 | ✔ |
| D06 | Difícil | Niño de 9 años | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=9, nivel=principiante, objetivos=tecnica, dias=2 | Fuera del alcance: no genera plan y da la recomendación general de la OMS. | estado=fuera_de_alcance; días=—; fuerza=—; sin plan | V04 | ✔ |
| D07 | Difícil | Deporte no previsto (rugby) | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=otro, deporteOtro=Rugby, edad=23, nivel=intermedio, objetivos=fuerza, dias=3, periodo=pretemporada | Caso no previsto: plan de condición física general con aviso; sin reglas específicas de deporte. | estado=ok; días=3; fuerza=3; Lun: fuerza, Mié: fuerza, Vie: combinada | V06 → V00 → C02 → L01 → L03 → L04 → L07 → L08 → L09 → L10 → P09 → A07 → PL01 → PL02 → PL03 | ✔ |
| D08 | Difícil | Fuerza y resistencia con solo 2 días | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=28, nivel=intermedio, objetivos=fuerza+resistencia, dias=2, periodo=fuera_temporada | Avisa del efecto interferencia y fusiona sesiones para que quepan en 2 días. | estado=ok; días=2; fuerza=2; Mar: fuerza, Jue: combinada | V00 → C02 → C10 → L01 → L03 → L04 → L07 → L08 → L09 → L14 → P01 → P02 → P03 → P04 → A07 → PL01 → PL02 → PL03 | ✔ |
| D09 | Difícil | Un solo día por semana y nivel avanzado | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=voleibol, edad=33, nivel=avanzado, objetivos=fuerza, dias=1 | Avisa de frecuencia insuficiente (L02) e incoherencia con el nivel (K01); plan de 1 sesión combinada. | estado=ok; días=1; fuerza=1; Mié: combinada | V07 → V00 → C02 → C12 → L01 → L02 → L03 → L04 → L07 → L08 → L09 → P07 → P03 → P04 → P05 → A07 → K01 → PL01 → PL02 → PL03 | ✔ |
| D10 | Difícil | Tres objetivos a la vez | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=balonmano, edad=21, nivel=intermedio, objetivos=velocidad+fuerza+resistencia, dias=4, periodo=fuera_temporada | Prioriza los dos primeros objetivos y avisa. | estado=ok; días=4; fuerza=2; Lun: fuerza, Mar: velocidad, Jue: combinada, Vie: recuperacion | V05 → V00 → C02 → C13 → L01 → L03 → L04 → L07 → L08 → L09 → L12 → P07 → P03 → P04 → P05 → A07 → PL01 → PL02 → PL03 | ✔ |
| D11 | Difícil | Edad imposible (150 años) | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=tenis, edad=150, nivel=intermedio, objetivos=tecnica, dias=3 | Rechaza el dato por estar fuera de rango. | estado=incompleto; días=—; fuerza=—; sin plan | V03 | ✔ |
| D12 | Difícil | Objetivo velocidad con molestia de isquiotibiales | sinLesiones=false, molestias=isquios, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=futbol, edad=25, nivel=avanzado, objetivos=velocidad, dias=5, periodo=fuera_temporada | Conflicto resuelto a favor de la seguridad: sprints al 80–90 % (A05, K02). | estado=ok; días=5; fuerza=3; Lun: fuerza, Mar: velocidad, Mié: fuerza, Vie: combinada, Sáb: recuperacion | V00 → C02 → C10 → L01 → L03 → L04 → L07 → L08 → L09 → L12 → P01 → P02 → P03 → P04 → A05 → A07 → K02 → PL01 → PL02 → PL03 | ✔ |
| D13 | Difícil | Datos opcionales sin responder | deporte=baloncesto, edad=35, nivel=intermedio, objetivos=resistencia, dias=3 | Asume 60 min, fuera de temporada, sin gimnasio y sin molestias, lo comunica y genera el plan. | estado=ok; días=3; fuerza=2; Lun: fuerza, Mié: combinada, Vie: resistencia | V07 → V00 → C02 → C11 → L01 → L03 → L04 → L07 → L08 → L09 → P07 → P03 → P04 → A06 → PL01 → PL02 → PL03 | ✔ |
| D14 | Difícil | Joven que se declara avanzado | sinLesiones=true, dolorAgudo=false, parqRiesgo=false, gimnasio=true, minutos=60, deporte=balonmano, edad=15, nivel=avanzado, objetivos=fuerza, dias=5, periodo=fuera_temporada | La edad prevalece sobre el nivel: prescripción juvenil (L05) y aviso K04; fuerza máx. 3. | estado=ok; días=5; fuerza=3; Lun: fuerza, Mar: tecnica, Mié: fuerza, Vie: fuerza, Sáb: recuperacion | V00 → C01 → C13 → L01 → L03 → L05 → L07 → L08 → L09 → L12 → P07 → P03 → P04 → P05 → A07 → K04 → PL01 → PL02 → PL03 | ✔ |

**Barrido exhaustivo** (`engine/barrido.ts`): recorre 51.030 combinaciones (6 deportes × 3 niveles × 3 periodos × 15 combinaciones de objetivos × 7 días × 3 edades × 3 duraciones) y comprueba que siempre hay plan de 7 días, que el nº de sesiones coincide con los días efectivos, que hay al menos un día libre, que la fuerza está separada ≥48 h, que no hay fuerza la víspera del partido y que los bloques suman la duración pedida. Resultado: **0 errores**.

### Comparación con un LLM

La comparación (mismos casos introducidos en ChatGPT/Gemini/Claude como chat) está en la memoria del proyecto. En resumen, lo que aporta este sistema frente a un LLM conversacional es: resultados **reproducibles** (misma entrada → mismo plan), **trazabilidad** de cada decisión a una regla y una fuente, **bloqueos de seguridad garantizados** (PAR-Q+, dolor agudo, menores de 12) y **comprobación automática** con pruebas.

## 7. Limitaciones

- No sustituye a un entrenador ni a un profesional sanitario; las cargas son orientativas.
- Solo cinco deportes con reglas específicas; no distingue posiciones de juego ni sexo.
- El nivel lo declara el propio usuario; no hay test físico.
- Se asume partido en domingo y un solo partido por semana.
- La prescripción es para una semana tipo; no planifica la progresión a lo largo de varias semanas.
- El cribado médico es una sola pregunta inspirada en el PAR-Q+, no el cuestionario completo.

## 8. Estructura del repositorio

```
index.html, index.tsx, App.tsx    entrada de la app (estructura de Google AI Studio)
metadata.json                     metadatos de la app para AI Studio
types.ts                          tipos: Entrada, Hechos, Regla, Resultado
knowledge/                        base de conocimiento: reglas, deportes, fuentes, casos de prueba
engine/                           motor de inferencia, planificador, pruebas y barrido
components/                       interfaz: formulario, resultado, base de conocimiento, pruebas
scripts/run-tests.ts              ejecución de pruebas en consola
```
