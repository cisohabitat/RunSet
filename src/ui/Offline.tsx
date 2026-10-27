import { useI18n } from "../i18n/I18n";
import { offlineReady } from "../lib/offline";
import { useEffect, useRef, useState } from "react";
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function Offline({
  beforeUpdate,
}: {
  beforeUpdate: () => boolean | Promise<boolean>;
}) {
  const { t } = useI18n();
  const mounted = useRef(false),
    updateWork = useRef(false),
    cleanupUpdate = useRef<(() => void) | undefined>(undefined);
  const activated = useRef(false);
  const [updating, setUpdating] = useState(false);
  const [readiness, setReadiness] = useState<
    "preparing" | "ready" | "unavailable"
  >("preparing");
  const [registration, setRegistration] =
      useState<ServiceWorkerRegistration | null>(null),
    [waiting, setWaiting] = useState(false),
    [install, setInstall] = useState<InstallPrompt | null>(null),
    [help, setHelp] = useState(false),
    [offline, setOffline] = useState(!navigator.onLine),
    [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    const status = () => setOffline(!navigator.onLine),
      prompt = (e: Event) => {
        e.preventDefault();
        setInstall(e as InstallPrompt);
      };
    window.addEventListener("online", status);
    window.addEventListener("offline", status);
    window.addEventListener("beforeinstallprompt", prompt);
    let cancelled = false;
    let reg: ServiceWorkerRegistration | undefined;
    let observed: ServiceWorker | undefined;
    let setupProblem = false;
    const setupFailed = () => {
      if (cancelled) return;
      setupProblem = true;
      if (!navigator.serviceWorker.controller && !reg?.active)
        setReadiness("unavailable");
      setError(
        "Offline setup could not finish. Reconnect and reload to try again. Keep this tab open.",
      );
    };
    const refreshReady = () => {
      setWaiting(Boolean(reg?.waiting));
      const active = navigator.serviceWorker.controller ?? reg?.active;
      if (active)
        void offlineReady(active).then((ready) => {
          if (!cancelled) {
            setReadiness(ready ? "ready" : "unavailable");
            if (ready && setupProblem) {
              setupProblem = false;
              setError("");
            }
          }
        });
    };
    navigator.serviceWorker?.addEventListener("controllerchange", refreshReady);
    const check = () => setWaiting(Boolean(reg?.waiting));
    const stateChanged = () => {
      if (cancelled || !observed) return;
      if (observed.state === "redundant") {
        setupFailed();
        refreshReady();
      } else if (observed.state === "installed") check();
      else if (observed.state === "activated") refreshReady();
    };
    const change = () => {
      observed?.removeEventListener("statechange", stateChanged);
      observed = reg?.installing ?? undefined;
      observed?.addEventListener("statechange", stateChanged);
      if (observed) stateChanged();
      else if (!reg?.active && !reg?.waiting) setupFailed();
    };
    if (!import.meta.env.PROD || !("serviceWorker" in navigator))
      setReadiness("unavailable");
    if (import.meta.env.PROD && "serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then((value) => {
          reg = value;
          if (cancelled) return;
          setRegistration(reg);
          check();
          void navigator.serviceWorker.ready.then(() => {
            if (!cancelled) refreshReady();
          });
          reg.addEventListener("updatefound", change);
          change();
          void reg.update().catch(() => {});
        })
        .catch(() => {
          if (!cancelled) {
            setReadiness("unavailable");
            setError(
              "Offline setup is unavailable. You can continue playing in this tab.",
            );
          }
        });
    return () => {
      cancelled = true;
      mounted.current = false;
      updateWork.current = false;
      cleanupUpdate.current?.();
      cleanupUpdate.current = undefined;
      observed?.removeEventListener("statechange", stateChanged);
      window.removeEventListener("online", status);
      window.removeEventListener("offline", status);
      window.removeEventListener("beforeinstallprompt", prompt);
      reg?.removeEventListener("updatefound", change);
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        refreshReady,
      );
    };
  }, []);
  const update = async () => {
    if (updateWork.current) return;
    updateWork.current = true;
    setUpdating(true);
    setError("");
    const release = () => {
      updateWork.current = false;
      if (mounted.current) setUpdating(false);
    };
    try {
      if (!(await beforeUpdate())) {
        if (mounted.current)
          setError(
            "The update is paused because your game could not be saved. Keep this tab open.",
          );
        release();
        return;
      }
      if (!mounted.current) return;
      const worker = registration?.waiting;
      if (!worker) {
        if (activated.current && mounted.current) {
          location.reload();
          return;
        }
        setWaiting(false);
        release();
        return;
      }
      const reload = async () => {
        cleanupUpdate.current?.();
        activated.current = true;
        if (!mounted.current) return;
        try {
          // A move may arrive between accepting the update and activation.
          if (await beforeUpdate()) {
            if (mounted.current) location.reload();
            return;
          }
        } catch {
          /* Keep the active draft in this tab. */
        }
        release();
        if (mounted.current) {
          setWaiting(true);
          setError(
            "The update is paused because your game could not be saved. Keep this tab open.",
          );
        }
      };
      const timer = setTimeout(() => {
        cleanupUpdate.current?.();
        release();
        if (mounted.current)
          setError(
            "The update could not finish. Keep this tab open and try again.",
          );
      }, 10000);
      cleanupUpdate.current = () => {
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener("controllerchange", reload);
        cleanupUpdate.current = undefined;
      };
      navigator.serviceWorker.addEventListener("controllerchange", reload, {
        once: true,
      });
      worker.postMessage({ type: "SKIP_WAITING" });
    } catch {
      cleanupUpdate.current?.();
      release();
      if (mounted.current)
        setError(
          "The update could not finish. Keep this tab open and try again.",
        );
    }
  };
  return (
    <aside className="offline-tools" aria-label={t("Offline and installation")}>
      <p className="offline-readiness" role="status">
        {t(
          readiness === "ready"
            ? offline
              ? "Offline · game, lessons and bots are ready."
              : "Ready offline"
            : readiness === "preparing"
              ? "Preparing offline play…"
              : "Offline readiness could not be verified. Connect and finish any available update.",
        )}
      </p>
      {waiting && (
        <div role="status">
          {t("A new version is ready. Your saved game will be kept.")}{" "}
          <button
            className="secondary"
            disabled={updating}
            aria-busy={updating}
            onClick={() => void update()}
          >
            {t(updating ? "Updating…" : "Save and update")}
          </button>
        </div>
      )}
      <button
        className="text-button"
        onClick={() => {
          if (install) {
            void install
              .prompt()
              .then(() => install.userChoice)
              .then((choice) => {
                if (choice.outcome === "accepted") setInstall(null);
              })
              .catch(() => setHelp(true));
          } else setHelp((x) => !x);
        }}
      >
        {t("Install or play offline")}
      </button>
      {help && (
        <p>
          {t(
            "On iPhone or iPad, open this site in Safari, tap Share, then Add to Home Screen. On desktop or Android, use your browser’s Install app option. Visit once online to download the game; regular games and lessons then work offline once “Ready offline” is shown.",
          )}
        </p>
      )}
      {error && <p role="status">{t(error)}</p>}
    </aside>
  );
}
