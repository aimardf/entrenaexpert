import React, { useState } from 'react';
import {
  Shield,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  Trophy,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Flame,
  ArrowRight,
  Sliders,
  Cpu,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeHeroProps {
  onStart: () => void;
  onExploreCatalog: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStart, onExploreCatalog }) => {
  const [activeSportPreview, setActiveSportPreview] = useState<'futbol' | 'balonmano' | 'baloncesto'>('futbol');

  const scrollToDiscovery = () => {
    const el = document.getElementById('sportexpert-discovery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sportsShowcase = {
    futbol: {
      name: 'Fútbol Federado',
      category: '11 vs 11 · Campo Natural / Sintético',
      icon: '⚽',
      color: '#22D3EE',
      accentBg: 'bg-[#22D3EE]/10 border-[#22D3EE]/30 text-[#22D3EE]',
      stats: '20 Ejercicios Protocolizados',
      keyExercises: ['Nordic Hamstring (Petersen 2011)', 'Copenhagen Adduction (Harøy 2019)', 'RSA 6x30m con COD'],
      focus: 'Prevención isquiosural, deceleración excéntrica y aceleración reactiva lineal.',
    },
    balonmano: {
      name: 'Balonmano Nacional',
      category: '7 vs 7 · Pista 40x20m Parquet',
      icon: '🤾',
      color: '#6366F1',
      accentBg: 'bg-[#6366F1]/10 border-[#6366F1]/30 text-[#A5B4FC]',
      stats: '20 Ejercicios Protocolizados',
      keyExercises: ['Rotación Externa 90° (Andersson 2017)', 'Lanzamiento Amortiguado (Myklebust 2003)', 'Desplazamientos 6m'],
      focus: 'Salud de la articulación glenohumeral, aterrizaje seguro y agilidad multidireccional.',
    },
    baloncesto: {
      name: 'Baloncesto Competición',
      category: '5 vs 5 · Pista 28x15m Parquet',
      icon: '🏀',
      color: '#F59E0B',
      accentBg: 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FCD34D]',
      stats: '20 Ejercicios Protocolizados',
      keyExercises: ['Wall-Sit Isométrico 60° (Rio 2015)', 'Drop Jump Reactivo', 'Close-out & Slide Defensivo'],
      focus: 'Descarga de tendón rotuliano, potencia vertical (CEA) y reactividad en cambios de dirección.',
    },
  };

  const coreCapabilities = [
    {
      id: '01',
      title: 'Motor Determinista SI-ENTONCES',
      desc: 'Cero predicciones probabilísticas y cero invenciones. Reglas formales de producción lógica donde la seguridad prevalece sobre cualquier puntaje.',
      icon: Cpu,
      accent: 'border-[#22D3EE]/40 group-hover:border-[#22D3EE]',
      iconColor: 'text-[#22D3EE]',
    },
    {
      id: '02',
      title: 'Sincronización con el Microciclo',
      desc: 'Inviolabilidad del día de partido (Match Day) y respeto absoluto a las sesiones de club. Ajustes víspera (MD-1) y pos-partido (MD+1).',
      icon: Calendar,
      accent: 'border-[#6366F1]/40 group-hover:border-[#6366F1]',
      iconColor: 'text-[#6366F1]',
    },
    {
      id: '03',
      title: 'Filtro Anatómico y Lesional',
      desc: 'Descarte determinista automático de cadenas cinéticas con dolor reportado (rodilla, hombro, aductores) y parada preventiva ante texto libre ambiguo.',
      icon: Shield,
      accent: 'border-[#10B981]/40 group-hover:border-[#10B981]',
      iconColor: 'text-[#10B981]',
    },
    {
      id: '04',
      title: 'Scoring Ponderado Multi-Factorial',
      desc: 'Priorización matemática transparente: +50 objetivo primario, +25 secundario, +15 demarcación técnica y +10 compatibilidad temporal.',
      icon: Sliders,
      accent: 'border-[#22D3EE]/40 group-hover:border-[#22D3EE]',
      iconColor: 'text-[#22D3EE]',
    },
    {
      id: '05',
      title: 'Catálogo de 60 Ejercicios',
      desc: '20 de fútbol, 20 de balonmano y 20 de baloncesto con metadatos reales, estado de validación científica y fuentes bibliográficas primarias.',
      icon: Layers,
      accent: 'border-[#6366F1]/40 group-hover:border-[#6366F1]',
      iconColor: 'text-[#6366F1]',
    },
    {
      id: '06',
      title: 'Auditoría y Trazabilidad Total',
      desc: 'Consola de inspección paso a paso y suite de 17 pruebas reproducibles ejecutables en tiempo real para verificar cada decisión del motor.',
      icon: FileCheck2,
      accent: 'border-[#10B981]/40 group-hover:border-[#10B981]',
      iconColor: 'text-[#10B981]',
    },
  ];

  return (
    <div className="space-y-20 py-4">
      {/* SECCIÓN HERO A PANTALLA COMPLETA */}
      <section className="relative min-h-[85vh] flex flex-col justify-center rounded-3xl overflow-hidden border border-[#1E2D4A] bg-[#0B132B]/70 backdrop-blur-md shadow-[0_25px_60px_-15px_rgba(8,13,25,0.9)]">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#22D3EE]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#6366F1]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1E2D4A_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Columna Izquierda: Titulares y CTA Principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-7"
            >
              {/* Badge sutil de deportes federados */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111B2E] border border-[#1E2D4A] text-xs font-semibold text-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                <span className="text-[#F8FAFC]">Fútbol · Balonmano · Baloncesto</span>
                <span className="text-[#64748B]">|</span>
                <span className="text-[#94A3B8]">Adultos Federados (+18)</span>
              </div>

              {/* Titular Principal Exigido */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.08] uppercase">
                  ENTRENA CON <span className="bg-gradient-to-r from-[#22D3EE] via-[#818CF8] to-[#6366F1] bg-clip-text text-transparent">INTELIGENCIA</span>.
                  <br />
                  COMPITE SIN <span className="text-[#22D3EE] drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">LÍMITES</span>.
                </h1>
                <p className="text-lg sm:text-xl text-[#94A3B8] font-medium leading-relaxed max-w-2xl">
                  Tu rendimiento, respaldado por conocimiento deportivo y sistemas expertos.
                </p>
              </div>

              {/* Resumen de valor */}
              <p className="text-sm text-[#94A3B8]/90 leading-relaxed max-w-xl">
                Diseñado para atletas y preparadores físicos que rechazan planes genéricos o generados al azar. 
                SportExpert aplica un motor de inferencia determinista que garantiza la inviolabilidad de tus partidos, el respeto a tu equipo y la máxima seguridad biomecánica.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStart}
                  className="px-8 py-4 rounded-xl text-sm font-extrabold text-[#080D19] bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] hover:from-[#38BDF8] hover:to-[#0EA5E9] shadow-[0_0_25px_rgba(34,211,238,0.45)] flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>DISEÑAR MI ENTRENAMIENTO</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToDiscovery}
                  className="px-6 py-4 rounded-xl text-sm font-bold text-[#F8FAFC] bg-[#111B2E] hover:bg-[#16243D] border border-[#1E2D4A] hover:border-[#22D3EE]/50 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>DESCUBRIR SPORTEXPERT</span>
                  <ArrowRight className="w-4 h-4 text-[#22D3EE]" />
                </motion.button>
              </div>

              {/* Tríada de Garantías Metodológicas */}
              <div className="pt-6 border-t border-[#1E2D4A] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-[#94A3B8]">
                  <div className="w-5 h-5 rounded-md bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Cero invención:</strong> Protocolos y RCTs verificados</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#94A3B8]">
                  <div className="w-5 h-5 rounded-md bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Hard Constraints:</strong> Seguridad médica innegociable</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#94A3B8]">
                  <div className="w-5 h-5 rounded-md bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] shrink-0">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Explicabilidad:</strong> Auditoría SI-ENTONCES</span>
                </div>
              </div>
            </motion.div>

            {/* Columna Derecha: Composición Trideportiva Interactiva de Fútbol, Balonmano y Baloncesto */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl border border-[#1E2D4A] bg-[#111B2E] p-6 shadow-2xl overflow-hidden">
                {/* Background image subtle overlay */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#22D3EE_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Encabezado del visor trideportivo */}
                <div className="flex items-center justify-between pb-4 border-b border-[#1E2D4A] relative z-10">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#22D3EE]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#F8FAFC]">
                      Disciplinas Deportivas
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#10B981] font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                    MOTOR ACTIVO
                  </span>
                </div>

                {/* Selector visual interactivo de los tres deportes */}
                <div className="grid grid-cols-3 gap-2 my-4 relative z-10">
                  {(['futbol', 'balonmano', 'baloncesto'] as const).map((sportKey) => {
                    const isSelected = activeSportPreview === sportKey;
                    const sp = sportsShowcase[sportKey];
                    return (
                      <button
                        key={sportKey}
                        onClick={() => setActiveSportPreview(sportKey)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-[#16243D] border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                            : 'bg-[#0B132B] border-[#1E2D4A] hover:border-[#334155] text-[#94A3B8]'
                        }`}
                      >
                        <span className="text-xl">{sp.icon}</span>
                        <span className={`text-xs font-bold capitalize ${isSelected ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}`}>
                          {sportKey}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tarjeta de Especificidad Deportiva del deporte seleccionado */}
                <div className="space-y-4 pt-1 relative z-10">
                  <div className="p-4 rounded-xl bg-[#0B132B] border border-[#1E2D4A] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#F8FAFC]">
                          {sportsShowcase[activeSportPreview].name}
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          {sportsShowcase[activeSportPreview].category}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                        20 Ejercicios
                      </span>
                    </div>

                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {sportsShowcase[activeSportPreview].focus}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#1E2D4A]">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">
                        Protocolos Específicos Clave:
                      </span>
                      {sportsShowcase[activeSportPreview].keyExercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                          <span className="text-[#F8FAFC] font-medium">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro-telemetría en vivo */}
                  <div className="p-3 rounded-xl bg-[#080D19] border border-[#1E2D4A] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#22D3EE]" />
                      <span className="text-[#94A3B8]">Validación Científica:</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#10B981]">
                      RCTs & Consensos Específicos
                    </span>
                  </div>

                  <button
                    onClick={onExploreCatalog}
                    className="w-full py-2.5 rounded-xl border border-[#1E2D4A] bg-[#16243D] hover:bg-[#1E2D4A] text-xs font-semibold text-[#22D3EE] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Ver los 60 ejercicios del catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DISCOVERY: ¿CÓMO FUNCIONA EL SISTEMA EXPERTO? */}
      <section id="sportexpert-discovery" className="space-y-12">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#22D3EE] uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>ARQUITECTURA DE INFERENCIA DETERMINISTA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            ¿Por qué un Sistema Experto y no un Modelo Generativo?
          </h2>
          <p className="text-base text-[#94A3B8] leading-relaxed">
            En el deporte de alto rendimiento, un ejercicio contraindicado por fatiga o dolor en rodilla puede provocar una rotura muscular o tendinosa. 
            SportExpert sustituye la incertidumbre de la inteligencia artificial probabilística por un motor formal basado en conocimiento científico y reglas lógicas irrompibles.
          </p>
        </div>

        {/* 6 Funcionalidades Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCapabilities.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`group p-6 rounded-2xl bg-[#111B2E] border ${item.accent} transition-all shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between pb-4">
                    <span className="text-xs font-mono font-bold text-[#64748B]">
                      MÓDULO {item.id}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-[#0B132B] border border-[#1E2D4A] flex items-center justify-center ${item.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#22D3EE] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1E2D4A] flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Determinista</span>
                  <span className="text-[#10B981] font-mono">100% Verificado</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Banner CTA secundario */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111B2E] via-[#16243D] to-[#111B2E] border border-[#1E2D4A] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl font-bold text-[#F8FAFC]">
              ¿Listo para planificar tu microciclo deportivo?
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Configura tu puesto, calendario competitivo y objetivos en el formulario guiado.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="px-6 py-3.5 rounded-xl text-xs font-bold text-[#080D19] bg-[#22D3EE] hover:bg-[#38BDF8] shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>COMENZAR EVALUACIÓN</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};
