import { Fuente } from '../types';

// Catálogo de fuentes. Cada regla de la base de conocimiento remite a uno o varios identificadores.
export const FUENTES: Fuente[] = [
  {
    id: 'F01',
    cita: 'Bull FC, et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med, 54, 1451–1462.',
    url: 'https://doi.org/10.1136/bjsports-2020-102955',
    uso: 'Grupos de edad, mínimos semanales de actividad, fuerza ≥2 días y equilibrio en mayores.',
  },
  {
    id: 'F02',
    cita: 'American College of Sports Medicine (2009). Progression models in resistance training for healthy adults. Med Sci Sports Exerc, 41(3), 687–708.',
    url: 'https://doi.org/10.1249/MSS.0b013e3181915670',
    uso: 'Frecuencia, series, repeticiones e intensidad de fuerza por nivel; 48 h entre sesiones del mismo grupo muscular.',
  },
  {
    id: 'F03',
    cita: 'American College of Sports Medicine (2021). ACSM’s Guidelines for Exercise Testing and Prescription (11.ª ed.). Wolters Kluwer.',
    uso: 'Principio FITT, cribado previo al ejercicio y derivación médica.',
  },
  {
    id: 'F04',
    cita: 'Warburton DER, Jamnik V, Bredin SSD, Gledhill N. The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+).',
    url: 'https://eparmedx.com/',
    uso: 'Pregunta de cribado de riesgo cardiovascular antes de iniciar un programa.',
  },
  {
    id: 'F05',
    cita: 'Soligard T, et al. (2008). Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial. BMJ, 337, a2469.',
    url: 'https://doi.org/10.1136/bmj.a2469',
    uso: 'Eficacia del calentamiento FIFA 11+ en fútbol.',
  },
  {
    id: 'F06',
    cita: 'Bizzini M, Dvorak J (2015). FIFA 11+: an effective programme to prevent football injuries in various player groups worldwide—a narrative review. Br J Sports Med, 49(9), 577–579.',
    url: 'https://doi.org/10.1136/bjsports-2015-094765',
    uso: 'Estructura del FIFA 11+ (≈20 min, ≥2 veces por semana).',
  },
  {
    id: 'F07',
    cita: 'Emery CA, Roy TO, Whittaker JL, Nettel-Aguirre A, van Mechelen W (2015). Neuromuscular training injury prevention strategies in youth sport: a systematic review and meta-analysis. Br J Sports Med, 49(13), 865–870.',
    url: 'https://doi.org/10.1136/bjsports-2015-094639',
    uso: 'Calentamientos neuromusculares en deportes de equipo distintos del fútbol.',
  },
  {
    id: 'F08',
    cita: 'van Dyk N, Behan FP, Whiteley R (2019). Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries. Br J Sports Med, 53(21), 1362–1370.',
    url: 'https://doi.org/10.1136/bjsports-2018-100045',
    uso: 'Ejercicio nórdico para isquiotibiales.',
  },
  {
    id: 'F09',
    cita: 'Hupperets MDW, Verhagen EALM, van Mechelen W (2009). Effect of unsupervised home based proprioceptive training on recurrences of ankle sprain: randomised controlled trial. BMJ, 339, b2684.',
    url: 'https://doi.org/10.1136/bmj.b2684',
    uso: 'Entrenamiento propioceptivo de tobillo.',
  },
  {
    id: 'F10',
    cita: 'Doherty C, et al. (2017). Treatment and prevention of acute and recurrent ankle sprain: an overview of systematic reviews with meta-analysis. Br J Sports Med, 51(2), 113–125.',
    url: 'https://doi.org/10.1136/bjsports-2016-096178',
    uso: 'Prevención de esguince recurrente: equilibrio y soporte externo.',
  },
  {
    id: 'F11',
    cita: 'Webster KE, Hewett TE (2018). Meta-analysis of meta-analyses of anterior cruciate ligament injury reduction training programs. J Orthop Res, 36(10), 2696–2708.',
    url: 'https://doi.org/10.1002/jor.24043',
    uso: 'Entrenamiento neuromuscular (aterrizajes, cambios de dirección) para la rodilla.',
  },
  {
    id: 'F12',
    cita: 'Andersson SH, Bahr R, Clarsen B, Myklebust G (2017). Preventing overuse shoulder injuries among throwing athletes: a cluster-randomised controlled trial in 660 elite handball players. Br J Sports Med, 51(14), 1073–1080.',
    url: 'https://doi.org/10.1136/bjsports-2016-096226',
    uso: 'Programa preventivo de hombro (rotación externa, escápula, movilidad torácica).',
  },
  {
    id: 'F13',
    cita: 'Steffens D, et al. (2016). Prevention of low back pain: a systematic review and meta-analysis. JAMA Intern Med, 176(2), 199–208.',
    url: 'https://doi.org/10.1001/jamainternmed.2015.7431',
    uso: 'El ejercicio (fuerza + control motor) reduce episodios de dolor lumbar.',
  },
  {
    id: 'F14',
    cita: 'Lloyd RS, et al. (2014). Position statement on youth resistance training: the 2014 International Consensus. Br J Sports Med, 48(7), 498–505.',
    url: 'https://doi.org/10.1136/bjsports-2013-092952',
    uso: 'Fuerza en jóvenes: técnica primero, cargas ligeras-moderadas, supervisión cualificada.',
  },
  {
    id: 'F15',
    cita: 'Haff GG, Triplett NT (eds.) (2016). Essentials of Strength Training and Conditioning (4.ª ed.). NSCA / Human Kinetics.',
    uso: 'Volumen de pliometría (contactos por sesión), estructura de sesión y velocidad.',
  },
  {
    id: 'F16',
    cita: 'Buchheit M, Laursen PB (2013). High-intensity interval training, solutions to the programming puzzle: Part I. Sports Med, 43(5), 313–338.',
    url: 'https://doi.org/10.1007/s40279-013-0029-x',
    uso: 'Formatos de entrenamiento interválico (intervalos largos, cortos, juegos reducidos).',
  },
  {
    id: 'F17',
    cita: 'Bompa TO, Haff GG (2009). Periodization: Theory and Methodology of Training (5.ª ed.). Human Kinetics.',
    uso: 'Objetivos de cada periodo de la temporada (pretemporada, competición, transición).',
  },
  {
    id: 'F18',
    cita: 'Rønnestad BR, Nymark BS, Raastad T (2011). Effects of in-season strength maintenance training frequency in professional soccer players. J Strength Cond Res, 25(10), 2653–2660.',
    url: 'https://doi.org/10.1519/JSC.0b013e31822dcd96',
    uso: 'En competición, 1–2 sesiones de fuerza bastan para mantener ganancias.',
  },
  {
    id: 'F19',
    cita: 'Wilson JM, et al. (2012). Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises. J Strength Cond Res, 26(8), 2293–2307.',
    url: 'https://doi.org/10.1519/JSC.0b013e31823a3e2d',
    uso: 'Efecto interferencia al combinar fuerza y resistencia.',
  },
  {
    id: 'F20',
    cita: 'Ardern CL, et al. (2016). 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med, 50(14), 853–864.',
    url: 'https://doi.org/10.1136/bjsports-2016-096278',
    uso: 'La vuelta al entrenamiento tras lesión debe decidirla un profesional sanitario.',
  },
  {
    id: 'F21',
    cita: 'Chodzko-Zajko WJ, et al. (2009). ACSM position stand: Exercise and physical activity for older adults. Med Sci Sports Exerc, 41(7), 1510–1530.',
    url: 'https://doi.org/10.1249/MSS.0b013e3181a0c95c',
    uso: 'Prescripción para mayores de 65: fuerza moderada, equilibrio, impacto controlado.',
  },
  {
    id: 'F22',
    cita: 'Mujika I, Padilla S (2003). Scientific bases for precompetition tapering strategies. Med Sci Sports Exerc, 35(7), 1182–1187.',
    url: 'https://doi.org/10.1249/01.MSS.0000074448.73931.11',
    uso: 'Reducir volumen manteniendo intensidad antes de competir.',
  },
  {
    id: 'F23',
    cita: 'Stølen T, Chamari K, Castagna C, Wisløff U (2005). Physiology of soccer: an update. Sports Med, 35(6), 501–536.',
    url: 'https://doi.org/10.2165/00007256-200535060-00004',
    uso: 'Perfil de exigencias del fútbol.',
  },
  {
    id: 'F24',
    cita: 'Ziv G, Lidor R (2009). Physical attributes, physiological characteristics, on-court performances and nutritional strategies of female and male basketball players. Sports Med, 39(7), 547–568.',
    url: 'https://doi.org/10.2165/00007256-200939070-00003',
    uso: 'Perfil de exigencias del baloncesto.',
  },
  {
    id: 'F25',
    cita: 'Kovacs MS (2007). Tennis physiology: training the competitive athlete. Sports Med, 37(3), 189–198.',
    url: 'https://doi.org/10.2165/00007256-200737030-00001',
    uso: 'Perfil de exigencias del tenis.',
  },
  {
    id: 'F26',
    cita: 'Sheppard JM, Gabbett TJ, Stanganelli LC (2009). An analysis of playing positions in elite men’s volleyball: considerations for competition demands and physiologic characteristics. J Strength Cond Res, 23(6), 1858–1866.',
    uso: 'Perfil de exigencias del voleibol.',
  },
  {
    id: 'F27',
    cita: 'Karcher C, Buchheit M (2014). On-court demands of elite handball, with special reference to playing positions. Sports Med, 44(6), 797–814.',
    url: 'https://doi.org/10.1007/s40279-014-0164-z',
    uso: 'Perfil de exigencias del balonmano.',
  },
  {
    id: 'D01',
    cita: 'Decisión de diseño del autor (alcance del sistema), justificada en la memoria.',
    uso: 'Límites del alcance: edades, deportes cubiertos y valores por defecto.',
  },
];

export const fuentePorId = (id: string) => FUENTES.find((f) => f.id === id);
