import { useEffect, useRef, useState } from "react";
import type { GameState } from "../engine/game";
import { useI18n } from "../i18n/I18n";
import {
  exportProfile,
  importProfile,
  profileLearningKeys,
  type PortableProfile,
} from "../lib/profile";
import { persistGame } from "../lib/storage";
import { MAX_BACKUP_BYTES } from "../lib/backup";
import "./ProfileTools.css";
import { ProfileReview } from "./ProfileReview";
export default function ProfileTools({
  game,
  onClose,
}: {
  game: GameState | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<PortableProfile | null>(null),
    [includeGame, setIncludeGame] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const modal = useRef<HTMLDialogElement>(null),
    close = useRef<HTMLButtonElement>(null),
    request = useRef<AbortController | null>(null),
    downloadUrl = useRef<string | null>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!message) return;
    const frame = requestAnimationFrame(() => {
      const target = messageRef.current;
      if (target?.isConnected && modal.current?.open) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "center" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [message]);
  useEffect(() => {
    const node = modal.current,
      opener = document.querySelector<HTMLButtonElement>(".profile-opener");
    node?.showModal();
    close.current?.focus();
    return () => {
      request.current?.abort();
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
      node?.close();
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
        requestAnimationFrame(() => {
          if (
            opener.isConnected &&
            document.activeElement === document.body &&
            !document.querySelector("dialog[open]")
          )
            opener.focus({ preventScroll: true });
        });
      }
    };
  }, []);
  const download = () => {
    try {
      const raw = exportProfile(game, localStorage);
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
      const url = URL.createObjectURL(
        new Blob([raw], { type: "application/json" }),
      );
      downloadUrl.current = url;
      const link = document.createElement("a");
      link.href = url;
      link.download = `runset-profile-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setMessage(
        "Profile downloaded. Keep this file to move your game, learning and choices to another device.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error &&
          (error.message.startsWith("Choose a RunSet") ||
            error.message.startsWith("Some saved") ||
            error.message.startsWith("This is not a supported"))
          ? error.message
          : "The profile could not be exported.",
      );
    }
  };
  const restore = async () => {
    if (!profile || busy) return;
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setBusy(true);
    setMessage("");
    const result = await persistGame(
      includeGame ? profile.game : null,
      profile.values,
      controller.signal,
    );
    if (controller.signal.aborted) return;
    setBusy(false);
    if (result.ok) window.location.reload();
    else
      setMessage(
        result.reason === "conflict"
          ? "This game changed in another tab. Close portable progress and review the latest game before importing again."
          : "The profile could not be fully restored. The page was not reloaded. Check your saved progress before trying again.",
      );
  };
  return (
    <dialog
      ref={modal}
      className="hint-preview profile-dialog"
      aria-labelledby="profile-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id="profile-title">{t("Portable progress")}</h2>
      <div className="hint-preview-body">
        <p>
          {t(
            "Export one file with your game, learning progress and supported display and sound choices. No account is needed.",
          )}
        </p>
        <button className="secondary" disabled={busy} onClick={download}>
          {t("Export portable profile")}
        </button>
        <label className="file-button">
          {t("Open portable profile")}
          <input
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={async (e) => {
              const input = e.currentTarget,
                file = input.files?.[0];
              if (!file) return;
              setBusy(true);
              setMessage("");
              setProfile(null);
              try {
                if (file.size > MAX_BACKUP_BYTES)
                  throw Error(
                    "Choose a RunSet profile file smaller than 2 MB.",
                  );
                const next = importProfile(await file.text());
                setProfile(next);
                setIncludeGame(!!next.game && !game);
              } catch (error) {
                setMessage(
                  error instanceof Error &&
                    (error.message.startsWith("Choose a RunSet") ||
                      error.message.startsWith("This is not a supported"))
                    ? error.message
                    : "The profile could not be opened.",
                );
              } finally {
                input.value = "";
                setBusy(false);
              }
            }}
          />
        </label>
        {profile && (
          <section className="profile-review" aria-label={t("Profile review")}>
            <h3>{t("Review before restoring")}</h3>
            <ProfileReview profile={profile} currentGame={game} />
            <p>
              {t(
                `Learning records in file: ${Object.keys(profile.values).filter((key) => (profileLearningKeys as readonly string[]).includes(key)).length}`,
              )}
            </p>
            <p>
              {t(
                `Other choices in file: ${Object.keys(profile.values).filter((key) => !(profileLearningKeys as readonly string[]).includes(key)).length}`,
              )}
            </p>
            {profile.game ? (
              <label>
                <input
                  type="checkbox"
                  checked={includeGame}
                  disabled={busy}
                  onChange={(e) => setIncludeGame(e.target.checked)}
                />
                {t("Also restore the game from this file")}
              </label>
            ) : (
              <p>
                {t("This file has no game. Your current game will be kept.")}
              </p>
            )}
            <p>
              {t(
                includeGame && profile.game
                  ? "The game from this file will replace the game on this device. Its original turn and timer are kept."
                  : "Your current game will be kept.",
              )}
            </p>
            <p>
              {t(
                "Only choices and learning records included in this file are replaced. Other progress is kept. The page reloads after a successful restore.",
              )}
            </p>
          </section>
        )}
        {message && (
          <p ref={messageRef} tabIndex={-1} role="status">
            {t(message)}
          </p>
        )}
        <p>
          {t(
            "Game-only backup files still use Import game backup on Home. Device voices depend on what is installed on the receiving device.",
          )}
        </p>
      </div>
      <div className="dialog-actions">
        <button
          ref={close}
          className="secondary"
          disabled={busy}
          onClick={onClose}
        >
          {t("Done")}
        </button>
        {profile && (
          <button
            className="primary"
            disabled={busy}
            onClick={() => void restore()}
          >
            {t(busy ? "Restoring…" : "Restore profile and reload")}
          </button>
        )}
      </div>
    </dialog>
  );
}
