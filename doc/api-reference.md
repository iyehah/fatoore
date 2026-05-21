# API reference

Public HTTP API for generating invoice images and PDFs from query parameters.

## Endpoints

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/api/invoice` | `image/png` or `application/pdf` |
| `GET` | `/invoice/render` | HTML preview (same query string; used by capture internally) |

**Playground:** `/developers/invoice-api`

**Authentication:** None on `/api/invoice` today (rate limits and API keys may be added later).

**Limits:** Query string max **12 000** characters; most text fields max **2 000** characters; line arrays max **50** rows.

---

## Output

| `format` value | Alias | `Content-Type` |
|----------------|-------|----------------|
| `img` | `png` | `image/png` |
| `pdf` | — | `application/pdf` |

---

## Query parameters (full table)

**Scope legend**

| Scope | Meaning |
|-------|---------|
| **all** | Every invoice type |
| **sales** | Sales invoices only |
| **subscription** | Subscription only |
| **service** | Service only |
| **booking** | Booking only |
| **installment** | Installment only |

| Parameter | Type | Default | Scope | Description |
|-----------|------|---------|-------|-------------|
| `type` | `sales` \| `subscription` \| `service` \| `booking` \| `installment` | `sales` | all | Invoice layout and calculation plugin |
| `format` | `img` \| `pdf` \| `png` | `img` | all | Export format (`png` → PNG) |
| `lang` | `en` \| `ar` \| `fr` | `en` | all | Invoice UI language (RTL for `ar`) |
| `size` | see [sizes](./branding-and-layout.md#template-size) | `medium` | all | Template size (`s`/`m`/`l`, `ticket`, `standard`, `full`, …) |
| `font` | see [fonts](./branding-and-layout.md#fonts) | `geist` | all | Invoice typography |
| `color` | `default` \| preset \| `#hex` | `default` | all | Accent color (see [colors](./branding-and-layout.md#accent-color)) |
| `applyBorders` | `true` \| `false` | `false` | all | Tint dashed/solid borders with accent |
| `showLogo` | `true` \| `false` | `true` | all | Show `businessLogo` in header when URL provided |
| `showQrCode` | `true` \| `false` | `true` | all | Show payment QR block when data allows |
| `exportMode` | `true` \| `false` | `true` (API) | all | Export-optimized layout (set automatically in API flow) |
| `debug` | `true` \| `false` | `false` | all | Verbose JSON on capture failures |
| `businessName` | string | `Business` | all | Seller name on invoice |
| `businessLogo` | URL (`http`/`https`) | — | all | Logo image URL (honored when `showLogo=true`) |
| `businessPhone` | string | — | all | Seller phone |
| `businessAddress` | string | — | all | Seller address |
| `businessTaxId` | string | — | all | Tax / registration ID |
| `clientName` | string | — | **all (required)** | Customer name |
| `clientPhone` | string | — | all | Customer phone |
| `clientAddress` | string | — | all | Customer address |
| `clientGender` | `M` \| `F` | — | all | Optional salutation / label hints |
| `taxRate` | number (0–100) | plugin default | all | Tax percent |
| `discount` | number ≥ 0 | plugin default | all | Discount amount |
| `paymentMethod` | string | — | all | Payment method id (e.g. `bankily`, `cash`) |
| `paymentDetails` | string | — | all | Payment instructions shown on invoice |
| `notes` | string | — | all | Footer notes |
| `dueDate` | `YYYY-MM-DD` | — | all | Due date |
| `currency` | string | `MRU` | all | Currency code |
| `autoInvoiceNumber` | `true` \| `false` | `true` | all | Derive stable number from request |
| `invoiceNumber` | string | — | all | **Required** if `autoInvoiceNumber=false` |
| `createdAt` | ISO date/datetime | — | all | Used in generated number and invoice date |
| `items` | JSON array | — | sales | `[{"description","quantity","unitPrice"}]` (max 50) |
| `item{n}_desc` | string | — | sales | Flat shorthand for line `n` description |
| `item{n}_qty` | number | — | sales | Flat shorthand quantity |
| `item{n}_price` | number | — | sales | Flat shorthand unit price |
| `shipping` | number ≥ 0 | — | sales | Shipping amount |
| `planName` | string | — | subscription | Plan title |
| `billingCycle` | `weekly` \| `monthly` \| `yearly` | — | subscription | Billing period |
| `startDate` | `YYYY-MM-DD` | — | subscription | Period start |
| `endDate` | `YYYY-MM-DD` | — | subscription | Period end (non-renewing) |
| `autoRenew` | `true` \| `false` | `true` | subscription | Auto-renew flag |
| `pricePerCycle` | number ≥ 0 | — | subscription | Price per cycle |
| `serviceDescription` | string | — | service | Service summary |
| `pricingModel` | `fixed` \| `hourly` \| `milestone` | — | service | Pricing mode |
| `fixedAmount` | number ≥ 0 | — | service | Fixed price |
| `hours` | number ≥ 0 | — | service | Hours (hourly model) |
| `hourlyRate` | number ≥ 0 | — | service | Rate per hour |
| `milestones` | JSON array | — | service | `[{"title","amount"}]` (max 50) |
| `bookingDate` | `YYYY-MM-DD` | — | booking | Appointment date |
| `bookingTime` | string | — | booking | Time label |
| `duration` | string | — | booking | Duration label |
| `serviceType` | string | — | booking | Service label |
| `deposit` | number ≥ 0 | — | booking | Deposit paid |
| `totalPrice` | number ≥ 0 | — | booking | Total price |
| `bookingStatus` | `confirmed` \| `cancelled` \| `completed` | — | booking | Status badge |
| `totalAmount` | number ≥ 0 | — | installment | Financed total |
| `scheduleMode` | `count` \| `custom` | — | installment | Schedule generation mode |
| `installmentCount` | integer ≥ 1 | — | installment | Number of payments (`count` mode) |
| `scheduleStartDate` | `YYYY-MM-DD` | — | installment | First due date |
| `installmentInterval` | `day` \| `week` \| `month` \| `year` | — | installment | Interval between payments |
| `interestOrFees` | number ≥ 0 | — | installment | Extra fees |
| `paidAmount` | number ≥ 0 | — | installment | Already paid |
| `installments` | JSON array | — | installment | Custom schedule: `{amount,dueDate,status?,paidAmount?}` |

