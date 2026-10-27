import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../i18n/I18n";
export class RecoveryBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function RecoveryScreen({
  onHome,
  beforeReload,
  reading,
}: {
  onHome: () => void;
  beforeReload: () => Promise<boolean>;
  reading: boolean;
}) {
  const { t } = useI18n();
  const alive = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null),
    pending = useRef(false);
  const [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    alive.current = true;
    heading.current?.focus();
    return () => {
      alive.current = false;
    };
  }, []);
  const reload = async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setFailed(false);
    try {
      if (await beforeReload()) {
        if (alive.current) location.reload();
        return;
      }
    } catch {
      /* Keep this screen and the previous save. */
    }
    if (!alive.current) return;
    pending.current = false;
    setBusy(false);
    setFailed(true);
  };
  return (
    <div className={`app ${reading ? "comfortable-reading" : ""}`}>
      <main className="page recovery-view" id="main-content" tabIndex={-1}>
        <h1 ref={heading} tabIndex={-1}>
          {t("This screen could not open.")}
        </h1>
        <p>
          {t(
            "Reconnect, then save and reload. You can return Home meanwhile. Timed games keep running.",
          )}
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onHome}>
            {t("Return Home")}
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void reload()}
          >
            {t(busy ? "Saving…" : "Save and reload")}
          </button>
        </div>
        {failed && (
          <p role="status">
            {t(
              "The current position could not be saved. Keep this tab open and return Home to try again. Your previous save is kept.",
            )}
          </p>
        )}
      </main>
    </div>
  );
}
