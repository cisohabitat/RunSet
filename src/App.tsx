import { lazy, Suspense, useEffect, useReducer, useRef, useState } from "react";
import {
  type GameState,
  type Difficulty,
  type GameOptions,
  type Action,
  reducer,
  newGame,
  results,
  turnCheck,
} from "./engine/game";
import { runPlanner } from "./lib/planner";
import {
  deleteGame,
  loadGame,
  persistGame,
  saveGame,
  SAVE_KEY,
} from "./lib/storage";
import { sound } from "./lib/sound";
import { Home } from "./ui/Home";
import { Setup } from "./ui/Setup";
import { HowToPlay } from "./ui/HowToPlay";
import { Game } from "./ui/Game";
import { GameOver } from "./ui/GameOver";
import { SaveTools } from "./ui/SaveTools";
import { Offline } from "./ui/Offline";
import { ConfirmDialog } from "./ui/ConfirmDialog";
const Tutorial = lazy(() => import("./ui/Tutorial"));
type Screen = "home" | "setup" | "help" | "game" | "learn";
const initial = loadGame();
export default function App() {
  const [screen, setScreen] = useState<Screen>("home"),
    [helpBack, setHelpBack] = useState<Screen>("home");
  const [game, dispatchBase] = useReducer(
    (
      s: GameState | null,
      a: Action | { type: "start"; game: GameState } | { type: "clear" },
    ) =>
      a.type === "clear"
        ? null
        : a.type === "start"
          ? a.game
          : s
            ? reducer(s, a)
            : null,
    initial.game,
  );
  const [confirmation, setConfirmation] = useState<{
    kind: "delete" | "replace" | "penalty";
    next?: GameState;
    preserveDeadline?: boolean;
    expectedTurn?: number;
    expectedSeed?: number;
  } | null>(null);
  const [learning, setLearning] = useState(() => {
    try {
      return localStorage.getItem("runset.learning") !== "false";
    } catch {
      return true;
    }
  });
  const [narrate, setNarrate] = useState(() => {
    try {
      return localStorage.getItem("runset.narrate") !== "false";
    } catch {
      return true;
    }
  });
  const [pace, setPace] = useState(() => {
    try {
      const n = Number(localStorage.getItem("runset.pace"));
      return [700, 1400, 2400].includes(n) ? n : 1400;
    } catch {
      return 1400;
    }
  });
  const [touch, setTouch] = useState(() => {
    try {
      return localStorage.getItem("runset.largeTiles") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("runset.largeTiles", String(touch));
    } catch {
      /* Optional view preference. */
    }
  }, [touch]);
  useEffect(() => {
    try {
      localStorage.setItem("runset.learning", String(learning));
      localStorage.setItem("runset.narrate", String(narrate));
      localStorage.setItem("runset.pace", String(pace));
    } catch {
      /* Optional preferences. */
    }
  }, [learning, narrate, pace]);
  const skipSave = useRef<GameState | null | undefined>(undefined);
  const [storageBusy, setStorageBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState(
    initial.game ? "Saved" : "No saved game",
  );
  const [notice, setNotice] = useState(initial.notice);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("runset.muted") === "true";
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("runset.muted", String(muted));
    } catch {
      /* Optional preference. */
    }
  }, [muted]);
  useEffect(() => {
    if (!game) {
      setSaveStatus("No saved game");
      return;
    }
    if (skipSave.current === game) {
      skipSave.current = undefined;
      setSaveStatus("Saved");
      return;
    }
    let active = true;
    setSaveStatus("Saving…");
    void persistGame(game).then((result) => {
      if (!active) return;
      if (result.ok) {
        setSaveStatus("Saved");
        return;
      }
      setSaveStatus(
        result.reason === "conflict" ? "Changed in another tab" : "Not saved",
      );
      if (result.reason === "conflict") {
        const remote = loadGame();
        skipSave.current = remote.game;
        dispatchBase(
          remote.game
            ? { type: "start", game: remote.game }
            : { type: "clear" },
        );
        setConfirmation(null);
        setNotice(
          "This game changed in another tab. The latest saved position has been loaded.",
        );
      } else
        setNotice(
          result.reason === "invalid"
            ? "This position failed validation and was not saved. Your previous saved game is preserved."
            : "Browser storage is unavailable. This round cannot be saved.",
        );
    });
    return () => {
      active = false;
    };
  }, [game]);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== SAVE_KEY && event.key !== null) return;
      const remote = loadGame();
      setSaveStatus(remote.game ? "Saved" : "No saved game");
      skipSave.current = remote.game;
      setConfirmation(null);
      dispatchBase(
        remote.game ? { type: "start", game: remote.game } : { type: "clear" },
      );
      setNotice(
        remote.game
          ? "Updated to the game saved in another tab."
          : "The saved game was deleted in another tab.",
      );
      if (!remote.game)
        setScreen((current) => (current === "game" ? "home" : current));
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);
  useEffect(() => {
    if (
      screen !== "game" ||
      confirmation ||
      !game ||
      game.phase !== "playing" ||
      !game.players[game.current].bot
    )
      return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      runPlanner(game, "bot", controller.signal)
        .then((table) => {
          if (!controller.signal.aborted)
            dispatchBase({ type: "botTurn", table, at: Date.now() });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            dispatchBase({ type: "draw", at: Date.now() });
        });
    }, pace);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [game, screen, confirmation, pace]);
  useEffect(() => {
    if (screen !== "game" || !game) return;
    if (game.phase === "over")
      sound(results(game).find((p) => p.winner)?.bot ? "lose" : "win", muted);
    else if (!game.players[game.current].bot) sound("turn", muted);
  }, [game?.turn, game?.phase, screen, muted]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);
  useEffect(() => {
    if (screen !== "game" || !game?.turnSeconds || game.phase !== "playing")
      return;
    const tick = () => dispatchBase({ type: "tick", now: Date.now() });
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [screen, game?.seed, game?.phase, game?.turnSeconds]);
  useEffect(() => {
    if (
      confirmation?.kind === "penalty" &&
      (game?.turn !== confirmation.expectedTurn || game?.phase !== "playing")
    )
      setConfirmation(null);
  }, [game?.turn, game?.phase, confirmation]);
  const dispatch = (action: Action) => {
    const a = { ...action, at: Date.now() };
    if (game?.turnSeconds && game.deadline !== undefined && a.at >= game.deadline) {
      dispatchBase(a);
      return;
    }
    if (a.type === "endTurn" && learning && game && !turnCheck(game).valid) {
      setConfirmation({
        kind: "penalty",
        expectedTurn: game.turn,
        expectedSeed: game.seed,
      });
      return;
    }
    if (a.type === "move") sound("place", muted);
    else if (a.type === "draw") sound("draw", muted);
    else if (a.type === "endTurn" && game && !turnCheck(game).valid)
      sound("invalid", muted);
    else sound("select", muted);
    dispatchBase(a);
  };
  const start = (
    name: string,
    bots: number,
    d: Difficulty,
    options: GameOptions = {},
  ) => {
    const next = newGame(name, bots, d, Date.now(), {
      ...options,
      now: Date.now(),
    });
    if (game) {
      setConfirmation({ kind: "replace", next });
      return;
    }
    dispatchBase({ type: "start", game: next });
    setScreen("game");
  };
  const restore = (restored: GameState) => {
    if (game) {
      setConfirmation({
        kind: "replace",
        next: restored,
        preserveDeadline: true,
      });
    } else {
      dispatchBase({ type: "start", game: restored });
      setScreen("game");
    }
    setNotice(
      "The backup has been validated. Saved games keep their original turn and timer.",
    );
  };
  const help = () => {
    setHelpBack(screen);
    setScreen("help");
  };
  const gameMenu =
    screen === "game" && game ? (
      <details
        className="game-dropdown"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.currentTarget.open = false;
            e.currentTarget.querySelector<HTMLElement>("summary")?.focus();
          }
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-menu-action]"))
            e.currentTarget.open = false;
        }}
      >
        <summary aria-label="Game menu">
          <span className="desktop-word">Game </span>Menu
        </summary>
        <nav className="game-menu-content" aria-label="Game options">
          {" "}
          <button
            className="text-button"
            data-menu-action
            onClick={() => {
              const human = game.players.find((p) => !p.bot)!;
              start(
                human.name,
                game.players.length - 1,
                game.players.find((p) => p.bot)?.bot ?? "normal",
                {
                  target: (game.match?.target ?? 0) as GameOptions["target"],
                  turnSeconds: game.turnSeconds,
                },
              );
            }}
          >
            {game.phase === "over"
              ? "Rematch with same players"
              : "Restart with same players"}
          </button>
          <details className="preferences">
            <summary>Playing options</summary>
            <label>
              <input
                type="checkbox"
                checked={learning}
                onChange={(e) => setLearning(e.target.checked)}
              />{" "}
              Explain penalties before ending a turn
            </label>
            <label>
              <input
                type="checkbox"
                checked={narrate}
                onChange={(e) => setNarrate(e.target.checked)}
              />{" "}
              Explain opponent moves
            </label>
            <label>
              <input
                type="checkbox"
                checked={touch}
                onChange={(e) => setTouch(e.target.checked)}
              />{" "}
              Larger touch controls
            </label>
            <label>
              Opponent pace{" "}
              <select
                value={pace}
                onChange={(e) => setPace(Number(e.target.value))}
              >
                <option value={700}>Quick</option>
                <option value={1400}>Comfortable</option>
                <option value={2400}>Take my time</option>
              </select>
            </label>
          </details>
          <button
            className="text-button"
            data-menu-action
            onClick={() => setConfirmation({ kind: "delete" })}
          >
            Delete saved game
          </button>
          <button
            className="text-button"
            data-menu-action
            onClick={() => setScreen("learn")}
          >
            Practice without losing this game
          </button>
          <details className="keyboard-guide">
            <summary>Keyboard controls</summary>
            <p>
              Use left/right arrows or Home/End within tiles. Space selects. N
              places selected tiles in a new group or run. Ctrl/⌘ Z undoes.
              Escape clears selection. H asks for a hint.
            </p>
          </details>
          <SaveTools game={game} onRestore={restore} />
          <Offline beforeUpdate={() => !game || saveGame(game)} />
        </nav>
      </details>
    ) : null;
  return (
    <div
      className={`app ${screen === "game" && game?.phase === "playing" ? "playing" : ""}`}
    >
      <header className="site-header">
        <button
          className="brand"
          onClick={() => setScreen("home")}
          aria-label="RunSet home"
        >
          <span className="brand-icon">
            r<span>◆</span>
          </span>
          runset<span className="brand-period">.</span>
        </button>
        <div className="header-right">
          {gameMenu}
          <span className="header-tag">A GOOD TIME, WELL PLAYED.</span>
          <button
            className="sound-button"
            onClick={() => setMuted((x) => !x)}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            aria-pressed={muted}
          >
            {muted ? "♪ Off" : "♫ On"}
          </button>
          {screen !== "home" && (
            <button className="text-button" onClick={() => setScreen("home")}>
              Home
            </button>
          )}
        </div>
      </header>
      {confirmation && (
        <ConfirmDialog
          title={
            confirmation.kind === "penalty"
              ? "This turn would draw penalty tiles"
              : confirmation.kind === "delete"
                ? "Delete this saved game?"
                : "Replace your saved game?"
          }
          cancelLabel={
            confirmation.kind === "penalty" ? "Keep editing" : "Keep game"
          }
          confirmLabel={
            confirmation.kind === "penalty"
              ? "End turn +3 tiles"
              : confirmation.kind === "delete"
                ? "Delete game"
                : "Start new game"
          }
          onCancel={() => {
            setConfirmation(null);
            setNotice("");
          }}
          busy={storageBusy}
          onConfirm={async () => {
            if (storageBusy) return;
            if (confirmation.kind === "penalty") {
              if (
                !game ||
                game.turn !== confirmation.expectedTurn ||
                game.seed !== confirmation.expectedSeed ||
                game.phase !== "playing"
              ) {
                setConfirmation(null);
                setNotice("That turn has already ended.");
                return;
              }
              dispatchBase({ type: "endTurn", at: Date.now() });
            } else if (confirmation.kind === "delete") {
              setStorageBusy(true);
              const deleted = await deleteGame();
              setStorageBusy(false);
              if (!deleted) {
                setNotice(
                  "The saved game could not be deleted. Your progress is still available.",
                );
                return;
              }
              dispatchBase({ type: "clear" });
              setScreen("home");
            } else if (confirmation.next) {
              const next = confirmation.next;
              dispatchBase({
                type: "start",
                game: {
                  ...next,
                  ...(!confirmation.preserveDeadline && next.turnSeconds
                    ? { deadline: Date.now() + next.turnSeconds * 1000 }
                    : {}),
                },
              });
              setScreen("game");
            }
            setConfirmation(null);
            setNotice("");
          }}
        >
          {confirmation.kind === "penalty" && game ? (
            <>
              <p>
                {turnCheck(game).reason} Ending now restores your moves and
                draws up to three penalty tiles.
              </p>
              <button
                className="secondary"
                onClick={() => {
                  dispatchBase({ type: "resetTurn" });
                  setConfirmation(null);
                }}
              >
                Reset turn instead
              </button>
            </>
          ) : (
            <p>
              Your progress{" "}
              {confirmation.kind === "delete"
                ? "will be removed"
                : "will be replaced"}{" "}
              on this browser. Sound and learning preferences are kept.
            </p>
          )}
          {notice && <p role="alert">{notice}</p>}
        </ConfirmDialog>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {screen === "home" && (
        <Home
          onNew={() => setScreen("setup")}
          onContinue={() => setScreen("game")}
          onHelp={help}
          hasSave={!!game}
          game={game}
          onDelete={() => setConfirmation({ kind: "delete" })}
          onLearn={() => setScreen("learn")}
        />
      )}
      {screen === "home" && (
        <>
          <p className="home-save-status" role="status">
            {saveStatus}
          </p>
          <SaveTools game={game} onRestore={restore} />
        </>
      )}
      {screen === "setup" && (
        <Setup
          onStart={start}
          onBack={() => setScreen("home")}
          hasSave={!!game && game.phase === "playing"}
        />
      )}
      {screen === "learn" && (
        <Suspense
          fallback={<p className="page">Preparing your practice table…</p>}
        >
          <Tutorial
            onExit={() => setScreen("home")}
            onPlay={() => start("You", 1, "easy", { coach: true })}
          />
        </Suspense>
      )}

      {screen === "help" && <HowToPlay onBack={() => setScreen(helpBack)} />}
      {screen === "game" &&
        game &&
        (game.phase === "over" ? (
          <GameOver
            onNextRound={() =>
              dispatchBase({ type: "nextRound", at: Date.now() })
            }
            game={game}
            onNew={() => setScreen("setup")}
            onHome={() => setScreen("home")}
          />
        ) : (
          <Game
            saveLabel={saveStatus}
            narrate={narrate}
            touch={touch}
            key={`${game.seed}-${game.turn}`}
            game={game}
            dispatch={dispatch}
            onHelp={help}
          />
        ))}
      {screen !== "game" && (
        <Offline beforeUpdate={() => !game || saveGame(game)} />
      )}
      <footer className="site-footer">
        <span>
          runset.{" "}
          <span className="footer-note">
            A classic game. A fresh perspective.
          </span>
        </span>
        <button className="text-button" onClick={help}>
          How to play ↗
        </button>
        <span>MADE FOR THE LOVE OF THE GAME</span>
      </footer>
    </div>
  );
}
