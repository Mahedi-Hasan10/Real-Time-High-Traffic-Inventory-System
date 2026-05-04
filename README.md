# Real-Time High-Traffic Inventory System

A full-stack merch drop platform built for **high concurrency** and **real-time stock tracking**. Users can reserve limited-edition items with atomic guarantees — if 100 users click "Reserve" at the same millisecond for the last item, **only 1 succeeds**.

## Tech Stack

| Layer      | Technology                                    |
|:-----------|:----------------------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS, Shadcn/UI |
| Backend    | Express 5, TypeScript, Socket.IO              |
| Database   | PostgreSQL + Prisma ORM                       |
| Real-Time  | WebSockets (Socket.IO)                        |
| Auth       | JWT (jsonwebtoken) + bcryptjs                 |

---

## How to Run the App

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally (or a remote connection string)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone <repo-url>
cd Real-Time-High-Traffic-Inventory-System

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### a) Create the PostgreSQL database

```sql
CREATE DATABASE merch_drop_db;
```

#### b) Configure the environment

Create a `.env` file inside the `backend/` directory:

```env
NODE_ENV=development
PORT=5001
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/merch_drop_db"
CORS_ORIGIN=*
JWT_SECRET=your-super-secret-jwt-key
```

#### c) Run Prisma migrations

This will create all tables, enums, and indexes in your PostgreSQL database:

```bash
cd backend
npx prisma migrate dev --name init
```

#### d) Generate the Prisma client

```bash
npx prisma generate
```

### 3. Database Schema (SQL)

Prisma generates the following SQL schema. Here is the equivalent raw SQL for reference:

```sql
-- Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "DropStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED');

-- Users table
CREATE TABLE "User" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"     TEXT NOT NULL UNIQUE,
    "name"      TEXT,
    "password"  TEXT NOT NULL,
    "role"      "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Drops table (merch items)
CREATE TABLE "Drop" (
    "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"           TEXT NOT NULL,
    "description"    TEXT,
    "price"          DOUBLE PRECISION NOT NULL,
    "totalStock"     INTEGER NOT NULL,
    "availableStock" INTEGER NOT NULL,
    "startTime"      TIMESTAMP(3) NOT NULL,
    "status"         "DropStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL
);

-- Reservations table
CREATE TABLE "Reservation" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id"),
    "dropId"    UUID NOT NULL REFERENCES "Drop"("id"),
    "status"    "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");
CREATE INDEX "Reservation_dropId_idx" ON "Reservation"("dropId");

-- Purchases table
CREATE TABLE "Purchase" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id"),
    "dropId"    UUID NOT NULL REFERENCES "Drop"("id"),
    "amount"    DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX "Purchase_dropId_idx" ON "Purchase"("dropId");
```

### 4. Start the Application

```bash
# Terminal 1 — Backend (port 5001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Seed an Admin User (Optional)

Register via the UI at `/login`, or use the API directly:

```bash
curl -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@test.com", "password": "password123", "role": "ADMIN"}'
```

Then log in at `/login` and navigate to `/admin` to create your first merch drop.

---

## Architecture Decisions

### 1. How Did You Handle the 60-Second Expiration Logic?

I chose a **server-side polling approach** combined with a **database-stored expiry timestamp**.

#### How it works:

```
User clicks "Reserve"
        │
        ▼
┌─────────────────────────────────────────────┐
│  Transaction:                               │
│  1. SELECT ... FOR UPDATE  (lock the row)   │
│  2. Check availableStock > 0                │
│  3. Decrement availableStock by 1           │
│  4. Create Reservation with                 │
│     expiresAt = NOW() + 60 seconds          │
└─────────────────────────────────────────────┘
        │
        ▼
  WebSocket: broadcast stockUpdate to all clients
        │
        ▼
  ┌───── 60 seconds pass, user does NOT purchase ─────┐
  │                                                     │
  ▼                                                     │
