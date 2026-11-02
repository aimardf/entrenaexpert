import React from 'react';
import { Gravedad, Resultado as R } from '../types';
import { reglaPorId } from '../knowledge/reglas';
import { fuentePorId } from '../knowledge/fuentes';
import { NOMBRE_DEPORTE, NOMBRE_ZONA } from '../knowledge/deportes';

const ETIQUETA: Record<Gravedad, string> = { info: 'INFO', aviso: 'AVISO', conflicto: 'CONFLICTO', bloqueo: 'NO SE GENERA PLAN' };

const ESTADO: Record<string, string> = {
  ok: 'Plan generado',
  incompleto: 'Faltan datos o hay datos no válidos',
  bloqueado: 'Plan no generado por seguridad',
  contradiccion: 'Hay respuestas contradictorias',
  fuera_de_alcance: 'Caso fuera del alcance del sistema',
};

export const IdRegla = ({ id }: { id: string }) => {
  const r = reglaPorId(id);
  return (
    <span className="rid" title={r ? `${r.nombre}: ${r.descripcion}` : id}>
      {id}
    </span>
  );
};

export default function Resultado({ res }: { res: R }) {
  const { hechos: h, traza, mensajes } = res;
  const ok = h.estado === 'ok' && h.semana;
  const usadas = Array.from(new Set(traza.map((p) => p.regla)));
  const fuentes = Array.from(new Set(usadas.flatMap((id) => reglaPorId(id)?.fuentes ?? [])));

  return (
    <div>
      <section className="panel">
        <div className="status">
          <span className={`dot ${ok ? '' : 'bad'}`} />
          <h2 style={{ margin: 0 }}>{ESTADO[h.estado ?? ''] ?? 'Sin resultado'}</h2>
        </div>
        {mensajes.length === 0 && <p className="muted small">Sin avisos: todos los datos son coherentes.</p>}
        {mensajes.map((m, i) => (
          <div key={i} className={`msg ${m.gravedad}`}>
            <span className="tag">{ETIQUETA[m.gravedad]}</span>
            <p>
              {m.texto} <IdRegla id={m.regla} />
            </p>
          </div>
        ))}
        {ok && (
          <div className="row noprint" style={{ marginTop: 8 }}>
            <button className="ghost" onClick={() => window.print()}>
              Imprimir o guardar en PDF
            </button>
          </div>
        )}
      </section>

      {ok && (
        <>
          <section className="panel">
            <h2>Conclusiones intermedias</h2>
            <p className="muted small">Hechos que el motor ha deducido a partir de tus respuestas.</p>
            <dl className="facts">
              <div className="fact">
                <dt>Deporte</dt>
                <dd>{NOMBRE_DEPORTE(h.deporte, h.deporteOtro)}</dd>
              </div>
              <div className="fact">
                <dt>Grupo de edad</dt>
                <dd>{h.grupoEdad}</dd>
              </div>
              <div className="fact">
                <dt>Días de entrenamiento</dt>
                <dd>
                  {h.diasEfectivos} {h.diasEfectivos !== h.dias && <span className="muted">(pediste {h.dias})</span>}
                </dd>
              </div>
              <div className="fact">
                <dt>Sesiones con fuerza</dt>
                <dd>{h.sesionesFuerza}</dd>
              </div>
              <div className="fact" style={{ gridColumn: '1 / -1' }}>
                <dt>Exigencias del deporte</dt>
                <dd>{h.perfilDeporte}</dd>
              </div>
              <div className="fact">
                <dt>Zonas a proteger</dt>
                <dd>{Array.from(new Set([...(h.zonasRiesgo ?? []), ...(h.molestias ?? [])])).map((z) => NOMBRE_ZONA[z]).join(', ') || '—'}</dd>
              </div>
              <div className="fact">
                <dt>Fuerza</dt>
                <dd>
                  {h.presFuerza?.series} series × {h.presFuerza?.repeticiones} rep · {h.presFuerza?.intensidad}
                </dd>
              </div>
              <div className="fact">
                <dt>Pliometría</dt>
                <dd>
                  {Math.round((h.contactosPliometria ?? 0) * (h.factorPliometria ?? 1))} contactos/sesión
                  {h.factorPliometria !== 1 && <span className="muted"> (reducida)</span>}
                </dd>
              </div>
              <div className="fact">
                <dt>Resistencia</dt>
                <dd>{h.presAerobica}</dd>
              </div>
              {(h.adaptaciones?.length ?? 0) > 0 && (
                <div className="fact" style={{ gridColumn: '1 / -1' }}>
                  <dt>Adaptaciones aplicadas</dt>
                  <dd>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {h.adaptaciones!.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="panel">
            <h2>Plan semanal</h2>
            <p className="muted small">Pasa el ratón (o mantén pulsado) sobre cada código para ver la regla que justifica la sesión.</p>
            <div className="week">
              {h.semana!.map((s) => (
                <article key={s.dia} className={`day ${s.tipo === 'descanso' ? 'rest' : ''}`}>
                  <header>
                    <b>{s.dia}</b>
                    {s.bloques.length > 0 && s.tipo !== 'partido' && (
                      <span className="muted small">{s.bloques.reduce((a, b) => a + b.minutos, 0)} min</span>
                    )}
                  </header>
                  <h3>{s.titulo}</h3>
                  {s.bloques.map((b) => (
                    <div className="block" key={b.nombre}>
                      <div className="bh">
                        <span>{b.nombre}</span>
                        {b.minutos > 0 && <span className="muted">{b.minutos}′</span>}
                      </div>
                      <ul>
                        {b.contenido.filter(Boolean).map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="rules">
                    {Array.from(new Set(s.reglas)).map((id) => (
                      <IdRegla key={id} id={id} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="panel">
        <h2>¿Cómo se ha llegado a esta conclusión?</h2>
        <p className="muted small">
          Traza del motor de inferencia: reglas disparadas en orden y hechos que cada una añadió a la memoria de trabajo.
        </p>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Regla</th>
                <th>Categoría</th>
                <th>Hechos nuevos</th>
              </tr>
            </thead>
            <tbody>
              {traza.map((p) => (
                <tr key={p.orden}>
                  <td>{p.orden}</td>
                  <td>
                    <IdRegla id={p.regla} /> {p.nombre}
                  </td>
                  <td>{p.categoria}</td>
                  <td className="small muted">{p.hechosNuevos.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details style={{ marginTop: 12 }}>
          <summary>Reglas aplicadas y sus fuentes ({usadas.length})</summary>
          {usadas.map((id) => {
            const r = reglaPorId(id)!;
            return (
              <p key={id} className="small">
                <IdRegla id={id} /> {r.descripcion} <span className="muted">[{r.fuentes.join(', ')}]</span>
              </p>
            );
          })}
        </details>
        <details>
          <summary>Fuentes citadas ({fuentes.length})</summary>
          <ul className="small">
            {fuentes.map((id) => {
              const f = fuentePorId(id)!;
              return (
                <li key={id}>
                  <b>{id}</b> {f.cita} {f.url && <a href={f.url} target="_blank" rel="noreferrer">{f.url}</a>}
                </li>
              );
            })}
          </ul>
        </details>
      </section>
    </div>
  );
}