---

## Examples

### Sales (PNG)

```http
GET /api/invoice?type=sales&format=img&clientName=Ada+Lovelace&businessName=My+Shop&items=[{"description":"Widget","quantity":2,"unitPrice":1500}]
```

### Subscription (PDF, blue accent)

```http
GET /api/invoice?type=subscription&format=pdf&color=blue&clientName=Client&businessName=Cloud+Co&planName=Pro&billingCycle=monthly&pricePerCycle=2500&startDate=2026-05-01
```

### Arabic RTL

```http
GET /api/invoice?lang=ar&clientName=عميل&businessName=متجر&type=sales&items=[{"description":"منتج","quantity":1,"unitPrice":500}]
```

### Custom invoice number

```http
GET /api/invoice?autoInvoiceNumber=false&invoiceNumber=INV-2026-0042&clientName=Client&type=sales&items=[{"description":"Item","quantity":1,"unitPrice":100}]
```

---

## Errors

| Status | Meaning |
|--------|---------|
| **400** | Validation failed (missing `clientName`, invalid JSON, wrong enum, …) |
| **500** | Capture failed (capture service down, timeout, render page error) |

**400 example**

```json
{
  "error": "Validation failed",
  "details": ["clientName is required"]
}
```

**500 example**

```json
{
  "error": "Invoice capture failed",
  "details": ["…"]
}
```

Add `debug=true` for extra hints in error payloads when capture fails.

---

## Caching

Identical requests are cached in memory for **60 seconds**.

- Response header: `Cache-Control: public, max-age=60`
- `X-Invoice-Cache: HIT` or `MISS`

Use stable `createdAt` and `autoInvoiceNumber` behavior when you need repeatable filenames.

---

## See also

- [Branding & layout](./branding-and-layout.md) — logo, labels, fonts, colors
- [Architecture](./architecture.md) — system diagrams
- [Integration guide](./integration-guide.md) — production setup
