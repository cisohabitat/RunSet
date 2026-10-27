import { useMemo } from "react";
import type { GameState } from "../engine/game";
import { useI18n } from "../i18n/I18n";
import {
  profileKeys,
  profileLearningKeys,
  validProfileValue,
  type PortableProfile,
} from "../lib/profile";
import {
  profileTime,
  wholePracticeSummary,
  profileLabels,
  profileChoice,
} from "../lib/profileSummary";
function GameInfo({ game }: { game: GameState | null }) {
  const { t, locale } = useI18n();
  if (!game) return <p>{t("No saved game")}</p>;
  const human = game.players.find((p) => !p.bot),
    dirty =
      game.phase === "playing" &&
      JSON.stringify(game.table) !== JSON.stringify(game.turnStart.table);
  return (
    <>
      <p>
        <strong>{human?.name}</strong> ·{" "}
        {game.phase === "over" && <>{t("Finished game")} · </>}
        {t("Turn")} {game.turn}
      </p>
      <p>
        {t("Tiles in your rack")}: {human?.rack.length ?? t("Unavailable")}
      </p>
      {dirty && <p>{t("Unfinished turn edits are included.")}</p>}
      {game.phase === "playing" && !!game.turnSeconds && (
        <p>
          {t("Original turn deadline")}:{" "}
          {profileTime(game.deadline, locale) ?? t("Unavailable")}
          <br />
          {t("Timed games keep this deadline after restore.")}
        </p>
      )}
    </>
  );
}
function PracticeInfo({ raw }: { raw: string | null }) {
  const { t } = useI18n();
  const summary = useMemo(() => wholePracticeSummary(raw), [raw]);
  return summary ? (
    <p>
      {t(summary.title)} · {t(`Practice layout ${summary.layout} of 4`)} ·{" "}
      {t(summary.mode)}
      <br />
      {t(summary.message)}
    </p>
  ) : (
    <p>{t(raw ? "Unavailable" : "No whole-turn practice saved")}</p>
  );
}
export function ProfileReview({
  profile,
  currentGame,
}: {
  profile: PortableProfile;
  currentGame: GameState | null;
}) {
  const { t, locale } = useI18n();
  const current = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const key of profileKeys) {
      try {
        result[key] = localStorage.getItem(key);
      } catch {
        result[key] = "unavailable";
      }
    }
    return result;
  }, [profile]);
  return (
    <div className="profile-comparison">
      <p>
        {t("Profile exported")}:{" "}
        {profileTime(profile.exportedAt, locale) ?? t("Unavailable")}
      </p>
      <div className="profile-compare-columns">
        <section aria-label={t("Game on this device")}>
          <h4>{t("Game on this device")}</h4>
          <GameInfo game={currentGame} />
        </section>
        <section aria-label={t("Game in this file")}>
          <h4>{t("Game in this file")}</h4>
          <GameInfo game={profile.game} />
        </section>
      </div>
      <h4>{t("Whole-turn practice on this device")}</h4>
      <PracticeInfo raw={current["runset.turnPractice.v1"]} />
      <h4>{t("Whole-turn practice in this file")}</h4>
      {profile.values["runset.turnPractice.v1"] ? (
        <PracticeInfo raw={profile.values["runset.turnPractice.v1"]} />
      ) : (
        <p>{t("Not in this file. Your current practice is kept.")}</p>
      )}
      <details>
        <summary>{t("Learning progress included")}</summary>
        <ul>
          {profileLearningKeys.map((key) => (
            <li key={key}>
              {t(profileLabels[key])}:{" "}
              {t(
                Object.hasOwn(profile.values, key)
                  ? "Will be replaced from this file"
                  : "Not included; kept on this device",
              )}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>{t("Display and sound choices included")}</summary>
        <ul>
          {Object.entries(profile.values)
            .filter(
              ([key]) =>
                !(profileLearningKeys as readonly string[]).includes(key),
            )
            .map(([key, raw]) => (
              <li key={key}>
                <strong>{t(profileLabels[key])}</strong>:{" "}
                {t(
                  current[key] !== null && !validProfileValue(key, current[key])
                    ? "Unavailable"
                    : profileChoice(key, current[key]),
                )}{" "}
                → {t(profileChoice(key, raw))}
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
}
