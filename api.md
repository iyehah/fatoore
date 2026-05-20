# Public Invoice API

Generate invoice images or PDFs via HTTP for external systems, automation, and integrations.

**Endpoint:** `GET /api/invoice`  
**Authentication:** None (public). API keys and rate limits are planned for a future release.

**Playground:** [/developers/invoice-api](/developers/invoice-api)  
**HTML preview (capture source):** `/invoice/render?…` (same query string as the API)

---

## Defaults

| Parameter | Default |
|-----------|---------|
| `type` | `sales` |
| `format` | `img` (PNG) |
| `color` | `default` (black accent) |
| `showLogo` | `true` |
| `showQrCode` | `true` |
| `lang` | `en` (invoice preview only, not the playground page) |
| `size` | `medium` (`m`, `standard`) |
| `font` | `geist` (all platform fonts, e.g. `inter`, `amiri`) |
| `currency` | `MRU` |
| `autoInvoiceNumber` | `true` |
| `applyBorders` | `false` |

---

## Output formats

| `format` | Response |
|----------|----------|
| `img` | `image/png` |
| `pdf` | `application/pdf` (print-scaled, same as in-app export) |

---

## Template size (`size`)

| Value | Alias | Layout |
|-------|-------|--------|
| `small` | `s`, `ticket` | Receipt strip |
| `medium` | `m`, `standard` | A5 |
| `large` | `l`, `full` | A4 |

---

## Accent color (`color`)

- `default` — black preset  
- Named: `blue`, `green`, `orange`, `gray`  
- Hex: `#2563eb` (custom)  
- Optional: `applyBorders=true` to tint dashed borders  

---

## Logo (`showLogo`)

- `showLogo=true` (default) — show `businessLogo` when provided  
- `showLogo=false` — hide logo in header even if `businessLogo` is set  

Logo URLs must use `http://` or `https://`.

---

## Languages (`lang`)

Supported UI languages: `en`, `ar`, `fr` (RTL for `ar`).

---

## Shared query parameters

| Parameter | Description |
|-----------|-------------|
| `businessName` | Seller name on invoice |
| `businessLogo` | Logo image URL |
| `businessPhone` | Business phone |
| `businessAddress` | Business address |
| `businessTaxId` | Tax ID |
| `clientName` | **Required** — customer name |
| `clientPhone` | Customer phone |
| `clientAddress` | Customer address |
| `clientGender` | `M` or `F` |
| `taxRate` | Tax percent (0–100) |
| `discount` | Discount amount |
| `paymentMethod` | Payment method id |
| `paymentDetails` | Payment instructions |
| `notes` | Footer notes |
| `dueDate` | ISO date `YYYY-MM-DD` |
| `currency` | Currency code (default `MRU`) |
| `autoInvoiceNumber` | `true` (default) — derive a stable invoice number from the request; `false` — you must pass `invoiceNumber` |
| `invoiceNumber` | Custom number (**required** when `autoInvoiceNumber=false`) |
| `createdAt` | ISO date/datetime used in the generated number and invoice date (recommended for stable output) |
| `showQrCode` | `true` / `false` |
| `debug` | `true` — verbose JSON errors on capture failure |

---

## Invoice types & type-specific parameters

### `sales`

| Parameter | Description |
|-----------|-------------|
| `items` | JSON array: `[{"description":"…","quantity":1,"unitPrice":100}]` |
| `item0_desc`, `item0_qty`, `item0_price` | Flat item shorthand |
| `shipping` | Shipping amount |

### `subscription`

| Parameter | Description |
|-----------|-------------|
| `planName` | Plan name |
| `billingCycle` | `weekly`, `monthly`, `yearly` |
| `startDate` | Start date |
| `endDate` | End date (if not auto-renew) |
| `autoRenew` | `true` / `false` |
| `pricePerCycle` | Price per cycle |

### `service`

| Parameter | Description |
|-----------|-------------|
| `serviceDescription` | Service description |
| `pricingModel` | `fixed`, `hourly`, `milestone` |
| `fixedAmount` | Fixed price |
| `hours`, `hourlyRate` | Hourly model |
| `milestones` | JSON array of `{title, amount}` |

### `booking`

| Parameter | Description |
|-----------|-------------|
| `bookingDate`, `bookingTime`, `duration` | Appointment |
| `serviceType` | Service label |
| `deposit`, `totalPrice` | Amounts |
| `bookingStatus` | `confirmed`, `cancelled`, `completed` |

### `installment`

| Parameter | Description |
|-----------|-------------|
| `totalAmount` | Total financed |
| `scheduleMode` | `count` or `custom` |
| `installmentCount`, `scheduleStartDate`, `installmentInterval` | Auto schedule |
| `interestOrFees`, `paidAmount` | Fees / paid |
| `installments` | JSON array for custom schedule |

---

## Examples

### Sales (PNG)

```
GET /api/invoice?type=sales&format=img&clientName=Ahmed&businessName=My+Shop&items=[{"description":"Item","quantity":1,"unitPrice":1500}]
```

### Subscription (PDF, blue accent)

```
GET /api/invoice?type=subscription&format=pdf&color=blue&clientName=Client&businessName=Cloud+Co&planName=Pro&billingCycle=monthly&pricePerCycle=2500&startDate=2026-05-01
```

### Arabic RTL

```
GET /api/invoice?lang=ar&clientName=محمد&businessName=متجر&items=[{"description":"منتج","quantity":2,"unitPrice":500}]
```

---

## Errors

**400** — validation failed

```json
{ "error": "Validation failed", "details": ["clientName is required"] }
```

**500** — Playwright capture failed (dev server must be running)

```json
{ "error": "Invoice capture failed", "details": ["…"] }
```

Add `debug=true` for `renderUrl` and setup hints.

---

## Local development

1. Start the app: `pnpm dev`
2. Install Chromium for Playwright:

   ```bash
   pnpm exec playwright install chromium
   ```

3. Optional env:

   ```env
   INVOICE_API_BASE_URL=http://127.0.0.1:3000
   ```

4. Open the [playground](/developers/invoice-api) or call the API directly.

---

## Caching

Identical requests are cached in memory for 60 seconds (`Cache-Control: public, max-age=60`, `X-Invoice-Cache: HIT|MISS`).

---

## Future

- API key authentication  
- Rate limiting  
- POST body for large payloads  
