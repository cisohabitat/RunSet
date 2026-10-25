import { offlineReady } from "../lib/offline";
import { useEffect, useState } from "react";
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function Offline({
  beforeUpdate,
}: {
  beforeUpdate: () => boolean | Promise<boolean>;
}) {
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
    const refreshReady = () => {
      const active = navigator.serviceWorker.controller ?? reg?.active;
      if (active)
        void offlineReady(active).then((ready) => {
          if (!cancelled) setReadiness(ready ? "ready" : "unavailable");
        });
    };
    navigator.serviceWorker?.addEventListener("controllerchange", refreshReady);
    const check = () => {
      if (reg?.waiting) setWaiting(true);
    };
    const change = () => {
      const worker = reg?.installing;
      if (worker)
        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            check();
        });
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
          void reg.update().catch(() => {});
        })
        .catch(() => {
          if (!cancelled) {
            setReadiness("unavailable");
            setError(
              "Offline setup is unavailable. You can continue playing online.",
            );
          }
        });
    return () => {
      cancelled = true;
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
    if (!(await beforeUpdate())) {
      setError(
        "The update is paused because your game could not be saved. Keep this tab open.",
      );
      return;
    }
    const worker = registration?.waiting;
    if (!worker) return;
    let reloaded = false;
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        if (!reloaded) {
          reloaded = true;
          location.reload();
        }
      },
      { once: true },
    );
    worker.postMessage({ type: "SKIP_WAITING" });
  };
  return (
    <aside className="offline-tools" aria-label="Offline and installation">
      <p className="offline-readiness" role="status">
        {readiness === "ready"
          ? offline
            ? "Offline · game, lessons and bots are ready."
            : "Ready offline"
          : readiness === "preparing"
            ? "Preparing offline play…"
            : "Offline readiness could not be verified. Connect and finish any available update."}
      </p>
      {waiting && (
        <div role="status">
          A new version is ready. Your saved game will be kept.{" "}
          <button className="secondary" onClick={update}>
            Save and update
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
        Install or play offline
      </button>
      {help && (
        <p>
          On iPhone or iPad, open this site in Safari, tap Share, then Add to
          Home Screen. On desktop or Android, use your browser’s Install app
          option. Visit once online to download the game; regular games and
          lessons then work offline once “Ready offline” is shown.
        </p>
      )}
      {error && <p role="status">{error}</p>}
    </aside>
  );
}
