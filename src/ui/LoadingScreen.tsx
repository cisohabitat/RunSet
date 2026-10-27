import { useI18n } from "../i18n/I18n";
/** Keep the skip target available; route focus waits for the loaded screen. */
export function LoadingScreen({ message }: { message: string }) {
  const { t } = useI18n();
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page loading-screen"
      aria-busy="true"
    >
      <h1>{message}</h1>
      <p role="status">
        {t("Please wait. You can return Home while this loads.")}
      </p>
    </main>
  );
}
