import clips from "./narration.json";
import type { Locale } from "../i18n/I18n";
/** Exact caption matching prevents recordings silently drifting from instructions. */
export function narrationFor(text: string, locale: Locale): string | undefined {
  const clip = clips.find((clip) => clip[locale] === text);
  return clip ? `/audio/${clip.id}-${locale}.mp3` : undefined;
}
