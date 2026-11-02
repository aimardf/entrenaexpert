import React, { useState } from 'react';
import Formulario from './components/Formulario';
import Resultado from './components/Resultado';
import BaseConocimiento from './components/BaseConocimiento';
import Pruebas from './components/Pruebas';
import { inferir } from './engine/motor';
import { Entrada, Resultado as R } from './types';

type Pestana = 'asistente' | 'conocimiento' | 'pruebas' | 'acerca';

const VACIA: Entrada = { objetivos: [], molestias: [] };

export default function App() {
  const [pestana, setPestana] = useState<Pestana>('asistente');
  const [entrada, setEntrada] = useState<Entrada>(VACIA);
  const [res, setRes] = useState<R | null>(null);

  const generar = (e: Entrada = entrada) => {
    setRes(inferir(e));
    if (window.innerWidth < 900) setTimeout(() => document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const tabs: [Pestana, string][] = [
    ['asistente', 'Asistente'],
    ['conocimiento', 'Base de conocimiento'],
    ['pruebas', 'Pruebas'],
    ['acerca', 'Acerca de'],
  ];

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="brand">
            <b>EntrenaExpert</b>
            <span>Sistema experto de planes de entrenamiento deportivo</span>
          </div>
          <nav className="tabs" role="tablist">
            {tabs.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap">
        {pestana === 'asistente' && (
          <div className="layout">
            <section className="panel">
              <Formulario
                entrada={entrada}
                onChange={setEntrada}
                onSubmit={() => generar()}
                onReset={() => {
                  setEntrada(VACIA);
                  setRes(null);
                }}
              />
            </section>
            <div id="resultado">
              {res ? (
                <Resultado res={res} />
              ) : (
                <section className="panel empty">
                  <h2>Tu plan aparecerá aquí</h2>
                  <p>
                    Responde a las preguntas y pulsa «Generar plan». Verás el plan semanal, los avisos y qué reglas y fuentes justifican
                    cada decisión.
                  </p>
                  <p className="small">También puedes abrir un caso de ejemplo desde la pestaña «Pruebas».</p>
                </section>
              )}
            </div>
          </div>
        )}

        {pestana === 'conocimiento' && <BaseConocimiento />}

        {pestana === 'pruebas' && (
          <Pruebas
            onAbrir={(e) => {
              setEntrada(e);
              setPestana('asistente');
              generar(e);
            }}
          />
        )}

        {pestana === 'acerca' && (
          <section className="panel" style={{ maxWidth: 760 }}>
            <h2>Acerca de EntrenaExpert</h2>
            <p>
              <b>Qué hace.</b> Propone un plan semanal de entrenamiento para fútbol, baloncesto, voleibol, balonmano o tenis a partir de la
              edad, el nivel, los objetivos, los días disponibles, el momento de la temporada y las molestias de la persona.
            </p>
            <p>
              <b>Para quién.</b> Deportistas aficionados y federados a partir de 12 años, y entrenadores de clubes amateur que necesitan una
              propuesta inicial justificada.
            </p>
            <p>
              <b>Cómo razona.</b> Es un sistema experto basado en reglas: una base de conocimiento con hechos y reglas SI … ENTONCES …
              vinculadas a fuentes científicas, y un motor de inferencia por encadenamiento hacia delante que dispara las reglas por
              prioridad y registra la traza. No usa un modelo de lenguaje: el mismo dato de entrada siempre produce el mismo plan.
            </p>
            <p>
              <b>Límites.</b> No sustituye a un entrenador ni a un profesional sanitario. No genera planes para menores de 12 años, con
              cribado médico positivo o con dolor agudo. Para deportes no incluidos solo ofrece condición física general. No guarda
              datos personales: todo se calcula en el navegador.
            </p>
          </section>
        )}
      </main>

      <footer className="wrap noprint">
        EntrenaExpert · Proyecto académico de sistemas expertos. Las recomendaciones son orientativas y no sustituyen el criterio de un
        profesional.
      </footer>
    </>
  );
}
