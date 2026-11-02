import React from 'react';
import { Deporte, Entrada, Nivel, Objetivo, Periodo, Zona } from '../types';

interface Props {
  entrada: Entrada;
  onChange: (e: Entrada) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const DEPORTES: [Deporte, string][] = [
  ['futbol', 'Fútbol'],
  ['baloncesto', 'Baloncesto'],
  ['voleibol', 'Voleibol'],
  ['balonmano', 'Balonmano'],
  ['tenis', 'Tenis'],
  ['otro', 'Otro'],
];
const NIVELES: [Nivel, string, string][] = [
  ['principiante', 'Principiante', 'menos de 1 año entrenando de forma estructurada'],
  ['intermedio', 'Intermedio', '1–3 años de entrenamiento regular'],
  ['avanzado', 'Avanzado', 'más de 3 años o compitiendo a nivel federado'],
];
const OBJETIVOS: [Objetivo, string][] = [
  ['resistencia', 'Resistencia'],
  ['fuerza', 'Fuerza'],
  ['velocidad', 'Velocidad y agilidad'],
  ['tecnica', 'Técnica del deporte'],
  ['prevencion', 'Prevenir lesiones'],
];
const PERIODOS: [Periodo, string][] = [
  ['pretemporada', 'Pretemporada'],
  ['competicion', 'En competición'],
  ['fuera_temporada', 'Fuera de temporada'],
];
const ZONAS: [Zona, string][] = [
  ['rodilla', 'Rodilla'],
  ['tobillo', 'Tobillo'],
  ['hombro', 'Hombro'],
  ['espalda', 'Espalda baja'],
  ['isquios', 'Isquiotibiales'],
];

function Radio<T extends string | number | boolean>(props: {
  name: string;
  value: T;
  actual: T | undefined;
  label: string;
  onPick: (v: T) => void;
}) {
  return (
    <label className="chip">
      <input type="radio" name={props.name} checked={props.actual === props.value} onChange={() => props.onPick(props.value)} />
      <span>{props.label}</span>
    </label>
  );
}

const SiNo = ({ name, actual, onPick }: { name: string; actual?: boolean; onPick: (v: boolean) => void }) => (
  <div className="chips">
    <Radio name={name} value={false} actual={actual} label="No" onPick={onPick} />
    <Radio name={name} value={true} actual={actual} label="Sí" onPick={onPick} />
  </div>
);

export default function Formulario({ entrada: e, onChange, onSubmit, onReset }: Props) {
  const set = <K extends keyof Entrada>(k: K, v: Entrada[K]) => onChange({ ...e, [k]: v });
  const objetivos = e.objetivos ?? [];
  const molestias = e.molestias ?? [];

  const toggleObjetivo = (o: Objetivo) =>
    set('objetivos', objetivos.includes(o) ? objetivos.filter((x) => x !== o) : [...objetivos, o]);
  const toggleZona = (z: Zona) => set('molestias', molestias.includes(z) ? molestias.filter((x) => x !== z) : [...molestias, z]);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        onSubmit();
      }}
    >
      <h2>Tus datos</h2>
      <p className="muted small">Las preguntas sin «opcional» son imprescindibles. Si dejas alguna opcional sin responder, el sistema te dirá qué ha supuesto.</p>

      <fieldset>
        <legend>1. ¿Qué deporte practicas?</legend>
        <div className="chips">
          {DEPORTES.map(([v, l]) => (
            <Radio key={v} name="deporte" value={v} actual={e.deporte} label={l} onPick={(x) => set('deporte', x)} />
          ))}
        </div>
        {e.deporte === 'otro' && (
          <input
            style={{ marginTop: 8 }}
            type="text"
            placeholder="¿Cuál? (p. ej., rugby)"
            value={e.deporteOtro ?? ''}
            onChange={(ev) => set('deporteOtro', ev.target.value)}
            aria-label="Nombre del deporte"
          />
        )}
      </fieldset>

      <fieldset>
        <legend>2. ¿Cuántos años tienes?</legend>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          value={e.edad ?? ''}
          onChange={(ev) => set('edad', ev.target.value === '' ? undefined : Number(ev.target.value))}
          aria-label="Edad"
          style={{ maxWidth: 120 }}
        />
      </fieldset>

      <fieldset>
        <legend>3. ¿Cuál es tu nivel?</legend>
        <div className="chips">
          {NIVELES.map(([v, l, d]) => (
            <span key={v} title={d}>
              <Radio name="nivel" value={v} actual={e.nivel} label={l} onPick={(x) => set('nivel', x)} />
            </span>
          ))}
        </div>
        {e.nivel && <p className="hint" style={{ marginTop: 6 }}>{NIVELES.find((n) => n[0] === e.nivel)![2]}</p>}
      </fieldset>

      <fieldset>
        <legend>4. ¿Qué quieres mejorar?</legend>
        <p className="hint">Elige 1 o 2, por orden de prioridad (el primero que marques es el principal).</p>
        <div className="chips">
          {OBJETIVOS.map(([v, l]) => {
            const idx = objetivos.indexOf(v);
            return (
              <label className="chip" key={v}>
                <input type="checkbox" checked={idx >= 0} disabled={idx < 0 && objetivos.length >= 2} onChange={() => toggleObjetivo(v)} />
                <span>
                  {idx >= 0 ? `${idx + 1}. ` : ''}
                  {l}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend>5. ¿Cuántos días a la semana puedes entrenar?</legend>
        <div className="chips">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Radio key={d} name="dias" value={d} actual={e.dias} label={String(d)} onPick={(x) => set('dias', x)} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          6. ¿Cuánto dura cada sesión? <span className="opt">(opcional)</span>
        </legend>
        <div className="chips">
          {[30, 45, 60, 90].map((m) => (
            <Radio key={m} name="minutos" value={m} actual={e.minutos} label={`${m} min`} onPick={(x) => set('minutos', x)} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          7. ¿En qué momento de la temporada estás? <span className="opt">(opcional)</span>
        </legend>
        <div className="chips">
          {PERIODOS.map(([v, l]) => (
            <Radio key={v} name="periodo" value={v} actual={e.periodo} label={l} onPick={(x) => set('periodo', x)} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          8. ¿Tienes alguna molestia? <span className="opt">(opcional, puedes marcar varias)</span>
        </legend>
        <div className="chips">
          <label className="chip">
            <input type="checkbox" checked={e.sinLesiones === true} onChange={() => set('sinLesiones', e.sinLesiones ? undefined : true)} />
            <span>Ninguna</span>
          </label>
          {ZONAS.map(([v, l]) => (
            <label className="chip" key={v}>
              <input type="checkbox" checked={molestias.includes(v)} onChange={() => toggleZona(v)} />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          9. ¿Tienes acceso a un gimnasio? <span className="opt">(opcional)</span>
        </legend>
        <SiNo name="gimnasio" actual={e.gimnasio} onPick={(v) => set('gimnasio', v)} />
      </fieldset>

      <fieldset>
        <legend>10. ¿Tienes ahora dolor agudo o una lesión sin recuperar?</legend>
        <SiNo name="dolor" actual={e.dolorAgudo} onPick={(v) => set('dolorAgudo', v)} />
      </fieldset>

      <fieldset>
        <legend>11. ¿Algún médico te ha dicho que tienes un problema de corazón o de tensión, o sientes dolor en el pecho o mareos al hacer ejercicio?</legend>
        <p className="hint">Pregunta de cribado basada en el cuestionario PAR-Q+.</p>
        <SiNo name="parq" actual={e.parqRiesgo} onPick={(v) => set('parqRiesgo', v)} />
      </fieldset>

      <div className="row">
        <button type="submit" className="primary">
          Generar plan
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
