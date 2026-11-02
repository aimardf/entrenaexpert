import React, { useMemo, useState } from 'react';
import { CASOS } from '../knowledge/casosPrueba';
import { ejecutarCaso, ResultadoPrueba } from '../engine/pruebas';
import { Entrada } from '../types';

export default function Pruebas({ onAbrir }: { onAbrir: (e: Entrada) => void }) {
  const [resultados, setResultados] = useState<ResultadoPrueba[] | null>(null);
  const superadas = useMemo(() => resultados?.filter((r) => r.superada).length ?? 0, [resultados]);

  return (
    <div>
      <section className="panel">
        <h2>Pruebas reproducibles</h2>
        <p className="muted">
          {CASOS.length} casos ({CASOS.filter((c) => c.tipo === 'Habitual').length} habituales y {CASOS.filter((c) => c.tipo === 'Difícil').length}{' '}
          difíciles). Cada caso tiene una entrada fija y un resultado esperado; al ejecutarlos se compara con lo que obtiene el motor. La
          misma batería se ejecuta en consola con <code>npm test</code>.
        </p>
        <div className="row">
          <button className="primary" onClick={() => setResultados(CASOS.map(ejecutarCaso))}>
            Ejecutar todas las pruebas
          </button>
          {resultados && (
            <span className={superadas === resultados.length ? 'ok' : 'ko'} style={{ alignSelf: 'center' }}>
              {superadas}/{resultados.length} superadas
            </span>
          )}
        </div>
      </section>

      <section className="panel scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Caso</th>
              <th>Esperado</th>
              <th>Obtenido</th>
              <th>Resultado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {CASOS.map((c, i) => {
              const r = resultados?.[i];
              return (
                <tr key={c.id}>
                  <td>
                    <b>{c.id}</b>
                    <br />
                    <span className={`pill ${c.tipo === 'Difícil' ? 'd' : ''}`}>{c.tipo}</span>
                  </td>
                  <td>{c.nombre}</td>
                  <td className="small">{c.esperadoTexto}</td>
                  <td className="small">
                    {r ? (
                      <>
                        {r.obtenidoTexto}
                        <br />
                        <span className="muted">Reglas: {r.resultado.traza.map((p) => p.regla).join(' → ')}</span>
                        {r.fallos.map((f) => (
                          <div key={f} className="ko">
                            {f}
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="muted">Sin ejecutar</span>
                    )}
                  </td>
                  <td>{r ? <span className={r.superada ? 'ok' : 'ko'}>{r.superada ? '✔ Superada' : '✘ Fallida'}</span> : '—'}</td>
                  <td>
                    <button className="ghost" onClick={() => onAbrir(c.entrada)}>
                      Abrir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
