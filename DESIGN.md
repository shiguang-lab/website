# Shiguang Website Design System

## Overview

Shiguang uses a dark, precise interface that feels calm, technical, and
trustworthy. Marketing pages may be cinematic, but authenticated account and
operations surfaces are compact workspaces optimized for scanning and repeated
use. Product identity comes from typography, restrained violet/blue accents,
and the Shiguang mark rather than decorative illustration.

## Colors

- Page background: `#020713` for marketing and `#070b14` for account tools.
- Primary surface: `#0a101d`; secondary surface: `rgba(13, 16, 31, 0.72)`.
- Primary text: `#f5f7fc`; body text: `#d9deea`.
- Muted text: `#788399`; subdued labels: `#667187`.
- Dividers: `rgba(145, 164, 204, 0.09-0.16)`.
- Brand accent: violet `#9b6cff`; supporting cyan `#55c8d8`.
- Positive: `#72d7a5`; warning: `#d9aa58`; error: `#ff9ca8`.
- Keep accents sparse. Do not turn an authenticated surface into a violet or
  blue monochrome composition.

## Typography

- Font stack: Inter, system UI, PingFang SC, Microsoft YaHei, sans-serif.
- Page title: 26px / 650 weight.
- Card title: 17px / 640 weight.
- Body: 13px; compact labels and metadata: 10-12px.
- Use tabular numerals for balances, counts, dates, and ledger amounts.
- Letter spacing is `0` except for existing brand marks and small uppercase
  marketing labels.

## Layout

- Marketing content uses a centered 1180px container.
- Account tools use a 1440px maximum canvas with a 236px sticky navigation and
  a fluid content column.
- Account content starts below the fixed 78px site header and uses 22-36px
  structural gaps.
- Prefer one framed surface per task. Use dividers and unframed rows inside a
  surface instead of nesting cards.

## Elevation And Depth

- Account surfaces use a solid dark background, a subtle 1px border, and at
  most one restrained shadow.
- Header overlays may use blur. Avoid blurred decorative shapes, glowing orbs,
  and heavy gradients behind operational content.

## Shapes

- Account cards and sidebars: 8px radius.
- Buttons and navigation items: 6-7px radius.
- Status labels: 5-6px radius.
- Avatars may use 8-10px radius; circular shapes are reserved for loading
  indicators or explicit status markers.

## Components

- Primary buttons use the existing violet-to-blue brand treatment only for the
  main action in a view.
- Secondary actions use transparent backgrounds and muted borders.
- Navigation rows combine an icon, title, short description, and optional
  chevron. Active state uses a subtle violet border and fill.
- Tables and ledgers use full-width rows separated by dividers, with amounts
  right-aligned and rendered in tabular numerals.
- Empty, loading, and error states occupy stable space and provide a single
  direct recovery action where appropriate.

## Do And Don't

- Do keep authenticated pages dense, calm, and easy to scan.
- Do use the existing Semi icon set for interface actions and navigation.
- Do expose loading, disabled, success, error, and empty states.
- Don't place cards inside cards.
- Don't introduce decorative gradients, large illustrations, or oversized
  headings in account tools.
- Don't rely on color alone for transaction direction or status.

## Responsive Behavior

- Below 900px, the account sidebar becomes a horizontal or stacked navigation
  and the main content uses the full available width.
- Below 640px, summary grids collapse to one column and ledger rows preserve a
  stable amount column without horizontal scrolling.
- Buttons keep at least a 40px touch target. Long identifiers and descriptions
  wrap; amounts, dates, and status labels remain legible and do not overlap.
