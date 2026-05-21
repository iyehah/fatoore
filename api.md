# Public Invoice API

> **Full documentation** lives in **[doc/](./doc/README.md)** — architecture diagrams, integration guide, branding, and the complete query-parameter table.

## Quick links

| Topic | Document |
|-------|----------|
| All query parameters (one table) | [doc/api-reference.md](./doc/api-reference.md) |
| Logo, labels, fonts, colors | [doc/branding-and-layout.md](./doc/branding-and-layout.md) |
| How your system connects to Fatoore | [doc/architecture.md](./doc/architecture.md) |
| Deploy & env vars (generic) | [doc/integration-guide.md](./doc/integration-guide.md) |

## At a glance

- **Endpoint:** `GET /api/invoice`
- **Formats:** `format=img` (PNG) or `format=pdf`
- **Playground:** `/developers/invoice-api`
- **Required:** `clientName` (+ line items for `type=sales`)

**Example**

```http
GET /api/invoice?type=sales&format=img&clientName=Client&businessName=Shop&items=[{"description":"Item","quantity":1,"unitPrice":1000}]
```

For defaults, errors, caching, and type-specific fields, see [doc/api-reference.md](./doc/api-reference.md).
