import { Hechos, Regla, Zona } from '../types';
import { DEPORTES, ID_REGLA_DEPORTE, NOMBRE_ZONA, PREVENTIVO_ZONA } from './deportes';
import { componerSesiones, construirSesion, distribuir, maxNoConsecutivos } from '../engine/planificador';

// ---------------------------------------------------------------------------
// BASE DE CONOCIMIENTO: reglas de producción SI <condición> ENTONCES <acción>.
// El motor (engine/motor.ts) las evalúa por encadenamiento hacia delante:
// en cada ciclo dispara la regla activa de mayor prioridad que aún no se haya disparado.
// ---------------------------------------------------------------------------

const ok = (h: Hechos) => h.estado === 'ok';
const zonasConsideradas = (h: Hechos): Zona[] => Array.from(new Set([...(h.zonasRiesgo ?? []), ...(h.molestias ?? [])]));

const reglaDeporte = (id: string, dep: keyof typeof DEPORTES): Regla => {
  const p = DEPORTES[dep];
  return {
    id,
    nombre: `Perfil del ${p.nombre.toLowerCase()}`,
    categoria: 'Clasificación',
    prioridad: 80,
    descripcion: `SI deporte = ${p.nombre} ENTONCES perfil = "${p.exigencias}" y zonas de riesgo = ${p.zonasRiesgo
      .map((z) => NOMBRE_ZONA[z])
      .join(', ')}.`,
    fuentes: [p.fuente],
    si: (h) => ok(h) && h.deporte === dep && !h.perfilDeporte,
    entonces: (h) => {
      h.perfilDeporte = p.exigencias;
      h.zonasRiesgo = [...p.zonasRiesgo];
    },
  };
};

const reglaPreventiva = (zona: Zona, fuentes: string[]): Regla => {
  const { ejercicio, regla } = PREVENTIVO_ZONA[zona];
  return {
    id: regla,
    nombre: `Prevención: ${NOMBRE_ZONA[zona]}`,
    categoria: 'Prevención',
    prioridad: 60,
    descripcion: `SI ${NOMBRE_ZONA[zona]} es zona de riesgo del deporte O el usuario declara molestia en ella ENTONCES añadir "${ejercicio}" al bloque preventivo.`,
    fuentes,
    si: (h) => ok(h) && h.zonasRiesgo !== undefined && zonasConsideradas(h).includes(zona) && !h.reglasPreventivas?.includes(regla),
    entonces: (h) => {
      h.preventivos = [...(h.preventivos ?? []), ejercicio];
      h.reglasPreventivas = [...(h.reglasPreventivas ?? []), regla];
    },
  };
};

