import { LanguageSwitch, useI18n } from "./i18n/I18n";
import { lazy, Suspense, useEffect, useReducer, useRef, useState } from "react";
import {
  type GameState,
  type Difficulty,
  type GameOptions,
  type Action,
  reducer,
  newGame,
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
import { settingsForGame, type GameSettings } from "./lib/gameSettings";
import { sound, primeAudio, transitionCue } from "./lib/sound";
import { useScreenFocus } from "./ui/useScreenFocus";
import { Home } from "./ui/Home";
const Setup = lazy(() =>
  import("./ui/Setup").then((module) => ({ default: module.Setup })),
);
const HowToPlay = lazy(() =>
  import("./ui/HowToPlay").then((module) => ({ default: module.HowToPlay })),
);
const Game = lazy(() =>
  import("./ui/Game").then((module) => ({ default: module.Game })),
);
const GameOver = lazy(() =>
  import("./ui/GameOver").then((module) => ({ default: module.GameOver })),
);
const Settings = lazy(() => import("./ui/Settings"));
import { SaveTools } from "./ui/SaveTools";
import { Offline } from "./ui/Offline";
import { ConfirmDialog } from "./ui/ConfirmDialog";
const Tutorial = lazy(() => import("./ui/Tutorial"));
const Exercises = lazy(() => import("./ui/Exercises"));
type Screen = "home" | "setup" | "help" | "game" | "learn" | "exercises";
const initial = loadGame();
export default function App() {
  const { t, locale } = useI18n();
  const [screen, setScreen] = useState<Screen>("home"),
    [helpBack, setHelpBack] = useState<Screen>("home");
  useScreenFocus(screen);
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
  const [setupPreset, setSetupPreset] = useState<GameSettings>();
  const openSetup = (source?: GameState) => {
    setSetupPreset(source ? settingsForGame(source) : undefined);
    setScreen("setup");
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reading, setReading] = useState(() => {
    try {
      return localStorage.getItem("runset.reading") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("runset.reading", String(reading));
    } catch {
      /* Optional view preference. */
    }
  }, [reading]);
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
      settingsOpen ||
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
  }, [game, screen, confirmation, settingsOpen, pace]);
  const audibleGame = useRef(game);
  useEffect(() => {
    const cue = transitionCue(audibleGame.current, game);
    audibleGame.current = game;
    if (screen === "game" && cue) sound(cue, muted);
  }, [game, screen, muted]);
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
    if (
      game?.turnSeconds &&
      game.deadline !== undefined &&
      a.at >= game.deadline
    ) {
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
  const replay = () => {
    if (!game) return;
    const { name, bots, difficulty, ...options } = settingsForGame(game);
    start(name, bots, difficulty, options);
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
        <summary aria-label={t("Game menu")}>
          <span className="desktop-word">{t("Game")}</span> {t("Menu")}
        </summary>
        <nav className="game-menu-content" aria-label={t("Game options")}>
          {" "}
          <button
            className="text-button"
            data-menu-action
            onClick={() => replay()}
          >
            {t(
              game.phase === "over"
                ? "Rematch with same players"
                : "Restart with same players",
            )}
          </button>
          <button
            className="text-button"
            data-menu-action
            onClick={() => setSettingsOpen(true)}
          >
            {t("Settings")}
          </button>
          <button
            className="text-button danger-text"
            data-menu-action
            onClick={() => setConfirmation({ kind: "delete" })}
          >
            {t("Delete saved game")}
          </button>
          <button
            className="text-button"
            data-menu-action
            onClick={() => setScreen("learn")}
          >
            {t("Practice without losing this game")}
          </button>
          <details className="keyboard-guide">
            <summary>{t("Keyboard controls")}</summary>
            <p>
              {t(
                "Use left/right arrows or Home/End within tiles. Space selects. N places selected tiles in a new group or run. Ctrl/⌘ Z undoes. Escape clears selection. H asks for a hint.",
              )}
            </p>
          </details>
          <SaveTools game={game} onRestore={restore} />
          <Offline beforeUpdate={() => !game || saveGame(game)} />
        </nav>
      </details>
    ) : null;
  return (
    <div
      onPointerDownCapture={() => {
        if (!muted) primeAudio();
      }}
      onKeyDownCapture={() => {
        if (!muted) primeAudio();
      }}
      className={`app ${reading ? "comfortable-reading" : ""} ${screen === "game" && game?.phase === "playing" ? "playing" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        {t("Skip to content")}
      </a>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => setScreen("home")}
          aria-label={t("RunSet home")}
        >
          <span className="brand-icon">
            {t("r")}
            <span>◆</span>
          </span>
          {t("runset")}
          <span className="brand-period">.</span>
        </button>
        <div className="header-right">
          <LanguageSwitch />
          {gameMenu}
          <span className="header-tag">{t("A GOOD TIME, WELL PLAYED.")}</span>
          <button
            className="sound-button"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
          >
            {t("Settings")}
          </button>
          {screen !== "home" && (
            <button className="text-button" onClick={() => setScreen("home")}>
              {t("Home")}
            </button>
          )}
        </div>
      </header>
      {settingsOpen && (
        <Suspense
          fallback={
            <p role="status" className="notice">
              {t("Loading settings…")}
            </p>
          }
        >
          <Settings
            reading={reading}
            setReading={setReading}
            touch={touch}
            setTouch={setTouch}
            muted={muted}
            setMuted={setMuted}
            learning={learning}
            setLearning={setLearning}
            narrate={narrate}
            setNarrate={setNarrate}
            pace={pace}
            setPace={setPace}
            timed={
              !!game?.turnSeconds &&
              screen === "game" &&
              game.phase === "playing"
            }
            onClose={() => setSettingsOpen(false)}
          />
        </Suspense>
      )}
      {confirmation && (
        <ConfirmDialog
          title={t(
            confirmation.kind === "penalty"
              ? "This turn would draw penalty tiles"
              : confirmation.kind === "delete"
                ? "Delete this saved game?"
                : "Replace your saved game?",
          )}
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
                {t(turnCheck(game).reason)}
                {t(
                  " Ending now restores your moves and draws up to three penalty tiles.",
                )}
              </p>
              <button
                className="secondary"
                onClick={() => {
                  dispatchBase({ type: "resetTurn" });
                  setConfirmation(null);
                }}
              >
                {t("Reset turn instead")}
              </button>
            </>
          ) : confirmation.kind === "replace" &&
            game?.phase === "over" &&
            !confirmation.preserveDeadline ? (
            <p>
              {t(
                "A fresh game replaces this saved result. The new deal starts at round 1 with zero match scores; your display and sound preferences stay the same.",
              )}
            </p>
          ) : (
            <p>
              {t("Your progress")}{" "}
              {t(
                confirmation.kind === "delete"
                  ? "will be removed"
                  : "will be replaced",
              )}{" "}
              {t("on this browser. Sound and learning preferences are kept.")}
            </p>
          )}
          {notice && <p role="alert">{t(notice)}</p>}
        </ConfirmDialog>
      )}
      {notice && (
        <div className="notice" role="status">
          {t(notice)}
          <button
            aria-label={t("Dismiss notice")}
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      {screen === "home" && (
        <Home
          onNew={() => openSetup()}
          onContinue={() => setScreen("game")}
          onHelp={help}
          hasSave={!!game}
          game={game}
          onDelete={() => setConfirmation({ kind: "delete" })}
          onLearn={() => setScreen("learn")}
          onExercises={() => setScreen("exercises")}
        />
      )}
      {screen === "home" && (
        <>
          <p className="home-save-status" role="status">
            {t(saveStatus)}
          </p>
          <SaveTools game={game} onRestore={restore} />
        </>
      )}
      {screen === "setup" && (
        <Suspense
          fallback={<p className="page">{t("Preparing game setup…")}</p>}
        >
          <Setup
            onStart={start}
            onBack={() => setScreen("home")}
            hasSave={!!game && game.phase === "playing"}
            initial={setupPreset}
          />
        </Suspense>
      )}
      {screen === "learn" && (
        <Suspense
          fallback={
            <p className="page">{t("Preparing your practice table…")}</p>
          }
        >
          <Tutorial
            muted={muted}
            onExit={() => setScreen("home")}
            onPlay={() =>
              start(locale === "zh-CN" ? "你" : "You", 1, "easy", {
                coach: true,
              })
            }
          />
        </Suspense>
      )}

      {screen === "exercises" && (
        <Suspense
          fallback={
            <p className="page">{t("Preparing your practice table…")}</p>
          }
        >
          <Exercises muted={muted} onExit={() => setScreen("home")} />
        </Suspense>
      )}
      {screen === "help" && (
        <Suspense fallback={<p className="page">{t("Loading rules…")}</p>}>
          <HowToPlay onBack={() => setScreen(helpBack)} />
        </Suspense>
      )}
      {screen === "game" &&
        game &&
        (game.phase === "over" ? (
          <Suspense fallback={<p className="page">{t("Loading results…")}</p>}>
            <GameOver
              onNextRound={() =>
                dispatchBase({ type: "nextRound", at: Date.now() })
              }
              game={game}
              onNew={() => openSetup(game)}
              onReplay={replay}
              onHome={() => setScreen("home")}
            />
          </Suspense>
        ) : (
          <Suspense
            fallback={<p className="page">{t("Preparing game table…")}</p>}
          >
            <Game
              muted={muted}
              saveLabel={saveStatus}
              narrate={narrate}
              touch={touch || reading}
              key={`${game.seed}-${game.turn}`}
              game={game}
              dispatch={dispatch}
              onHelp={help}
            />
          </Suspense>
        ))}
      {screen !== "game" && (
        <Offline beforeUpdate={() => !game || saveGame(game)} />
      )}
      <footer className="site-footer">
        <span>
          {t("runset.")}{" "}
          <span className="footer-note">
            {t("A classic game. A fresh perspective.")}
          </span>
        </span>
        <button className="text-button" onClick={help}>
          {t("How to play →")}
        </button>
        <span>{t("MADE FOR THE LOVE OF THE GAME")}</span>
      </footer>
    </div>
  );
}
