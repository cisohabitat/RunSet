import { useI18n } from "../i18n/I18n";
import { SaveSummary, type HomeProps } from "./Home";
import "./SimpleHome.css";
export default function SimpleHome({
  onNew,
  onContinue,
  onHelp,
  hasSave,
  onLearn,
  onExercises,
  onDelete,
  game,
  status,
  children,
}: HomeProps) {
  const { t } = useI18n();
  return (
    <main id="main-content" tabIndex={-1} className="page simple-home">
      <h1>{t("Choose where to start.")}</h1>
      <div className="simple-actions">
        {hasSave && (
          <button className="primary" onClick={onContinue}>
            {t(game?.phase === "over" ? "View results →" : "Continue game →")}
          </button>
        )}
        <button className={hasSave ? "secondary" : "primary"} onClick={onNew}>
          {t("New game →")}
        </button>
        <button className="secondary" onClick={onLearn}>
          {t("Learn to play ")} →
        </button>
      </div>
      {game && <SaveSummary game={game} />}
      <p role="status">{t(status)}</p>
      <details className="simple-options">
        <summary>{t("More options")}</summary>
        <div className="simple-actions">
          <button className="secondary" onClick={onHelp}>
            {t("How to play →")}
          </button>
          <button className="secondary" onClick={onExercises}>
            {t("Quick exercises")}
          </button>
          {game && (
            <button className="text-button danger-text" onClick={onDelete}>
              {t("Delete saved game")}
            </button>
          )}
        </div>
        {children}
      </details>
    </main>
  );
}