export const REGLAS: Regla[] = [
  // ------------------------------ VALIDACIÓN Y LÍMITES ------------------------------
  {
    id: 'V01',
    nombre: 'Datos obligatorios incompletos',
    categoria: 'Validación',
    prioridad: 100,
    descripcion:
      'SI falta deporte, edad, nivel, días disponibles u objetivo ENTONCES no se genera plan y se indica qué datos faltan.',
    fuentes: ['D01'],
    si: (h) => !h.deporte || h.edad === undefined || !h.nivel || h.dias === undefined || !h.objetivos?.length,
    entonces: (h, ctx) => {
      const faltan: string[] = [];
      if (!h.deporte) faltan.push('deporte');
      if (h.edad === undefined) faltan.push('edad');
      if (!h.nivel) faltan.push('nivel');
      if (h.dias === undefined) faltan.push('días disponibles');
      if (!h.objetivos?.length) faltan.push('objetivo');
      h.estado = 'incompleto';
      h.faltan = faltan;
      ctx.avisar('bloqueo', `Faltan datos imprescindibles: ${faltan.join(', ')}. Complétalos para obtener un plan.`);
      ctx.detener();
    },
  },
  {
    id: 'V03',
    nombre: 'Datos fuera de rango',
    categoria: 'Validación',
    prioridad: 99,
    descripcion: 'SI edad < 5 o > 100, o días fuera de 1–7, o minutos fuera de 20–150 ENTONCES el dato se considera inválido y se pide corregirlo.',
    fuentes: ['D01'],
    si: (h) =>
      (h.edad !== undefined && (h.edad < 5 || h.edad > 100 || !Number.isFinite(h.edad))) ||
      (h.dias !== undefined && (h.dias < 1 || h.dias > 7)) ||
      (h.minutos !== undefined && (h.minutos < 20 || h.minutos > 150)),
    entonces: (h, ctx) => {
      h.estado = 'incompleto';
      h.faltan = [];
      if (h.edad !== undefined && (h.edad < 5 || h.edad > 100)) h.faltan.push('edad válida (5–100)');
      if (h.dias !== undefined && (h.dias < 1 || h.dias > 7)) h.faltan.push('días entre 1 y 7');
      if (h.minutos !== undefined && (h.minutos < 20 || h.minutos > 150)) h.faltan.push('minutos entre 20 y 150');
      ctx.avisar('bloqueo', `Hay datos fuera de rango: ${h.faltan.join(', ')}.`);
      ctx.detener();
    },
  },
  {
    id: 'S01',
    nombre: 'Cribado médico positivo (PAR-Q+)',
    categoria: 'Seguridad',
    prioridad: 98,
    descripcion:
      'SI el usuario responde SÍ a la pregunta de riesgo cardiovascular (PAR-Q+) ENTONCES no se genera plan y se recomienda valoración médica antes de entrenar.',
    fuentes: ['F04', 'F03'],
    si: (h) => h.parqRiesgo === true,
    entonces: (h, ctx) => {
      h.estado = 'bloqueado';
      ctx.avisar(
        'bloqueo',
        'Has indicado un posible riesgo cardiovascular. Antes de seguir un plan de entrenamiento, consulta con un médico (recomendación del cuestionario PAR-Q+).',
      );
      ctx.detener();
    },
  },
  {
    id: 'S02',
    nombre: 'Dolor agudo o lesión no recuperada',
    categoria: 'Seguridad',
    prioridad: 97,
    descripcion:
      'SI el usuario tiene dolor agudo o una lesión sin recuperar ENTONCES no se genera plan y se deriva a fisioterapeuta o médico deportivo.',
    fuentes: ['F20'],
    si: (h) => h.dolorAgudo === true,
    entonces: (h, ctx) => {
      h.estado = 'bloqueado';
      ctx.avisar(
        'bloqueo',
        'Con dolor agudo o una lesión sin recuperar, la vuelta al entrenamiento debe decidirla un fisioterapeuta o médico deportivo. El sistema no genera un plan en este caso.',
      );
      ctx.detener();
    },
  },
  {
    id: 'V02',
    nombre: 'Contradicción en lesiones',
    categoria: 'Validación',
    prioridad: 96,
    descripcion: 'SI el usuario marca "sin lesiones ni molestias" Y a la vez marca alguna zona con molestias ENTONCES hay una contradicción y se pide aclararla.',
    fuentes: ['D01'],
    si: (h) => h.sinLesiones === true && (h.molestias?.length ?? 0) > 0,
    entonces: (h, ctx) => {
      h.estado = 'contradiccion';
      ctx.avisar(
        'bloqueo',
        `Respuestas contradictorias: indicas que no tienes molestias pero has marcado ${h.molestias!.map((z) => NOMBRE_ZONA[z]).join(', ')}. Aclara cuál es correcta.`,
      );
      ctx.detener();
    },
  },
  {
    id: 'V04',
    nombre: 'Edad fuera del alcance (menores de 12)',
    categoria: 'Validación',
    prioridad: 95,
    descripcion:
      'SI edad < 12 ENTONCES el caso queda fuera del alcance: se recomienda actividad multideportiva y juego (≥60 min/día) supervisado por un entrenador.',
    fuentes: ['F01', 'D01'],
    si: (h) => h.edad !== undefined && h.edad < 12,
    entonces: (h, ctx) => {
      h.estado = 'fuera_de_alcance';
      ctx.avisar(
        'bloqueo',
        'El sistema no genera planes para menores de 12 años. A esta edad la OMS recomienda al menos 60 minutos diarios de actividad variada y juego, sin especialización temprana.',
      );
      ctx.detener();
    },
  },
  {
    id: 'V05',
    nombre: 'Demasiados objetivos',
    categoria: 'Conflicto',
    prioridad: 94,
    descripcion: 'SI hay más de 2 objetivos ENTONCES se priorizan los 2 primeros y se avisa (más objetivos diluyen el estímulo).',
    fuentes: ['F17'],
    si: (h) => (h.objetivos?.length ?? 0) > 2 && !h.objetivosPriorizados,
    entonces: (h, ctx) => {
      h.objetivosPriorizados = h.objetivos!.slice(0, 2);
      ctx.avisar('conflicto', `Has elegido ${h.objetivos!.length} objetivos. Se priorizan los dos primeros: ${h.objetivosPriorizados.join(' y ')}.`);
    },
  },
  {
    id: 'V06',
    nombre: 'Deporte no previsto',
    categoria: 'Validación',
    prioridad: 93,
    descripcion:
      'SI el deporte no está en la base de conocimiento ENTONCES se genera solo un plan de condición física general, sin reglas específicas del deporte, y se avisa.',
    fuentes: ['D01'],
    si: (h) => h.deporte === 'otro' && h.zonasRiesgo === undefined,
    entonces: (h, ctx) => {
      h.perfilDeporte = 'Deporte no incluido en la base de conocimiento: se aplican solo reglas generales.';
      h.zonasRiesgo = [];
      ctx.avisar(
        'aviso',
        `"${h.deporteOtro || 'Otro deporte'}" no está en la base de conocimiento. El plan es de condición física general; las sesiones técnicas deben diseñarlas un entrenador de ese deporte.`,
      );
    },
  },
  {
    id: 'V07',
    nombre: 'Datos opcionales asumidos',
    categoria: 'Validación',
    prioridad: 92,
    descripcion:
      'SI faltan datos opcionales ENTONCES se asumen valores prudentes (60 min, fuera de temporada, sin molestias, sin gimnasio) y se informa de ello.',
    fuentes: ['D01'],
    si: (h) => !h.supuestos && (h.minutos === undefined || !h.periodo || h.gimnasio === undefined || (h.sinLesiones === undefined && !h.molestias?.length)),
    entonces: (h, ctx) => {
      const s: string[] = [];
      if (h.minutos === undefined) {
        h.minutos = 60;
        s.push('60 minutos por sesión');
      }
      if (!h.periodo) {
        h.periodo = 'fuera_temporada';
        s.push('periodo fuera de temporada');
      }
      if (h.gimnasio === undefined) {
        h.gimnasio = false;
        s.push('sin acceso a gimnasio');
      }
      if (h.sinLesiones === undefined && !h.molestias?.length) {
        h.sinLesiones = true;
        h.molestias = [];
        s.push('sin molestias');
      }
      h.supuestos = s;
      if (s.length) ctx.avisar('info', `No indicaste algunos datos; se ha supuesto: ${s.join(', ')}.`);
    },
  },
  {
    id: 'V00',
    nombre: 'Datos válidos',
    categoria: 'Validación',
    prioridad: 90,
    descripcion: 'SI los datos están completos, en rango y sin contradicciones ENTONCES estado = válido y se inicia el razonamiento.',
    fuentes: ['D01'],
    si: (h) => h.estado === undefined,
    entonces: (h) => {
      h.estado = 'ok';
      h.objetivosPriorizados ??= [...h.objetivos!];
      h.molestias ??= [];
      h.preventivos = [];
      h.reglasPreventivas = [];
      h.adaptaciones = [];
      h.sesionesExtra = [];
      h.factorPliometria = 1;
    },
  },

  // ------------------------------ CLASIFICACIÓN ------------------------------
  {
    id: 'C01',
    nombre: 'Grupo de edad: joven',
    categoria: 'Clasificación',
    prioridad: 80,
    descripcion: 'SI 12 ≤ edad ≤ 17 ENTONCES grupo de edad = joven.',
    fuentes: ['F01', 'F14'],
    si: (h) => ok(h) && !h.grupoEdad && h.edad! >= 12 && h.edad! <= 17,
    entonces: (h) => {
      h.grupoEdad = 'joven';
    },
  },
  {
    id: 'C02',
    nombre: 'Grupo de edad: adulto',
    categoria: 'Clasificación',
    prioridad: 80,
    descripcion: 'SI 18 ≤ edad ≤ 64 ENTONCES grupo de edad = adulto.',
    fuentes: ['F01'],
    si: (h) => ok(h) && !h.grupoEdad && h.edad! >= 18 && h.edad! <= 64,
    entonces: (h) => {
      h.grupoEdad = 'adulto';
    },
  },
  {
    id: 'C03',
    nombre: 'Grupo de edad: mayor',
    categoria: 'Clasificación',
    prioridad: 80,
    descripcion: 'SI edad ≥ 65 ENTONCES grupo de edad = mayor.',
    fuentes: ['F01', 'F21'],
    si: (h) => ok(h) && !h.grupoEdad && h.edad! >= 65,
    entonces: (h) => {
      h.grupoEdad = 'mayor';
    },
  },
  reglaDeporte(ID_REGLA_DEPORTE.futbol, 'futbol'),
  reglaDeporte(ID_REGLA_DEPORTE.baloncesto, 'baloncesto'),
  reglaDeporte(ID_REGLA_DEPORTE.voleibol, 'voleibol'),
  reglaDeporte(ID_REGLA_DEPORTE.balonmano, 'balonmano'),
  reglaDeporte(ID_REGLA_DEPORTE.tenis, 'tenis'),

  // ------------------------------ CARGA DE ENTRENAMIENTO ------------------------------
  {
    id: 'L01',
    nombre: 'Días máximos según nivel',
    categoria: 'Carga',
    prioridad: 70,
    descripcion:
      'SI nivel = principiante ENTONCES máx. 4 días; intermedio máx. 5; avanzado máx. 6; mayores máx. 5. Siempre queda ≥1 día de descanso. Si el usuario pide más, se reduce y se avisa.',
    fuentes: ['F02', 'F15'],
    si: (h) => ok(h) && h.grupoEdad !== undefined && h.diasEfectivos === undefined,
    entonces: (h, ctx) => {
      let max = { principiante: 4, intermedio: 5, avanzado: 6 }[h.nivel!];
      if (h.grupoEdad === 'mayor') max = Math.min(max, 5);
      h.diasEfectivos = Math.min(h.dias!, max);
      if (h.dias! > max)
        ctx.avisar(
          'conflicto',
          `Pides ${h.dias} días, pero para tu nivel el máximo recomendado es ${max} para asegurar la recuperación. El plan usa ${max} días.`,
        );
    },
  },
  {
    id: 'L02',
    nombre: 'Frecuencia insuficiente',
    categoria: 'Carga',
    prioridad: 69,
    descripcion: 'SI días = 1 ENTONCES el plan es solo de mantenimiento y se avisa de que no alcanza las recomendaciones mínimas (fuerza ≥2 días/semana).',
    fuentes: ['F01'],
    si: (h) => ok(h) && h.diasEfectivos === 1,
    entonces: (_h, ctx) => {
      ctx.avisar('aviso', 'Con un solo día a la semana el plan solo sirve para mantener. La OMS recomienda trabajar la fuerza al menos 2 días por semana.');
    },
  },
  {
    id: 'L03',
    nombre: 'Número de sesiones de fuerza',
    categoria: 'Carga',
    prioridad: 68,
    descripcion:
      'SI nivel = principiante o intermedio ENTONCES 2 sesiones de fuerza; avanzado 3. +1 si el objetivo es fuerza. En competición máx. 2 (mantenimiento). Jóvenes máx. 3. Nunca más de las que permitan 48 h entre ellas.',
    fuentes: ['F02', 'F18', 'F01'],
    si: (h) => ok(h) && h.diasEfectivos !== undefined && h.sesionesFuerza === undefined,
    entonces: (h) => {
      let f = h.nivel === 'avanzado' ? 3 : 2;
      if (h.objetivosPriorizados!.includes('fuerza')) f++;
      if (h.periodo === 'competicion') f = Math.min(f, 2);
      if (h.grupoEdad === 'joven' || h.grupoEdad === 'mayor') f = Math.min(f, 3);
      h.sesionesFuerza = Math.min(f, maxNoConsecutivos(h.diasEfectivos!, h.periodo === 'competicion'));
    },
  },
  {
    id: 'L04',
    nombre: 'Prescripción de fuerza por nivel (adultos)',
    categoria: 'Carga',
    prioridad: 67,
    descripcion:
      'SI adulto ENTONCES principiante: 1–3 × 8–12 al 60–70 % 1RM; intermedio: 3–4 × 6–12 al 70–80 %; avanzado: 3–6 × 3–8 al 80–90 %.',
    fuentes: ['F02'],
    si: (h) => ok(h) && h.grupoEdad === 'adulto' && !h.presFuerza,
    entonces: (h) => {
      h.presFuerza = {
        principiante: { series: '1–3', repeticiones: '8–12', intensidad: '60–70 % 1RM (RPE 6–7)', descanso: '1–2 min' },
        intermedio: { series: '3–4', repeticiones: '6–12', intensidad: '70–80 % 1RM (RPE 7–8)', descanso: '2 min' },
        avanzado: { series: '3–6', repeticiones: '3–8', intensidad: '80–90 % 1RM (RPE 8–9)', descanso: '2–3 min' },
      }[h.nivel!];
    },
  },
  {
    id: 'L05',
    nombre: 'Prescripción de fuerza en jóvenes',
    categoria: 'Carga',
    prioridad: 67,
    descripcion:
      'SI grupo = joven ENTONCES prioridad a la técnica: 1–3 × 8–15 con cargas ligeras-moderadas (RPE ≤ 7) y supervisión cualificada, sea cual sea el nivel declarado.',
    fuentes: ['F14'],
    si: (h) => ok(h) && h.grupoEdad === 'joven' && !h.presFuerza,
    entonces: (h, ctx) => {
      h.presFuerza = { series: '1–3', repeticiones: '8–15', intensidad: 'ligera-moderada, técnica perfecta (RPE ≤ 7)', descanso: '1–2 min' };
      ctx.avisar('info', 'Por tu edad, el trabajo de fuerza prioriza la técnica con cargas moderadas y debe estar supervisado por un entrenador cualificado.');
    },
  },
  {
    id: 'L06',
    nombre: 'Prescripción de fuerza en mayores',
    categoria: 'Carga',
    prioridad: 67,
    descripcion:
      'SI grupo = mayor ENTONCES 1–3 × 8–12 a intensidad moderada (RPE 5–7) e incluir equilibrio en ≥3 días por semana.',
    fuentes: ['F21', 'F01'],
    si: (h) => ok(h) && h.grupoEdad === 'mayor' && !h.presFuerza,
    entonces: (h, ctx) => {
      h.presFuerza = { series: '1–3', repeticiones: '8–12', intensidad: 'moderada (RPE 5–7)', descanso: '2 min' };
      h.preventivos = [...(h.preventivos ?? []), 'Equilibrio: apoyo monopodal, marcha en tándem (≥3 días/semana)'];
      h.reglasPreventivas = [...(h.reglasPreventivas ?? []), 'L06'];
      ctx.avisar('info', 'A partir de 65 años se añade trabajo de equilibrio en las sesiones (recomendación OMS de actividad multicomponente).');
    },
  },
  {
    id: 'L07',
    nombre: 'Volumen de pliometría',
    categoria: 'Carga',
    prioridad: 66,
    descripcion:
      'SI principiante ENTONCES 80 contactos/sesión de baja intensidad; intermedio 100; avanzado 120. SI mayor ENTONCES sin pliometría de alto impacto.',
    fuentes: ['F15', 'F21'],
    si: (h) => ok(h) && h.grupoEdad !== undefined && h.contactosPliometria === undefined,
    entonces: (h) => {
      if (h.grupoEdad === 'mayor') {
        h.contactosPliometria = 0;
        h.presPliometria = 'Sin saltos de alto impacto';
        return;
      }
      h.contactosPliometria = { principiante: 80, intermedio: 100, avanzado: 120 }[h.nivel!];
      h.presPliometria = {
        principiante: 'Saltos de baja intensidad: comba, saltos a cajón bajo, aterrizajes',
        intermedio: 'Saltos de intensidad media: saltos laterales, CMJ, saltos unipodales cortos',
        avanzado: 'Saltos de alta intensidad: saltos con contramovimiento, multisaltos, reactivos',
      }[h.nivel!];
    },
  },
  {
    id: 'L08',
    nombre: 'Prescripción de resistencia interválica',
    categoria: 'Carga',
    prioridad: 66,
    descripcion:
      'SI principiante ENTONCES intervalos largos 4 × 3 min (RPE 7) con 2 min de pausa; intermedio 2 × 8 × 15 s/15 s; avanzado juego reducido + 3 × 10 × 30 s/30 s. Mayores: continuo moderado.',
    fuentes: ['F16', 'F21'],
    si: (h) => ok(h) && h.grupoEdad !== undefined && !h.presAerobica,
    entonces: (h) => {
      h.presAerobica =
        h.grupoEdad === 'mayor'
          ? '20–30 min continuos a intensidad moderada (RPE 5–6) o intervalos suaves 5 × 2 min'
          : {
              principiante: '4 × 3 min a RPE 7 con 2 min de pausa activa',
              intermedio: '2 series de 8 × 15 s / 15 s a RPE 8, 3 min entre series',
              avanzado: '3 series de 10 × 30 s / 30 s a RPE 8–9, 3 min entre series',
            }[h.nivel!];
    },
  },
  {
    id: 'L09',
    nombre: 'Prescripción de velocidad y agilidad',
    categoria: 'Carga',
    prioridad: 66,
    descripcion:
      'SI principiante ENTONCES 6 aceleraciones de 10–20 m; intermedio 8; avanzado 10 + cambios de dirección reactivos. Recuperación completa (≥90 s).',
    fuentes: ['F15'],
    si: (h) => ok(h) && h.grupoEdad !== undefined && !h.presVelocidad,
    entonces: (h) => {
      const reps = { principiante: 6, intermedio: 8, avanzado: 10 }[h.nivel!];
      h.presVelocidad = `${reps} aceleraciones de 10–20 m + ${Math.round(reps / 2)} cambios de dirección (5-0-5)${
        h.nivel === 'avanzado' ? ' con estímulo reactivo' : ''
      }; recuperación completa ≥ 90 s`;
    },
  },
  {
    id: 'L10',
    nombre: 'Pretemporada',
    categoria: 'Carga',
    prioridad: 65,
    descripcion: 'SI periodo = pretemporada ENTONCES se prioriza construir base aeróbica y fuerza: se añade una sesión de resistencia.',
    fuentes: ['F17'],
    si: (h) => ok(h) && h.periodo === 'pretemporada' && !h.sesionesExtra!.includes('resistencia'),
    entonces: (h) => {
      h.sesionesExtra!.push('resistencia');
    },
  },
  {
    id: 'L11',
    nombre: 'Microciclo de competición',
    categoria: 'Carga',
    prioridad: 65,
    descripcion:
      'SI periodo = competición ENTONCES partido el domingo, el día previo es de activación (volumen bajo, intensidad alta y breve) y, con ≥4 días, el lunes es de recuperación.',
    fuentes: ['F17', 'F22'],
    si: (h) => ok(h) && h.periodo === 'competicion' && h.diasEfectivos !== undefined && !h.sesionesExtra!.includes('activacion'),
    entonces: (h, ctx) => {
      h.sesionesExtra!.push('activacion');
      if (h.diasEfectivos! >= 4) h.sesionesExtra!.push('recuperacion');
      ctx.avisar('info', 'Periodo de competición: se asume partido el domingo. Si compites otro día, desplaza la semana para que la activación sea el día anterior.');
    },
  },
  {
    id: 'L12',
    nombre: 'Fuera de temporada',
    categoria: 'Carga',
    prioridad: 65,
    descripcion: 'SI periodo = fuera de temporada Y días ≥ 4 ENTONCES se incluye una sesión de recuperación activa.',
    fuentes: ['F17'],
    si: (h) => ok(h) && h.periodo === 'fuera_temporada' && (h.diasEfectivos ?? 0) >= 4 && !h.sesionesExtra!.includes('recuperacion'),
    entonces: (h) => {
      h.sesionesExtra!.push('recuperacion');
    },
  },
  {
    id: 'L13',
    nombre: 'Sesión corta con varios objetivos',
    categoria: 'Conflicto',
    prioridad: 64,
    descripcion: 'SI minutos ≤ 30 Y hay 2 objetivos ENTONCES los bloques se comprimen y se recomienda centrarse en el primer objetivo.',
    fuentes: ['F17'],
    si: (h) => ok(h) && (h.minutos ?? 60) <= 30 && h.objetivosPriorizados!.length >= 2 && !h.adaptaciones!.some((a) => a.startsWith('Sesiones cortas')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Sesiones cortas: bloques comprimidos, prioridad al primer objetivo.');
      ctx.avisar('aviso', 'Con sesiones de 30 minutos es difícil trabajar bien dos objetivos; los bloques se comprimen y conviene priorizar el primero.');
    },
  },
  {
    id: 'L14',
    nombre: 'Efecto interferencia fuerza-resistencia',
    categoria: 'Conflicto',
    prioridad: 64,
    descripcion:
      'SI objetivos incluyen fuerza Y resistencia Y días ≤ 3 ENTONCES se avisa del efecto interferencia y se recomienda separar ambos estímulos el máximo posible.',
    fuentes: ['F19'],
    si: (h) =>
      ok(h) &&
      h.objetivosPriorizados!.includes('fuerza') &&
      h.objetivosPriorizados!.includes('resistencia') &&
      (h.diasEfectivos ?? 7) <= 3 &&
      !h.adaptaciones!.some((a) => a.startsWith('Interferencia')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Interferencia: separar fuerza y resistencia en días distintos o, si coinciden, hacer primero la fuerza.');
      ctx.avisar('conflicto', 'Fuerza y resistencia con pocos días pueden interferir entre sí. Si coinciden el mismo día, haz primero la fuerza.');
    },
  },

  // ------------------------------ PREVENCIÓN ------------------------------
  {
    id: 'P01',
    nombre: 'Calentamiento FIFA 11+ (fútbol)',
    categoria: 'Prevención',
    prioridad: 60,
    descripcion: 'SI deporte = fútbol ENTONCES el calentamiento de cada sesión es el programa FIFA 11+ (carrera, fuerza, pliometría y equilibrio, ≈20 min).',
    fuentes: ['F05', 'F06'],
    si: (h) => ok(h) && h.deporte === 'futbol' && !h.calentamiento,
    entonces: (h) => {
      h.calentamiento = 'FIFA 11+: carreras (8 min), fuerza-pliometría-equilibrio (10 min) y carreras finales (2 min)';
    },
  },
  {
    id: 'P07',
    nombre: 'Calentamiento neuromuscular (otros deportes)',
    categoria: 'Prevención',
    prioridad: 60,
    descripcion:
      'SI deporte ∈ {baloncesto, voleibol, balonmano, tenis} ENTONCES calentamiento neuromuscular: activación, equilibrio, aterrizajes y cambios de dirección (+ hombro en deportes de lanzamiento o golpeo).',
    fuentes: ['F07', 'F12'],
    si: (h) => ok(h) && ['baloncesto', 'voleibol', 'balonmano', 'tenis'].includes(h.deporte!) && !h.calentamiento,
    entonces: (h) => {
      const hombro = ['voleibol', 'balonmano', 'tenis'].includes(h.deporte!);
      h.calentamiento = `Calentamiento neuromuscular: carrera progresiva, equilibrio, aterrizajes y cambios de dirección${
        hombro ? ' + activación de hombro con goma' : ''
      }`;
    },
  },
  {
    id: 'P09',
    nombre: 'Calentamiento general (deporte no previsto)',
    categoria: 'Prevención',
    prioridad: 60,
    descripcion: 'SI deporte no previsto ENTONCES calentamiento general RAMP: elevar temperatura, activar, movilizar y potenciar.',
    fuentes: ['F15'],
    si: (h) => ok(h) && h.deporte === 'otro' && !h.calentamiento,
    entonces: (h) => {
      h.calentamiento = 'Calentamiento general (RAMP): carrera suave, activación, movilidad dinámica y progresivos';
    },
  },
  reglaPreventiva('isquios', ['F08']),
  reglaPreventiva('tobillo', ['F09', 'F10']),
  reglaPreventiva('rodilla', ['F11']),
  reglaPreventiva('hombro', ['F12']),
  reglaPreventiva('espalda', ['F13']),
  {
    id: 'P08',
    nombre: 'Objetivo prevención de lesiones',
    categoria: 'Prevención',
    prioridad: 59,
    descripcion: 'SI objetivo = prevención ENTONCES se añade una sesión de recuperación con bloque preventivo y el bloque preventivo aparece en todas las sesiones.',
    fuentes: ['F06', 'F07'],
    si: (h) => ok(h) && h.objetivosPriorizados!.includes('prevencion') && !h.sesionesExtra!.includes('recuperacion') && h.periodo !== undefined,
    entonces: (h) => {
      h.sesionesExtra!.push('recuperacion');
    },
  },

  // ------------------------------ ADAPTACIONES POR MOLESTIAS O MATERIAL ------------------------------
  {
    id: 'A01',
    nombre: 'Molestia de rodilla',
    categoria: 'Adaptación',
    prioridad: 55,
    descripcion: 'SI molestia en rodilla ENTONCES reducir la pliometría al 50 %, evitar saltos en profundidad y trabajar sentadilla en rango sin dolor.',
    fuentes: ['F11', 'F20'],
    si: (h) => ok(h) && h.molestias!.includes('rodilla') && h.contactosPliometria !== undefined && !h.adaptaciones!.some((a) => a.startsWith('Rodilla')),
    entonces: (h, ctx) => {
      h.factorPliometria = Math.min(h.factorPliometria ?? 1, 0.5);
      h.adaptaciones!.push('Rodilla: pliometría al 50 %, sin saltos en profundidad, sentadilla en rango sin dolor.');
      ctx.avisar('aviso', 'Por la molestia de rodilla se reduce el volumen de saltos. Si la molestia persiste, consulta con un fisioterapeuta.');
    },
  },
  {
    id: 'A02',
    nombre: 'Molestia de tobillo',
    categoria: 'Adaptación',
    prioridad: 55,
    descripcion: 'SI molestia en tobillo ENTONCES reducir la pliometría al 50 % y priorizar equilibrio; valorar tobillera o vendaje funcional.',
    fuentes: ['F10'],
    si: (h) => ok(h) && h.molestias!.includes('tobillo') && h.contactosPliometria !== undefined && !h.adaptaciones!.some((a) => a.startsWith('Tobillo')),
    entonces: (h, ctx) => {
      h.factorPliometria = Math.min(h.factorPliometria ?? 1, 0.5);
      h.adaptaciones!.push('Tobillo: pliometría al 50 %, prioridad al equilibrio, valorar tobillera o vendaje funcional.');
      ctx.avisar('aviso', 'Por la molestia de tobillo se reducen los saltos y se refuerza el equilibrio. Si persiste, consulta con un fisioterapeuta.');
    },
  },
  {
    id: 'A03',
    nombre: 'Molestia de hombro',
    categoria: 'Adaptación',
    prioridad: 55,
    descripcion: 'SI molestia en hombro ENTONCES evitar press por encima de la cabeza con carga alta y limitar el volumen de lanzamientos, remates o saques.',
    fuentes: ['F12'],
    si: (h) => ok(h) && h.molestias!.includes('hombro') && !h.adaptaciones!.some((a) => a.startsWith('Hombro')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Hombro: sin press por encima de la cabeza con carga alta; limitar lanzamientos, remates o saques.');
      ctx.avisar('aviso', 'Por la molestia de hombro se sustituye el press por encima de la cabeza y se limita el volumen de golpeos. Si persiste, consulta con un fisioterapeuta.');
    },
  },
  {
    id: 'A04',
    nombre: 'Molestia de espalda baja',
    categoria: 'Adaptación',
    prioridad: 55,
    descripcion: 'SI molestia lumbar ENTONCES evitar cargas axiales máximas; usar variantes goblet o unilaterales y reforzar el core.',
    fuentes: ['F13'],
    si: (h) => ok(h) && h.molestias!.includes('espalda') && !h.adaptaciones!.some((a) => a.startsWith('Espalda')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Espalda: sin cargas axiales máximas; variantes goblet o unilaterales y core.');
      ctx.avisar('aviso', 'Por la molestia lumbar se evitan las cargas pesadas sobre la columna. Si persiste, consulta con un fisioterapeuta.');
    },
  },
  {
    id: 'A05',
    nombre: 'Molestia de isquiotibiales',
    categoria: 'Adaptación',
    prioridad: 55,
    descripcion: 'SI molestia en isquiotibiales ENTONCES los sprints se hacen al 80–90 % de la velocidad máxima y progresan solo sin dolor.',
    fuentes: ['F08', 'F20'],
    si: (h) => ok(h) && h.molestias!.includes('isquios') && h.presVelocidad !== undefined && !h.adaptaciones!.some((a) => a.startsWith('Isquios')),
    entonces: (h, ctx) => {
      h.presVelocidad = `${h.presVelocidad} — al 80–90 % de la velocidad máxima`;
      h.adaptaciones!.push('Isquios: sprints al 80–90 %, progresar solo sin dolor.');
      ctx.avisar('aviso', 'Por la molestia de isquiotibiales los sprints se hacen al 80–90 %. Si persiste, consulta con un fisioterapeuta.');
    },
  },
  {
    id: 'A06',
    nombre: 'Ejercicios sin gimnasio',
    categoria: 'Adaptación',
    prioridad: 54,
    descripcion: 'SI no hay acceso a gimnasio ENTONCES los ejercicios de fuerza se hacen con peso corporal, gomas elásticas o mancuernas ligeras.',
    fuentes: ['F02', 'F15'],
    si: (h) => ok(h) && h.gimnasio === false && h.adaptaciones !== undefined && !h.ejerciciosFuerza,
    entonces: (h) => {
      h.ejerciciosFuerza = [
        'Sentadilla búlgara con peso corporal',
        'Puente de glúteo a una pierna',
        h.molestias!.includes('hombro') ? 'Flexiones inclinadas (manos elevadas)' : 'Flexiones',
        'Remo con goma elástica',
        'Peso muerto a una pierna con mochila o goma',
      ];
    },
  },
  {
    id: 'A07',
    nombre: 'Ejercicios con gimnasio',
    categoria: 'Adaptación',
    prioridad: 54,
    descripcion:
      'SI hay gimnasio ENTONCES ejercicios básicos multiarticulares; SI molestia lumbar ENTONCES sentadilla goblet en vez de trasera; SI molestia de hombro ENTONCES press landmine en vez de press militar.',
    fuentes: ['F02', 'F15'],
    si: (h) => ok(h) && h.gimnasio === true && h.adaptaciones !== undefined && !h.ejerciciosFuerza,
    entonces: (h) => {
      const espalda = h.molestias!.includes('espalda') || h.grupoEdad !== 'adulto';
      h.ejerciciosFuerza = [
        espalda ? 'Sentadilla goblet' : 'Sentadilla trasera',
        'Peso muerto rumano',
        'Zancada búlgara con mancuernas',
        'Remo con mancuerna',
        h.molestias!.includes('hombro') ? 'Press landmine a una mano' : 'Press banca o press militar',
      ];
    },
  },

  // ------------------------------ CONFLICTOS ------------------------------
  {
    id: 'K01',
    nombre: 'Nivel avanzado con poca frecuencia',
    categoria: 'Conflicto',
    prioridad: 50,
    descripcion: 'SI nivel = avanzado Y días ≤ 2 ENTONCES posible incoherencia: se mantiene el nivel pero se avisa de que la carga semanal será baja.',
    fuentes: ['F02'],
    si: (h) => ok(h) && h.nivel === 'avanzado' && (h.diasEfectivos ?? 7) <= 2 && !h.adaptaciones!.some((a) => a.startsWith('Nivel')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Nivel avanzado con pocos días: carga semanal baja.');
      ctx.avisar('conflicto', 'Has indicado nivel avanzado pero solo entrenas 1–2 días. Revisa el nivel: un deportista avanzado suele entrenar 4 o más días.');
    },
  },
  {
    id: 'K02',
    nombre: 'Objetivo velocidad con molestia de isquiotibiales',
    categoria: 'Conflicto',
    prioridad: 50,
    descripcion: 'SI objetivo = velocidad Y molestia en isquiotibiales ENTONCES conflicto: la seguridad prevalece y la velocidad máxima queda limitada (regla A05).',
    fuentes: ['F08', 'F20'],
    si: (h) => ok(h) && h.objetivosPriorizados!.includes('velocidad') && h.molestias!.includes('isquios') && !h.adaptaciones!.some((a) => a.startsWith('Conflicto velocidad')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Conflicto velocidad-isquios: prevalece la seguridad.');
      ctx.avisar('conflicto', 'Tu objetivo de velocidad choca con la molestia de isquiotibiales: prima la seguridad y los sprints no serán máximos hasta que no haya dolor.');
    },
  },
  {
    id: 'K03',
    nombre: 'Persona mayor con objetivo de velocidad',
    categoria: 'Conflicto',
    prioridad: 50,
    descripcion: 'SI grupo = mayor Y objetivo = velocidad ENTONCES se reinterpreta como agilidad y equilibrio, sin sprints máximos.',
    fuentes: ['F21'],
    si: (h) => ok(h) && h.grupoEdad === 'mayor' && h.objetivosPriorizados!.includes('velocidad') && h.presVelocidad !== undefined && !h.adaptaciones!.some((a) => a.startsWith('Mayor')),
    entonces: (h, ctx) => {
      h.presVelocidad = '6–8 desplazamientos de agilidad a velocidad controlada y ejercicios de equilibrio dinámico; sin sprints máximos';
      h.adaptaciones!.push('Mayor: velocidad sustituida por agilidad y equilibrio.');
      ctx.avisar('conflicto', 'A partir de 65 años el objetivo de velocidad se trabaja como agilidad y equilibrio, sin sprints máximos.');
    },
  },
  {
    id: 'K04',
    nombre: 'Joven que se declara avanzado',
    categoria: 'Conflicto',
    prioridad: 50,
    descripcion: 'SI grupo = joven Y nivel = avanzado ENTONCES la edad prevalece sobre el nivel en la prescripción de fuerza (regla L05).',
    fuentes: ['F14'],
    si: (h) => ok(h) && h.grupoEdad === 'joven' && h.nivel === 'avanzado' && !h.adaptaciones!.some((a) => a.startsWith('Joven')),
    entonces: (h, ctx) => {
      h.adaptaciones!.push('Joven avanzado: la edad prevalece en la carga de fuerza.');
      ctx.avisar('conflicto', 'Aunque tu nivel es avanzado, por edad la carga de fuerza se mantiene moderada y supervisada.');
    },
  },

  // ------------------------------ PLANIFICACIÓN ------------------------------
  {
    id: 'PL01',
    nombre: 'Composición de la semana',
    categoria: 'Planificación',
    prioridad: 20,
    descripcion:
      'SI se conocen días, sesiones de fuerza, objetivos y periodo ENTONCES se forma la lista de sesiones; si no caben, se fusiona fuerza con técnica y después se descarta lo menos prioritario.',
    fuentes: ['F17', 'F02'],
    si: (h) => ok(h) && h.sesionesFuerza !== undefined && !!h.presFuerza && !!h.calentamiento && !!h.ejerciciosFuerza && !h.listaSesiones,
    entonces: (h, ctx) => {
      const { lista, descartadas, fusionadas } = componerSesiones(h);
      h.listaSesiones = lista;
      if (fusionadas) ctx.avisar('info', `Para que todo quepa en ${h.diasEfectivos} días, ${fusionadas} sesión(es) de fuerza se combinan con técnica.`);
      if (descartadas.length) ctx.avisar('aviso', `No caben todas las sesiones deseadas; se han dejado fuera: ${descartadas.join(', ')}.`);
    },
  },
  {
    id: 'PL02',
    nombre: 'Distribución semanal y 48 h entre fuerza',
    categoria: 'Planificación',
    prioridad: 19,
    descripcion:
      'SI hay lista de sesiones ENTONCES se colocan en la semana dejando ≥48 h entre sesiones de fuerza, el domingo libre (o partido) y la activación el día previo al partido.',
    fuentes: ['F02', 'F17', 'F22'],
    si: (h) => ok(h) && !!h.listaSesiones && !h.semana,
    entonces: (h, ctx) => {
      const { tipos, convertidas } = distribuir(h, h.listaSesiones!);
      h.semana = tipos.map((t, d) => construirSesion(h, t!, d));
      if (convertidas) ctx.avisar('info', `${convertidas} sesión(es) de fuerza se han cambiado por técnica para respetar 48 h de recuperación.`);
    },
  },
  {
    id: 'PL03',
    nombre: 'Plan completo',
    categoria: 'Planificación',
    prioridad: 18,
    descripcion: 'SI la semana está construida ENTONCES el plan se da por concluido y se presenta con su explicación.',
    fuentes: ['D01'],
    si: (h) => ok(h) && !!h.semana && !h.planListo,
    entonces: (h) => {
      h.planListo = true;
    },
  },
];

export const reglaPorId = (id: string) => REGLAS.find((r) => r.id === id);
