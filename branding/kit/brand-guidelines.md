# Klip — Logo Guidelines

## 1. The Logo
- **Concept**: *The Razor K* — A monolithic vertical timeline spine paired with twin 45° aerodynamic clipping blades, separated by a precision 24-unit negative-space channel.
- **Versions**:
  - Symbol (`klip-symbol.svg` / `klip-symbol-small.svg`)
  - Horizontal lockup (`klip-horizontal.svg`)
  - Stacked lockup (`klip-stacked.svg`)
  - App icon (`klip-app-icon.svg`) & Monochrome variants (`klip-black.svg`, `klip-white.svg`, `klip-mono-18181b.svg`, `klip-mono-3b82f6.svg`)

## 2. Clear Space
Maintain a minimum clear zone equal to the width of the vertical stem (**56 units** on a 256×256 grid, or **~22%** of the symbol height) on all sides of the mark.

## 3. Minimum Size
| Version | Screen | Print |
|---|---|---|
| Horizontal lockup | 96 px wide | 25 mm wide |
| Symbol (standard) | 24 px | 8 mm |
| Symbol (small-size cut / tray / favicon) | 16 px (`klip-symbol-small.svg`) | 6 mm |

## 4. Colour Palette (Solid Zinc)
| Name | HEX | RGB | Role |
|---|---|---|---|
| Zinc Void (App Icon Bg / Dark Ground) | `#09090b` | `9, 9, 11` | Primary dark background |
| Zinc Ink | `#18181b` | `24, 24, 27` | Primary mark on light surfaces |
| Zinc Paper (Light Ground / Reversed Mark) | `#fafafa` | `250, 250, 250` | Primary mark on dark surfaces |
| Electric Accent (Optional Mono) | `#3b82f6` | `59, 130, 246` | Technical accent |

**Approved logo/background pairs**:
- `#18181b` or `#000000` on light surfaces (`#fafafa`, `#ffffff`)
- `#fafafa` or `#ffffff` on dark surfaces (`#09090b`, `#111113`, `#18181b`)

## 5. Typography
- UI & Headings: `Poppins` (weights 400, 500, 600, 700), tight tracking on display headings (`tracking-tight`).
- Monospace / Numeric readouts: `JetBrains Mono` (`tabular-nums`).
- Note: The Klip wordmark in `klip-horizontal.svg` and `klip-stacked.svg` is constructed purely from geometric SVG paths and must never be recreated by typing text.

## 6. Don'ts
- Don't stretch, skew, or rotate the mark.
- Don't apply neon glows, drop shadows, or complex gradients.
- Don't alter the negative-space channel proportions.
- Don't use the standard symbol below 24 px when `klip-symbol-small.svg` / `klip-favicon.svg` is available.

## 7. Attribution & Master Files
- Author: Saul Gabriel
- Open-source license: GNU GPL v3.0 (based on the open-source architecture of Arroxy `antonio-orionus/Arroxy`).
- Master files location: `branding/kit/`
