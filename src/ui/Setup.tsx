import { useState } from "react";
import type { Difficulty, GameOptions } from "../engine/game";
export function Setup({
  onStart,
  onBack,
  hasSave,
}: {
  onStart: (
    name: string,
    bots: number,
    difficulty: Difficulty,
    options?: GameOptions,
  ) => void;
  onBack: () => void;
  hasSave: boolean;
}) {
  const [target, setTarget] = useState<0 | 100 | 200 | 500>(0),
    [turnSeconds, setTurnSeconds] = useState<0 | 60 | 120>(0);
  const [name, setName] = useState("You"),
    [bots, setBots] = useState(2),
    [difficulty, setDifficulty] = useState<Difficulty>("normal");
  return (
    <main className="page setup">
      <button className="text-button" onClick={onBack}>
        ← Back
      </button>
      <div className="eyebrow">PULL UP A CHAIR</div>
      <h1>
        Your table.
        <br />
        <em>Your pace.</em>
      </h1>
      <p>Settle in for a round or a longer match of tile-rummy.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(name, bots, difficulty, { target, turnSeconds });
        }}
      >
        <label className="field-label" htmlFor="name">
          What should we call you?
        </label>
        <input
          id="name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
        />
        <fieldset>
          <legend>Computer opponents</legend>
          <div className="choices">
            {[1, 2, 3].map((n) => (
              <button
                type="button"
                className={bots === n ? "choice active" : "choice"}
                aria-pressed={bots === n}
                key={n}
                onClick={() => setBots(n)}
              >
                {n} {n === 1 ? "opponent" : "opponents"}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>A little challenge?</legend>
          <div className="difficulty-choices">
            {(["easy", "normal", "hard"] as const).map((d, i) => (
              <button
                type="button"
                className={difficulty === d ? "choice active" : "choice"}
                aria-pressed={difficulty === d}
                key={d}
                onClick={() => setDifficulty(d)}
              >
                <strong>
                  {["Easy does it", "A fair match", "Think ahead"][i]}
                </strong>
                <span>
                  {
                    [
                      "New melds only. Room to learn.",
                      "Clever sets and well-timed additions.",
                      "Rearranges the table. Bring your best.",
                    ][i]
                  }
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>How long would you like to play?</legend>
          <label className="field-label" htmlFor="match-length">
            Game length
          </label>
          <select
            id="match-length"
            value={target}
            onChange={(e) =>
              setTarget(Number(e.target.value) as 0 | 100 | 200 | 500)
            }
          >
            <option value={0}>One round</option>
            <option value={100}>Match · first to 100 points</option>
            <option value={200}>Match · first to 200 points</option>
            <option value={500}>Match · first to 500 points</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>Optional turn timer</legend>
          <label className="field-label" htmlFor="turn-timer">
            Time per turn
          </label>
          <select
            id="turn-timer"
            value={turnSeconds}
            onChange={(e) =>
              setTurnSeconds(Number(e.target.value) as 0 | 60 | 120)
            }
          >
            <option value={0}>No timer · recommended for learning</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
          </select>
          {turnSeconds > 0 && (
            <p className="muted">
              When time runs out, unfinished edits are restored and you draw one
              tile (or pass if the pool is empty). The clock keeps running when
              you leave the game.
            </p>
          )}
        </fieldset>
        {hasSave && (
          <p className="muted">
            Starting a new game replaces your saved round.
          </p>
        )}
        <button className="primary" type="submit">
          Deal the tiles <span>→</span>
        </button>
      </form>
    </main>
  );
}
