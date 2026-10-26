import { useState } from "react";
import type { GameState } from "../engine/game";
import { exportBackup, importBackup, MAX_BACKUP_BYTES } from "../lib/backup";
import { readRecoveryGame } from "../lib/storage";
export function SaveTools({
  game,
  onRestore,
}: {
  game: GameState | null;
  onRestore: (game: GameState) => void;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const recovery = readRecoveryGame();
  const download = () => {
    if (!game) return;
    try {
      const blob = new Blob([exportBackup(game)], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `runset-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Backup downloaded. Keep the file somewhere you can find it.");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };
  return (
    <section className="save-tools" aria-label="Save tools">
      <h2>Save and recovery</h2>
      <div className="backup-actions">
        <button
          className="secondary"
          disabled={!game || busy}
          onClick={download}
        >
          Export game backup
        </button>
        <label className="file-button">
          Import game backup
          <input
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={async (e) => {
              const input = e.currentTarget,
                file = input.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                if (file.size > MAX_BACKUP_BYTES)
                  throw Error("Choose a RunSet JSON backup smaller than 2 MB.");
                const restored = importBackup(await file.text());
                onRestore(restored);
                setMessage(
                  "Backup validated. If a game already exists, confirm before replacing it.",
                );
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                input.value = "";
                setBusy(false);
              }
            }}
          />
        </label>
        {recovery && (
          <button
            className="secondary"
            disabled={busy}
            onClick={() => onRestore(recovery)}
          >
            Recover previous position
          </button>
        )}
      </div>
      <details className="backup-help">
        <summary>About backups and recovery</summary>
      <p>
        Progress stays in this browser. Download a backup to keep a separate
        copy or move your game to another device. Timed backups retain their
        original deadline. Deleting a game also clears its automatic recovery
        copy; downloaded files remain yours.
      </p>
      </details>
      {recovery && (
        <p className="recovery-summary">
          Recovery available: {recovery.players.find((p) => !p.bot)?.name} ·
          turn {recovery.turn}
          {recovery.match ? ` · round ${recovery.match.round}` : ""}. Recovery
          may restore an earlier turn or a previously replaced game.
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
