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
  coaching = true,
  coachTarget,
  onSelectionChange,
  saveLabel,
  narrate = false,
  touch = false,
  lessonAction,
}: {
  game: GameState;
  dispatch: (a: Action) => void;
  onHelp: () => void;
  suggested?: number[];
  coaching?: boolean;
  coachTarget?: string;
  onSelectionChange?: (ids: number[]) => void;
  saveLabel?: string;
  narrate?: boolean;
  touch?: boolean;
  lessonAction?: { label: string; onClick: () => void };
}) {
  const [focused, setFocused] = useState<number | null>(null);
  const rackRef = useRef<HTMLDivElement>(null);
  const focusRack = () =>
    requestAnimationFrame(() =>
      rackRef.current
        ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
        ?.focus({ preventScroll: true }),
    );
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    if (!s.turnSeconds) return;
    const timer = setInterval(() => setClock(Date.now()), 500);
    return () => clearInterval(timer);
  }, [s.turnSeconds]);
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
  useEffect(() => {
    if (myTurn) focusRack();
  }, [s.turn, myTurn]);
  const select = (id: number) => {
    if (myTurn) {
      const next = selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id];
      setSelected(next);
      onSelectionChange?.(next);
    }
  };
  const move = (target: string, ids = activeSelected) => {
    if (!myTurn) return;
    dispatch({ type: "move", ids, target });
    setSelected([]);
    onSelectionChange?.([]);
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
    <main
      aria-describedby={coachTarget ? "practice-instructions" : undefined}
      className={`game ${touch ? "touch-friendly" : ""} ${tableView === "wide" ? "table-expanded" : ""}`}
      onKeyDown={(e) => {
        if (
          (e.target as HTMLElement).closest("input,textarea,select,dialog") ||
          !myTurn
        )
          return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          e.preventDefault();
          act({ type: "undo" });
          focusRack();
        } else if (e.key === "Escape") {
          setSelected([]);
          setHint(null);
        } else if (
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey &&
          e.key.toLowerCase() === "n" &&
          activeSelected.length
        ) {
          e.preventDefault();
          move("new");
          focusRack();
        } else if (
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey &&
          e.key.toLowerCase() === "h" &&
          coaching &&
          !planning
        ) {
          e.preventDefault();
          askHint();
        }
      }}
    >
      <div className="game-heading">
        <div>
          <span className="eyebrow">THE TABLE</span>
          <h1>{myTurn ? "Your move." : "A little thinking…"}</h1>
        </div>
        <div className="game-heading-actions">
          {saveLabel && (
            <span
              className={`save-indicator ${saveLabel === "Not saved" ? "save-error" : ""}`}
              role="status"
            >
              {saveLabel}
            </span>
          )}
          <button className="text-button" onClick={onHelp}>
            Rules ↗
          </button>
        </div>
      </div>
      {s.match && (
        <div className="match-bar" aria-label="Match scores">
          <span>First to {s.match.target}</span>
          {s.players.map((player, i) => (
            <span key={i}>
              {player.name}: <strong>{s.match!.totals[i]}</strong>
            </span>
          ))}
        </div>
      )}
      {s.turnSeconds && (
        <p
          className={`turn-clock ${Math.max(0, (s.deadline ?? clock) - clock) < 15000 ? "urgent" : ""}`}
          role="timer"
          aria-label="Time left this turn"
        >
          Time left:{" "}
          {Math.max(0, Math.ceil(((s.deadline ?? clock) - clock) / 1000))}s ·
          unfinished moves reset and draw one on expiry
        </p>
      )}
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
      {s.coach && !hint && (
        <aside
          className="first-game-guide"
          aria-label="First real game guidance"
        >
          <strong>Your first real game</strong>
          <p>
            {!myTurn
              ? "Watch the opponent. Your turn comes next."
              : !human.melded
                ? check.valid && check.played.length
                  ? `Your opening is worth ${check.points} points. Choose End turn to complete your first play.`
                  : "Look for a matching-number group or a same-colour run. Your first play needs 30 points. Hint can explain a possibility; drawing is always allowed."
                : "You have opened! Add tiles to existing groups or runs, make new ones, or draw. You can turn these tips off whenever you’re ready."}
          </p>
          <button
            className="text-button"
            onClick={() => dispatch({ type: "dismissCoach" })}
          >
            Got it — hide coaching
          </button>
        </aside>
      )}
      {hint && (
        <aside className="coach-card" aria-label="Move hint">
          <p role="status">{hint.message}</p>
          {hint.explanations && (
            <details className="hint-reasons" open>
              <summary>Why this works</summary>
              <ul>
                {hint.explanations.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </details>
          )}
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
          <span>
            Round {s.match?.round ?? 1} · Turn {s.turn}
          </span>
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
                      tabIndex={
                        m.tiles.includes(focused ?? -1)
                          ? focused === id
                            ? 0
                            : -1
                          : info.ordered[0] === id
                            ? 0
                            : -1
                      }
                      onFocus={() => setFocused(id)}
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
                  data-coach-target={coachTarget === m.id || undefined}
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
            data-coach-target={coachTarget === "new" || undefined}
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
          <div
            className="rack-tiles"
            ref={rackRef}
            role="group"
            aria-label="Your tiles. Use left and right arrows to navigate."
          >
            {human.rack.map((id) => (
              <Tile
                key={id}
                id={id}
                tabIndex={
                  human.rack.includes(focused ?? -1)
                    ? focused === id
                      ? 0
                      : -1
                    : human.rack[0] === id
                      ? 0
                      : -1
                }
                onFocus={() => setFocused(id)}
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
        </section>
        {activeSelected.length > 0 && (
          <div className="selection-actions">
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
          </div>
        )}
        <div className="action-bar">
          <div className="turn-tools">
            <button
              className="text-button"
              aria-label="Undo move"
              disabled={!myTurn || !s.history?.length}
              onClick={() => act({ type: "undo" })}
            >
              Undo
            </button>
            {coaching && (
              <button
                className="text-button"
                aria-label={
                  planning ? "Finding a move…" : "Show a possible move"
                }
                disabled={!myTurn || planning}
                onClick={askHint}
              >
                {planning ? "Thinking…" : "Hint"}
              </button>
            )}
            <button
              className="text-button"
              aria-label="Reset turn"
              data-coach-target={coachTarget === "reset" || undefined}
              disabled={!myTurn}
              onClick={() => act({ type: "resetTurn" })}
            >
              Reset
            </button>
            <details className="more-actions">
              <summary>More</summary>
              <div>
                <button
                  className="text-button"
                  disabled={!myTurn || !activeSelected.length}
                  onClick={() => move("rack")}
                >
                  Return selected tiles to rack
                </button>
                <details className="move-history">
                  <summary>Move history</summary>
                  {s.log.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </details>
              </div>
            </details>
            <span className="selection-count" role="status">
              {activeSelected.length
                ? `${activeSelected.length} selected`
                : "Select tiles"}
            </span>
          </div>
          <div className="primary-actions">
            {lessonAction ? (
              <button className="primary" onClick={lessonAction.onClick}>
                {lessonAction.label}
              </button>
            ) : (
              <>
                <button
                  className="secondary"
                  disabled={!myTurn}
                  data-coach-target={coachTarget === "draw" || undefined}
                  onClick={() => act({ type: "draw" })}
                >
                  {s.pool.length ? "Draw a tile" : "Pass"} ↓
                </button>
                <button
                  className={`primary ${!check.valid && dirty ? "danger" : ""}`}
                  disabled={!myTurn || (!check.played.length && !dirty)}
                  data-coach-target={coachTarget === "end" || undefined}
                  onClick={() => act({ type: "endTurn" })}
                >
                  {check.valid || !dirty ? "End turn →" : "+3 tiles · End turn"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {s.notice && (
        <p className="game-notice" role="status">
          {narrate ? narrateMove(s) : s.notice}
        </p>
      )}
    </main>
  );
}
