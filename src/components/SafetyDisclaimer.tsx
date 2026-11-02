import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const SafetyDisclaimer: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#F59E0B]/30 bg-[#111B2E] p-4 text-xs text-[#FCD34D]/90 leading-relaxed shadow-lg">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="font-bold text-[#FCD34D] block text-xs uppercase tracking-wide">
            Marco Ético y Deontológico de Seguridad Deportiva
          </span>
          <p className="text-xs text-[#CBD5E1]">
            SportExpert es un sistema experto determinista orientado al acondicionamiento físico de jugadores federados adultos mayores de 18 años.
            <strong className="text-[#F8FAFC]"> No realiza diagnósticos médicos, prescripción farmacológica ni pautas de rehabilitación clínica lesional.</strong> Si experimentas dolor agudo, signos inflamatorios o antecedentes quirúrgicos sin alta médica, consulta inmediatamente a los servicios médicos de tu federación o club.
          </p>
        </div>
      </div>
    </div>
  );
};
