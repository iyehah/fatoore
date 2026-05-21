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
GET /api/invoice?type=sales&format=img&clientName=Iyehah+Hacen&businessName=My+Shop&items=[{"description":"Item","quantity":1,"unitPrice":1500}]
```

### Subscription (PDF, blue accent)

```
GET /api/invoice?type=subscription&format=pdf&color=blue&clientName=Client&businessName=Cloud+Co&planName=Pro&billingCycle=monthly&pricePerCycle=2500&startDate=2026-05-01
```

### Arabic RTL

```
GET /api/invoice?lang=ar&clientName=إيهاه+الحسن&businessName=متجر&items=[{"description":"منتج","quantity":2,"unitPrice":500}]
```

---

## Errors

**400** — validation failed

```json
{ "error": "Validation failed", "details": ["clientName is required"] }
```

**500** — Capture failed (render service unreachable, timeout, or invoice page error)

```json
{ "error": "Invoice capture failed", "details": ["…"] }
```

Add `debug=true` for `renderUrl` and setup hints.

---

## Architecture

```
Client → Vercel GET /api/invoice → Render service POST /render → Playwright opens /invoice/render → PNG/PDF
```

Playwright runs on the **external render service** ([`backend/`](../backend/)), not on Vercel. The invoice UI at `/invoice/render` is unchanged.

---

## Local development

1. Install deps: `pnpm install` from **repo root**, or `npm install` in each of `frontend/` and `backend/`.
2. Terminal 1 — `cd frontend` → `npm run dev` → http://127.0.0.1:3000
3. Terminal 2 — `cd backend` → `npm run dev` → http://127.0.0.1:3001 (do **not** run `pnpm dev:render` from inside `backend/`; that script is only on the repo root)

   ```env
   # frontend/.env.local
   INVOICE_API_BASE_URL=http://127.0.0.1:3000
   RENDER_SERVICE_URL=http://127.0.0.1:3001
   RENDER_SERVICE_API_KEY=your-shared-secret
   ```

   ```env
   # backend/.env
   RENDER_SERVICE_API_KEY=your-shared-secret
   ```

4. Open the [playground](/developers/invoice-api) or call the API directly.

---

## Deployment

### Vercel (frontend)

Set environment variables:

```env
INVOICE_API_BASE_URL=https://your-production-domain
RENDER_SERVICE_URL=https://your-render-service.onrender.com
RENDER_SERVICE_API_KEY=<same secret as render service>
RENDER_SERVICE_TIMEOUT_MS=55000
```

[`vercel.json`](vercel.json) sets **60s** max duration for `/api/invoice` (proxy to render service).

### Render.com (capture service)

Deploy [`backend/`](../backend/) (Docker or Node). See root [`render.yaml`](../render.yaml).

```env
RENDER_SERVICE_API_KEY=<shared secret>
ALLOWED_RENDER_HOST=your-production-domain
RENDER_TIMEOUT_MS=45000
```

Verify `/invoice/render?...` in a browser, then `GET /api/invoice?format=img&...`.

---

## Caching

Identical requests are cached in memory for 60 seconds (`Cache-Control: public, max-age=60`, `X-Invoice-Cache: HIT|MISS`).

---

## Future

- API key authentication  
- Rate limiting  
- POST body for large payloads  
