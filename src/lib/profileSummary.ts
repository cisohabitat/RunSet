import { replayTurnPractice, practiceResumeMessage } from "./turnPractice";
import { turnLessonCopy } from "./turnLessons";
export function profileTime(
  value: string | number | undefined,
  locale: string,
): string | null {
  const date = new Date(value ?? NaN);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return null;
  }
}
export function wholePracticeSummary(raw: string | null) {
  try {
    const progress = raw ? replayTurnPractice(JSON.parse(raw)) : null;
    if (!progress) return null;
    return {
      title: turnLessonCopy[progress.record.lesson ?? "opening"].title,
      layout: (progress.record.layout ?? 0) + 1,
      mode: progress.record.mode === "guided" ? "GUIDED TURN" : "FEWER PROMPTS",
      message: practiceResumeMessage(progress),
    };
  } catch {
    return null;
  }
}
export const profileLabels: Record<string, string> = {
  "runset.reading": "Comfortable reading",
  "runset.contrast": "Higher contrast",
  "runset.largeTiles": "Larger touch controls",
  "runset.simpleHome": "Simple home screen",
  "runset.learning": "Learning help",
  "runset.narrate": "Opponent move explanations",
  "runset.muted": "Sound effects",
  "runset.tableExpanded": "Full screen",
  "runset.language": "Language",
  "runset.pace": "Opponent pace",
  "runset.audioVoice": "Reading voice",
  "runset.rackOrder.v1": "Rack display order",
  "runset.tableOrder.v1": "Table arrangement",
  "runset.practice.v1": "Short lessons",
  "runset.exercises.v1": "Quick exercises",
  "runset.solo.v1": "Solo progress",
  "runset.turnPractice.v1": "Whole-turn practice",
};
export function profileChoice(key: string, raw: string | null): string {
  if (raw === null) return "Not saved";
  if (key === "runset.language")
    return raw === "zh-CN" ? "简体中文" : "English";
  if (key === "runset.muted") return raw === "true" ? "Off" : "On";
  if (raw === "true" || raw === "false") return raw === "true" ? "On" : "Off";
  if (key === "runset.pace")
    return (
      (
        {
          "700": "Quick",
          "1400": "Comfortable",
          "2400": "Take my time",
          "5000": "Unhurried · 5 seconds",
        } as Record<string, string>
      )[raw] ?? "Unavailable"
    );
  if (key === "runset.audioVoice")
    return raw === "device" ? "Device voice" : "Recorded guide";
  if (key === "runset.tableOrder.v1") {
    const choice = (
      {
        placed: "Placed order",
        kind: "Groups then runs",
        colour: "Colour then number",
      } as Record<string, unknown>
    )[raw];
    return typeof choice === "string" ? choice : "Unavailable";
  }
  if (key === "runset.rackOrder.v1") {
    try {
      return (
        (
          {
            manual: "Manual order",
            color: "Colour",
            number: "Number",
          } as Record<string, string>
        )[JSON.parse(raw).mode] ?? "Unavailable"
      );
    } catch {
      return "Unavailable";
    }
  }
  return "Included";
}
