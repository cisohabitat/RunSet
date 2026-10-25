import { lazy, Suspense, useEffect, useReducer, useState } from "react";
import {
  type GameState,
  type Difficulty,
  type Action,
  reducer,
  newGame,
  results,
  turnCheck,
} from "./engine/game";
import { runPlanner } from "./lib/planner";
import { deleteGame, loadGame, saveGame } from "./lib/storage";
import { sound } from "./lib/sound";
import { Home } from "./ui/Home";
import { Setup } from "./ui/Setup";
import { HowToPlay } from "./ui/HowToPlay";
import { Game } from "./ui/Game";
import { GameOver } from "./ui/GameOver";
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
    if (game && !saveGame(game))
      setNotice("Browser storage is unavailable. This round cannot be saved.");
  }, [game]);
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
            dispatchBase({ type: "botTurn", table });
        })
        .catch(() => {
          if (!controller.signal.aborted) dispatchBase({ type: "draw" });
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
  const dispatch = (a: Action) => {
    if (a.type === "endTurn" && learning && game && !turnCheck(game).valid) {
      setConfirmation({ kind: "penalty" });
      return;
    }
    if (a.type === "move") sound("place", muted);
    else if (a.type === "draw") sound("draw", muted);
    else if (a.type === "endTurn" && game && !turnCheck(game).valid)
      sound("invalid", muted);
    else sound("select", muted);
    dispatchBase(a);
  };
  const start = (name: string, bots: number, d: Difficulty) => {
    const next = newGame(name, bots, d);
    if (game) {
      setConfirmation({ kind: "replace", next });
      return;
    }
    dispatchBase({ type: "start", game: next });
    setScreen("game");
  };
  const help = () => {
    setHelpBack(screen);
    setScreen("help");
  };
  return (
    <>
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
          onConfirm={() => {
            if (confirmation.kind === "penalty") {
              dispatchBase({ type: "endTurn" });
            } else if (confirmation.kind === "delete") {
              if (!deleteGame()) {
                setNotice(
                  "The saved game could not be deleted. Your progress is still available.",
                );
                return;
              }
              dispatchBase({ type: "clear" });
              setScreen("home");
            } else if (confirmation.next) {
              dispatchBase({ type: "start", game: confirmation.next });
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
          hasSave={!!game && game.phase === "playing"}
          game={game}
          onDelete={() => setConfirmation({ kind: "delete" })}
          onLearn={() => setScreen("learn")}
        />
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
            onPlay={() => start("You", 1, "easy")}
          />
        </Suspense>
      )}
      {screen === "game" && game && (
        <nav
          className={`game-menu ${touch ? "touch-friendly" : ""}`}
          aria-label="Game menu"
        >
          <button
            className="text-button"
            onClick={() => {
              const human = game.players.find((p) => !p.bot)!;
              start(
                human.name,
                game.players.length - 1,
                game.players.find((p) => p.bot)?.bot ?? "normal",
              );
            }}
          >
            Restart with same players
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
            onClick={() => setConfirmation({ kind: "delete" })}
          >
            Delete saved game
          </button>
          <button className="text-button" onClick={() => setScreen("learn")}>
            Practice without losing this game
          </button>
        </nav>
      )}
      {screen === "help" && <HowToPlay onBack={() => setScreen(helpBack)} />}
      {screen === "game" &&
        game &&
        (game.phase === "over" ? (
          <GameOver
            game={game}
            onNew={() => setScreen("setup")}
            onHome={() => setScreen("home")}
          />
        ) : (
          <Game
            narrate={narrate}
            touch={touch}
            key={`${game.seed}-${game.turn}`}
            game={game}
            dispatch={dispatch}
            onHelp={help}
          />
        ))}
      <Offline beforeUpdate={() => !game || saveGame(game)} />
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
    </>
  );
}