┌─────────────────────────────────────────────┐         │
│  Server-side setInterval (every 10s):       │         │
│  1. Query all PENDING reservations where    │         │
│     expiresAt < NOW()                       │         │
│  2. For each expired reservation:           │         │
│     a. UPDATE status → EXPIRED              │         │
│        (only if still PENDING — idempotent) │         │
│     b. INCREMENT availableStock by 1        │         │
│     c. WebSocket: broadcast stockUpdate     │         │
└─────────────────────────────────────────────┘
```

#### Why this approach?

| Alternative | Why I didn't use it |
|:---|:---|
| **`setTimeout` per reservation** | Doesn't survive server restarts. If the server crashes, all pending timers are lost and stock is never returned. |
| **Cron job (e.g., every 1 minute)** | Too slow for a real-time UX. Users would see stale stock for up to 60s after expiry. |
| **Database-level scheduled events** | Not portable across PostgreSQL versions, harder to emit WebSocket events from. |

The chosen approach (`setInterval` every 10 seconds + `expiresAt` column) gives us:
- **Crash resilience**: The `expiresAt` timestamp is persisted in PostgreSQL. After a restart, the next poll picks up all expired reservations.
- **Near-real-time recovery**: Stock returns within 10 seconds of expiry, and all clients are notified immediately via WebSocket.
- **Idempotent processing**: Uses `updateMany` with a `status: 'PENDING'` guard, so even if two poll cycles overlap, stock is only incremented once.

#### Frontend side:
The frontend runs its own 60-second countdown timer (`setInterval` decrementing `timeLeft` from 60 to 0). When it hits 0, the UI clears the reservation state and shows a "Reservation expired!" toast. This is purely cosmetic — the **server is the authority** on expiration.

---

### 2. How Did You Prevent Multiple Users From Claiming the Same Last Item?

I use **PostgreSQL row-level locking** (`SELECT ... FOR UPDATE`) inside a **serializable Prisma transaction**.

#### The core reservation code:

```typescript
export const reserveItem = async (dropId: string, userId: string) => {
  const reservation = await prisma.$transaction(async (tx) => {
    // Step 1: Lock the Drop row — any concurrent transaction
    //         trying to reserve the SAME drop will BLOCK here
    //         until this transaction completes.
    const drops = await tx.$queryRaw<any[]>`
      SELECT * FROM "Drop" WHERE id = ${dropId} FOR UPDATE
    `;
    const drop = drops[0];

    // Step 2: Check stock AFTER acquiring the lock
    if (!drop || drop.availableStock <= 0) {
      throw new ApiError(400, 'Item is sold out or unavailable');
    }

    // Step 3: Decrement stock
    const updatedDrop = await tx.drop.update({
      where: { id: dropId },
      data: { availableStock: { decrement: 1 } },
    });

    // Step 4: Create reservation record
    const res = await tx.reservation.create({
      data: {
        userId,
        dropId,
        expiresAt: new Date(Date.now() + 60 * 1000),
      },
    });

    return { reservation: res, availableStock: updatedDrop.availableStock };
  });

  // Step 5: Notify all connected clients
  emitStockUpdate(dropId, reservation.availableStock);

  return reservation.reservation;
};
```

#### How `FOR UPDATE` prevents overselling:

```
Timeline (1 item left, availableStock = 1):

User A (Transaction A)          User B (Transaction B)
──────────────────────          ──────────────────────
SELECT ... FOR UPDATE           
→ Gets lock, reads stock=1      SELECT ... FOR UPDATE
                                → BLOCKED (waiting for A's lock)
stock > 0 ✓                     
UPDATE stock = stock - 1        
CREATE reservation              
COMMIT                          
                                → Lock released, reads stock=0
                                stock <= 0 ✗
                                → ApiError: "Item is sold out"
                                ROLLBACK
```

#### Why not optimistic locking?

| Approach | Pros | Cons |
|:---|:---|:---|
| **Pessimistic (`FOR UPDATE`)** ✅ | Guarantees exactly 1 winner. No retries needed. Simple, correct. | Slightly higher latency under extreme contention (transactions queue up). |
| **Optimistic (version column)** | No blocking, higher throughput. | Requires client-side retry logic. Under extreme contention (100 users, 1 item), 99 users fail and must retry — potentially cascading. |

For a **merch drop** scenario where fairness matters and stock is tiny (1–100 units), pessimistic locking is the correct choice. The brief queueing is negligible compared to the risk of retry storms.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| `POST` | `/api/v1/auth/register` | Public | Register a new user |
| `POST` | `/api/v1/auth/login` | Public | Login, returns JWT |
| `GET` | `/api/v1/auth/me` | JWT | Get current user profile |
| `GET` | `/api/v1/drops` | Public | List all active drops (with top 3 purchasers) |
| `POST` | `/api/v1/drops/initialize` | Admin | Create a new merch drop |
| `POST` | `/api/v1/drops/reserve` | JWT | Reserve an item (atomic) |
| `POST` | `/api/v1/drops/purchase` | JWT | Complete purchase from reservation |
| `GET` | `/api/v1/drops/my-reservations` | JWT | Get user's reservation history |
| `GET` | `/api/v1/drops/admin/reservations` | Admin | Get all reservations |

## WebSocket Events

| Event | Direction | Payload | Trigger |
|:------|:----------|:--------|:--------|
| `stockUpdate` | Server → Client | `{ dropId, availableStock }` | On reserve, purchase, or stock recovery |
| `newPurchase` | Server → Client | `{ dropId, userName }` | On successful purchase |

---

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── src/
│       ├── config/                 # Env config, Prisma client
│       ├── controllers/            # Request handlers
│       ├── middlewares/            # Error handling
│       ├── routes/                 # Express routes
│       ├── services/              # Business logic (drop.service.ts)
│       ├── socket/                # Socket.IO setup
│       ├── utils/                 # ApiError, ApiResponse, auth middleware, socket emitters
│       ├── app.ts                 # Express app configuration
│       └── server.ts              # HTTP server + socket + stock recovery scheduler
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Main dashboard (drop listing)
│       │   ├── login/page.tsx     # Auth page (login + register)
│       │   ├── dashboard/page.tsx # User's reservation history
│       │   └── admin/page.tsx     # Admin: create drops, view reservations
│       ├── components/
│       │   └── DropCard.tsx       # Product card with real-time updates
│       ├── lib/                   # Axios client, socket client
│       ├── providers/             # Auth, Socket, React Query providers
│       └── types/                 # TypeScript interfaces
│
└── README.md
```