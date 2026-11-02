import React, { useState } from 'react';
import { InferenceResult, RuleAudit } from '../types';
import { EXPERT_RULES } from '../knowledge/rules';
import {
  Terminal,
  ShieldCheck,
  AlertOctagon,
  Scale,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Sliders,
  Filter,
} from 'lucide-react';
import { motion } from 'motion/react';

interface InferenceAuditViewProps {
  inferenceResult: InferenceResult;
}

export const InferenceAuditView: React.FC<InferenceAuditViewProps> = ({
  inferenceResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { auditLogs, scoredExercises, discardedExercises, contradictions, safetyBlockReasons } =
    inferenceResult;

  const filteredScored = scoredExercises.filter((item) =>
    item.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.exerciseId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      {/* Encabezado */}
      <div className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22D3EE]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>MOTOR DE INFERENCIA DETERMINISTA · TRAZABILIDAD & AUDITORÍA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Consola de Auditoría y Verificación de Reglas
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
            Cada recomendación de SportExpert es producto de una cadena lógica determinista (SI-ENTONCES). A continuación se auditan las reglas activadas en tu perfil, los descartes preventivos y la matriz de scoring.
          </p>
        </div>

        {/* Tarjetas de Resumen de Inferencia */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#1E2D4A] relative z-10">
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Reglas Auditadas</span>
            <span className="text-xl font-bold font-mono text-[#F8FAFC]">
              {auditLogs.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">
              Evaluadas en el pipeline
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Compatibles Validados</span>
            <span className="text-xl font-bold font-mono text-[#10B981]">
              {inferenceResult.compatibleValidatedExercises.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">
              Aptos para prescripción
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Parciales / Pendientes</span>
            <span className="text-xl font-bold font-mono text-[#FCD34D]">
              {inferenceResult.compatiblePartiallyDocumentedExercises.length + inferenceResult.compatiblePendingExercises.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">
              Retenidos por rigor (REG-VAL-06)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Ejercicios Descartados</span>
            <span className="text-xl font-bold font-mono text-[#EF4444]">
              {discardedExercises.length}
            </span>
            <span className="text-[10px] text-[#94A3B8] block mt-0.5">
              Por filtros o seguridad
            </span>
          </div>
        </div>
      </div>

      {/* Si hubo alertas de seguridad o contradicciones */}
      {(safetyBlockReasons.length > 0 || contradictions.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#FCD34D] flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#F59E0B]" />
            <span>Alertas de Seguridad y Contradicciones Detectadas</span>
          </h3>

          <div className="space-y-2">
            {safetyBlockReasons.map((reason, idx) => (
              <div
                key={`sec-${idx}`}
                className="p-4 rounded-2xl border border-[#EF4444]/40 bg-[#111B2E] flex items-start gap-3 text-xs text-[#EF4444]"
              >
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Bloqueo Preventivo:</span>
                  <p className="text-[#CBD5E1] mt-0.5">{reason}</p>
                </div>
              </div>
            ))}

            {contradictions.map((contra, idx) => (
              <div
                key={`con-${idx}`}
                className="p-4 rounded-2xl border border-[#F59E0B]/40 bg-[#111B2E] flex items-start gap-3 text-xs text-[#FCD34D]"
              >
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Contradicción en Datos:</span>
                  <p className="text-[#CBD5E1] mt-0.5">{contra}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traza de Reglas Evaluadas */}
      <div className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2D4A]">
          <div>
            <h3 className="text-xl font-bold text-[#F8FAFC]">
              Traza de Reglas SI-ENTONCES Disparadas
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Registro secuencial de condiciones y consecuentes aplicados por el motor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#080D19] border border-[#1E2D4A] text-xs">
            {['all', 'validacion', 'contradiccion', 'seguridad', 'calendario', 'filtrado', 'scoring'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#22D3EE] text-[#080D19]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {auditLogs
            .filter((log) => filterCategory === 'all' || log.category === filterCategory)
            .map((log) => (
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
                        ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                        : log.severity === 'advertencia'
                        ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/30'
                        : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                    }`}
                  >
                    {log.severity || 'info'}
                  </span>
                </div>

                <p className="text-[#CBD5E1] leading-relaxed">{log.description}</p>

                <div className="pt-2 border-t border-[#1E2D4A]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] text-[#64748B]">
                  <span>Fase: <strong className="text-[#94A3B8] capitalize">{log.category}</strong></span>
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
        </div>
      </div>
    </div>
  );
};
