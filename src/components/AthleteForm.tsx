import React, { useState } from 'react';
import {
  AthleteProfile,
  CompetitiveLevel,
  DayOfWeek,
  Equipment,
  FatigueLevel,
  Objective,
  PainLocation,
  Position,
  Sport,
} from '../types';
import {
  User,
  Activity,
  Calendar,
  Clock,
  Dumbbell,
  HeartPulse,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  CheckCircle2,
  Trophy,
  Sliders,
  Flame,
  AlertTriangle,
  RotateCcw,
  Zap,
  Target,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AthleteFormProps {
  initialProfile?: AthleteProfile;
  onSubmit: (profile: AthleteProfile) => void;
}

const DEFAULT_PROFILE: AthleteProfile = {
  age: 22,
  sport: 'futbol',
  position: 'delantero_centro',
  level: 'nacional',
  primaryObjective: 'explosividad',
  secondaryObjective: 'velocidad',
  teamTrainingDays: ['martes', 'jueves', 'viernes'],
  competitionDays: ['domingo'],
  availableIndividualDays: ['lunes', 'miercoles'],
  sessionDuration: 45,
  equipment: ['campo_pista', 'conos_escaleras_vallas', 'balon', 'mancuernas'],
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

const DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'L' },
  { id: 'martes', label: 'Martes', short: 'M' },
  { id: 'miercoles', label: 'Miércoles', short: 'X' },
  { id: 'jueves', label: 'Jueves', short: 'J' },
  { id: 'viernes', label: 'Viernes', short: 'V' },
  { id: 'sabado', label: 'Sábado', short: 'S' },
  { id: 'domingo', label: 'Domingo', short: 'D' },
];

const SPORT_POSITIONS: Record<Sport, { id: Position; label: string }[]> = {
  futbol: [
    { id: 'portero', label: 'Portero' },
    { id: 'defensa_central', label: 'Defensa Central' },
    { id: 'lateral', label: 'Lateral (Izquierdo / Derecho)' },
    { id: 'mediocentro_defensivo', label: 'Mediocentro Defensivo' },
    { id: 'mediocentro_ofensivo', label: 'Mediocentro Ofensivo / Interior' },
    { id: 'extremo', label: 'Extremo' },
    { id: 'delantero_centro', label: 'Delantero Centro' },
  ],
  balonmano: [
    { id: 'portero', label: 'Portero' },
    { id: 'extremo', label: 'Extremo (Izquierdo / Derecho)' },
    { id: 'lateral', label: 'Lateral (Primera Línea)' },
    { id: 'central', label: 'Central (Organizador)' },
    { id: 'pivote', label: 'Pivote (6 Metros)' },
  ],
  baloncesto: [
    { id: 'base', label: 'Base (Point Guard - 1)' },
    { id: 'escolta', label: 'Escolta (Shooting Guard - 2)' },
    { id: 'alero', label: 'Alero (Small Forward - 3)' },
    { id: 'ala_pivot', label: 'Ala-Pívot (Power Forward - 4)' },
    { id: 'pivot', label: 'Pívot (Center - 5)' },
  ],
};

const OBJECTIVES: { id: Objective; label: string; desc: string; icon: string }[] = [
  { id: 'fuerza', label: 'Fuerza', desc: 'Desarrollo neuromuscular y tensión muscular máxima', icon: '⚡' },
  { id: 'resistencia', label: 'Resistencia', desc: 'Capacidad glucolítica y RSA interválico', icon: '🫁' },
  { id: 'velocidad', label: 'Velocidad', desc: 'Aceleración lineal y velocidad pico sin fatiga', icon: '💨' },
  { id: 'explosividad', label: 'Explosividad', desc: 'Potencia reactiva y ciclo estiramiento-acortamiento', icon: '💥' },
  { id: 'agilidad', label: 'Agilidad', desc: 'Cambios de dirección multidireccionales y reactividad', icon: '🔄' },
  { id: 'tecnica', label: 'Técnica específica', desc: 'Gestos balísticos y control motor de juego', icon: '🎯' },
];

