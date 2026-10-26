import type { Page } from "@playwright/test";
export async function mockSpeech(
  page: Page,
  options: {
    unsupported?: boolean;
    voices?: { lang: string; localService: boolean }[];
  } = {},
) {
  await page.addInitScript((options) => {
    if (options.unsupported) {
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        configurable: true,
      });
      delete (window as any).SpeechSynthesisUtterance;
      return;
    }
    const state: any = {
      spoken: [],
      cancels: 0,
      active: null,
      last: null,
      voices: options.voices ?? [
        { lang: "zh-CN", localService: true },
        { lang: "en-US", localService: true },
      ],
      finish() {
        this.active?.onend?.();
        this.active = null;
      },
      fail() {
        this.active?.onerror?.({ error: "synthesis-failed" });
        this.active = null;
      },
    };
    (window as any).__speech = state;
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        constructor(public text: string) {}
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => state.voices,
        cancel: () => {
          state.cancels++;
          state.active = null;
        },
        speak: (utterance: any) => {
          state.spoken.push({
            text: utterance.text,
            lang: utterance.lang,
            rate: utterance.rate,
            pitch: utterance.pitch,
          });
          state.active = state.last = utterance;
        },
      },
    });
  }, options);
}
