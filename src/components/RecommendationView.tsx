import React, { useState } from 'react';
import { AthleteProfile, DaySchedule, Exercise, InferenceResult, Objective } from '../types';
import { WeeklyCalendar } from './WeeklyCalendar';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  FileQuestion,
  Terminal,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Scale,
  XCircle,
  BookOpen,
  Activity,
  Layers,
  Dumbbell,
  Sliders,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecommendationViewProps {
  profile: AthleteProfile;
  result: InferenceResult;
  onEditProfile: () => void;
  onOpenAudit: () => void;
  onSelectExercise: (exercise: Exercise, rationale?: string, score?: number) => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  profile,
  result,
  onEditProfile,
  onOpenAudit,
  onSelectExercise,
}) => {
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DaySchedule>(
    result.weeklySchedule.find((s) => s.isIndividualSession) || result.weeklySchedule[0]
  );

  const [activeWhySection, setActiveWhySection] = useState<'scoring' | 'rules' | 'discarded' | 'sources'>('scoring');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Si el motor determinó un bloqueo de seguridad estricto
  if (result.isBlockedBySafety) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-10 rounded-3xl border border-[#EF4444]/40 bg-[#111B2E] text-center space-y-6 shadow-2xl"
        >
          <div className="w-18 h-18 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] mx-auto shadow-[0_0_25px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Prescripción de Entrenamiento Bloqueada por Seguridad
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-xl mx-auto">
              El motor determinista de <strong>SportExpert</strong> aplicó reglas obligatorias de seguridad (Hard Constraints). Una puntuación alta nunca puede anular una restricción médica o un estado lesional activo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080D19] border border-[#EF4444]/30 text-left text-xs space-y-2 text-[#CBD5E1]">
            <span className="font-bold text-[#EF4444] block uppercase tracking-wider text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Motivos de la Parada de Seguridad:</span>
            </span>
            <ul className="space-y-1.5 pl-2">
              {result.safetyBlockReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={onEditProfile}
              className="px-6 py-3.5 text-xs font-bold text-[#080D19] bg-[#22D3EE] hover:bg-[#38BDF8] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#22D3EE]/20"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Modificar datos en el formulario</span>
            </button>
            <button
              onClick={onOpenAudit}
              className="px-6 py-3.5 text-xs font-bold text-[#F8FAFC] bg-[#16243D] hover:bg-[#1E2D4A] border border-[#1E2D4A] rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-[#22D3EE]" />
              <span>Ver traza y auditoría de reglas</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalPrescribed = result.recommendationSummary?.validatedExercisesPrescribed || 0;

  return (
    <div className="space-y-10 py-4">
      {/* 1. DASHBOARD HEADER: RESUMEN DEL PERFIL DEL JUGADOR */}
      <div className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22D3EE]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#22D3EE]">
              <span className="uppercase font-bold tracking-wider">{profile.sport}</span>
              <span className="text-[#64748B]">·</span>
              <span className="text-[#F8FAFC] font-semibold">{profile.position.replace(/_/g, ' ').toUpperCase()}</span>
              <span className="text-[#64748B]">·</span>
              <span className="text-[#A5B4FC] capitalize">Nivel {profile.level}</span>
              <span className="text-[#64748B]">·</span>
              <span className="text-[#CBD5E1]">{profile.age} años</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Dashboard de Rendimiento & Planificación Semanal
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
              <span>
                Prioridad: <strong className="text-[#22D3EE] font-bold">{profile.primaryObjective}</strong> (+50 pts)
              </span>
              <span className="text-[#64748B]">·</span>
              <span>
                Sinérgica: <strong className="text-[#A5B4FC] font-bold">{profile.secondaryObjective}</strong> (+25 pts)
              </span>
              <span className="text-[#64748B]">·</span>
              <span>
                Recuperación: <strong className="text-[#10B981] font-bold">{profile.perceivedRecovery}/5</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onEditProfile}
              className="px-4 py-2.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] hover:bg-[#16243D] text-xs font-bold text-[#CBD5E1] hover:text-[#22D3EE] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ajustar Perfil</span>
            </button>
            <button
              onClick={onOpenAudit}
              className="px-4 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#38BDF8] text-xs font-extrabold text-[#080D19] flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Consola de Reglas</span>
            </button>
          </div>
        </div>

        {/* Indicadores de telemetría real del microciclo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#1E2D4A]">
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Sesiones Individuales</span>
            <span className="text-xl font-mono font-bold text-[#22D3EE]">
              {result.weeklySchedule.filter((s) => s.isIndividualSession).length} días
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Ejercicios Validados</span>
            <span className="text-xl font-mono font-bold text-[#10B981]">
              {totalPrescribed} asignados
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Candidatos Compatibles</span>
            <span className="text-xl font-mono font-bold text-[#F8FAFC]">
              {result.scoredExercises.length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Descartes Preventivos</span>
            <span className="text-xl font-mono font-bold text-[#EF4444]">
              {result.discardedExercises.length}
            </span>
          </div>
        </div>
      </div>

      {/* ADVERTENCIA PREVENTIVA SI EXISTE CLARIFICACIÓN O NOTA DE CARGA */}
      {result.clarificationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-3 text-xs text-[#FCD34D]"
        >
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#FCD34D] block uppercase tracking-wide">
              Advertencia Preventiva del Motor:
            </span>
            <p className="text-[#CBD5E1] leading-relaxed">{result.clarificationMessage}</p>
          </div>
        </motion.div>
      )}

      {/* 2. CALENDARIO SEMANAL & TARJETAS DE SESIÓN */}
      <WeeklyCalendar
        schedule={result.weeklySchedule}
        onSelectDay={(dayItem) => setSelectedDaySchedule(dayItem)}
        onSelectExercise={(ex, rat, sc) => onSelectExercise(ex, rat, sc)}
      />

      {/* 3. SECCIÓN EXPLICATIVA: ¿POR QUÉ ESTE ENTRENAMIENTO? */}
      <section className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2D4A]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Transparencia & Explicabilidad Algorítmica</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
              ¿Por qué este entrenamiento?
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Inspecciona las reglas que se han activado, el desglose de puntuaciones y los descartes efectuados.
            </p>
          </div>

          {/* Selector de pestañas de explicabilidad */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#080D19] border border-[#1E2D4A]">
            <button
              onClick={() => setActiveWhySection('scoring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeWhySection === 'scoring'
                  ? 'bg-[#22D3EE] text-[#080D19] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Puntuaciones (Scoring)
            </button>
            <button
              onClick={() => setActiveWhySection('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeWhySection === 'rules'
                  ? 'bg-[#22D3EE] text-[#080D19] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Reglas Activadas
            </button>
            <button
              onClick={() => setActiveWhySection('discarded')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeWhySection === 'discarded'
                  ? 'bg-[#22D3EE] text-[#080D19] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Descartes ({result.discardedExercises.length})
            </button>
            <button
              onClick={() => setActiveWhySection('sources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeWhySection === 'sources'
                  ? 'bg-[#22D3EE] text-[#080D19] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Fuentes Científicas
            </button>
          </div>
        </div>

        {/* CONTENIDO INTERACTIVO DE EXPLICABILIDAD */}
        <AnimatePresence mode="wait">
          {/* TAB 1: DESGLOSE DE PUNTUACIONES */}
          {activeWhySection === 'scoring' && (
            <motion.div
              key="scoring-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] text-xs text-[#CBD5E1] space-y-1">
                <span className="font-bold text-[#22D3EE] block">Fórmula de Ponderación Determinista:</span>
                <p>
                  Puntos = <strong className="text-[#22D3EE]">+50 pts</strong> (Objetivo Principal: {profile.primaryObjective}) +{' '}
                  <strong className="text-[#A5B4FC]">+25 pts</strong> (Objetivo Secundario: {profile.secondaryObjective}) +{' '}
                  <strong className="text-[#10B981]">+15 pts</strong> (Afinidad de Puesto) +{' '}
                  <strong className="text-[#FCD34D]">+10 pts</strong> (Compatibilidad con el Microciclo).
                </p>
              </div>

              <div className="space-y-3">
                {result.scoredExercises.slice(0, 10).map((item) => {
                  const isExpanded = expandedExerciseId === item.exerciseId;
                  return (
                    <div
                      key={item.exerciseId}
                      className="rounded-2xl border border-[#1E2D4A] bg-[#080D19] p-4 transition-all"
                    >
                      <div
                        onClick={() => setExpandedExerciseId(isExpanded ? null : item.exerciseId)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-[#64748B]">
                            {item.exerciseId}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[#F8FAFC]">{item.exerciseName}</h4>
                            <span className="text-[11px] text-[#94A3B8]">
                              Afinidad de objetivos: {item.matchedObjectives.join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-base font-mono font-extrabold text-[#22D3EE]">
                              {item.totalScore} pts
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                          )}
                        </div>
                      </div>

                      {/* Desglose desplegable */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#1E2D4A] space-y-3 text-xs">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                            <div className="p-2 rounded-xl bg-[#111B2E]">
                              <span className="text-[10px] text-[#64748B] block font-sans">Obj. Principal</span>
                              <span className="font-bold text-[#22D3EE]">+{item.breakdown.primaryObjectiveScore} pts</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#111B2E]">
                              <span className="text-[10px] text-[#64748B] block font-sans">Obj. Secundario</span>
                              <span className="font-bold text-[#A5B4FC]">+{item.breakdown.secondaryObjectiveScore} pts</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#111B2E]">
                              <span className="text-[10px] text-[#64748B] block font-sans">Posición</span>
                              <span className="font-bold text-[#10B981]">+{item.breakdown.positionScore} pts</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#111B2E]">
                              <span className="text-[10px] text-[#64748B] block font-sans">Calendario</span>
                              <span className="font-bold text-[#FCD34D]">+{item.breakdown.calendarScore} pts</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#111B2E] text-[#CBD5E1]">
                            <span className="font-bold text-[#F8FAFC] block mb-0.5">Estado de Validación:</span>
                            <p className="capitalize text-[#10B981] font-mono">{item.validationStatus.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: REGLAS ACTIVADAS */}
          {activeWhySection === 'rules' && (
            <motion.div
              key="rules-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {result.auditLogs.map((log) => (
                <div
                  key={log.ruleId}
                  className="p-4 rounded-2xl border border-[#1E2D4A] bg-[#080D19] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#22D3EE]">{log.ruleId}</span>
                      <span className="text-[#64748B]">·</span>
                      <span className="font-bold text-[#F8FAFC]">{log.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        log.severity === 'bloqueo'
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                          : log.severity === 'advertencia'
                          ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/40'
                          : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                      }`}
                    >
                      {log.severity || 'info'}
                    </span>
                  </div>

                  <p className="text-[#CBD5E1] leading-relaxed">{log.description}</p>
                  <div className="text-[11px] text-[#64748B] pt-1 border-t border-[#1E2D4A]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>Categoría: <strong className="text-[#94A3B8] capitalize">{log.category}</strong></span>
                    <span>Acción: <strong className="text-[#CBD5E1]">{log.actionTaken}</strong></span>
                  </div>

                  {log.sources && log.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#1E2D4A]/60 text-[11px] space-y-1">
                      <span className="text-[#22D3EE] font-bold block">Fuentes / Justificación:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[#94A3B8]">
                        {log.sources.map((src, i) => (
                          <li key={i} className="leading-snug">{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: EJERCICIOS DESCARTADOS */}
          {activeWhySection === 'discarded' && (
            <motion.div
              key="discarded-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] text-xs text-[#CBD5E1]">
                <p>
                  Total de ejercicios descartados preventivamente: <strong className="text-[#EF4444]">{result.discardedExercises.length}</strong>. Los descartes obligatorios garantizan que ninguna puntuación alta pueda rescatar un ejercicio contraindicado.
                </p>
              </div>

              <div className="space-y-2">
                {result.discardedExercises.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#1E2D4A] bg-[#080D19] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                      <div>
                        <span className="font-mono text-[11px] text-[#64748B] mr-2">{d.exercise.id}</span>
                        <span className="font-bold text-[#F8FAFC]">{d.exercise.name}</span>
                      </div>
                    </div>
                    <span className="text-[#CBD5E1] bg-[#111B2E] px-3 py-1 rounded-lg border border-[#1E2D4A] text-[11px]">
                      {d.reason}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: FUENTES CIENTÍFICAS */}
          {activeWhySection === 'sources' && (
            <motion.div
              key="sources-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] text-xs text-[#CBD5E1] space-y-1">
                <span className="font-bold text-[#10B981] block">Criterio de Rigor Metodológico (Cero Invención):</span>
                <p>
                  Solo los ejercicios respaldados por ensayos clínicos controlados o consensos federativos específicos con dosificación contrastada son prescritos en las sesiones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#22D3EE] font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>Fútbol: Petersen et al., 2011 (BJSM) & FIFA 11+</span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Ensayo prospectivo en futbolistas federados demostrando una reducción de más del 60% en lesiones isquiotibiales mediante el <em>Nordic Hamstring Curl</em> dosificado progresivamente.
                  </p>
                  <span className="text-[10px] font-mono text-[#10B981] block">RCT Nivel 1 · Protocolo FUT-01</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#22D3EE] font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>Fútbol: Harøy et al., 2019 (BJSM)</span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Protocolo controlado del <em>Copenhagen Adduction Exercise</em> con 3 niveles de progresión, reduciendo significativamente la incidencia de dolor inguinal y osteopatía de pubis en futbolistas.
                  </p>
                  <span className="text-[10px] font-mono text-[#10B981] block">RCT Nivel 1 · Protocolo FUT-02</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#A5B4FC] font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>Balonmano: Andersson et al., 2017 (BJSM, EHF)</span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Protocolo de rotación externa con banda a 90° de abducción para balonmanistas de élite, demostrando un 28% de reducción en la prevalencia de dolor de hombro de lanzamiento.
                  </p>
                  <span className="text-[10px] font-mono text-[#10B981] block">RCT Multicéntrico · Protocolo BAL-01</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#FCD34D] font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>Baloncesto: Rio et al., 2015 (BJSM)</span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Contracciones isométricas pesadas (Wall-Sit 60° a 5 repeticiones de 45 segundos) produciendo inhibición cortical y analgesia inmediata en tendinopatía rotuliana en deportes de salto.
                  </p>
                  <span className="text-[10px] font-mono text-[#10B981] block">RCT Clínico · Protocolo BAS-02</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};
