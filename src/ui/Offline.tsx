import { lazy, Suspense } from "react";
import { useI18n } from "../i18n/I18n";
import { RecoveryBoundary } from "./RecoveryBoundary";
const Panel = lazy(() => import("./OfflinePanel"));
const keepPlaying = () => {};
export function Offline(props: {
  beforeUpdate: () => boolean | Promise<boolean>;
}) {
  const { t } = useI18n();
  return (
    <RecoveryBoundary
      onFailure={keepPlaying}
      fallback={
        <section
          className="offline-tools"
          aria-label={t("Offline and installation")}
        >
          <p role="status">
            {t(
              "Offline tools could not open. You can keep playing in this tab.",
            )}
          </p>
        </section>
      }
    >
      <Suspense
        fallback={
          <section
            className="offline-tools"
            aria-label={t("Offline and installation")}
          >
            <p role="status">{t("Preparing offline play…")}</p>
          </section>
        }
      >
        <Panel {...props} />
      </Suspense>
    </RecoveryBoundary>
  );
}
