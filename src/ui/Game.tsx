import { useI18n } from "../i18n/I18n";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type GameState, type Action, turnCheck } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { explainMeld, narrateMove, type Hint } from "../engine/coaching";
import { runPlanner } from "../lib/planner";
import { suggestedDestinations, turnGuidance } from "../lib/guidance";
import { Tile } from "./Tile";
import { ReadAloud } from "./ReadAloud";
import { useTileFeedback } from "./useTileFeedback";
import { sound } from "../lib/sound";
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
  autoScrollLessonAction = true,
  muted = true,
  embedded = false,
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
  autoScrollLessonAction?: boolean;
  muted?: boolean;
  embedded?: boolean;
}) {
  const { t, locale } = useI18n();
  const feedbackRoot = useRef<HTMLElement>(null);
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
    [tableView, setTableView] = useState<"normal" | "wide">(() => {
      try {
        return coaching &&
          localStorage.getItem("runset.tableExpanded") === "true"
          ? "wide"
          : "normal";
      } catch {
        return "normal";
      }
    });
  const viewButton = useRef<HTMLSelectElement>(null);
  const [rackHidden, setRackHidden] = useState(false);
  const previousView = useRef(tableView);
  const lessonButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (coaching) {
      try {
        localStorage.setItem(
          "runset.tableExpanded",
          String(tableView === "wide"),
        );
      } catch {
        /* Optional view preference. */
      }
    }
    if (previousView.current === "wide" && tableView === "normal") {
      setRackHidden(false);
      requestAnimationFrame(() => {
        viewButton.current?.focus({ preventScroll: true });
        viewButton.current?.scrollIntoView({ block: "nearest" });
      });
    }
    previousView.current = tableView;
    if (tableView !== "wide") return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const exitOnEscape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        document.querySelector("dialog[open]") ||
        (event.target instanceof Element &&
          event.target.closest("input,textarea,select") &&
          event.target !== viewButton.current)
      )
        return;
      event.preventDefault();
      setTableView("normal");
    };
    window.addEventListener("keydown", exitOnEscape);
    return () => {
      window.removeEventListener("keydown", exitOnEscape);
      document.body.style.overflow = before;
    };
  }, [tableView, coaching]);
  useLayoutEffect(() => {
    if (lessonAction && autoScrollLessonAction)
      lessonButton.current?.scrollIntoView({ block: "nearest" });
  }, [lessonAction?.label, autoScrollLessonAction]);
  const tableRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLElement>(null);
  const hintButton = useRef<HTMLButtonElement>(null);
  const [hint, setHint] = useState<Hint | null>(null),
    [planning, setPlanning] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    if (hint) hintRef.current?.scrollIntoView({ block: "nearest" });
  }, [hint]);
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
  const selectionKey = activeSelected.join(",");
  useTileFeedback(
    feedbackRoot,
    s,
    [tableView, rackHidden, expanded, touch, locale, selectionKey, !!hint].join(
      "|",
    ),
  );
  const destinations = useMemo(
    () =>
      coaching
        ? suggestedDestinations(
            s,
            selectionKey ? selectionKey.split(",").map(Number) : [],
          )
        : [],
    [s, selectionKey, coaching],
  );
  const guidance = turnGuidance(s, activeSelected, destinations);
  useEffect(() => {
    if (myTurn && !embedded) focusRack();
  }, [s.turn, myTurn, embedded]);
  const select = useCallback(
    (id: number) => {
      if (myTurn) {
        sound("select", muted);
        const next = selected.includes(id)
          ? selected.filter((v) => v !== id)
          : [...selected, id];
        setSelected(next);
        onSelectionChange?.(next);
      }
    },
    [selected, myTurn, muted, onSelectionChange],
  );
  const dragTile = useCallback((id: number) => {
    setSelected((current) => (current.includes(id) ? current : [id]));
  }, []);
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
  const Workspace = embedded ? "section" : "main";
  return (
    <Workspace
      id={embedded ? undefined : "main-content"}
      tabIndex={embedded ? undefined : -1}
      aria-label={embedded ? t("Practice table") : undefined}
      ref={feedbackRoot}
      aria-describedby={coachTarget ? "practice-instructions" : undefined}
      className={`game ${touch ? "touch-friendly" : ""} ${tableView === "wide" ? "table-expanded" : ""}`}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("input,textarea,select,dialog"))
          return;
        if (e.key === "Escape" && tableView === "wide") {
          e.preventDefault();
          setTableView("normal");
          return;
        }
        if (!myTurn) return;
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
      <div className="game-context">
        <div className="game-heading">
          <div>
            <span className="eyebrow turn-owner">
              {myTurn ? t("Your turn") : t(`${p.name}’s turn`)}
            </span>
            <h1>{t(myTurn ? "Your move." : `${p.name} is playing.`)}</h1>
          </div>
          <div className="game-heading-actions">
            {saveLabel && tableView === "normal" && (
              <span
                className={`save-indicator ${saveLabel === "Not saved" ? "save-error" : ""}`}
                role="status"
              >
                {t(saveLabel)}
              </span>
            )}
            <button className="text-button" onClick={onHelp}>
              {t("Rules →")}
            </button>
          </div>
        </div>
        {s.match && (
          <div className="match-bar" aria-label={t("Match scores")}>
            <span>
              {t("First to")} {s.match.target}
            </span>
            {s.players.map((player, i) => (
              <span key={i}>
                {player.name}: <strong>{s.match!.totals[i]}</strong>
              </span>
            ))}
          </div>
        )}
        {s.turnSeconds && tableView === "normal" ? (
          <p
            className={`turn-clock ${Math.max(0, (s.deadline ?? clock) - clock) < 15000 ? "urgent" : ""}`}
            role="timer"
            aria-label={t("Time left this turn")}
          >
            {t("Time left:")}{" "}
            {Math.max(0, Math.ceil(((s.deadline ?? clock) - clock) / 1000))}
            {t("s · on expiry: reset unfinished edits and ")}
            {t(s.pool.length ? "draw one" : "pass")}
          </p>
        ) : null}
        <div className="opponents">
          {s.players
            .filter((x) => x.bot)
            .map((x, i) => (
              <div
                className={`opponent ${x === p ? "is-turn" : ""}`}
                key={x.name}
              >
                <span className="avatar">{t(["✳", "◈", "✦"][i])}</span>
                <div>
                  <strong>{x.name}</strong>
                  <span>
                    {t(x.bot)} · {x.rack.length}
                    {t(" tiles")}
                    {t(x.melded ? "· opened" : "")}
                  </span>
                </div>
                {x === p && (
                  <span className="thinking" aria-label={t("Taking a turn")}>
                    •••
                  </span>
                )}
              </div>
            ))}
          <div className="pool-count">
            <strong>{s.pool.length}</strong>
            <span>{t("in the pool")}</span>
          </div>
        </div>
        {coaching && (
          <p
            id="end-turn-help"
            className="turn-help"
            hidden={!!hint || !!s.coach}
          >
            {t(guidance.endHelp)}
          </p>
        )}
        {s.coach && !hint && (
          <aside
            className="first-game-guide"
            aria-label={t("First real game guidance")}
          >
            <strong>{t("Your first real game")}</strong>
            <p>
              <span className="guide-full">{t(guidance.message)}</span>
              <span className="guide-compact">
                {t(guidance.compactMessage)}
              </span>
            </p>
            <button
              className="text-button"
              aria-label={t("Got it — hide coaching")}
              onClick={() => dispatch({ type: "dismissCoach" })}
            >
              <span className="coach-dismiss-copy">
                {t("Got it — hide coaching")}
              </span>
              <span className="coach-dismiss-icon" aria-hidden="true">
                ×
              </span>
            </button>
          </aside>
        )}
        {hint && (
          <aside
            ref={hintRef}
            className={`coach-card ${hint.table ? "" : "hint-summary"}`}
            aria-label={t("Move hint")}
          >
            <p role="status">
              {t(
                hint.table
                  ? `Possible move: ${hint.used.length} highlighted tiles.`
                  : hint.message,
              )}
            </p>
            <div className="hint-actions">
              {hint.table && (
                <button
                  className="primary"
                  onClick={() => {
                    dispatch({ type: "applyPlan", table: hint.table! });
                    setSelected([]);
                  }}
                >
                  {t("Place hint")}
                </button>
              )}
              <button
                className="text-button"
                onClick={() => {
                  setHint(null);
                  hintButton.current?.focus({ preventScroll: true });
                }}
              >
                {t("Dismiss hint")}
              </button>
            </div>
            {hint.explanations && (
              <details className="hint-reasons">
                <summary>{t("Why this works")}</summary>
                <p>{t(hint.message)}</p>
                <ul>
                  {hint.explanations.map((reason, i) => (
                    <li key={i}>{t(reason)}</li>
                  ))}
                </ul>
              </details>
            )}
          </aside>
        )}
      </div>
      <div className="table-tools">
        <label className="view-picker">
          {t("View")}
          <select
            ref={viewButton}
            aria-label={t("Table view")}
            aria-controls="meld-table player-rack"
            value={
              tableView === "normal" ? "normal" : rackHidden ? "table" : "wide"
            }
            onChange={(event) => {
              const value = event.target.value;
              setTableView(value === "normal" ? "normal" : "wide");
              setRackHidden(value === "table");
            }}
          >
            <option value="normal">{t("Standard")}</option>
            <option value="wide">{t("Full screen")}</option>
            {coaching && <option value="table">{t("Table only")}</option>}
          </select>
        </label>
        <button
          className="text-button"
          onClick={() =>
            tableRef.current?.scrollTo({ top: 0, behavior: "auto" })
          }
        >
          {t("Table start ↑")}
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
          {t("Table end ↓")}
        </button>
        <span>{t("Scroll the table to see more groups and runs.")}</span>
        {tableView === "wide" && (
          <span className="board-save" role="status">
            {t(saveLabel ?? "")}
          </span>
        )}
        {s.turnSeconds ? (
          <span
            className="board-clock"
            role="timer"
            aria-label={t("Time left this turn")}
            aria-description={t(
              s.pool.length
                ? "On expiry: unfinished edits reset, then draw one."
                : "On expiry: unfinished edits reset, then pass.",
            )}
          >
            <span className="board-clock-label">{t("Time left:")} </span>
            {Math.max(0, Math.ceil(((s.deadline ?? clock) - clock) / 1000))}
            {t("s")}
            <span className="board-expiry">
              {" "}
              → {t(s.pool.length ? "draw one" : "pass")}
            </span>
          </span>
        ) : null}
      </div>
      <section
        ref={tableRef}
        id="meld-table"
        className={`table ${tableView === "wide" ? "expanded-table" : ""}`}
        aria-label={t("Table melds")}
        tabIndex={0}
      >
        <div className="table-topline">
          <span>
            {t(
              s.lastPlaced.length
                ? "Corner dot: latest play"
                : "MAKE ROOM FOR A GOOD IDEA",
            )}
          </span>
          <span>
            {t("Round ")}
            {s.match?.round ?? 1}
            {t(" · Turn")}
            {s.turn}
          </span>
        </div>
        <div className="melds">
          {s.table.map((m) => {
            const info = inspectMeld(m.tiles);
            return (
              <div
                key={m.id}
                data-invalid-label={t("Needs fixing")}
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
                      onFocus={setFocused}
                      selected={activeSelected.includes(id)}
                      recent={s.lastPlaced.includes(id)}
                      glow={suggested.includes(id) || !!hint?.used.includes(id)}
                      represents={
                        info.values[id]
                          ? `${info.jokerColors[id]} ${info.values[id]}`
                          : undefined
                      }
                      onSelect={myTurn ? select : undefined}
                      draggable={myTurn}
                      onDrag={dragTile}
                    />
                  ))}
                </div>
                {!info.valid && (
                  <p className="meld-explanation">{t(explainMeld(m.tiles))}</p>
                )}
                <button
                  data-coach-target={coachTarget === m.id || undefined}
                  data-suggested-destination={
                    destinations.includes(m.id) || undefined
                  }
                  className="meld-target"
                  disabled={!myTurn || !activeSelected.length}
                  onClick={() => move(m.id)}
                  aria-label={t(
                    `Add selected tiles to meld ${s.table.indexOf(m) + 1}`,
                  )}
                >
                  {t(
                    info.valid
                      ? `${info.kind} · ${info.points} pts`
                      : "Incomplete group or run",
                  )}{" "}
                  <span>＋</span>
                </button>
              </div>
            );
          })}
          <button
            data-coach-target={coachTarget === "new" || undefined}
            data-suggested-destination={
              destinations.includes("new") || undefined
            }
            className="new-meld"
            disabled={!myTurn}
            onClick={() => move("new")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => drop(e, "new")}
          >
            <span>＋</span>
            {t("New group or run")}
            <small>
              {t(
                activeSelected.length
                  ? `Place ${activeSelected.length} selected`
                  : "Select tiles, then place here",
              )}
            </small>
          </button>
        </div>
        {!s.table.length && (
          <div className="empty-table">
            <span>✳</span>
            <h2>
              {t("Every good game")}
              <br />
              {t("starts with a possibility.")}
            </h2>
            <p>{t("Open with 30 points from your rack.")}</p>
          </div>
        )}
      </section>
      {myTurn && !p.melded && check.played.length > 0 && (
        <p className="opening-breakdown">
          {t("Opening points:")}{" "}
          {t(
            s.table
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
              .join("; "),
          )}
          {t(". Need at least 30.")}
        </p>
      )}
      <div className="status-line" role="status" aria-live="polite">
        <span className={`status-dot ${myTurn ? "" : "waiting"}`} />
        {t(
          myTurn
            ? p.melded
              ? `${check.played.length} tile${check.played.length === 1 ? "" : "s"} played this turn`
              : `Opening meld: ${check.points} / 30 points`
            : `${p.name} is finding a move…`,
        )}
        {myTurn && !check.valid && check.played.length > 0 && (
          <span className="warning">{t(check.reason)}</span>
        )}
      </div>
      <div className="player-dock">
        <section
          id="player-rack"
          hidden={tableView === "wide" && rackHidden}
          className={`rack ${expanded ? "expanded-rack" : ""}`}
          aria-label={t("Your rack")}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => drop(e, "rack")}
        >
          <div className="rack-heading">
            <div>
              <strong>
                {human.name}
                {t("’s rack")}
              </strong>
              <span>
                {human.rack.length}
                {t(" tiles")}{" "}
                {t(human.melded ? "· opened" : "· not opened yet")}
              </span>
            </div>
            <div className="sort">
              <button onClick={() => setExpanded((x) => !x)}>
                {t(expanded ? "Compact rack" : "Expand rack")}
              </button>
              <span>{t("Sort")}</span>
              <button
                disabled={!myTurn}
                onClick={() => act({ type: "sortRack", by: "color" })}
              >
                {t("Colour")}
              </button>
              <button
                disabled={!myTurn}
                onClick={() => act({ type: "sortRack", by: "number" })}
              >
                {t("Number")}
              </button>
            </div>
          </div>
          <div
            className="rack-tiles"
            ref={rackRef}
            role="group"
            aria-label={t("Your tiles. Use left and right arrows to navigate.")}
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
                onFocus={setFocused}
                selected={activeSelected.includes(id)}
                glow={suggested.includes(id) || !!hint?.used.includes(id)}
                onSelect={myTurn ? select : undefined}
                draggable={myTurn}
                onDrag={dragTile}
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
              {t("Place selected")}
            </button>
            <button className="text-button" onClick={() => setSelected([])}>
              {t("Deselect all")}
            </button>
          </div>
        )}
        <div className="action-bar">
          <div className="turn-tools">
            <button
              className="text-button"
              aria-label={t("Undo move")}
              disabled={!myTurn || !s.history?.length}
              onClick={() => act({ type: "undo" })}
            >
              {t("Undo")}
            </button>
            {coaching && (
              <button
                className="text-button"
                ref={hintButton}
                aria-label={t(
                  planning ? "Finding a move…" : "Show a possible move",
                )}
                disabled={!myTurn || planning}
                onClick={askHint}
              >
                {t(planning ? "Thinking…" : "Hint")}
              </button>
            )}
            <button
              className="text-button"
              aria-label={t("Reset turn")}
              data-coach-target={coachTarget === "reset" || undefined}
              disabled={!myTurn}
              onClick={() => act({ type: "resetTurn" })}
            >
              {t("Reset")}
            </button>
            {activeSelected.length > 0 && (
              <button
                className="text-button mobile-clear"
                aria-label={t("Deselect all")}
                onClick={() => setSelected([])}
              >
                {t("Clear")}
              </button>
            )}
            <details className="more-actions">
              <summary>{t("More")}</summary>
              <div>
                {coaching && (
                  <ReadAloud
                    reminder
                    text={`${t(guidance.message)} ${t(guidance.endHelp)}`}
                  />
                )}
                {coaching && (
                  <details className="current-turn-help">
                    <summary>{t("What can I do now?")}</summary>
                    <p>{t(guidance.message)}</p>
                    <p>{t(guidance.endHelp)}</p>
                    {s.log.length > 0 && (
                      <p>
                        <strong>{t("Last completed turn:")}</strong>{" "}
                        {t(s.log.at(-1)!)}
                      </p>
                    )}
                    {s.lastPlaced.length > 0 && (
                      <p>
                        {t("Marked tiles show the latest play on the table.")}
                      </p>
                    )}
                  </details>
                )}
                {s.match && (
                  <details className="compact-match-scores">
                    <summary>{t("Match scores")}</summary>
                    <p>
                      {t("Round ")}
                      {s.match.round} · {t("First to")} {s.match.target}
                    </p>
                    {s.players.map((player, i) => (
                      <p key={i}>
                        {player.name}: <strong>{s.match!.totals[i]}</strong>
                      </p>
                    ))}
                  </details>
                )}
                <div
                  className="focused-rack-options"
                  role="group"
                  aria-label={t("Sort")}
                >
                  <button
                    className="text-button"
                    disabled={!myTurn}
                    onClick={() => act({ type: "sortRack", by: "color" })}
                  >
                    {t("Colour")}
                  </button>
                  <button
                    className="text-button"
                    disabled={!myTurn}
                    onClick={() => act({ type: "sortRack", by: "number" })}
                  >
                    {t("Number")}
                  </button>
                </div>
                <button
                  className="text-button"
                  disabled={!myTurn || !activeSelected.length}
                  onClick={() => move("rack")}
                >
                  {t("Return selected tiles to rack")}
                </button>
                <details className="turn-actions-help">
                  <summary>{t("Reset, Draw and Pass explained")}</summary>
                  <p>
                    {t(
                      "Reset puts this turn back as it was. You keep your turn and draw no penalty tiles.",
                    )}
                  </p>
                  <p>
                    {t(
                      "Draw restores unfinished edits, adds one tile to your rack and ends your turn.",
                    )}
                  </p>
                  <p>
                    {t(
                      "Pass is available when the pool is empty. It restores unfinished edits and ends your turn without adding a tile.",
                    )}
                  </p>
                </details>
                <details className="move-history">
                  <summary>{t("Move history")}</summary>
                  {s.log.map((line, i) => (
                    <p key={i}>{t(line)}</p>
                  ))}
                </details>
              </div>
            </details>
            <span className="selection-count" role="status">
              {t(
                activeSelected.length
                  ? `${activeSelected.length} selected`
                  : "Select tiles",
              )}
            </span>
          </div>
          <div className="primary-actions">
            {lessonAction ? (
              <button
                ref={lessonButton}
                className="primary"
                aria-describedby={
                  coachTarget ? "practice-instructions" : undefined
                }
                onClick={lessonAction.onClick}
              >
                {t(lessonAction.label)}
              </button>
            ) : (
              <>
                <button
                  className="secondary"
                  disabled={!myTurn}
                  data-coach-target={coachTarget === "draw" || undefined}
                  onClick={() => act({ type: "draw" })}
                >
                  {t(s.pool.length ? "Draw a tile" : "Pass")} ↓
                </button>
                <button
                  className={`primary ${!check.valid && dirty ? "danger" : ""}`}
                  disabled={!myTurn || (!check.played.length && !dirty)}
                  data-coach-target={coachTarget === "end" || undefined}
                  aria-describedby={coaching ? "end-turn-help" : undefined}
                  onClick={() => act({ type: "endTurn" })}
                >
                  {t(
                    check.valid || !dirty
                      ? "End turn →"
                      : "+3 tiles · End turn",
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {s.notice && (
        <p className="game-notice" role="status">
          {t(narrate ? narrateMove(s) : s.notice)}
        </p>
      )}
    </Workspace>
  );
}
