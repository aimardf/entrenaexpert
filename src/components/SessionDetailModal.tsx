import React from 'react';
import { Exercise } from '../types';
import {
  X,
  ShieldCheck,
  Clock,
  Dumbbell,
  BookOpen,
  AlertTriangle,
  Scale,
  CheckCircle2,
  FileQuestion,
  Activity,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SessionDetailModalProps {
  exercise: Exercise | null;
  rationale?: string;
  score?: number;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  exercise,
  rationale,
  score,
  onClose,
}) => {
  if (!exercise) return null;

  const params = exercise.trainingParameters;
  const isValidated =
    exercise.validationStatus === 'validado' &&
    params &&
    params.isDocumented;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D19]/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        >
          {/* Header con botón cerrar */}
          <div className="flex items-start justify-between gap-4 border-b border-[#1E2D4A] pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#22D3EE] mb-1.5">
                <span className="font-bold text-[#F8FAFC]">{exercise.id}</span>
                <span className="text-[#64748B]">·</span>
                <span className="uppercase font-bold">{exercise.sport}</span>
                <span className="text-[#64748B]">·</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exercise.validationStatus === 'validado'
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                      : exercise.validationStatus === 'documentado_parcialmente'
                      ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/30'
                      : 'bg-[#64748B]/20 text-[#CBD5E1] border border-[#64748B]/30'
                  }`}
                >
                  {exercise.validationStatus === 'validado'
                    ? 'Protocolo Validado (RCT)'
                    : exercise.validationStatus === 'documentado_parcialmente'
                    ? 'Documentado Parcialmente'
                    : 'Pendiente de Consenso'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
                {exercise.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#080D19] border border-[#1E2D4A] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explicación de Inferencia si vino de una sesión calculada */}
          {rationale && (
            <div className="p-4 rounded-2xl border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-xs text-[#CBD5E1] flex items-start gap-3">
              <Scale className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#22D3EE] block mb-0.5">
                  Criterio de Inferencia del Motor Experto {score ? `(${score} puntos)` : ''}:
                </span>
                <p>{rationale}</p>
              </div>
            </div>
          )}

          {/* Descripción técnica */}
          <div className="text-xs text-[#CBD5E1] leading-relaxed p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
              Descripción & Ejecución Motriz:
            </span>
            <p>{exercise.description}</p>
          </div>

          {/* Parámetros de Entrenamiento Obligatorios */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Parámetros de Entrenamiento
            </h3>

            {isValidated && params ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
                  <span className="text-[10px] text-[#64748B] block font-bold">Series</span>
                  <span className="text-base font-extrabold font-mono text-[#22D3EE]">
                    {params.sets}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
                  <span className="text-[10px] text-[#64748B] block font-bold">Reps / Tiempo</span>
                  <span className="text-base font-extrabold font-mono text-[#F8FAFC]">
                    {params.reps || (params.durationSeconds ? `${params.durationSeconds}s` : '—')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
                  <span className="text-[10px] text-[#64748B] block font-bold">Descanso</span>
                  <span className="text-base font-extrabold font-mono text-[#A5B4FC]">
                    {params.restSeconds ? `${params.restSeconds}s` : '—'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
                  <span className="text-[10px] text-[#64748B] block font-bold">Intensidad</span>
                  <span className="text-base font-extrabold font-mono text-[#10B981]">
                    {params.intensity || 'Pte.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#080D19] border border-[#F59E0B]/30 text-xs text-[#CBD5E1] space-y-1">
                <div className="flex items-center gap-2 text-[#FCD34D] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Parámetros Pendientes de Validación Prospectiva</span>
                </div>
                <p>
                  {params?.missingVerificationNotes ||
                    'Este ejercicio cuenta con fundamentación formativa o descriptiva, pero carece de un RCT cerrado que fije la dosis exacta de series y descansos. Por principio de cero invención, no se prescribe automáticamente.'}
                </p>
              </div>
            )}
          </div>

          {/* Cuadrícula de Metadatos Adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1.5">
              <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                Material Necesario
              </span>
              <p className="font-semibold text-[#F8FAFC]">
                {exercise.equipment.join(', ')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1.5">
              <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                Objetivos Condicionales
              </span>
              <p className="font-semibold text-[#22D3EE] capitalize">
                {exercise.objectives.join(' · ')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1.5">
              <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                Contraindicaciones Anatómicas (Reglas de Seguridad)
              </span>
              <p className="font-semibold text-[#EF4444]">
                {exercise.anatomicalContraindications.length > 0 ? exercise.anatomicalContraindications.join(', ') : 'Ninguna reportada'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080D19] border border-[#1E2D4A] space-y-1.5">
              <span className="text-[10px] text-[#64748B] font-bold uppercase block">
                Fuente Documental / Ensayo Clínico
              </span>
              <p className="font-medium text-[#CBD5E1] text-[11px] leading-snug">
                {exercise.sources.join('; ') || 'Referencia federativa o manual metodológico'}
              </p>
            </div>
          </div>

          {/* Botón cerrar inferior */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#080D19] bg-[#22D3EE] hover:bg-[#38BDF8] transition-all cursor-pointer shadow-md"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
