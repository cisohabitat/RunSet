export type Messages = Record<string, string>;
// {name...} parameters are literal player names. Other parameters may contain
// nested engine messages, colours or lesson instructions and are translated.
export function translator(messages: Messages) {
  const patterns = Object.entries(messages)
    .filter(([key]) => key.includes("{"))
    .sort(
      ([a], [b]) =>
        Number(a.startsWith("{name}")) - Number(b.startsWith("{name}")),
    )
    .map(([key, value]) => {
      const names: string[] = [];
      const source = key
        .split(/(\{\w+\})/)
        .map((part) => {
          if (/^\{\w+\}$/.test(part)) {
            names.push(part.slice(1, -1));
            if (part === "{numbers}") return "([0-9, –]+)";
            if (part === "{s}") return "(s?)";
            return /^(n|r|target|value)$/.test(part.slice(1, -1))
              ? "([0-9]+)"
              : "([\\s\\S]*?)";
          }
          return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("");
      return { regex: new RegExp(`^${source}$`), names, value };
    });
  function translate(text: string, depth = 0): string {
    if (!text.trim() || depth > 8) return text;
    const key = text.trim();
    let result = Object.hasOwn(messages, key) ? messages[key] : undefined;
    if (result === undefined) {
      for (const pattern of patterns) {
        const match = key.match(pattern.regex);
        if (!match) continue;
        result = pattern.value.replace(/\{(\w+)\}/g, (_, name: string) => {
          const raw = match[pattern.names.indexOf(name) + 1] ?? "";
          return name.startsWith("name") ? raw : translate(raw, depth + 1);
        });
        break;
      }
    }
    if (result === undefined) {
      // Lists inside lesson feedback and opponent narration. Never split names.
      if (key.includes("; ") || key.includes(", "))
        return text
          .split(key.includes("; ") ? /(; )/ : /(, )/)
          .map((part) =>
            part === "; " || part === ", " ? part : translate(part, depth + 1),
          )
          .join("");
      return text;
    }
    return (
      text.slice(0, text.indexOf(key)) +
      result +
      text.slice(text.indexOf(key) + key.length)
    );
  }
  return translate;
}
