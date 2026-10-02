# Festi UI — how to build with it

Festi UI is a **shadcn / Radix** component library (style `radix-nova`) styled with
**Tailwind v4** utility classes bound to CSS-variable design tokens. It is
**dark-themed by default**: the tokens on `:root` define a near-black background
and near-white foreground, so components only look right on the brand surface.

## Wrapping & setup

- **Always wrap your design in the brand surface.** Put everything inside a root
  element with `className="bg-background text-foreground"`. Without it, components
  that have no surface of their own (Table, plain text, Label) render near-white
  text on whatever is behind them and appear invisible.
- **Font:** the brand font is **Raleway**; it ships in `styles.css` (`--font-raleway`,
  mapped to `--font-sans`). It applies automatically once your root uses the tokens
  above — do not hard-code another font family.
- **No global theme provider is required** — tokens live as CSS variables on `:root`.
  Two components need a context wrapper:
  - `Tooltip` must be inside `TooltipProvider`.
  - `Sidebar` and its parts must be inside `SidebarProvider`.
- Overlay components (`Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`,
  `Select`) are compound: compose `*Trigger` + `*Content` under the root, exactly as
  shown in each component's `.prompt.md`.

## Styling idiom — utility classes bound to tokens

Style with Tailwind utility classes whose colors resolve to the design tokens. Use
these token-backed classes instead of raw colors; never invent hex values.

| Role | Classes |
|---|---|
| Page / app surface | `bg-background` `text-foreground` |
| Cards, panels | `bg-card` `text-card-foreground` |
| Popovers, menus | `bg-popover` `text-popover-foreground` |
| Primary action | `bg-primary` `text-primary-foreground` (hover: `--primary-hover`) |
| Secondary action | `bg-secondary` `text-secondary-foreground` |
| Muted / subtle text | `text-muted-foreground`, muted fills `bg-muted` |
| Destructive | `bg-destructive`, or `text-destructive` |
| Borders / inputs / focus ring | `border-border` `border-input` `ring-ring` |
| Radius | `rounded-md` `rounded-lg` (scale from `--radius`) |
| Charts | `--chart-1` … `--chart-5` |
| Sidebar surfaces | `bg-sidebar` `text-sidebar-foreground` `border-sidebar-border` |

Component-level variants (see each `.d.ts`), not CSS:

- `Button` — `variant`: `default | secondary | destructive | outline | ghost | link`;
  `size`: `sm | default | lg | icon`.
- `Badge` — `variant`: `default | secondary | destructive | outline`.
- `Alert` — `variant`: `default | destructive`.
- `Toggle` — `variant`: `default | outline`.

## Where the truth lives

- **Styles:** read the bound `styles.css` and its `@import` closure (`_ds_bundle.css`)
  for the exact token values and utility set before styling.
- **Per component:** `<Name>.d.ts` is the prop contract; `<Name>.prompt.md` shows the
  canonical composition. Compose from those — they reflect the real shipped API.

## Idiomatic example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from "festi";

export function RideCard() {
  return (
    <div className="bg-background text-foreground p-6">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Alpine Loop</CardTitle>
          <CardDescription>84 km · 1,240 m climbing</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A scenic tempo ride through the foothills.
        </CardContent>
        <CardFooter className="justify-between">
          <Badge variant="secondary">12 riders</Badge>
          <Button size="sm">Join ride</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```
