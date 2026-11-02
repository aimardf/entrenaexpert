import React, { useState } from 'react';
import { DaySchedule, Exercise, Objective } from '../types';
import {
  Calendar,
  Trophy,
  Users,
  Dumbbell,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Info,
  Layers,
  Activity,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { motion } from 'motion/react';

interface WeeklyCalendarProps {
  schedule: DaySchedule[];
  onSelectDay: (daySchedule: DaySchedule) => void;
  onSelectExercise: (exercise: Exercise, rationale: string, score: number) => void;
}

// Category visual styling
const CATEGORY_STYLES: Record<
  Objective,
  { label: string; bg: string; text: string; border: string; badge: string }
> = {
  fuerza: {
    label: 'Fuerza',
    bg: 'bg-[#6366F1]/10',
    text: 'text-[#A5B4FC]',
    border: 'border-[#6366F1]/30',
    badge: 'bg-[#6366F1]/20 text-[#A5B4FC]',
  },
  resistencia: {
    label: 'Resistencia',
    bg: 'bg-[#0EA5E9]/10',
    text: 'text-[#38BDF8]',
    border: 'border-[#0EA5E9]/30',
    badge: 'bg-[#0EA5E9]/20 text-[#38BDF8]',
  },
  velocidad: {
    label: 'Velocidad',
    bg: 'bg-[#22D3EE]/10',
    text: 'text-[#22D3EE]',
    border: 'border-[#22D3EE]/30',
    badge: 'bg-[#22D3EE]/20 text-[#22D3EE]',
  },
  explosividad: {
    label: 'Explosividad',
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#FCD34D]',
    border: 'border-[#F59E0B]/30',
    badge: 'bg-[#F59E0B]/20 text-[#FCD34D]',
  },
  agilidad: {
    label: 'Agilidad',
    bg: 'bg-[#EC4899]/10',
    text: 'text-[#F472B6]',
    border: 'border-[#EC4899]/30',
    badge: 'bg-[#EC4899]/20 text-[#F472B6]',
  },
  tecnica: {
    label: 'Técnica',
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/30',
    badge: 'bg-[#10B981]/20 text-[#10B981]',
  },
};

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  schedule,
  onSelectDay,
  onSelectExercise,
}) => {
  const [activeDay, setActiveDay] = useState<string>(
    schedule.find((s) => s.isIndividualSession)?.day || schedule[0]?.day || 'lunes'
  );

  const selectedSchedule = schedule.find((s) => s.day === activeDay) || schedule[0];
  const activeSession = selectedSchedule.recommendedSession;
  const activeExercises = activeSession?.exercises || [];

  return (
    <div className="space-y-6">
      {/* Encabezado del Calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Microciclo Semanal Integrado</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
            Planificación del Microciclo (7 Días)
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Coordinación de entrenamientos colectivos, partidos oficiales y sesiones de acondicionamiento individual.
          </p>
        </div>

        {/* Leyenda limpia sin píldoras superfluas */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] bg-[#111B2E] px-4 py-2 rounded-xl border border-[#1E2D4A]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" />
            <span className="text-[#FCD34D] font-semibold">Competición (MD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#6366F1]" />
            <span className="text-[#A5B4FC]">Equipo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#22D3EE]" />
            <span className="text-[#22D3EE] font-semibold">Individual</span>
          </div>
        </div>
      </div>

      {/* Grid de los 7 días de la semana */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {schedule.map((dayItem) => {
          const isSelected = dayItem.day === activeDay;
          const hasIndividual = dayItem.isIndividualSession;
          const hasMatch = dayItem.isMatchDay;
          const hasTeam = dayItem.isTeamTraining;
          const session = dayItem.recommendedSession;
          const exerciseCount = session?.exercises.length || 0;

          return (
            <motion.button
              key={dayItem.day}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveDay(dayItem.day);
                onSelectDay(dayItem);
              }}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[145px] cursor-pointer ${
                isSelected
                  ? 'bg-[#16243D] border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-[#22D3EE]'
                  : 'bg-[#111B2E] border-[#1E2D4A] hover:border-[#334155]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold tracking-wider ${isSelected ? 'text-[#22D3EE]' : 'text-[#F8FAFC]'}`}>
                    {dayItem.dayLabel.toUpperCase()}
                  </span>
                  {dayItem.microcycleStatus && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        dayItem.microcycleStatus === 'MD'
                          ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/40'
                          : dayItem.microcycleStatus === 'MD-1'
                          ? 'bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/40'
                          : 'bg-[#080D19] text-[#94A3B8] border border-[#1E2D4A]'
                      }`}
                    >
                      {dayItem.microcycleStatus}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mt-2">
                  {hasMatch && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FCD34D]">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span>Partido Oficial</span>
                    </div>
                  )}

                  {hasTeam && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#A5B4FC]">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Sesión Club</span>
                    </div>
                  )}

                  {hasIndividual && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#22D3EE]">
                      <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                      <span>{session?.focus || 'Individual'}</span>
                    </div>
                  )}

                  {!hasMatch && !hasTeam && !hasIndividual && (
                    <span className="text-[11px] text-[#64748B] block">Descanso total</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E2D4A]/60 flex items-center justify-between text-[10px] text-[#64748B]">
                {hasIndividual ? (
                  <span className="text-[#22D3EE] font-mono font-semibold">
                    {exerciseCount} ejer · {session?.durationMinutes || 45}m
                  </span>
                ) : (
                  <span>{hasMatch ? 'Inviolable' : 'Sin sesión'}</span>
                )}
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* DETALLE COMPLETO DEL DÍA SELECCIONADO */}
      <motion.div
        key={selectedSchedule.day}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-2xl"
      >
        {/* Cabecera del día */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2D4A]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] mb-1">
              <span className="uppercase font-bold">{selectedSchedule.dayLabel}</span>
              {selectedSchedule.microcycleStatus && (
                <>
                  <span className="text-[#64748B]">·</span>
                  <span className="text-[#FCD34D] font-bold">{selectedSchedule.microcycleStatus}</span>
                </>
              )}
            </div>
            <h4 className="text-xl font-bold text-[#F8FAFC]">
              {selectedSchedule.isMatchDay
                ? 'Día de Competición Oficial (Match Day)'
                : selectedSchedule.isIndividualSession
                ? `Sesión Individual: ${activeSession?.focus || 'Acondicionamiento Específico'}`
                : selectedSchedule.isTeamTraining
                ? 'Entrenamiento Colectivo con el Club'
                : 'Día de Recuperación y Descanso Pasivo'}
            </h4>
          </div>

          {selectedSchedule.isIndividualSession && activeSession && (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-[#080D19] border border-[#1E2D4A] flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-[#22D3EE]" />
                <span className="font-mono text-[#F8FAFC] font-bold">{activeSession.durationMinutes} min</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#080D19] border border-[#1E2D4A] flex items-center gap-2 text-xs">
                <Layers className="w-4 h-4 text-[#10B981]" />
                <span className="font-mono text-[#F8FAFC] font-bold">{activeExercises.length} Ejercicios</span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido según tipo de día */}
        {selectedSchedule.isMatchDay ? (
          <div className="p-6 rounded-2xl bg-[#080D19] border border-[#F59E0B]/30 flex items-start gap-4 text-xs">
            <Trophy className="w-6 h-6 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-[#FCD34D] text-sm">
                Inviolabilidad de Match Day (Regla REG-CAL-01)
              </h5>
              <p className="text-[#CBD5E1] leading-relaxed">
                El motor determinista prohíbe taxativamente prescribir sesiones de acondicionamiento físico individual en el mismo día que un partido oficial para evitar fatiga aguda, interferencias neuromusculares y riesgo de lesión tisular.
              </p>
            </div>
          </div>
        ) : selectedSchedule.isIndividualSession ? (
          <div className="space-y-4">
            {/* Si no hubo ejercicios validados compatibles */}
            {activeExercises.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-3">
                <div className="flex items-center gap-2 text-[#FCD34D]">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  <h5 className="font-bold text-sm text-[#FCD34D]">
                    Ausencia de Ejercicios Validados Compatibles (REG-CAL-05)
                  </h5>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {selectedSchedule.explanation ||
                    'Para este día y restricciones (momento del microciclo, dolor o material), no existen ejercicios en el catálogo que dispongan del estado "validado" con dosificación cerrada de series y pausas. Por compromiso con el rigor científico y principio de cero invención, no se fuerza ninguna recomendación artificial ni fallback inseguro.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span className="font-bold uppercase tracking-wider text-[#CBD5E1]">
                    Ejercicios Prescritos para esta Sesión
                  </span>
                  <span>Haz clic en un ejercicio para ver la ficha técnica completa</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeExercises.map((item, idx: number) => {
                    const ex = item.exercise;
                    const primaryCat = (ex.objectives[0] || 'fuerza') as Objective;
                    const catStyle = CATEGORY_STYLES[primaryCat] || CATEGORY_STYLES.fuerza;
                    const params = ex.trainingParameters;
                    const hasDosedParams = params && params.isDocumented;

                    return (
                      <motion.div
                        key={`${ex.id}-${idx}`}
                        whileHover={{ y: -3 }}
                        onClick={() => onSelectExercise(ex, item.rationale, item.score)}
                        className={`p-5 rounded-2xl border ${catStyle.border} bg-[#080D19] hover:bg-[#0E1626] transition-all cursor-pointer shadow-md flex flex-col justify-between group`}
                      >
                        <div>
                          {/* Encabezado del ejercicio */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] mb-1">
                                <span className="font-bold text-[#F8FAFC]">{ex.id}</span>
                                <span>·</span>
                                <span className={`px-2 py-0.5 rounded font-bold uppercase ${catStyle.badge}`}>
                                  {catStyle.label}
                                </span>
                                <span>·</span>
                                <span className="text-[#10B981] font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Validado
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors leading-snug">
                                {ex.name}
                              </h5>
                            </div>

                            <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 shrink-0">
                              {item.score} pts
                            </span>
                          </div>

                          <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                            {ex.description}
                          </p>
                        </div>

                        {/* Parámetros técnicos dosificados */}
                        <div className="pt-3 mt-3 border-t border-[#1E2D4A] space-y-2 text-xs">
                          {hasDosedParams && params ? (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-1.5 rounded-lg bg-[#111B2E]">
                                <span className="text-[10px] text-[#64748B] block">Series/Reps</span>
                                <span className="font-mono font-bold text-[#22D3EE]">
                                  {params.sets}x{params.reps || (params.durationSeconds ? `${params.durationSeconds}s` : '—')}
                                </span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-[#111B2E]">
                                <span className="text-[10px] text-[#64748B] block">Descanso</span>
                                <span className="font-mono font-bold text-[#F8FAFC]">
                                  {params.restSeconds ? `${params.restSeconds}s` : '—'}
                                </span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-[#111B2E]">
                                <span className="text-[10px] text-[#64748B] block">Intensidad</span>
                                <span className="font-mono font-bold text-[#10B981]">
                                  {params.intensity || 'Pte.'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-[#111B2E] text-center text-[#94A3B8] text-[11px]">
                              Parámetros pendientes de consenso prospectivo
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                            <span className="truncate max-w-[200px]">Mat: {ex.equipment.join(', ')}</span>
                            <span className="text-[#22D3EE] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Ficha técnica <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : selectedSchedule.isTeamTraining ? (
          <div className="p-6 rounded-2xl bg-[#080D19] border border-[#6366F1]/30 flex items-start gap-4 text-xs">
            <Users className="w-6 h-6 text-[#6366F1] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-[#A5B4FC] text-sm">
                Entrenamiento Colectivo con el Club (Regla REG-CAL-02)
              </h5>
              <p className="text-[#CBD5E1] leading-relaxed">
                Este día está reservado para la dinámica técnico-táctica y la carga grupal programada por el cuerpo técnico de tu club. SportExpert no interfiere ni sobrecarga este día para evitar fatiga acumulada.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#080D19] border border-[#1E2D4A] flex items-start gap-4 text-xs">
            <Info className="w-6 h-6 text-[#94A3B8] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-[#F8FAFC] text-sm">
                Día de Descanso y Recuperación
              </h5>
              <p className="text-[#94A3B8] leading-relaxed">
                No hay sesiones individuales programadas. La supercompensación neuromuscular requiere pausas planificadas para asimilar las cargas de entrenamiento y competición.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
