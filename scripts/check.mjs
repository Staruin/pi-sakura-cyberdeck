import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));

assert.equal(manifest.name, "pi-sakura-cyberdeck");
assert.equal(manifest.keywords.includes("pi-package"), true);

for (const path of [...manifest.pi.extensions, ...manifest.pi.themes]) {
  await access(resolve(root, path));
}

const theme = JSON.parse(await readFile(resolve(root, "themes/violet-cyberdeck.json"), "utf8"));
const requiredColors = [
  "accent", "border", "borderAccent", "borderMuted", "success", "error", "warning",
  "muted", "dim", "text", "thinkingText", "selectedBg", "userMessageBg",
  "userMessageText", "customMessageBg", "customMessageText", "customMessageLabel",
  "toolPendingBg", "toolSuccessBg", "toolErrorBg", "toolTitle", "toolOutput", "mdHeading",
  "mdLink", "mdLinkUrl", "mdCode", "mdCodeBlock", "mdCodeBlockBorder", "mdQuote",
  "mdQuoteBorder", "mdHr", "mdListBullet", "toolDiffAdded", "toolDiffRemoved",
  "toolDiffContext", "syntaxComment", "syntaxKeyword", "syntaxFunction", "syntaxVariable",
  "syntaxString", "syntaxNumber", "syntaxType", "syntaxOperator", "syntaxPunctuation",
  "thinkingOff", "thinkingMinimal", "thinkingLow", "thinkingMedium", "thinkingHigh",
  "thinkingXhigh", "bashMode",
];

assert.equal(theme.name, "violet-cyberdeck");
for (const color of requiredColors) assert.ok(color in theme.colors, `missing theme color: ${color}`);

// Palette guard: the fork ships a violet palette. Catch a stray pink/peach
// literal sneaking back in — in the theme or anywhere in the extensions.
const violetVars = ["violet", "lilac", "lavender", "periwinkle"];
for (const name of violetVars) assert.ok(name in theme.vars, `missing theme var: ${name}`);
assert.equal(theme.vars.violet, "#B79CF0");

const bannedPink = ["#F2A7C6", "#FCC9B9", "#EFC3E6", "#F6BC9A", "#C7B8F5", "#9FD3F2", "#FF8FA3"];
const themeSource = await readFile(resolve(root, "themes/violet-cyberdeck.json"), "utf8");
for (const hex of bannedPink) {
	assert.equal(themeSource.includes(hex), false, `pink palette literal ${hex} came back in the theme`);
}

// The editorBorder sentinel is a user-facing config value and must stay stable.
const gradientSource = await readFile(resolve(root, "extensions/zentui/gradient.ts"), "utf8");
assert.match(gradientSource, /SAKURA_MACARON_GRADIENT = "sakura-macaron-gradient"/);

// Fixed-editor regression: when pinned cluster shrinks, rows above its new start
// belong to transcript. paintCluster runs after transcript output and must not clear them.
const compositor = await readFile(
  resolve(root, "extensions/zentui/fixed-editor/compositor.ts"),
  "utf8",
);
assert.match(compositor, /const clearStart = startRow;/);
assert.doesNotMatch(
  compositor,
  /const clearStart = previous \? Math\.min\(previous\.startRow, startRow\)/,
);
const previousCluster = { startRow: 34, lineCount: 7 };
const nextCluster = { startRow: 37, lineCount: 4 };
const clearEnd = Math.max(
  previousCluster.startRow + previousCluster.lineCount - 1,
  nextCluster.startRow + nextCluster.lineCount - 1,
);
const postPaintClears = Array.from(
  { length: clearEnd - nextCluster.startRow + 1 },
  (_, index) => nextCluster.startRow + index,
);
assert.deepEqual(postPaintClears, [37, 38, 39, 40]);
assert.equal(postPaintClears.some((row) => row >= 34 && row <= 36), false);

// Mouse ownership: transcript events stay here; fresh cluster clicks pass to widgets.
assert.match(compositor, /mouseEv && this\.handleMouseEvent\(mouseEv\)/);
assert.match(compositor, /if \(!this\.selection\.isDragging\) return false;/);
assert.match(compositor, /if \(ev\.action === "release"\) \{\s*this\.selection\.clear\(\);/);

// HUD keeps one useful clock: total turn time, not a transient duplicate thought timer.
const shimmer = await readFile(resolve(root, "extensions/claude-shimmer/index.ts"), "utf8");
assert.doesNotMatch(shimmer, /thinkingDuration|THOUGHT_DISPLAY_MS|thoughtTimer/);
assert.match(shimmer, /parts\.push\(rgbAnsi\(MUTED, formatDigital\(elapsed\)\)\)/);

// Pi 0.84+: fixed editor must stay off by default and hard-block native sticky TUI layouts.
const zentuiConfig = await readFile(resolve(root, "extensions/zentui/config.ts"), "utf8");
assert.match(
  zentuiConfig,
  /fixedEditor:\s*\{\s*\/\/[\s\S]*?enabled:\s*false|fixedEditor:\s*\{\s*enabled:\s*false/,
);
const fixedEditorIndex = await readFile(
  resolve(root, "extensions/zentui/fixed-editor/index.ts"),
  "utf8",
);
assert.match(fixedEditorIndex, /function isNativeStickyEditorPi/);
assert.match(fixedEditorIndex, /Hard block on Pi 0\.84\+/);
assert.match(fixedEditorIndex, /if \(isNativeStickyEditorPi\(tui\)\)/);
assert.equal(manifest.version, "1.1.5");

console.log("pi-sakura-cyberdeck package check passed");
