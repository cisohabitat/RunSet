import { useEffect, useRef, useState } from "react";
import { type GameState, type Action, turnCheck } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { explainMeld, narrateMove, type Hint } from "../engine/coaching";
import { runPlanner } from "../lib/planner";
import { Tile } from "./Tile";
export function Game({
  game: s,
  dispatch,
  onHelp,
  suggested = [],
  narrate = false,
  touch = false,
}: {
  game: GameState;
  dispatch: (a: Action) => void;
  onHelp: () => void;
  suggested?: number[];
  narrate?: boolean;
  touch?: boolean;
}) {
  const [expanded, setExpanded] = useState(false),
    [tableView, setTableView] = useState<"normal" | "wide">("normal");
  const tableRef = useRef<HTMLElement>(null);
  const [hint, setHint] = useState<Hint | null>(null),
    [planning, setPlanning] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    setHint(null);
    setPlanning(false);
    return () => request.current?.abort();
  }, [s]);
  const askHint = () => {
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setPlanning(true);
    runPlanner(s, "hint", controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setHint(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setHint({ table: null, used: [], message: error.message });
      })
      .finally(() => {
        if (!controller.signal.aborted) setPlanning(false);
      });
  };
  const [selected, setSelected] = useState<number[]>([]);
  const p = s.players[s.current],
    human = s.players.find((x) => !x.bot)!,
    myTurn = !p.bot,
    check = turnCheck(s),
    dirty = JSON.stringify(s.table) !== JSON.stringify(s.turnStart.table);
  const activeSelected = selected.filter(
    (id) =>
      human.rack.includes(id) || s.table.some((m) => m.tiles.includes(id)),
  );
  const select = (id: number) => {
    if (myTurn)
      setSelected((x) =>
        x.includes(id) ? x.filter((v) => v !== id) : [...x, id],
      );
  };
  const move = (target: string, ids = activeSelected) => {
    if (!myTurn) return;
    dispatch({ type: "move", ids, target });
    setSelected([]);
  };
  const drop = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id)) return;
    move(target, activeSelected.includes(id) ? activeSelected : [id]);
  };
  const act = (a: Action) => {
    setSelected([]);
    dispatch(a);
  };
  return (
    <main className={`game ${touch ? "touch-friendly" : ""}`}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">THE TABLE</span>
          <h1>{myTurn ? "Your move." : "A little thinking…"}</h1>
        </div>
        <button className="text-button" onClick={onHelp}>
          Rules ↗
        </button>
      </div>
      <div className="opponents">
        {s.players
          .filter((x) => x.bot)
          .map((x, i) => (
            <div
              className={`opponent ${x === p ? "is-turn" : ""}`}
              key={x.name}
            >
              <span className="avatar">{["✳", "◈", "✦"][i]}</span>
              <div>
                <strong>{x.name}</strong>
                <span>
                  {x.bot} · {x.rack.length} tiles {x.melded ? "· opened" : ""}
                </span>
              </div>
              {x === p && (
                <span className="thinking" aria-label="Taking a turn">
                  •••
                </span>
              )}
            </div>
          ))}
        <div className="pool-count">
          <strong>{s.pool.length}</strong>
          <span>in the pool</span>
        </div>
      </div>
      {hint && (
        <aside className="coach-card" aria-label="Move hint">
          <p role="status">{hint.message}</p>
          {hint.table && (
            <button
              className="secondary"
              onClick={() => {
                dispatch({ type: "applyPlan", table: hint.table! });
                setSelected([]);
              }}
            >
              Place hint
            </button>
          )}
          <button className="text-button" onClick={() => setHint(null)}>
            Dismiss hint
          </button>
        </aside>
      )}
      <div className="table-tools">
        <button
          className="text-button"
          onClick={() =>
            setTableView((x) => (x === "normal" ? "wide" : "normal"))
          }
        >
          {tableView === "normal" ? "Expand table" : "Compact table"}
        </button>
        <button
          className="text-button"
          onClick={() =>
            tableRef.current?.scrollTo({ top: 0, behavior: "auto" })
          }
        >
          Table start ↑
        </button>
        <button
          className="text-button"
          onClick={() =>
            tableRef.current?.scrollTo({
              top: tableRef.current.scrollHeight,
              behavior: "auto",
            })
          }
        >
          Table end ↓
        </button>
        <span>Scroll the table to see more groups and runs.</span>
      </div>
      <section
        ref={tableRef}
        className={`table ${tableView === "wide" ? "expanded-table" : ""}`}
        aria-label="Table melds"
        tabIndex={0}
      >
        <div className="table-topline">
          <span>MAKE ROOM FOR A GOOD IDEA</span>
          <span>Round 01 · Turn {s.turn}</span>
        </div>
        <div className="melds">
          {s.table.map((m) => {
            const info = inspectMeld(m.tiles);
            return (
              <div
                key={m.id}
                className={`meld ${info.valid ? "" : "invalid"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => drop(e, m.id)}
              >
                <div className="meld-tiles">
                  {info.ordered.map((id) => (
                    <Tile
                      key={id}
                      id={id}
                      selected={activeSelected.includes(id)}
                      glow={
                        s.lastPlaced.includes(id) ||
                        suggested.includes(id) ||
                        !!hint?.used.includes(id)
                      }
                      represents={
                        info.values[id]
                          ? `${info.jokerColors[id]} ${info.values[id]}`
                          : undefined
                      }
                      onSelect={myTurn ? select : undefined}
                      draggable={myTurn}
                      onDrag={(id) => {
                        if (!activeSelected.includes(id)) setSelected([id]);
                      }}
                    />
                  ))}
                </div>
                {!info.valid && (
                  <p className="meld-explanation">{explainMeld(m.tiles)}</p>
                )}
                <button
                  className="meld-target"
                  disabled={!myTurn || !activeSelected.length}
                  onClick={() => move(m.id)}
                  aria-label={`Add selected tiles to meld ${s.table.indexOf(m) + 1}`}
                >
                  {info.valid
                    ? `${info.kind} · ${info.points} pts`
                    : "Incomplete group or run"}{" "}
                  <span>＋</span>
                </button>
              </div>
            );
          })}
          <button
            className="new-meld"
            disabled={!myTurn}
            onClick={() => move("new")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => drop(e, "new")}
          >
            <span>＋</span>New group or run
            <small>
              {activeSelected.length
                ? `Place ${activeSelected.length} selected`
                : "Select tiles, then place here"}
            </small>
          </button>
        </div>
        {!s.table.length && (
          <div className="empty-table">
            <span>✳</span>
            <h2>
              Every good game
              <br />
              starts with a possibility.
            </h2>
            <p>Open with 30 points from your rack.</p>
          </div>
        )}
      </section>
      {myTurn && !p.melded && check.played.length > 0 && (
        <p className="opening-breakdown">
          Opening points:{" "}
          {s.table
            .filter(
              (m) =>
                !m.tiles.some((id) =>
                  s.turnStart.table.some((old) => old.tiles.includes(id)),
                ),
            )
            .map((m) =>
              inspectMeld(m.tiles).valid
                ? `${inspectMeld(m.tiles)
                    .ordered.map((id) => inspectMeld(m.tiles).values[id])
                    .join(" + ")} = ${inspectMeld(m.tiles).points}`
                : "incomplete group or run",
            )
            .join("; ")}
          . Need at least 30.
        </p>
      )}
      <div className="status-line" role="status" aria-live="polite">
        <span className={`status-dot ${myTurn ? "" : "waiting"}`} />
        {myTurn
          ? p.melded
            ? `${check.played.length} tile${check.played.length === 1 ? "" : "s"} played this turn`
            : `Opening meld: ${check.points} / 30 points`
          : `${p.name} is finding a move…`}
        {myTurn && !check.valid && check.played.length > 0 && (
          <span className="warning">{check.reason}</span>
        )}
      </div>
      <div className="player-dock">
        <section
          className={`rack ${expanded ? "expanded-rack" : ""}`}
          aria-label="Your rack"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => drop(e, "rack")}
        >
          <div className="rack-heading">
            <div>
              <strong>{human.name}’s rack</strong>
              <span>
                {human.rack.length} tiles{" "}
                {human.melded ? "· opened" : "· not opened yet"}
              </span>
            </div>
            <div className="sort">
              <button onClick={() => setExpanded((x) => !x)}>
                {expanded ? "Compact rack" : "Expand rack"}
              </button>
              <span>Sort</span>
              <button
                disabled={!myTurn}
                onClick={() => act({ type: "sortRack", by: "color" })}
              >
                Colour
              </button>
              <button
                disabled={!myTurn}
                onClick={() => act({ type: "sortRack", by: "number" })}
              >
                Number
              </button>
            </div>
          </div>
          <div className="rack-tiles">
            {human.rack.map((id) => (
              <Tile
                key={id}
                id={id}
                selected={activeSelected.includes(id)}
                glow={suggested.includes(id) || !!hint?.used.includes(id)}
                onSelect={myTurn ? select : undefined}
                draggable={myTurn}
                onDrag={(id) => {
                  if (!activeSelected.includes(id)) setSelected([id]);
                }}
              />
            ))}
          </div>
          {activeSelected.length > 0 && (
            <button
              className="text-button return-tiles"
              disabled={!myTurn}
              onClick={() => move("rack")}
            >
              Return selected tiles to rack ↩
            </button>
          )}
        </section>
        <div className="action-bar">
          <button
            className="text-button"
            disabled={!myTurn || !s.history?.length}
            onClick={() => act({ type: "undo" })}
          >
            Undo move
          </button>
          <button
            className="text-button"
            disabled={!myTurn || planning}
            onClick={askHint}
          >
            {planning ? "Finding a move…" : "Show a possible move"}
          </button>
          <button
            className="text-button"
            disabled={!myTurn}
            onClick={() => act({ type: "resetTurn" })}
          >
            ↺ Reset turn
          </button>
          <span className="selection-count">
            {activeSelected.length
              ? `${activeSelected.length} selected`
              : "Select a tile to begin"}
          </span>
          {activeSelected.length > 0 && (
            <>
              <button
                className="secondary"
                onClick={() => move("new")}
                disabled={!myTurn}
              >
                Place selected
              </button>
              <button className="text-button" onClick={() => setSelected([])}>
                Deselect all
              </button>
            </>
          )}
          <button
            className="secondary"
            disabled={!myTurn}
            onClick={() => act({ type: "draw" })}
          >
            {s.pool.length ? "Draw a tile" : "Pass"} <span>↓</span>
          </button>
          <button
            className={`primary ${!check.valid && dirty ? "danger" : ""}`}
            disabled={!myTurn || (!check.played.length && !dirty)}
            onClick={() => act({ type: "endTurn" })}
          >
            {check.valid || !dirty ? "End turn →" : "+3 tiles · End turn"}
          </button>
        </div>
      </div>
      {s.notice && (
        <p className="game-notice" role="status">
          {narrate ? narrateMove(s) : s.notice}
        </p>
      )}
      <details className="game-log">
        <summary>At the table · move history</summary>
        {s.log.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </details>
    </main>
  );
}
