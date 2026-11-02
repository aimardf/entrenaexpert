import React, { useState } from 'react';
import { Exercise, Objective, Sport, ValidationStatus } from '../types';
import { EXERCISES_DATABASE } from '../knowledge/exercises';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Dumbbell,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileQuestion,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface KnowledgeCatalogProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export const KnowledgeCatalog: React.FC<KnowledgeCatalogProps> = ({ onSelectExercise }) => {
  const [selectedSport, setSelectedSport] = useState<Sport | 'todos'>('todos');
  const [selectedStatus, setSelectedStatus] = useState<ValidationStatus | 'todos'>('todos');
  const [selectedObjective, setSelectedObjective] = useState<Objective | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    if (selectedSport !== 'todos' && ex.sport !== selectedSport) return false;
    if (selectedStatus !== 'todos' && ex.validationStatus !== selectedStatus) return false;
    if (selectedObjective !== 'todos' && !ex.objectives.includes(selectedObjective)) return false;
    if (
      searchTerm &&
      !ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ex.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ex.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const footballCount = EXERCISES_DATABASE.filter((e) => e.sport === 'futbol').length;
  const handballCount = EXERCISES_DATABASE.filter((e) => e.sport === 'balonmano').length;
  const basketballCount = EXERCISES_DATABASE.filter((e) => e.sport === 'baloncesto').length;
  const validatedCount = EXERCISES_DATABASE.filter((e) => e.validationStatus === 'validado').length;
  const partialCount = EXERCISES_DATABASE.filter((e) => e.validationStatus === 'documentado_parcialmente').length;
  const pendingCount = EXERCISES_DATABASE.filter((e) => e.validationStatus === 'pendiente').length;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="rounded-3xl border border-[#1E2D4A] bg-[#111B2E] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#22D3EE]/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>BASE DE CONOCIMIENTO EXPERTA · 60 EJERCICIOS DOCUMENTADOS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Catálogo Técnico y Metodológico de Ejercicios
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
            Estructura rigurosa de 60 ejercicios distribuidos estrictamente en 20 de fútbol, 20 de balonmano y 20 de baloncesto. Cada registro incluye metadatos de validación científica, contraindicaciones anatómicas y referencias documentales primarias.
          </p>
        </div>

        {/* Métricas del Catálogo */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-[#1E2D4A] relative z-10">
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Total Catálogo</span>
            <span className="text-xl font-mono font-bold text-[#F8FAFC]">60</span>
            <span className="text-[10px] text-[#94A3B8] block">20 por deporte</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Fútbol</span>
            <span className="text-xl font-mono font-bold text-[#22D3EE]">{footballCount}</span>
            <span className="text-[10px] text-[#94A3B8] block">FUT-01 a FUT-20</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Balonmano</span>
            <span className="text-xl font-mono font-bold text-[#A5B4FC]">{handballCount}</span>
            <span className="text-[10px] text-[#94A3B8] block">BAL-01 a BAL-20</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Baloncesto</span>
            <span className="text-xl font-mono font-bold text-[#FCD34D]">{basketballCount}</span>
            <span className="text-[10px] text-[#94A3B8] block">BAS-01 a BAS-20</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#080D19] border border-[#1E2D4A]">
            <span className="text-[10px] text-[#64748B] block font-bold uppercase">Validación</span>
            <span className="text-xs font-mono font-bold text-[#10B981] block">
              {validatedCount} Validados
            </span>
            <span className="text-[10px] font-mono text-[#FCD34D] block">
              {partialCount} Parciales
            </span>
            <span className="text-[10px] font-mono text-[#64748B] block">
              {pendingCount} Pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#1E2D4A] bg-[#111B2E] space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por ID (ej. FUT-01), nombre o descripción biomecánica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D19] border border-[#1E2D4A] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE] transition-all"
            />
          </div>

          {/* Filtro Deporte */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['todos', 'futbol', 'balonmano', 'baloncesto'] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSport(sp)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedSport === sp
                    ? 'bg-[#22D3EE] text-[#080D19] shadow-sm'
                    : 'bg-[#080D19] border border-[#1E2D4A] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros secundarios: Estado y Objetivo */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1E2D4A] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Estado:</span>
            <div className="flex items-center gap-1">
              {(['todos', 'validado', 'documentado_parcialmente', 'pendiente'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-[#16243D] border border-[#22D3EE] text-[#22D3EE]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st === 'validado' ? 'Validados' : st === 'documentado_parcialmente' ? 'Parciales' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Objetivo:</span>
            <div className="flex items-center gap-1">
              {(['todos', 'fuerza', 'resistencia', 'velocidad', 'explosividad', 'agilidad', 'tecnica'] as const).map((obj) => (
                <button
                  key={obj}
                  onClick={() => setSelectedObjective(obj)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    selectedObjective === obj
                      ? 'bg-[#16243D] border border-[#6366F1] text-[#A5B4FC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Ejercicios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Mostrando <strong>{filteredExercises.length}</strong> de 60 ejercicios</span>
          <span>Haz clic en una tarjeta para ver la ficha completa</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => {
            const isValidated = ex.validationStatus === 'validado';
            const isPartial = ex.validationStatus === 'documentado_parcialmente';

            return (
              <motion.div
                key={ex.id}
                whileHover={{ y: -3 }}
                onClick={() => onSelectExercise(ex)}
                className="p-5 rounded-2xl border border-[#1E2D4A] bg-[#111B2E] hover:border-[#22D3EE]/50 hover:bg-[#16243D] transition-all cursor-pointer shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8]">
                      <span className="font-bold text-[#22D3EE]">{ex.id}</span>
                      <span>·</span>
                      <span className="uppercase">{ex.sport}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isValidated
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                          : isPartial
                          ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/30'
                          : 'bg-[#64748B]/20 text-[#CBD5E1] border border-[#64748B]/30'
                      }`}
                    >
                      {isValidated ? 'Validado' : isPartial ? 'Parcial' : 'Pendiente'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#22D3EE] transition-colors leading-snug">
                    {ex.name}
                  </h4>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1.5 leading-relaxed">
                    {ex.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1E2D4A] space-y-1.5 text-[11px] text-[#94A3B8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Objetivos:</span>
                    <span className="text-[#CBD5E1] capitalize font-medium">{ex.objectives.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">Material:</span>
                    <span className="text-[#CBD5E1] truncate max-w-[170px]">{ex.equipment.join(', ')}</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[#22D3EE] font-semibold text-xs">
                    <span>Ver ficha técnica</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
