// Split an award title for overlay rendering on the golden-ring badge.
// The ring is too small to fit 3-word labels ("Top Project Leader",
// "Signature 2025 Creator") on one line at a legible size, so the trailing
// role-word wraps onto a second line per the Figma badge design. 1- or 2-word
// titles stay on a single line.
export function splitOverlayTitle(title: string): string[] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return [title];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}
