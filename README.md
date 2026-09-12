# pi-sakura-cyberdeck

Violet Cyberdeck visual pack for [Pi](https://pi.dev).

> ### This is a personal fork
>
> Forked from [beautifulrem/pi-sakura-cyberdeck](https://github.com/beautifulrem/pi-sakura-cyberdeck) (MIT).
> Divergence from upstream:
>
> | Change | Detail |
> |--------|--------|
> | **Palette** | Pink/sakura family replaced with a violet family. Theme renamed `sakura-macaron` → `violet-cyberdeck`. Semantic colors (mint success / butter warning / rose error) are kept so diffs and warnings stay readable. |
> | **Startup art** | The 10-line braille anime header art is gone; the header now draws an ANSI Shadow `PI` mark with a gradient divider and `◈ PI CYBERDECK ◈` telemetry line. |
> | **Dual-quota removed** | The bundled `dual-quota` extension (Codex + Grok quota chips) was deleted along with its manifest entry and stale config mapping. |
>
> Upstream identifiers are deliberately unchanged (package name, `sakura-cyberdeck-zentui.json`, widget keys, the `/sakura-matrix` command) so existing configs and muscle memory keep working.

**v1.1.5** — cleaner thinking HUD and clickable fixed-cluster compatibility.

## What’s inside

| Piece | Role |
|-------|------|
| **Theme** `violet-cyberdeck` | Truecolor palette (violet / lilac / lavender / periwinkle / apricot / mint / butter / rose) |
| **Header** | ANSI Shadow `PI` mark with violet→periwinkle gradient |
| **Matrix** | Pastel violet digital rain while working (optional; can conflict with shimmer) |
| **Zentui** | Editor, prompt rails, Starship footer, fixed bottom editor |
| **Claude shimmer** | Working spinner with violet sweep + effort HUD |

## Look

**Header**

```text
██████╗ ██╗
██╔══██╗██║
██████╔╝██║
██╔═══╝ ██║
██║     ██║
╚═╝     ╚═╝

━━━━━━━━━━━━━━━━━━
 ◈  PI CYBERDECK  ◈
```

**Footer**

```text
󰀵  project  on 󰘬 main   [███░░░░░░░] 4%/2m  $0.06
```

- Context bar: truecolor violet gauge; label **periwinkle** (not mint green)
- Cost: **apricot**
- Separators / cwd / os: soft violet gradient accents

**Working line**

```text
Whisking...  ( HIGH · ↓ ~144 tokens · 00:12 )
```

- Fixed-width dots, slow cycle
- Effort: MINIMAL→MAX, tier-colored, stable for the turn
- Tokens: periwinkle `↑/↓` + readable count (`144 tokens`, `1.2k tokens`, `12.3k tokens`)
- `~` marks the live estimate; finalized provider `usage.output` replaces it and accumulates across tool turns
- Outer `( … )` with inner ` · ` (upstream pi-claude-shimmer layout)

**History**

```text
  ✦ Thought trail
  ├─ ◇ …
  ╰─ ◇ …

╭─ ✓ READ · COMPLETE ─╮
┃ read  /path/to/file │
╰─────────────────────╯
```

- Thought trail: tight spacing (no double blank stack)
- Tool frames: symmetric violet frame gradient (ends match); no per-line trailing `...`
- Tool titles: no leading ◎ glyph; snake_case tools colored; paths violet
- Left rail: periwinkle (running) / mint (ok) / rose (error)

## Requirements

- Pi `>= 0.80` (Pi **0.84+** fully supported; see sticky editor note below)
- Truecolor terminal
- Nerd Font for configured icons

## Install

```bash
pi install git:github.com/Staruin/pi-sakura-cyberdeck
```

Local:

```bash
pi install /path/to/pi-sakura-cyberdeck
```

Then `/settings` → **violet-cyberdeck**. Restart Pi once.

> Prefer **this package’s shimmer** over stock `npm:pi-claude-shimmer`, and turn off `sakura-matrix` if both fight for the working indicator.

### Pi 0.84+ sticky editor

Pi 0.84 introduced a native fullscreen TUI with a sticky editor. This pack’s experimental **fixed editor** compositor patches private TUI APIs and is **off by default** from v1.1.5; it is also hard-blocked at runtime on Pi 0.84+ layouts even if re-enabled in config.

For sticky editor + scrollable transcript on Pi 0.84+:

```jsonc
// ~/.pi/agent/settings.json
{
  "tuiMode": "fullscreen"
}
```

Or start with `pi --tui-mode fullscreen`. Pack styling (editor chrome, footer, shimmer) still applies.

Config file for this pack’s Zentui: `~/.pi/agent/sakura-cyberdeck-zentui.json`.

Recommended companion settings (optional, user-owned):

```jsonc
// ~/.pi/agent/sakura-cyberdeck-zentui.json (excerpt)
{
  "colors": {
    "contextNormal": "syntaxFunction",
    "cost": "mdCode",
    // Sentinel value, kept from upstream so configs stay portable:
    "editorBorder": "sakura-macaron-gradient"
  },
  "fixedEditor": {
    "enabled": false
  }
}
```

## Commands

```text
/zentui                         editor/footer settings
/sakura-matrix                 rain status
/sakura-matrix on|off
```

## Development

```bash
npm run check     # manifest + theme + palette + fixed-editor regression checks
npm run preview   # truecolor render of the header and footer in your terminal
```

`npm run check` includes a palette guard: it fails if any of the old pink hexes
sneak back into the theme, or if the `editorBorder` sentinel value changes.

## Conflicts

Avoid stacking with `pi-zentui`, `pi-powerline-footer`, `@tifan/pi-fixed-editor`, stock `pi-claude-shimmer`, or a second copy of this pack. They share footer / working / editor surfaces.

## Changelog

### Fork

- **Palette**: violet family replaces the pink/sakura family across the theme and every extension that hardcodes colors (zentui gradient + defaults, header, matrix, shimmer, thinking HUD, tool chrome). Theme renamed to `violet-cyberdeck`.
- **Header**: anime braille art → ANSI Shadow `PI`; telemetry reads `◈ PI CYBERDECK ◈`; divider/label now share the artwork width.
- **Removed**: bundled `dual-quota` extension and its dead `dual-subscription-quota` placement mapping.
- **Tooling**: added `npm run preview`; `npm run check` grew a palette guard.

### Upstream

#### 1.1.5

- **Pi 0.84+**: disable fixed-editor by default and hard-block the compositor on native sticky/fullscreen TUI layouts (prevents broken input after upgrading Pi)
- Document using Pi `tuiMode: "fullscreen"` for sticky editor instead of the experimental fixed-editor compositor

#### 1.1.4

- **Thinking HUD**: remove the brief pink per-thought timer; the muted total turn timer remains
- **Fixed editor**: cluster mouse clicks now pass through to below-editor widgets while transcript selection stays owned by the compositor

#### 1.1.3

- **Token HUD**: provider-reported `usage.output` is authoritative and accumulated across tool turns
- Live stream fallback handles CJK/emoji better than raw `chars / 4`; `~` marks estimated values
- Labels are readable and compact: `144 tokens`, `1.2k tokens`, `12.3k tokens`, `1.2M tokens`
- Final usage can correct a live estimate downward instead of leaving an inflated count

#### 1.1.2

- **Fixed editor**: output completion no longer leaves a blank gap hiding transcript text until scroll
- Root cause: when pinned status/loader cluster shrank, its post-render cleanup erased rows already returned to the transcript
- Cluster paint now clears only rows it still owns; focused regression check covers the shrink case

#### 1.1.1

- **Tool cards**: stop right-edge `...` on every body line (Box pad broke diff parse; re-box from plain only; `truncateToWidth` ellipsis forced empty)
- **Diff body**: Pi-native `±12 text` — no extra `│` gutters eating width
- **Context gauge**: solid butter (warning) / coral (error) at high %; no healthy pink at 85–90%
- **Tool left rail**: sky / mint / coral status cues (macaron, not traffic-light RGB)
- **Self-shell tools** (edit): also polished + framed
- **Startup**: deferred project refresh / web-access / chrome bridge / subagents (from 1.1.0 follow-ups)

#### 1.1.0

- Macaron truecolor footer: gradient separators, pulsed context gauge, sky context text + peach cost
- Fixed-editor: keep one blank above working spinner so it does not glue to history
- Thought trail: sakura chrome, tight vertical spacing
- Tool cards: symmetric frame gradient, path/title color consistency, no icon prefix on `read`
- Bundled dual-quota chips (`· in Nd`) and sakura Claude shimmer (effort HUD + verb list)
- Defaults: context/cost colors no longer mint-on-gradient clash

#### 1.0.0

- Initial theme, header, matrix, zentui pack

## License

MIT. Claude shimmer is a violet-themed fork of [pi-claude-shimmer](https://github.com/ouzhenkun/pi-claude-shimmer) (MIT).
