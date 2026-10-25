import { useState } from "react";
import type { Difficulty } from "../engine/game";
export function Setup({
  onStart,
  onBack,
  hasSave,
}: {
  onStart: (name: string, bots: number, difficulty: Difficulty) => void;
  onBack: () => void;
  hasSave: boolean;
}) {
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
      <p>Settle in for a single round of tile-rummy.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(name, bots, difficulty);
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
        {hasSave && (
          <p className="muted">
            Starting a new game replaces your saved round.
          </p>
        )}
        <button className="primary" type="submit">
          Deal the tiles <span>↗</span>
        </button>
      </form>
    </main>
  );
}
