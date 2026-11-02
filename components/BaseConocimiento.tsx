import React from 'react';
import { REGLAS } from '../knowledge/reglas';
import { FUENTES } from '../knowledge/fuentes';
import { DEPORTES, NOMBRE_ZONA, PREVENTIVO_ZONA } from '../knowledge/deportes';
import { Categoria, Zona } from '../types';

const CATEGORIAS: Categoria[] = ['Validación', 'Seguridad', 'Clasificación', 'Carga', 'Prevención', 'Adaptación', 'Conflicto', 'Planificación'];

export default function BaseConocimiento() {
  return (
    <div>
      <section className="panel">
        <h2>Base de conocimiento</h2>
        <p className="muted">
          {REGLAS.length} reglas de producción (SI … ENTONCES …), hechos sobre {Object.keys(DEPORTES).length} deportes y {FUENTES.length}{' '}
          fuentes. Cuando varias reglas se pueden aplicar a la vez, el motor elige la de mayor prioridad: primero validación y
          seguridad, después clasificación, carga, prevención, adaptaciones, conflictos y por último la planificación.
        </p>
      </section>

      <section className="panel">
        <h2>Reglas</h2>
        {CATEGORIAS.map((c) => (
          <details key={c} open={c === 'Seguridad'}>
            <summary>
              {c} ({REGLAS.filter((r) => r.categoria === c).length})
            </summary>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Regla</th>
                    <th>Prioridad</th>
                    <th>Fuentes</th>
                  </tr>
                </thead>
                <tbody>
                  {REGLAS.filter((r) => r.categoria === c).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="rid">{r.id}</span>
                      </td>
                      <td>
                        <b>{r.nombre}</b>
                        <br />
                        <span className="small">{r.descripcion}</span>
                      </td>
                      <td>{r.prioridad}</td>
                      <td className="small">{r.fuentes.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </section>

      <section className="panel">
        <h2>Hechos: perfil de cada deporte</h2>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Deporte</th>
                <th>Exigencias</th>
                <th>Zonas de riesgo</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(DEPORTES).map((d) => (
                <tr key={d.nombre}>
                  <td>{d.nombre}</td>
                  <td className="small">{d.exigencias}</td>
                  <td className="small">{d.zonasRiesgo.map((z) => NOMBRE_ZONA[z]).join(', ')}</td>
                  <td>{d.fuente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 style={{ marginTop: 16 }}>Ejercicio preventivo por zona</h3>
        <ul className="small">
          {(Object.keys(PREVENTIVO_ZONA) as Zona[]).map((z) => (
            <li key={z}>
              <b>{NOMBRE_ZONA[z]}</b> ({PREVENTIVO_ZONA[z].regla}): {PREVENTIVO_ZONA[z].ejercicio}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Fuentes</h2>
        <ul className="small">
          {FUENTES.map((f) => (
            <li key={f.id} style={{ marginBottom: 6 }}>
              <b>{f.id}</b> {f.cita}{' '}
              {f.url && (
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.url}
                </a>
              )}
              <br />
              <span className="muted">Uso: {f.uso}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
