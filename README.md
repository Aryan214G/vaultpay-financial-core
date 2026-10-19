# VaultPay Financial Core

> Secure, corporate billing, invoice management, and financial operations portal built with Next.js, Tailwind CSS, and Firebase.

🔗 **Live Demo**: [https://vaultpay-financial-core-ocrlg7jm8-aryan214gs-projects.vercel.app/](https://vaultpay-financial-core-ocrlg7jm8-aryan214gs-projects.vercel.app/)

---

## 📌 Overview

**VaultPay Financial Core** is an enterprise-grade financial portal designed for corporate invoice generation, status tracking, secure PDF downloads, and client checkout workflows. It features strict server-enforced role-based access control (RBAC), multi-role dashboards, and authenticated API endpoints.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Multi-Role User Model**: Distinguishes between **Administrators** and **Clients** via Cloud Firestore profiles.
- **Server Token Verification**: Custom `requireAuth` helper validates Firebase ID bearer tokens and verifies user roles on the server using the Firebase Admin SDK.
- **Dedicated Admin Route**: `/admin/dashboard` protected by both client-side session checks and Firestore role authorization with 403 Forbidden screens for unauthorized accounts.
- **Personalized Header & Greetings**: Dynamic user greeting (`Good morning, {displayName}`) and uniform dark-themed sign-out actions.

### 📊 Admin Operations Dashboard
- **Financial Metrics Overview**: Aggregates real-time metrics for total invoiced volume, collected revenue, and outstanding amounts.
- **Invoice Creation**: Form for creating client invoices with client selection, invoice numbering, description, due date, and amount validation.
- **Client Mapping**: Automatically maps invoice `clientId` to registered client names with fallback to email/UID.

### 💳 Client Billing & Invoices
- **Client Dashboard**: Filtered billing history showing only invoices belonging to the signed-in client.
- **Dynamic Invoice Detail Page**: Dedicated route (`/invoices/[invoiceId]`) displaying detailed invoice breakdown, billed recipient, payment status, and due dates.
- **Ownership Enforcement**: API layer rejects any request to view or download an invoice that does not belong to the requesting client (`403 Forbidden`).

### 📄 PDF Invoice Generation
- **Server-Side Rendering with PDFKit**: Dedicated streaming endpoint at `/api/invoices/[invoiceId]/pdf` that formats A4 invoice documents on the fly.
- **Direct Download**: In-browser authenticated PDF download with loading feedback and sanitized filenames.

### 🛒 Checkout Flow
- **Interactive Checkout Route**: `/checkout/[invoiceId]` dedicated to pending invoices.
- **Idempotency & Double-Click Protection**: Disables actions during loading states.
- **Demo Mode Notice**: Explicit sandbox notice indicating payment processing state without modifying Firestore data.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: [Geist Font](https://vercel.com/font)
- **Authentication & Database**: [Firebase Auth](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Admin Backend SDK**: `firebase-admin`
- **PDF Generation**: [PDFKit](https://pdfkit.org/)
- **Hosting & Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/aryan214g/vaultpay-financial-core.git
cd vaultpay-financial-core
```

### 2. Install dependencies

```bash
cd vaultpay-financial-core
npm install
```

### 3. Configure environment variables

Create a `.env.local` file inside the `vaultpay-financial-core` application directory:

```env
# Client-side Firebase SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Authenticated | Verifies ID token and returns `uid`, `email`, and `role` |
| `GET` | `/api/clients` | Admin only | Returns registered client profiles (`uid`, `name`, `email`) |
| `GET` | `/api/invoices` | Authenticated | Lists all invoices for admins, or client-filtered invoices |
| `POST` | `/api/invoices` | Admin only | Creates a new invoice in Firestore |
| `GET` | `/api/invoices/[invoiceId]` | Admin or Owner | Retrieves single invoice details with ownership check |
| `GET` | `/api/invoices/[invoiceId]/pdf` | Admin or Owner | Streams dynamic PDF binary file attachment |

---

## 🛡 Security Architecture

1. **Bearer Token Authentication**: All API requests require a valid Firebase ID token in the `Authorization: Bearer <token>` header.
2. **Server-Side Authorization**: Roles are loaded directly from the Firestore `users` collection via the Admin SDK, never trusted from client-provided state.
3. **Strict Ownership Filtering**: Clients can never access invoices, PDFs, or checkout sessions belonging to other accounts.