const EQUIPMENT_OPTIONS: { id: Equipment; label: string; desc: string }[] = [
  { id: 'sin_material', label: 'Sin material', desc: 'Solo peso corporal y calistenia atlética' },
  { id: 'gimnasio_completo', label: 'Gimnasio completo', desc: 'Barras olímpicas, discos, jaula y poleas' },
  { id: 'mancuernas', label: 'Mancuernas / Pesas', desc: 'Cargas libres regulables' },
  { id: 'bandas_elasticas', label: 'Bandas elásticas', desc: 'Resistencia progresiva para manguito rotador o cadera' },
  { id: 'campo_pista', label: 'Campo / Pista reglamentaria', desc: 'Hierba natural, sintético o parquet' },
  { id: 'conos_escaleras_vallas', label: 'Conos, escaleras o vallas', desc: 'Material de agilidad y reactividad' },
  { id: 'balon', label: 'Balón oficial del deporte', desc: 'Fútbol, balonmano o baloncesto' },
];

const PAIN_LOCATIONS: { id: PainLocation; label: string }[] = [
  { id: 'ninguno', label: 'Ninguna molestia articular o muscular' },
  { id: 'rodilla', label: 'Rodilla (Tendón rotuliano, menisco, cruzado)' },
  { id: 'tobillo', label: 'Tobillo (Ligamentos peroneos, tendón de Aquiles)' },
  { id: 'hombro', label: 'Hombro (Manguito rotador, glenohumeral)' },
  { id: 'isquiotibiales', label: 'Isquiotibiales (Bíceps femoral / Semitendinoso)' },
  { id: 'aductores', label: 'Aductores / Zona inguinal (Pubalgia)' },
  { id: 'cuadriceps', label: 'Cuádriceps / Recto anterior' },
  { id: 'espalda_lumbar', label: 'Espalda baja / Zona lumbar' },
  { id: 'otro', label: 'Otra localización' },
];

const STEPS = [
  { id: 1, label: 'Perfil', icon: User, desc: 'Edad y categoría' },
  { id: 2, label: 'Deporte & Posición', icon: Trophy, desc: 'Modalidad y puesto' },
  { id: 3, label: 'Objetivos', icon: Target, desc: 'Primario y secundario' },
  { id: 4, label: 'Calendario', icon: Calendar, desc: 'Microciclo semanal' },
  { id: 5, label: 'Equipamiento', icon: Dumbbell, desc: 'Recursos disponibles' },
  { id: 6, label: 'Estado Físico', icon: HeartPulse, desc: 'Salud y recuperación' },
  { id: 7, label: 'Confirmación', icon: Sparkles, desc: 'Resumen y generación' },
];

