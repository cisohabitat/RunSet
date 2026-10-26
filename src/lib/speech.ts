import type { Locale } from "../i18n/I18n";

/** Do not substitute Cantonese or an unrelated default voice for Mandarin. */
export function readingVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: Locale,
  offline: boolean,
): SpeechSynthesisVoice | undefined {
  const rank = (voice: SpeechSynthesisVoice) => {
    const lang = voice.lang.toLowerCase().replaceAll("_", "-");
    if (locale === "en") return /^en(?:-|$)/.test(lang) ? 1 : 0;
    if (/^(?:zh|cmn)-cn$/.test(lang)) return 3;
    return /^(?:zh(?:-(?:sg|tw|hans)(?:-.*)?)?|cmn(?:-.*)?)$/.test(lang)
      ? 2
      : 0;
  };
  return voices
    .filter((voice) => rank(voice) && (!offline || voice.localService))
    .sort(
      (a, b) =>
        Number(b.localService) - Number(a.localService) || rank(b) - rank(a),
    )[0];
}

export function spokenText(text: string): string {
  return text.replaceAll("→", "，").replaceAll("·", "，");
}
