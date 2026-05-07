<div align="center">
<img src="./public/logo.svg" width="300" alt="Fatoore Logo" />
<p>
  <img src="https://img.shields.io/github/stars/iyehah/fatoore?style=flat-square" />
  <img src="https://img.shields.io/github/forks/iyehah/fatoore?style=flat-square" />
  <img src="https://img.shields.io/github/issues/iyehah/fatoore?style=flat-square" />
  <img src="https://img.shields.io/github/license/iyehah/fatoore?style=flat-square" />
</p>
</div>

> *Fatoore* Fast web app for creating and managing invoices with support for Mauritanian context (MRU, local payment methods such as Bankily, Seddad, Masrvi, BimBank). Authentication and user records use **Firebase**; invoices and business branding profiles are stored **in the browser** (`localStorage`) per signed-in user.

## Requirements

- **Node.js** 20+ (or current LTS) and npm  
- A **Firebase** project with **Authentication** (e.g. Google provider) and **Firestore** enabled

### Environment variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Data model notes

- **User profile** in Firestore (`users/{uid}`) is used after sign-in (see `getUserDocument` / `createUserDocument`).
- **Invoices** and **business profiles** are **not** synced to Firestore in the current codebase; they live in `localStorage` keyed by Firebase `uid`. Clearing site data or using another browser loses that local data unless you add cloud sync later.

## Invoice export

Export is triggered from the invoice preview dialog (`components/invoice/invoice-pdf.tsx`). Implementation lives in `lib/pdf-generator.ts` (PNG via `html-to-image`, PDF by embedding that image in `jspdf`).
