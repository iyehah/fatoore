# Branding & layout

How logos, labels, languages, fonts, colors, and template sizes affect API and form output.

## Logo

| Query param | Behavior |
|-------------|----------|
| `businessLogo` | Absolute `http://` or `https://` URL to an image |
| `showLogo` | `true` (default): show logo when URL is valid; `false`: hide logo even if URL is set |

**Best practices**

- Use HTTPS URLs on a CDN or your static host.
- Prefer square or wide logos; very tall images are scaled in the header.
- The capture service loads the page from your **public app URL** — the logo URL must be reachable from the internet (not `localhost` in production).

## Labels & language

Invoice **labels** (column headers, totals, payment block, dates) come from translation files, controlled by `lang`:

| `lang` | Layout |
|--------|--------|
| `en` | English, LTR |
| `fr` | French, LTR |
| `ar` | Arabic, RTL |

Your **data** (`clientName`, `items[].description`, `notes`, etc.) is shown as you send it — the API does not translate customer text.

**Business and customer fields** map to on-invoice labels:

| Parameter | Typical label role |
|-----------|------------------|
| `businessName` | Seller name in header |
| `businessAddress`, `businessPhone`, `businessTaxId` | Seller contact block |
| `clientName` | Bill-to name (required) |
| `clientPhone`, `clientAddress` | Customer details |
| `paymentMethod`, `paymentDetails` | Payment section |
| `notes` | Footer notes |

## Template size

| `size` value | Aliases | Layout |
|--------------|---------|--------|
| `small` | `s`, `ticket` | Receipt strip |
| `medium` | `m`, `standard` | A5 |
| `large` | `l`, `full` | A4 |

PDF page dimensions follow the same size mapping as the in-app export.

## Accent color

| `color` value | Result |
|---------------|--------|
| `default` | Black accent preset |
| `black`, `blue`, `green`, `orange`, `gray` | Named presets |
| `#RRGGBB` | Custom hex (e.g. `#2563eb`) |

| Param | Effect |
|-------|--------|
| `applyBorders=true` | Accent tints dashed/solid borders (table, cards, icons) |

Accent applies to: business name, table header, totals bar, icons, optional borders.

## Fonts

`font` must be one of the registered API keys (same as the in-app font picker):

`geist`, `inter`, `notoSans`, `nunitoSans`, `figtree`, `roboto`, `raleway`, `dmSans`, `publicSans`, `outfit`, `geistMono`, `geistPixelSquare`, `jetBrainsMono`, `notoSerif`, `robotoSlab`, `merriweather`, `lora`, `playfairDisplay`, `amiri`

Default: `geist`. Use `amiri` or `notoSans` with `lang=ar` for readable Arabic body text.

## QR code

| Param | Behavior |
|-------|----------|
| `showQrCode=true` | Show QR when payment data supports it |
| `showQrCode=false` | Hide QR block |

## Invoice number

| Mode | Parameters |
|------|------------|
| Auto (default) | `autoInvoiceNumber=true` — number derived from type, dates, and key fields |
| Manual | `autoInvoiceNumber=false` + required `invoiceNumber` |

Pass `createdAt` (ISO date) for stable numbers across repeated exports.

## Web UI vs API

| Feature | Web app | API |
|---------|---------|-----|
| Logo | Business profile + toggle | `businessLogo` + `showLogo` |
| Accent | Toolbar + localStorage | `color`, `applyBorders` |
| Size | Toolbar + localStorage | `size` |
| Font | Settings + API `font` | `font` |
| Languages | App UI + invoice `lang` | `lang` |

Forms on `/dashboard` and the [playground](/developers/invoice-api) produce the same query strings the API accepts.

## See also

- [API reference](./api-reference.md) — full parameter table
- [Integration guide](./integration-guide.md)
