import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
export type Locale = "en" | "zh-CN";
export const LANGUAGE_KEY = "runset.language";
function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "en" || saved === "zh-CN") return saved;
  } catch {
    /* Language remains usable without storage. */
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
const identity = (text: string) => text;
const initial = initialLocale();
type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  pending: boolean;
  t: <T>(value: T) => T;
};
const Context = createContext<I18n | null>(null);
// Keep the dictionary out of the initial English download. Vite's offline
// build precaches this chunk too, so switching languages works offline.
let chinese: ((text: string) => string) | undefined;
const loadChinese = () =>
  import("./zh-CN").then(
    ({ translateChinese }) => (chinese ??= translateChinese),
  );
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(initial);
  const [ready, setReady] = useState(initial === "en");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef(0);
  useEffect(() => {
    if (initial !== "zh-CN") return;
    let active = true;
    void loadChinese()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "zh-CN"
        ? "RunSet · 数字牌游戏"
        : "RunSet · A little strategy. A perfect run.";
    try {
      localStorage.setItem(LANGUAGE_KEY, locale);
    } catch {
      /* Optional preference. */
    }
  }, [locale]);
  const setLocale = async (next: Locale) => {
    const id = ++request.current;
    setPending(true);
    setError(false);
    try {
      if (next === "zh-CN") await loadChinese();
      if (id === request.current) {
        updateLocale(next);
        setReady(true);
      }
    } catch {
      if (id === request.current) setError(true);
    } finally {
      if (id === request.current) setPending(false);
    }
  };
  const translate = locale === "zh-CN" ? (chinese ?? identity) : identity;
  const value: I18n = {
    locale,
    setLocale,
    pending,
    t: <T,>(node: T): T =>
      typeof node === "string" ? (translate(node) as T) : node,
  };
  return (
    <Context.Provider value={value}>
      {!ready ? (
        <main className="page" aria-busy={!error}>
          <p role="status">
            {error
              ? "中文暂时无法加载，请联网后重试。 Chinese could not load. Please reconnect and retry."
              : "正在加载中文… Loading Chinese…"}
          </p>
          {error && (
            <>
              <button onClick={() => void setLocale("zh-CN")}>
                重试 / Retry
              </button>
              <button onClick={() => void setLocale("en")}>English</button>
            </>
          )}
        </main>
      ) : (
        <>
          {error && (
            <p role="alert" className="notice">
              中文暂时无法加载，请联网后重试。 Chinese could not load. Please
              retry.
            </p>
          )}
          {children}
        </>
      )}
    </Context.Provider>
  );
}
export function useI18n() {
  const value = useContext(Context);
  if (!value) throw Error("I18nProvider is required");
  return value;
}
export function LanguageSwitch() {
  const { locale, setLocale, pending } = useI18n();
  return (
    <label className="language-switch">
      <span>语言 / Language</span>
      <select
        aria-label="语言 / Language"
        value={locale}
        disabled={pending}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="zh-CN" lang="zh-CN">
          简体中文
        </option>
      </select>
    </label>
  );
}
