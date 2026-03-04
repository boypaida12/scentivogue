# Scenti Vogue - Developer Documentation

> A reusable Next.js e-commerce platform built for Ghanaian kids clothing & accessories stores.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Developer Setup Guide](#4-developer-setup-guide)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema](#6-database-schema)
7. [API Documentation](#7-api-documentation)
8. [Payment Integration](#8-payment-integration)
9. [Image Upload](#9-image-upload)
10. [Deployment Guide](#10-deployment-guide)
11. [Reusing for New Clients](#11-reusing-for-new-clients)
12. [Common Issues & Fixes](#12-common-issues--fixes)

---

## 1. Project Overview

Scenti Vogue is a full-stack e-commerce platform built with Next.js 15. It includes a customer-facing storefront and a password-protected admin dashboard.

### Features

- Product & category management (CRUD)
- Multi-image upload via Cloudinary
- Shopping cart with localStorage persistence
- Checkout with Paystack (mobile money & bank card)
- Cash on Delivery (COD) for orders under GH₵ 200
- Order management with status tracking
- Paystack webhook for reliable order creation
- Responsive design (mobile-first)

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Frontend + Backend |
| Language | TypeScript | Type safety |
| Database | PostgreSQL (Supabase) | Data storage |
| ORM | Prisma 5 | Database queries |
| Auth | NextAuth v4 | Admin authentication |
| UI | shadcn/ui + Tailwind CSS | Components & styling |
| Images | Cloudinary | Image storage & CDN |
| Payments | Paystack | Mobile money & card |
| Deployment | Vercel | Hosting |

---

## 3. Project Structure

```
scentivogue/
├── app/
│   ├── admin/                        # Admin dashboard (protected)
│   │   ├── login/page.tsx            # Admin login
│   │   ├── dashboard/page.tsx        # Stats overview
│   │   ├── products/                 # Product management
│   │   │   ├── page.tsx              # Products list
│   │   │   ├── new/page.tsx          # Add product
│   │   │   └── [id]/edit/page.tsx    # Edit product
│   │   ├── categories/page.tsx       # Category management
│   │   └── orders/                   # Order management
│   │       ├── page.tsx              # Orders list
│   │       └── [id]/page.tsx         # Order detail
│   ├── api/                          # API routes
│   │   ├── auth/[...nextauth]/       # NextAuth handler
│   │   ├── products/                 # Products CRUD
│   │   ├── categories/               # Categories CRUD
│   │   ├── upload/                   # Cloudinary upload
│   │   ├── checkout/
│   │   │   └── cod/route.ts          # COD order creation
│   │   ├── orders/[id]/
│   │   │   ├── status/route.ts       # Update order status
│   │   │   └── payment-status/       # Update payment status
│   │   └── payment/
│   │       ├── initialize/route.ts   # Paystack init
│   │       ├── verify/route.ts       # Verify payment
│   │       └── webhook/route.ts      # Paystack webhook
│   ├── products/                     # Storefront
│   │   ├── page.tsx                  # Products listing
│   │   └── [slug]/page.tsx           # Product detail
│   ├── cart/page.tsx                 # Shopping cart
│   ├── checkout/
│   │   ├── page.tsx                  # Checkout form
│   │   ├── success/page.tsx          # Payment success
│   │   └── confirmation/             # COD confirmation
│   ├── layout.tsx                    # Root layout (providers)
│   └── page.tsx                      # Homepage
├── components/
│   ├── admin/                        # Admin components
│   │   ├── product-form.tsx          # Create/edit product
│   │   ├── products-table.tsx        # Products list table
│   │   ├── categories-table.tsx      # Categories table
│   │   ├── create-category-dialog.tsx # Create category modal
│   │   ├── edit-category-dialog.tsx  # Edit category modal
│   │   ├── image-upload.tsx          # Image upload component
│   │   ├── order-status-update.tsx   # Update order status
│   │   └── orders-table.tsx          # Orders list table
│   ├── store/                        # Storefront components
│   │   ├── store-navbar.tsx          # Reusable navbar
│   │   ├── store-footer.tsx          # Reusable footer
│   │   ├── store-layout.tsx          # Layout wrapper
│   │   ├── product-card.tsx          # Reusable product card
│   │   ├── product-image-gallery.tsx # Image gallery
│   │   ├── add-to-cart-button.tsx    # Add to cart
│   │   └── cart-badge.tsx            # Cart count badge
│   └── providers/
│       └── session-provider.tsx      # NextAuth session
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── prisma.ts                     # Prisma client singleton
│   ├── cart-context.tsx              # Cart state (Context API)
│   └── use-mounted.ts                # SSR hydration helper
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration history
├── scripts/
│   ├── create-admin.ts               # Create first admin user
│   └── cleanup-test-data.ts          # Remove test data
├── types/
│   └── next-auth.d.ts                # NextAuth type extensions
├── next.config.ts                    # Next.js config
└── .env                              # Environment variables
```

---

## 4. Developer Setup Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier)
- Cloudinary account (free tier)
- Paystack account (test keys for development)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/scentivogue.git
cd scentivogue
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. After project is created, go to **Settings → Database**
3. Under **Connection String**, select **Session Pooler**
4. Copy the connection string (use port `5432`)

> ⚠️ **Important:** Use the **Session Pooler** (not Direct Connection) for IPv4 compatibility with Vercel serverless functions.

### Step 4: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From the dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### Step 5: Set Up Paystack

1. Go to [paystack.com](https://paystack.com) and create an account
2. Go to **Settings → API Keys & Webhooks**
3. Copy your **Test Public Key** and **Test Secret Key**
4. Add webhook URL (see [Payment Integration](#8-payment-integration))

### Step 6: Configure Environment Variables

Create a `.env` file in the root directory (see [Environment Variables](#5-environment-variables) for full reference):

```bash
cp .env.example .env
# Fill in your values
```

### Step 7: Set Up the Database

Run Prisma migrations to create all tables:

```bash
npx prisma migrate dev
```

### Step 8: Create Admin User

```bash
npm run create-admin
```

Default credentials (change after first login):

- **Email:** `admin@example.com`
- **Password:** `admin123`

### Step 9: Start Development Server

```bash
npm run dev
```

Visit:

- **Storefront:** `http://localhost:3000`
- **Admin:** `http://localhost:3000/admin/login`

---

## 5. Environment Variables

Create a `.env` file in the root with the following variables:

```env
# ─── Database ────────────────────────────────────────────
# Supabase Session Pooler connection string (port 5432)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# ─── NextAuth ─────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"

# Your app URL (use https:// in production)
NEXTAUTH_URL="http://localhost:3000"

# ─── Cloudinary ───────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ─── Paystack ─────────────────────────────────────────────
# Use pk_test_ / sk_test_ for development
# Use pk_live_ / sk_live_ for production
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxx"
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxx"
```

### Variable Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for JWT signing |
| `NEXTAUTH_URL` | ✅ | Full URL of the app |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | ✅ | Paystack public key |
| `PAYSTACK_SECRET_KEY` | ✅ | Paystack secret key |

> ⚠️ Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in `NEXT_PUBLIC_` variables.

---

## 6. Database Schema

### Models Overview

```
User ──────────────────── Admin accounts
Category ─────────────── Product organization
Product ──────────────── Store inventory
  └── images[]           Array of Cloudinary URLs
Customer ─────────────── Shoppers
Order ────────────────── Purchases
  └── OrderItem[]        Line items (product + quantity + price)
```

### Enums

```prisma
enum UserRole {
  ADMIN
  STAFF
}

enum PaymentStatus {
  PENDING   # Not yet paid
  PAID      # Payment confirmed
  FAILED    # Payment failed
  REFUNDED  # Payment refunded
}

enum OrderStatus {
  PENDING     # Order received, not yet processed
  PROCESSING  # Order confirmed, being prepared
  SHIPPED     # Order dispatched
  DELIVERED   # Order received by customer
  CANCELLED   # Order cancelled
}
```

### Key Design Decisions

**Three-tier pricing on Product:**

- `costPrice` - What you paid the supplier (admin-only, profit tracking)
- `price` - What customers pay
- `compareAtPrice` - Original price (used to show discounts)

**Order creation timing:**

- **Online payments (Paystack):** Order is created ONLY after Paystack webhook confirms payment. This prevents ghost/abandoned orders.
- **COD orders:** Order created immediately since no payment is required upfront.

**COD threshold:** GH₵ 200. Orders at or above this amount cannot use Cash on Delivery. Configured in `app/checkout/page.tsx`:

```typescript
const COD_THRESHOLD = 200;
```

---

## 7. API Documentation

All API routes are under `/app/api/`. Admin routes require a valid NextAuth session.

### Products

#### `GET /api/products`

Returns all products with their categories.

**Response:**

```json
[
  {
    "id": "cml123...",
    "name": "Boys Cotton T-Shirt",
    "slug": "boys-cotton-tshirt",
    "price": 45.00,
    "compareAtPrice": 60.00,
    "stock": 10,
    "isActive": true,
    "isFeatured": false,
    "images": ["https://res.cloudinary.com/..."],
    "category": { "id": "...", "name": "Boys Clothing" }
  }
]
```

#### `POST /api/products`

Creates a new product. Requires auth.

**Request body:**

```json
{
  "name": "Boys Cotton T-Shirt",
  "slug": "boys-cotton-tshirt",
  "description": "Comfortable cotton t-shirt...",
  "price": 45.00,
  "compareAtPrice": 60.00,
  "costPrice": 25.00,
  "sku": "KJH-001",
  "stock": 10,
  "categoryId": "cml123...",
  "isActive": true,
  "isFeatured": false,
  "images": ["https://res.cloudinary.com/..."]
}
```

#### `GET /api/products/[id]`

Returns a single product by ID.

#### `PUT /api/products/[id]`

Updates a product. Requires auth. Same body as POST.

#### `DELETE /api/products/[id]`

Deletes a product. Requires auth.

---

### Categories

#### `GET /api/categories`

Returns all categories.

#### `POST /api/categories`

Creates a new category. Requires auth.

**Request body:**

```json
{
  "name": "Boys Clothing",
  "slug": "boys-clothing",
  "description": "Clothing for boys aged 0-12"
}
```

#### `GET /api/categories/[id]`

Returns a single category with product count.

#### `PUT /api/categories/[id]`

Updates a category. Requires auth.

#### `DELETE /api/categories/[id]`

Deletes a category. Requires auth. Fails if category has products.

---

### Orders

#### `GET /api/orders` *(Admin only)*

Returns all orders with customer and item details.

#### `PUT /api/orders/[id]/status`

Updates order fulfillment status. Requires auth.

**Request body:**

```json
{
  "status": "SHIPPED"
}
```

**Valid values:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

#### `PUT /api/orders/[id]/payment-status`

Updates payment status (primarily for COD orders). Requires auth. When set to `PAID`, automatically sets `paidAt` timestamp and order status to `DELIVERED`.

**Request body:**

```json
{
  "paymentStatus": "PAID"
}
```

**Valid values:** `PENDING`, `PAID`, `FAILED`, `REFUNDED`

---

### Checkout

#### `POST /api/checkout/cod`

Creates a Cash on Delivery order immediately (no payment required).

**Request body:**

```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0244123456"
  },
  "shipping": {
    "address": "123 Main Street",
    "city": "Accra",
    "region": "Greater Accra"
  },
  "items": [
    { "productId": "cml123...", "quantity": 2, "price": 45.00 }
  ],
  "notes": "Optional delivery instructions",
  "subtotal": 90.00,
  "shippingCost": 20.00,
  "total": 110.00
}
```

**Response:**

```json
{
  "orderNumber": "ORD-1234567890",
  "orderId": "cml123..."
}
```

> ⚠️ Returns `400` if total >= GH₵ 200.

---

### Payments

#### `POST /api/payment/initialize`

Initializes a Paystack transaction. Stores ALL order data in Paystack metadata. No order is created in the database at this point.

**Request body:**

```json
{
  "email": "john@example.com",
  "amount": 55.00,
  "customerName": "John Doe",
  "customerPhone": "0244123456",
  "shipping": {
    "address": "123 Main Street",
    "city": "Accra",
    "region": "Greater Accra"
  },
  "items": [
    {
      "productId": "cml123...",
      "quantity": 1,
      "price": 35.00,
      "name": "Boys Cotton T-Shirt"
    }
  ],
  "paymentMethod": "momo",
  "notes": "",
  "subtotal": 35.00,
  "shippingCost": 20.00
}
```

**Response:**

```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "PAY-1234567890-ABCDEF"
}
```

#### `GET /api/payment/verify?reference=[ref]`

Verifies payment after Paystack redirect. Checks if webhook already created the order, falls back to direct Paystack verification if webhook was delayed.

**Response:**

```json
{
  "success": true,
  "orderNumber": "ORD-1234567890",
  "source": "webhook"
}
```

#### `POST /api/payment/webhook`

Receives Paystack webhook events. Verifies HMAC signature, then creates the order on `charge.success` event. This is the primary order creation path for online payments.

> ⚠️ This endpoint must be publicly accessible. Configure the URL in the Paystack dashboard.

---

### Upload

#### `POST /api/upload`

Uploads an image to Cloudinary. Requires auth.

**Request:** `multipart/form-data` with `file` field.

**Response:**

```json
{
  "url": "https://res.cloudinary.com/...",
  "public_id": "scentivogue/products/abc123"
}
```

#### `DELETE /api/upload?publicId=[id]`

Deletes an image from Cloudinary. Requires auth.

---

## 8. Payment Integration

### How Paystack Integration Works

```
Customer fills checkout form
        │
        ▼
POST /api/payment/initialize
  - Sends all order data in metadata
  - NO order created in DB yet
  - Returns authorization_url
        │
        ▼
Customer redirected to Paystack
  - Pays with mobile money or card
        │
     ┌──┴──────────────────┐
     │                     │
     ▼                     ▼
Paystack Webhook       Customer redirected to
POST /api/payment/     /checkout/success
webhook                        │
  - Verifies signature         ▼
  - Creates order in DB  GET /api/payment/verify
  - Reduces stock          - Checks if webhook
  - Sets status PAID         created order
                           - If not (delayed),
                             creates order directly
```

### Setting Up Webhooks

**For local development (ngrok):**

```bash
# Terminal 1 - Run Next.js
npm run dev

# Terminal 2 - Expose to internet
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`) and add to Paystack:

1. Go to [dashboard.paystack.com](https://dashboard.paystack.com)
2. **Settings → API Keys & Webhooks**
3. Set **Webhook URL** to: `https://abc123.ngrok-free.app/api/payment/webhook`

> ⚠️ The ngrok URL changes every time you restart it. Update Paystack each time.

**For production:**

Set webhook URL to: `https://yourdomain.com/api/payment/webhook`

### Switching to Live Mode

When ready for real payments:

1. Go to Paystack dashboard and toggle to **Live Mode**
2. Copy your **Live** API keys
3. Update `.env` (and Vercel environment variables):

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxx"
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxx"
```

### COD Threshold

Cash on Delivery is only available for orders under GH₵ 200. To change this threshold, update in `app/checkout/page.tsx`:

```typescript
const COD_THRESHOLD = 200; // Change this value
```

Also update the server-side validation in `app/api/checkout/cod/route.ts`:

```typescript
if (total >= 200) { // Keep in sync with frontend
  return NextResponse.json(
    { error: "Cash on Delivery is only available for orders under GH₵ 200" },
    { status: 400 }
  );
}
```

---

## 9. Image Upload

Images are stored on Cloudinary under the folder `scentivogue/products`.

### Configuration

Images are configured in `next.config.ts` to allow Cloudinary's domain:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};
```

### Limits

- Maximum **5 images** per product
- First image is used as the **main/thumbnail** image
- Images are auto-optimized by Cloudinary's CDN
- Deleting a product image also removes it from Cloudinary

### Changing the Upload Folder

To use a different Cloudinary folder (e.g., for a new client), update `app/api/upload/route.ts`:

```typescript
const result = await cloudinary.uploader.upload(dataURI, {
  folder: "your-client-name/products", // Change this
  resource_type: "auto",
});
```

---

## 10. Deployment Guide

### Prerequisites

- Vercel account
- All third-party accounts set up (Supabase, Cloudinary, Paystack)
- Repository pushed to GitHub

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repository
3. Framework preset will auto-detect **Next.js**
4. **Do not deploy yet** - add environment variables first

### Step 3: Add Environment Variables in Vercel

In the Vercel project settings, go to **Settings → Environment Variables** and add all variables from your `.env` file:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase Session Pooler URL |
| `NEXTAUTH_SECRET` | Your secret |
| `NEXTAUTH_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_...` for production |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` for production |

> ⚠️ Update `NEXTAUTH_URL` to your actual production URL, not localhost.

### Step 4: Deploy

Click **Deploy** in Vercel. The first deployment will take 2-3 minutes.

### Step 5: Run Database Migrations

After deployment, your database schema needs to be applied. Since you're using Supabase (already has your migrations from development), this step is usually already done.

If deploying to a fresh database:

```bash
# Set DATABASE_URL to production database
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### Step 6: Create Production Admin User

```bash
# Set DATABASE_URL to production database
DATABASE_URL="your-production-url" npm run create-admin
```

### Step 7: Configure Production Webhook

Update Paystack webhook URL:

1. Paystack Dashboard → **Settings → API Keys & Webhooks**
2. Set webhook URL to: `https://yourdomain.com/api/payment/webhook`

### Step 8: Test Production

Before going live:

- [ ] Test admin login
- [ ] Create a test product
- [ ] Test full checkout flow with Paystack test keys
- [ ] Switch to Paystack live keys
- [ ] Test one real payment
- [ ] Verify order appears in admin dashboard

### Custom Domain (Optional)

1. In Vercel project → **Settings → Domains**
2. Add your domain (e.g., `scentivogue.com`)
3. Update DNS records at your domain registrar
4. Update `NEXTAUTH_URL` environment variable to new domain
5. Update Paystack webhook URL to new domain

---

## 11. Reusing for New Clients

This platform is designed to be reused. Here's how to set it up for a new client:

### Step 1: Fork or Copy the Repository

```bash
git clone https://github.com/yourusername/scentivogue.git new-client-store
cd new-client-store
```

### Step 2: Update Branding

Find and replace the store name across the codebase:

**Files to update:**

- `app/layout.tsx` - Page title and metadata
- `components/store/store-navbar.tsx` - Logo/store name
- `components/store/store-footer.tsx` - Footer content, contact info
- `app/page.tsx` - Hero section text

### Step 3: Create New Third-Party Accounts

For each client, create separate accounts to keep data isolated:

- New **Supabase** project → New `DATABASE_URL`
- New **Cloudinary** folder (or account) → Update upload folder path
- New **Paystack** account (or use same account with different integration)

### Step 4: Update COD Threshold

Based on client's business model, update in `app/checkout/page.tsx` and `app/api/checkout/cod/route.ts`:

```typescript
const COD_THRESHOLD = 200; // Discuss with client
```

### Step 5: Update Shipping Cost

Free shipping threshold in `app/checkout/page.tsx`:

```typescript
const shippingCost = total >= 200 ? 0 : 20; // GH₵ 20 shipping under GH₵ 200
```

### Step 6: Deploy Fresh Instance

Follow the [Deployment Guide](#10-deployment-guide) with new client credentials.

---

## 12. Common Issues & Fixes

### Database Connection Failed

**Error:** `Can't reach database server`

**Fix:** Use Supabase **Session Pooler** connection string (port 5432), not the Direct Connection:

```env
# ✅ Correct - Session Pooler
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# ❌ Wrong - Direct connection (IPv6 issues with Vercel)
DATABASE_URL="postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres"
```

---

### Paystack Payment Fails

**Error:** `Failed to initialize payment`

**Checklist:**

- Verify `PAYSTACK_SECRET_KEY` starts with `sk_test_` (development) or `sk_live_` (production)
- Restart dev server after updating `.env`
- Check terminal logs for detailed error

---

### Hydration Error on Cart Badge

**Error:** `Hydration failed because the server rendered HTML didn't match the client`

**Cause:** Cart data in localStorage only exists on the client, not during server render.

**Fix:** Use the `useMounted` hook before rendering cart count:

```typescript
const mounted = useMounted();

// Only render badge after mount
{mounted && itemCount > 0 && <span>{itemCount}</span>}
```

---

### Next.js Image Width Error

**Error:** `Image is missing required width property`

**Fix:** Use `fill` with a relative parent container instead of `width`/`height`:

```typescript
// ✅ Correct
<div className="relative w-24 h-24">
  <Image src={url} alt="..." fill sizes="96px" className="object-cover" />
</div>

// ❌ Wrong (without relative parent)
<Image src={url} alt="..." className="w-full h-full" />
```

---

### Prisma Enum Type Error

**Error:** `Type 'string' is not assignable to type 'PaymentStatus'`

**Fix:** Import and use Prisma enums directly instead of plain strings:

```typescript
import { PaymentStatus, OrderStatus } from "@prisma/client";

// ✅ Correct
data: { paymentStatus: paymentStatus as PaymentStatus }

// ❌ Wrong
data: { paymentStatus: "PAID" }
```

---

### Paystack Metadata Returns Strings

**Error:** `Argument subtotal: Invalid value provided. Expected Float, provided String`

**Cause:** Paystack stores metadata as JSON and returns all values as strings.

**Fix:** Always parse numbers from Paystack metadata:

```typescript
const subtotal = parseFloat(metadata.subtotal);
const quantity = parseInt(String(item.quantity));
const price = parseFloat(String(item.price));
```

---

### COD Not Showing in Payment Options

**Cause:** Order total is at or above GH₵ 200.

**Expected behavior:** COD option is hidden for orders >= GH₵ 200. This is intentional to limit cash handling risk.

---

### Webhook Not Receiving Events (Local)

**Fix:** Use ngrok to expose localhost to the internet:

```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 3000
```

Update Paystack webhook URL to ngrok URL each time you restart ngrok.

---

## Useful Commands

```bash
# Start development server
npm run dev

# Create initial admin user
npm run create-admin

# Remove all test data (orders, customers) before going live
npm run cleanup

# Run database migrations after schema changes
npx prisma migrate dev

# Open Prisma Studio (visual database browser)
npx prisma studio

# Add new shadcn/ui component
npx shadcn@latest add [component-name]

# Generate Prisma client after schema changes
npx prisma generate
```

---

### Last updated: February 2026

### Platform: Scenti Vogue v1.0
