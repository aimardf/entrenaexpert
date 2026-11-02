import React, { useState, useEffect } from 'react';
import { AthleteProfile, Exercise, InferenceResult } from './types';
import { runInferenceEngine } from './engine/inferenceEngine';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { HowItWorks } from './components/HowItWorks';
import { AthleteForm } from './components/AthleteForm';
import { RecommendationView } from './components/RecommendationView';
import { KnowledgeCatalog } from './components/KnowledgeCatalog';
import { InferenceAuditView } from './components/InferenceAuditView';
import { TestSuiteView } from './components/TestSuiteView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { Shield, Sparkles, Trophy, Activity, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_PROFILE: AthleteProfile = {
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
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'form' | 'results' | 'catalog' | 'audit' | 'tests'>('home');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [profile, setProfile] = useState<AthleteProfile>(INITIAL_PROFILE);
  const [inferenceResult, setInferenceResult] = useState<InferenceResult>(() =>
    runInferenceEngine(INITIAL_PROFILE)
  );

  const [modalExercise, setModalExercise] = useState<Exercise | null>(null);
  const [modalRationale, setModalRationale] = useState<string | undefined>(undefined);
  const [modalScore, setModalScore] = useState<number | undefined>(undefined);

  // Sincronizar clase dark en el documento
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleFormSubmit = (newProfile: AthleteProfile) => {
    setProfile(newProfile);
    const result = runInferenceEngine(newProfile);
    setInferenceResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExerciseModal = (exercise: Exercise, rationale?: string, score?: number) => {
    setModalExercise(exercise);
    setModalRationale(rationale);
    setModalScore(score);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D19] text-[#F8FAFC] selection:bg-[#22D3EE] selection:text-[#080D19] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Barra de navegación superior con diseño premium */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        hasResults={Boolean(inferenceResult)}
      />

      {/* Contenido principal según pestaña activa con transiciones de página */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              <HomeHero
                onStart={() => {
                  setActiveTab('form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onExploreCatalog={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              <SafetyDisclaimer />
              <HowItWorks />
            </motion.div>
          )}

          {activeTab === 'form' && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SafetyDisclaimer />
              <AthleteForm initialProfile={profile} onSubmit={handleFormSubmit} />
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <SafetyDisclaimer />
              <RecommendationView
                profile={profile}
                result={inferenceResult}
                onEditProfile={() => setActiveTab('form')}
                onOpenAudit={() => setActiveTab('audit')}
                onSelectExercise={(ex, rat, sc) => handleOpenExerciseModal(ex, rat, sc)}
              />
            </motion.div>
          )}

          {activeTab === 'catalog' && (
            <motion.div
              key="catalog-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SafetyDisclaimer />
              <KnowledgeCatalog
                onSelectExercise={(exercise) => handleOpenExerciseModal(exercise)}
              />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SafetyDisclaimer />
              <InferenceAuditView inferenceResult={inferenceResult} />
            </motion.div>
          )}

          {activeTab === 'tests' && (
            <motion.div
              key="tests-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SafetyDisclaimer />
              <TestSuiteView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Ficha Técnica de Ejercicio */}
      <SessionDetailModal
        exercise={modalExercise}
        rationale={modalRationale}
        score={modalScore}
        onClose={() => setModalExercise(null)}
      />

      {/* Footer deportivo de alta gama */}
      <footer className="border-t border-[#1E2D4A] bg-[#080D19]/90 backdrop-blur-xl py-8 text-xs text-[#94A3B8] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
              <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-[#F8FAFC]">SportExpert PRO</span>
            <span aria-hidden="true" className="text-[#64748B]">·</span>
            <span>Sistema Experto Determinista de Alto Rendimiento</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-[#F8FAFC]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Fútbol · Balonmano · Baloncesto
            </span>
            <span aria-hidden="true" className="text-[#64748B]">·</span>
            <span>Reglas SI-ENTONCES</span>
            <span aria-hidden="true" className="text-[#64748B]">·</span>
            <span className="text-[#64748B]">© 2026 SportExpert</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
