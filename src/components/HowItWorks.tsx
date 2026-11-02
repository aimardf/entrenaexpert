import React from 'react';
import {
  CheckCircle,
  AlertOctagon,
  CalendarDays,
  Sliders,
  Scale,
  FileCheck2,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'motion/react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Validación de Perfil Federado',
      description:
        'Comprobación estricta de mayoría de edad (≥18 años), especificidad del puesto táctico y diferenciación obligatoria entre el objetivo principal y secundario.',
      icon: CheckCircle,
      accent: 'border-[#22D3EE]/30 bg-[#22D3EE]/5 text-[#22D3EE]',
      tag: 'Entrada Determinista',
    },
    {
      step: '02',
      title: 'Restricciones de Seguridad (Hard Constraints)',
      description:
        'Si existe lesión activa sin alta médica, dolor agudo (EVA ≥ 7) o restricciones en texto libre ambiguas, se activa una parada preventiva (Safety Hold). Las restricciones operan ANTES del cálculo de puntos.',
      icon: Lock,
      accent: 'border-[#EF4444]/30 bg-[#EF4444]/5 text-[#EF4444]',
      tag: 'Seguridad Innegociable',
    },
    {
      step: '03',
      title: 'Microciclo y Calendario Competitivo',
      description:
        'Mapeo de la semana respecto a la competición oficial. Inviolabilidad del Match Day (MD), protección de las sesiones del equipo y modulación de daño excéntrico en víspera (MD-1) y post-partido (MD+1).',
      icon: CalendarDays,
      accent: 'border-[#6366F1]/30 bg-[#6366F1]/5 text-[#A5B4FC]',
      tag: 'Carga Semanal',
    },
    {
      step: '04',
      title: 'Filtrado Biomecánico y de Recursos',
      description:
        'Descarte automático e irreversible de ejercicios con contraindicación articular en zonas de dolor declarado (ej. rodilla descarta sentadillas pesadas y Drop Jumps) y por falta de material disponible.',
      icon: Sliders,
      accent: 'border-[#22D3EE]/30 bg-[#22D3EE]/5 text-[#22D3EE]',
      tag: 'Anatomía & Equipamiento',
    },
    {
      step: '05',
      title: 'Scoring Ponderado Multi-Factorial',
      description:
        'Ponderación matemática de candidatos aptos: Objetivo Principal (+50 pts), Objetivo Secundario (+25 pts), Afinidad de Posición (+15 pts) y Compatibilidad de Calendario (+10 pts).',
      icon: Scale,
      accent: 'border-[#6366F1]/30 bg-[#6366F1]/5 text-[#A5B4FC]',
      tag: '50 / 25 / 15 / 10 pts',
    },
    {
      step: '06',
      title: 'Rigor Científico y Cero Invención',
      description:
        'Solo los ejercicios clasificados como "validados" con dosificación contrastada en ensayos clínicos (RCTs) pasan a la rutina. Los pendientes se notifican de forma transparente y sin fallbacks.',
      icon: FileCheck2,
      accent: 'border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981]',
      tag: 'Protocolos Validados',
    },
  ];

  return (
    <section className="py-12 border-t border-[#1E2D4A] bg-[#0B132B]/50 rounded-3xl p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-[#22D3EE] tracking-wider uppercase block">
            PROCESO DE INFERENCIA
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Pipeline Determinista de Evaluación en 6 Etapas
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Cada recomendación es trazable y explicable. Si un ejercicio no supera las etapas 1 a 4, queda descartado antes del cómputo de puntuación, garantizando cero prescripciones peligrosas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-[#1E2D4A] bg-[#111B2E] p-6 flex flex-col justify-between hover:border-[#22D3EE]/50 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E2D4A]">
                    <span className="text-xs font-mono font-bold text-[#64748B]">
                      ETAPA {item.step}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                      {item.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1E2D4A]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Prioridad Absoluta</span>
                  <span className="text-[#22D3EE] font-mono">SI-ENTONCES</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