export const AthleteForm: React.FC<AthleteFormProps> = ({ initialProfile, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<AthleteProfile>(initialProfile || DEFAULT_PROFILE);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Función para cambiar de deporte y reiniciar posición por defecto
  const handleSportChange = (sport: Sport) => {
    const defaultPos = SPORT_POSITIONS[sport][0].id;
    setProfile((prev) => ({
      ...prev,
      sport,
      position: defaultPos,
    }));
  };

  const toggleDay = (field: 'teamTrainingDays' | 'competitionDays' | 'availableIndividualDays', day: DayOfWeek) => {
    setProfile((prev) => {
      const current = prev[field];
      const exists = current.includes(day);
      const updated = exists ? current.filter((d) => d !== day) : [...current, day];
      return { ...prev, [field]: updated };
    });
  };

  const toggleEquipment = (eq: Equipment) => {
    setProfile((prev) => {
      const exists = prev.equipment.includes(eq);
      let updated: Equipment[];
      if (eq === 'sin_material') {
        updated = exists ? [] : ['sin_material'];
      } else {
        const withoutNoEquipment = prev.equipment.filter((e) => e !== 'sin_material');
        updated = exists
          ? withoutNoEquipment.filter((e) => e !== eq)
          : [...withoutNoEquipment, eq];
      }
      return { ...prev, equipment: updated };
    });
  };

  // Preajustes rápidos de auditoría
  const loadPreset = (
    type:
      | 'futbol'
      | 'balonmano'
      | 'baloncesto'
      | 'lesion_bloqueada'
      | 'restriccion_dolor'
      | 'texto_ambiguo'
      | 'sin_material'
  ) => {
    if (type === 'futbol') {
      setProfile({
        age: 23,
        sport: 'futbol',
        position: 'extremo',
        level: 'nacional',
        primaryObjective: 'velocidad',
        secondaryObjective: 'explosividad',
        teamTrainingDays: ['martes', 'jueves', 'viernes'],
        competitionDays: ['domingo'],
        availableIndividualDays: ['lunes', 'miercoles'],
        sessionDuration: 45,
        equipment: ['campo_pista', 'conos_escaleras_vallas', 'balon', 'mancuernas'],
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
      });
    } else if (type === 'balonmano') {
      setProfile({
        age: 25,
        sport: 'balonmano',
        position: 'lateral',
        level: 'nacional',
        primaryObjective: 'fuerza',
        secondaryObjective: 'explosividad',
        teamTrainingDays: ['lunes', 'miercoles', 'viernes'],
        competitionDays: ['sabado'],
        availableIndividualDays: ['martes', 'jueves'],
        sessionDuration: 45,
        equipment: ['campo_pista', 'bandas_elasticas', 'balon', 'gimnasio_completo'],
        hasPain: false,
        painLocation: 'ninguno',
        painIntensity: 0,
        painDuringMovement: false,
        hasActiveInjury: false,
        injuryDetails: '',
        hasMedicalClearance: true,
        fatigue: 'moderada',
        perceivedRecovery: 4,
        freeTextRestrictions: '',
      });
    } else if (type === 'baloncesto') {
      setProfile({
        age: 24,
        sport: 'baloncesto',
        position: 'alero',
        level: 'profesional',
        primaryObjective: 'explosividad',
        secondaryObjective: 'agilidad',
        teamTrainingDays: ['lunes', 'martes', 'jueves'],
        competitionDays: ['sabado'],
        availableIndividualDays: ['miercoles', 'viernes'],
        sessionDuration: 50,
        equipment: ['campo_pista', 'balon', 'conos_escaleras_vallas', 'mancuernas'],
        hasPain: false,
        painLocation: 'ninguno',
        painIntensity: 0,
        painDuringMovement: false,
        hasActiveInjury: false,
        injuryDetails: '',
        hasMedicalClearance: true,
        fatigue: 'baja',
        perceivedRecovery: 5,
        freeTextRestrictions: '',
      });
    } else if (type === 'lesion_bloqueada') {
      setProfile((prev) => ({
        ...prev,
        hasActiveInjury: true,
        injuryDetails: 'Sospecha de rotura de fibras en isquiotibiales',
        hasMedicalClearance: false,
      }));
    } else if (type === 'restriccion_dolor') {
      setProfile((prev) => ({
        ...prev,
        hasPain: true,
        painLocation: 'rodilla',
        painIntensity: 4,
        painDuringMovement: true,
      }));
    } else if (type === 'texto_ambiguo') {
      setProfile((prev) => ({
        ...prev,
        freeTextRestrictions: 'Intervención de menisco reciente, pendiente de revisión.',
      }));
    } else if (type === 'sin_material') {
      setProfile((prev) => ({
        ...prev,
        equipment: ['sin_material'],
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];
    if (currentStep === 1) {
      if (profile.age < 18) {
        errors.push('La edad mínima requerida es de 18 años para deportistas federados adultos.');
      }
    } else if (currentStep === 3) {
      if (profile.primaryObjective === profile.secondaryObjective) {
        errors.push('El objetivo principal y el secundario deben ser distintos.');
      }
    } else if (currentStep === 4) {
      if (profile.availableIndividualDays.length === 0) {
        errors.push('Debes seleccionar al menos un día disponible para entrenar individualmente.');
      }
    } else if (currentStep === 5) {
      if (profile.equipment.length === 0) {
        errors.push('Selecciona al menos una opción de equipamiento disponible (o sin material).');
      }
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setFormErrors([]);
      if (currentStep < 7) {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    setFormErrors([]);
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (profile.age < 18) {
      errors.push('La edad mínima debe ser de 18 años para deportistas federados adultos.');
    }
    if (profile.primaryObjective === profile.secondaryObjective) {
      errors.push('El objetivo principal y el secundario deben ser distintos.');
    }
    if (profile.availableIndividualDays.length === 0) {
      errors.push('Debes seleccionar al menos un día disponible para entrenar individualmente.');
    }
    if (profile.equipment.length === 0) {
      errors.push('Selecciona al menos una opción de equipamiento disponible (o sin material).');
    }

    setFormErrors(errors);
    if (errors.length === 0) {
      onSubmit(profile);
    }
  };

  const progressPercentage = Math.round((currentStep / 7) * 100);

  return (
    <div className="space-y-8 py-4">
      {/* STEPPER HEADER MODERNO */}
      <div className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Configuración Guiada del Microciclo</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
              Paso {currentStep} de 7: {STEPS[currentStep - 1].label}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {STEPS[currentStep - 1].desc} · El motor evaluará tus parámetros de forma determinista
            </p>
          </div>

          {/* Porcentaje y progreso */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-[#94A3B8] block">Progreso</span>
              <span className="text-lg font-mono font-bold text-[#22D3EE]">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-24 bg-[#080D19] h-2 rounded-full overflow-hidden border border-[#1E2D4A]">
              <div
                className="bg-gradient-to-r from-[#22D3EE] to-[#6366F1] h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stepper Navigation Pills / Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-[#1E2D4A]">
          {STEPS.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < currentStep || validateCurrentStep()) {
                    setFormErrors([]);
                    setCurrentStep(s.id);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                  isCurrent
                    ? 'bg-[#16243D] border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                    : isCompleted
                    ? 'bg-[#0B132B] border-[#10B981]/40 text-[#94A3B8] hover:border-[#10B981]'
                    : 'bg-[#080D19]/60 border-[#1E2D4A] text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-[#22D3EE]' : isCompleted ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                    0{s.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#22D3EE]' : 'text-[#64748B]'}`} />
                  )}
                </div>
                <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#F8FAFC]' : isCompleted ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ERRORES DE VALIDACIÓN SI EXISTEN */}
      {formErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] space-y-1.5 shadow-lg"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Por favor, corrige los siguientes requisitos antes de continuar:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[#CBD5E1] pl-2">
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* CONTENIDO DEL FORMULARIO POR PASOS */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* PASO 1: PERFIL DEL DEPORTISTA */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#22D3EE]" />
                  <span>Perfil General del Deportista</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  SportExpert solo prescribe planes para deportistas federados adultos (mínimo 18 años).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Edad */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wider">
                    Edad (Años cumplidos)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={16}
                      max={45}
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl bg-[#080D19] border border-[#1E2D4A] focus:border-[#22D3EE] text-[#F8FAFC] text-sm focus:outline-none focus:ring-1 focus:ring-[#22D3EE] transition-all"
                    />
                    <span className="absolute right-4 top-3 text-xs text-[#64748B] font-mono">AÑOS</span>
                  </div>
                  {profile.age < 18 ? (
                    <p className="text-xs text-[#EF4444] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Menor de 18 años: El motor aplicará bloqueo de seguridad (REG-VAL-01).</span>
                    </p>
                  ) : (
                    <p className="text-xs text-[#10B981] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Edad válida para el marco federado adulto.</span>
                    </p>
                  )}
                </div>

                {/* Nivel Competitivo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wider">
                    Nivel Competitivo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['autonomico', 'nacional', 'profesional'] as CompetitiveLevel[]).map((lvl) => {
                      const isSelected = profile.level === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setProfile({ ...profile, level: lvl })}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#16243D] border-[#22D3EE] text-[#F8FAFC] font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                              : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                          }`}
                        >
                          <span className="text-xs capitalize block">{lvl}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Ajusta la especificidad de las demandas neuromusculares requeridas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 2: SELECCIÓN DE DEPORTE Y POSICIÓN */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#22D3EE]" />
                  <span>Modalidad Deportiva y Demarcación Táctica</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Selecciona la disciplina y el puesto específico sobre el terreno de juego.
                </p>
              </div>

              {/* Tarjetas Interactivas de Deportes */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wider">
                  Selecciona tu Deporte
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      { id: 'futbol' as Sport, name: 'Fútbol', icon: '⚽', desc: '11 vs 11 · Campo hierba/sintético', badge: '20 Ejercicios' },
                      { id: 'balonmano' as Sport, name: 'Balonmano', icon: '🤾', desc: '7 vs 7 · Pista 40x20m parquet', badge: '20 Ejercicios' },
                      { id: 'baloncesto' as Sport, name: 'Baloncesto', icon: '🏀', desc: '5 vs 5 · Pista 28x15m parquet', badge: '20 Ejercicios' },
                    ]
                  ).map((sp) => {
                    const isSelected = profile.sport === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleSportChange(sp.id)}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-[#16243D] border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-[#22D3EE]'
                            : 'bg-[#080D19] border-[#1E2D4A] hover:border-[#334155]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-3xl">{sp.icon}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              isSelected ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[#111B2E] text-[#64748B]'
                            }`}>
                              {sp.badge}
                            </span>
                          </div>
                          <h4 className={`text-base font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                            {sp.name}
                          </h4>
                          <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                            {sp.desc}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#1E2D4A]/60 flex items-center justify-between text-xs">
                          <span className={isSelected ? 'text-[#22D3EE] font-bold' : 'text-[#64748B]'}>
                            {isSelected ? 'Seleccionado' : 'Elegir'}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Posición en el Campo / Pista */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wider">
                  Posición Táctica Específica en {profile.sport.toUpperCase()}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {SPORT_POSITIONS[profile.sport].map((pos) => {
                    const isSelected = profile.position === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setProfile({ ...profile, position: pos.id })}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#16243D] border-[#22D3EE] text-[#F8FAFC] font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <span className="text-xs">{pos.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#22D3EE] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  La posición añade <strong>+15 puntos</strong> de afinidad técnica a ejercicios con demandas directas del puesto.
                </p>
              </div>
            </motion.div>
          )}

          {/* PASO 3: OBJETIVOS PRINCIPALES Y SECUNDARIOS */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#22D3EE]" />
                  <span>Objetivos de Acondicionamiento Físico</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Define la capacidad condicional prioritaria (+50 pts) y la secundaria sinérgica (+25 pts). Deben ser distintas.
                </p>
              </div>

              {/* Objetivo Principal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#22D3EE] block uppercase tracking-wider">
                    Objetivo Principal (+50 puntos de scoring)
                  </label>
                  <span className="text-[10px] text-[#94A3B8] uppercase">Prioridad #1</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {OBJECTIVES.map((obj) => {
                    const isSelected = profile.primaryObjective === obj.id;
                    const isSecondary = profile.secondaryObjective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, primaryObjective: obj.id });
                          if (profile.secondaryObjective === obj.id) {
                            // Cambiar secundario para no duplicar
                            const nextSec = OBJECTIVES.find((o) => o.id !== obj.id)?.id || 'resistencia';
                            setProfile((prev) => ({ ...prev, primaryObjective: obj.id, secondaryObjective: nextSec }));
                          }
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#16243D] border-[#22D3EE] text-[#F8FAFC] shadow-[0_0_15px_rgba(34,211,238,0.25)] ring-1 ring-[#22D3EE]'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{obj.icon}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#22D3EE]/20 text-[#22D3EE]">
                                +50 PTS
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                            {obj.label}
                          </h4>
                          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                            {obj.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Objetivo Secundario */}
              <div className="space-y-3 pt-4 border-t border-[#1E2D4A]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A5B4FC] block uppercase tracking-wider">
                    Objetivo Secundario (+25 puntos de scoring)
                  </label>
                  <span className="text-[10px] text-[#94A3B8] uppercase">Prioridad #2</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {OBJECTIVES.map((obj) => {
                    const isSelected = profile.secondaryObjective === obj.id;
                    const isPrimary = profile.primaryObjective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        disabled={isPrimary}
                        onClick={() => setProfile({ ...profile, secondaryObjective: obj.id })}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isPrimary
                            ? 'bg-[#080D19]/40 border-[#1E2D4A]/50 opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#16243D] border-[#6366F1] text-[#F8FAFC] shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-[#6366F1] cursor-pointer'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155] cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{obj.icon}</span>
                            {isSelected && (
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#6366F1]/20 text-[#A5B4FC]">
                                +25 PTS
                              </span>
                            )}
                            {isPrimary && (
                              <span className="text-[9px] font-mono text-[#64748B]">Principal</span>
                            )}
                          </div>
                          <h4 className={`text-sm font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                            {obj.label}
                          </h4>
                          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                            {obj.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 4: CALENDARIO DE ENTRENAMIENTOS Y COMPETICIÓN */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#22D3EE]" />
                  <span>Microciclo Semanal y Calendario de Competición</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  El sistema respeta los entrenamientos colectivos y garantiza que NUNCA se programen sesiones individuales en día de partido oficial.
                </p>
              </div>

              {/* Días de Partido / Competición */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#FCD34D] block uppercase tracking-wider flex items-center gap-2">
                  <span>Día(s) de Partido / Competición Oficial (Match Day - MD)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#FCD34D]">Inviolable</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const isSelected = profile.competitionDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay('competitionDays', day.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FCD34D] font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <span className="text-xs font-mono block font-bold">{day.short}</span>
                        <span className="text-[10px] hidden sm:block truncate mt-0.5">{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Días de Entrenamiento con el Club / Equipo */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#A5B4FC] block uppercase tracking-wider">
                  Días de Entrenamiento Colectivo con el Club / Equipo
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const isSelected = profile.teamTrainingDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay('teamTrainingDays', day.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6366F1]/20 border-[#6366F1] text-[#A5B4FC] font-bold shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <span className="text-xs font-mono block font-bold">{day.short}</span>
                        <span className="text-[10px] hidden sm:block truncate mt-0.5">{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Días Disponibles para Sesión Individual */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#22D3EE] block uppercase tracking-wider flex items-center gap-2">
                  <span>Días con Disponibilidad para Trabajo Físico Individual</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22D3EE]/20 text-[#22D3EE]">Mínimo 1 día</span>
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const isSelected = profile.availableIndividualDays.includes(day.id);
                    const isMatchDay = profile.competitionDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay('availableIndividualDays', day.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#F8FAFC] font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                            : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                        }`}
                      >
                        <span className="text-xs font-mono block font-bold">{day.short}</span>
                        <span className="text-[10px] hidden sm:block truncate mt-0.5">{day.label}</span>
                        {isMatchDay && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F59E0B]" title="Día de partido" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duración de Sesión */}
              <div className="space-y-3 pt-4 border-t border-[#1E2D4A]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F8FAFC] block uppercase tracking-wider">
                    Duración Estimada de la Sesión Individual
                  </label>
                  <span className="text-sm font-mono font-bold text-[#22D3EE]">
                    {profile.sessionDuration} MINUTOS
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[30, 45, 60, 75, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setProfile({ ...profile, sessionDuration: dur })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                        profile.sessionDuration === dur
                          ? 'bg-[#16243D] border-[#22D3EE] text-[#22D3EE] shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                          : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 5: EQUIPAMIENTO DISPONIBLE */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#22D3EE]" />
                  <span>Equipamiento e Instalaciones Disponibles</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Se descartará de forma estricta cualquier ejercicio que requiera material no disponible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {EQUIPMENT_OPTIONS.map((eq) => {
                  const isSelected = profile.equipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#16243D] border-[#22D3EE] text-[#F8FAFC] shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                          : 'bg-[#080D19] border-[#1E2D4A] text-[#94A3B8] hover:border-[#334155]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#22D3EE] border-[#22D3EE] text-[#080D19]' : 'border-[#334155]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                          {eq.label}
                        </h4>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          {eq.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PASO 6: ESTADO FÍSICO Y RECUPERACIÓN */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#22D3EE]" />
                  <span>Estado Físico, Molestias y Nivel de Fatiga</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Hard Constraints: el motor descarta ejercicios que carguen zonas doloridas y detiene la prescripción si hay lesión activa sin alta.
                </p>
              </div>

              {/* Dolor Articular / Muscular */}
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                    ¿Experimentas dolor o molestia osteomuscular actualmente?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, hasPain: false, painLocation: 'ninguno', painIntensity: 0, painDuringMovement: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !profile.hasPain
                          ? 'bg-[#10B981] text-[#080D19]'
                          : 'bg-[#111B2E] border border-[#1E2D4A] text-[#94A3B8]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, hasPain: true, painLocation: 'rodilla', painIntensity: 3 })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        profile.hasPain
                          ? 'bg-[#EF4444] text-[#F8FAFC]'
                          : 'bg-[#111B2E] border border-[#1E2D4A] text-[#94A3B8]'
                      }`}
                    >
                      Sí
                    </button>
                  </div>
                </div>

                {profile.hasPain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-3 border-t border-[#1E2D4A]"
                  >
                    <div>
                      <label className="text-xs font-semibold text-[#CBD5E1] block mb-2">
                        Localización Anatómica del Dolor (Descarte determinista de la cadena cinética):
                      </label>
                      <select
                        value={profile.painLocation}
                        onChange={(e) => setProfile({ ...profile, painLocation: e.target.value as PainLocation })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#111B2E] border border-[#1E2D4A] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#22D3EE]"
                      >
                        {PAIN_LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Escala EVA */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#CBD5E1]">Intensidad en Escala EVA (0-10):</span>
                          <span className="font-mono font-bold text-[#F8FAFC]">{profile.painIntensity}/10</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={10}
                          value={profile.painIntensity}
                          onChange={(e) => setProfile({ ...profile, painIntensity: parseInt(e.target.value) })}
                          className="w-full accent-[#EF4444]"
                        />
                        {profile.painIntensity >= 7 && (
                          <p className="text-[11px] text-[#EF4444] mt-1 font-semibold">
                            EVA ≥ 7: Dolor severo. Activará bloqueo de seguridad (REG-SEG-02).
                          </p>
                        )}
                      </div>

                      {/* Dolor en Movimiento */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#111B2E] border border-[#1E2D4A]">
                        <span className="text-xs text-[#CBD5E1]">¿Aumenta con el movimiento o salto?</span>
                        <input
                          type="checkbox"
                          checked={profile.painDuringMovement}
                          onChange={(e) => setProfile({ ...profile, painDuringMovement: e.target.checked })}
                          className="w-4 h-4 accent-[#22D3EE] rounded"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Lesión Activa y Autorización Médica */}
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                    ¿Padeces alguna lesión actual en proceso?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, hasActiveInjury: false, injuryDetails: '', hasMedicalClearance: true })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !profile.hasActiveInjury
                          ? 'bg-[#10B981] text-[#080D19]'
                          : 'bg-[#111B2E] border border-[#1E2D4A] text-[#94A3B8]'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, hasActiveInjury: true, hasMedicalClearance: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        profile.hasActiveInjury
                          ? 'bg-[#EF4444] text-[#F8FAFC]'
                          : 'bg-[#111B2E] border border-[#1E2D4A] text-[#94A3B8]'
                      }`}
                    >
                      Sí
                    </button>
                  </div>
                </div>

                {profile.hasActiveInjury && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-3 border-t border-[#1E2D4A]"
                  >
                    <div>
                      <label className="text-xs font-semibold text-[#CBD5E1] block mb-1">
                        Detalle de la lesión activa:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Sospecha de rotura de fibras en isquiotibiales"
                        value={profile.injuryDetails}
                        onChange={(e) => setProfile({ ...profile, injuryDetails: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#111B2E] border border-[#1E2D4A] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#22D3EE]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#111B2E] border border-[#1E2D4A]">
                      <div>
                        <span className="text-xs font-bold text-[#F8FAFC] block">
                          ¿Cuentas con alta médica o autorización formal para entrenar?
                        </span>
                        <span className="text-[11px] text-[#94A3B8]">
                          Sin alta médica formal se suspende preventivamente el entrenamiento físico.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.hasMedicalClearance}
                        onChange={(e) => setProfile({ ...profile, hasMedicalClearance: e.target.checked })}
                        className="w-4 h-4 accent-[#10B981] rounded"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Nivel de Fatiga y Recuperación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2">
                  <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider block">
                    Sensación de Fatiga Acumulada
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['baja', 'media', 'alta'] as FatigueLevel[]).map((fat) => (
                      <button
                        key={fat}
                        type="button"
                        onClick={() => setProfile({ ...profile, fatigue: fat })}
                        className={`p-2.5 rounded-xl border text-center text-xs capitalize transition-all cursor-pointer ${
                          profile.fatigue === fat
                            ? fat === 'alta'
                              ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] font-bold'
                              : 'bg-[#16243D] border-[#22D3EE] text-[#F8FAFC] font-bold'
                            : 'bg-[#111B2E] border-[#1E2D4A] text-[#94A3B8]'
                        }`}
                      >
                        {fat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#F8FAFC] uppercase tracking-wider">
                      Recuperación Percibida
                    </label>
                    <span className="font-mono text-[#22D3EE] font-bold">{profile.perceivedRecovery} de 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setProfile({ ...profile, perceivedRecovery: val })}
                        className={`p-2.5 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                          profile.perceivedRecovery === val
                            ? val <= 2
                              ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                              : 'bg-[#16243D] border-[#10B981] text-[#10B981]'
                            : 'bg-[#111B2E] border-[#1E2D4A] text-[#94A3B8]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Restricciones Médicas en Texto Libre */}
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2">
                <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider block">
                  Restricciones Médicas o Técnicas Adicionales en Texto Libre
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Evitar flexión profunda tras artroscopia, pauta de readaptación..."
                  value={profile.freeTextRestrictions}
                  onChange={(e) => setProfile({ ...profile, freeTextRestrictions: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111B2E] border border-[#1E2D4A] text-[#F8FAFC] text-xs focus:outline-none focus:border-[#22D3EE]"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Por principio deontológico, cualquier indicación clínica no interpretable con certeza activará una parada de seguridad para solicitar confirmación médica.
                </p>
              </div>
            </motion.div>
          )}

          {/* PASO 7: RESUMEN Y CONFIRMACIÓN */}
          {currentStep === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="border-b border-[#1E2D4A] pb-4">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#22D3EE]" />
                  <span>Resumen de Evaluación y Ejecución de Inferencia</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Revisa los datos antes de lanzar la inferencia determinista.
                </p>
              </div>

              {/* Resumen en cuadrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Perfil</span>
                  <p className="font-bold text-[#F8FAFC]">{profile.age} años · Nivel {profile.level}</p>
                  <p className="text-[#22D3EE] font-mono capitalize">{profile.sport} · {profile.position.replace(/_/g, ' ')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Objetivos</span>
                  <p className="text-[#F8FAFC]">1º: <strong className="text-[#22D3EE]">{profile.primaryObjective}</strong> (+50 pts)</p>
                  <p className="text-[#F8FAFC]">2º: <strong className="text-[#A5B4FC]">{profile.secondaryObjective}</strong> (+25 pts)</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Microciclo</span>
                  <p className="text-[#F8FAFC]">Partido: {profile.competitionDays.join(', ') || 'Sin partido'}</p>
                  <p className="text-[#94A3B8]">Indiv: {profile.availableIndividualDays.join(', ')} ({profile.sessionDuration} min)</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Material</span>
                  <p className="text-[#CBD5E1] truncate">{profile.equipment.join(', ')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Salud / Dolor</span>
                  <p className="text-[#F8FAFC]">
                    {profile.hasPain ? `Dolor en ${profile.painLocation} (EVA ${profile.painIntensity}/10)` : 'Sin dolor reportado'}
                  </p>
                  <p className="text-[#94A3B8]">
                    {profile.hasActiveInjury ? 'Lesión activa declarada' : 'Sin lesiones activas'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1">
                  <span className="text-[#64748B] uppercase text-[10px] block font-bold">Carga</span>
                  <p className="text-[#F8FAFC]">Fatiga: <span className="capitalize">{profile.fatigue}</span></p>
                  <p className="text-[#94A3B8]">Recuperación: {profile.perceivedRecovery}/5</p>
                </div>
              </div>

              {/* Preajustes Reproducibles de Auditoría */}
              <div className="pt-4 border-t border-[#1E2D4A] space-y-2">
                <span className="text-xs font-bold text-[#22D3EE] uppercase tracking-wider block">
                  Cargar Escenarios de Prueba de Auditoría (Preajustes Directos)
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => loadPreset('futbol')}
                    className="px-3 py-1.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] hover:bg-[#16243D] text-[#CBD5E1] hover:text-[#22D3EE] transition-all cursor-pointer"
                  >
                    ⚽ Fútbol Válido
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('balonmano')}
                    className="px-3 py-1.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] hover:bg-[#16243D] text-[#CBD5E1] hover:text-[#22D3EE] transition-all cursor-pointer"
                  >
                    🤾 Balonmano Válido
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('baloncesto')}
                    className="px-3 py-1.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] hover:bg-[#16243D] text-[#CBD5E1] hover:text-[#22D3EE] transition-all cursor-pointer"
                  >
                    🏀 Baloncesto Válido
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('lesion_bloqueada')}
                    className="px-3 py-1.5 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] transition-all cursor-pointer"
                  >
                    🚫 Lesión sin alta (Bloqueo)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('restriccion_dolor')}
                    className="px-3 py-1.5 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#FCD34D] transition-all cursor-pointer"
                  >
                    ⚠️ Dolor en Rodilla
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('texto_ambiguo')}
                    className="px-3 py-1.5 rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#FCD34D] transition-all cursor-pointer"
                  >
                    ❓ Texto Ambiguo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('sin_material')}
                    className="px-3 py-1.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] hover:bg-[#16243D] text-[#CBD5E1] transition-all cursor-pointer"
                  >
                    🤸 Sin Material (Calistenia)
                  </button>
                </div>
              </div>

              {/* Botón Principal Generar Plan */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-base font-extrabold text-[#080D19] bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#6366F1] hover:opacity-95 shadow-[0_0_30px_rgba(34,211,238,0.4)] flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>GENERAR PLAN Y AUDITORÍA DE REGLAS</span>
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTROLES DE NAVEGACIÓN ANTERIOR / SIGUIENTE */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handlePrev}
            className={`px-5 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
              currentStep === 1
                ? 'opacity-30 border-[#1E2D4A] text-[#64748B] cursor-not-allowed'
                : 'border-[#1E2D4A] bg-[#111B2E] hover:bg-[#16243D] text-[#F8FAFC] cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#080D19] bg-[#22D3EE] hover:bg-[#38BDF8] shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#080D19] bg-[#22D3EE] hover:bg-[#38BDF8] shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Ejecutar Motor Experto</span>
              <Sparkles className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
