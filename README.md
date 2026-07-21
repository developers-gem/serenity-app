# Serenity Backend — Node.js + Express + MongoDB

The API server for the Serenity Flutter app: anonymous identity, Sage AI
chat (Claude), mood tracking, journaling, therapist directory & booking,
Stripe billing, and notifications.

Every endpoint here matches what the Flutter client's `services/` layer
already expects (see the Flutter project's README) — point the app at
this server with no client-side changes needed.

## Stack

- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — data storage
- **JWT** — session tokens for the anonymous-handle identity model (no
  passwords, no email required)
- **Anthropic SDK (Claude)** — powers Sage's replies
- **Stripe** — subscription checkout + webhook-driven billing records

## Getting started

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY, STRIPE_* at minimum
npm run seed     # populates the therapist directory
npm run dev      # starts on http://localhost:4000 with nodemon
```

Health check: `GET http://localhost:4000/api/health` → `{ status: "ok" }`

### Required environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs session tokens — use a long random string |
| `ANTHROPIC_API_KEY` | Powers Sage's replies via Claude |
| `STRIPE_SECRET_KEY` | Stripe API access (test mode key while developing) |
| `STRIPE_WEBHOOK_SECRET` | Verifies incoming Stripe webhook signatures |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` | Stripe Price IDs for the two plans |

See `.env.example` for the full list including optional ones.

### Stripe webhook setup (local dev)

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## Authentication model

There is **no email/password login** — this is intentional, matching the
product's anonymous-by-design identity system:

1. Client calls `POST /api/auth/anonymous` once, with no body.
2. Server generates a unique `anon-XXXXXXXX` handle, creates a `User`
   document, and returns `{ user, token }`.
3. Client stores the JWT and sends it as `Authorization: Bearer <token>`
   on every subsequent request.
4. `POST /api/auth/regenerate-handle` lets a user rotate their visible
   handle without losing their history (same underlying `User._id`).

## Data models (MongoDB / Mongoose)

### User
The anonymous identity — the only "account" concept in the system.

| Field | Type | Notes |
|---|---|---|
| `anonHandle` | String | Unique, format `anon-XXXXXXXX` |
| `isPremium` | Boolean | Set by Stripe webhook on subscription activation |
| `contactEmail` | String \| null | Optional, opt-in only, never required |
| `notificationPrefs` | Object | `dailyCheckInReminders`, `sessionReminders`, `sageFollowUps` (Booleans) |
| `lastActiveAt` | Date | |
| `createdAt` / `updatedAt` | Date | Auto (timestamps) |

### MoodEntry
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `score` | Number | 1–10 |
| `tags` | [String] | enum: calm, anxious, sad, angry, hopeful, tired, lonely, grateful, numb, overwhelmed |
| `note` | String \| null | Optional, max 2000 chars |
| `createdAt` | Date | Auto |

### JournalEntry
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `title` | String | Defaults to "Untitled entry" |
| `body` | String | Required, max 20,000 chars |
| `moodScore` | Number \| null | Optional 1–10 link to how they felt |
| `createdAt` | Date | Auto |

### ChatThread / ChatMessage
Sage AI conversations, split so the thread list is cheap to query.

**ChatThread**: `user`, `clientThreadId` (client-generated id), `title`,
`preview`, `lastMessageAt`.

**ChatMessage**: `thread` (→ ChatThread), `user`, `role` (`user`|`assistant`),
`content` (max 8000 chars), `createdAt`.

### Therapist
Catalog data (admin-managed via the seed script), not user-owned.

| Field | Type | Notes |
|---|---|---|
| `name`, `specialty`, `bio` | String | |
| `pricePerSession` | Number | |
| `languages`, `approaches` | [String] | e.g. `["CBT", "EMDR"]` |
| `rating` | Number | 0–5 |
| `yearsExperience` | Number | |
| `isActive` | Boolean | Soft-delete flag; hides from directory |

### TherapySession
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `therapist` | ObjectId → Therapist | |
| `therapistName` | String | Denormalized at booking time |
| `pricePaid` | Number | Denormalized — historical accuracy even if price changes later |
| `datetime` | Date | Must be in the future at booking time |
| `status` | String | `scheduled` \| `completed` \| `cancelled` |

### Subscription (one per user)
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Unique |
| `plan` | String | `none` \| `monthly` \| `yearly` |
| `status` | String | `inactive` \| `active` \| `past_due` \| `canceled` |
| `stripeCustomerId` / `stripeSubscriptionId` | String \| null | |
| `currentPeriodEnd` | Date \| null | |
| `cancelAtPeriodEnd` | Boolean | |

### Payment
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `amount` | Number | In dollars, not cents |
| `description` | String | |
| `kind` | String | `subscription` \| `session` |
| `relatedSession` | ObjectId → TherapySession \| null | |
| `stripePaymentIntentId` | String \| null | |

### Invoice
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `stripeInvoiceId` | String | Unique |
| `url` | String | Stripe-hosted invoice page |
| `amount` | Number | |

### Notification
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `title`, `body` | String | |
| `icon` | String | enum: `mood`, `session`, `sage`, `streak`, `general` — map to a Flutter icon client-side |
| `read` | Boolean | |

## API reference

All routes are prefixed with `/api`. All routes except `POST /auth/anonymous`
and the Stripe webhook require `Authorization: Bearer <token>`.

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| GET | `/health` | — | `{ status: "ok" }` |
| POST | `/auth/anonymous` | — | `{ user, token }` |
| GET | `/auth/me` | — | `{ user }` |
| POST | `/auth/regenerate-handle` | — | `{ user }` (new handle) |
| POST | `/sage/message` | `{ threadId, message }` | `{ reply }` |
| GET | `/sage/history` | `?threadId=` | `[ChatMessage]` |
| GET | `/sage/threads` | — | `[SageThread]` |
| POST | `/mood` | `{ score, tags, note }` | `MoodEntry` |
| GET | `/mood` | `?limit=30` | `[MoodEntry]` |
| GET | `/mood/latest` | — | `MoodEntry` or `204` |
| GET | `/journal` | — | `[JournalEntry]` |
| POST | `/journal` | `{ title, body, moodScore }` | `JournalEntry` |
| DELETE | `/journal/:id` | — | `204` |
| GET | `/therapists` | `?specialty=` | `[Therapist]` |
| GET | `/sessions` | — | `[TherapySession]` |
| POST | `/sessions` | `{ therapistId, datetime }` | `TherapySession` |
| GET | `/billing/summary` | — | `BillingSummary` |
| POST | `/billing/checkout` | `{ plan: "monthly"\|"yearly" }` | `{ url }` |
| POST | `/webhooks/stripe` | *(raw Stripe event)* | `{ received: true }` |
| GET | `/notifications` | — | `[Notification]` |
| POST | `/notifications/read-all` | — | `204` |

### Example: bootstrapping a session

```bash
curl -X POST http://localhost:4000/api/auth/anonymous
# → { "user": { "id": "...", "anonHandle": "anon-3f8a1c2b", ... }, "token": "eyJ..." }

curl http://localhost:4000/api/therapists \
  -H "Authorization: Bearer eyJ..."
```

## Project structure

```
src/
├── server.js              # Boots DB connection + Express listener
├── app.js                 # Express app: middleware, routes, error handling
├── config/
│   ├── env.js               # Centralized env var access
│   └── db.js                 # Mongoose connection
├── models/                 # One file per Mongoose schema (see table above)
├── middleware/
│   ├── auth.js               # requireAuth — verifies JWT, loads req.user
│   ├── errorHandler.js       # ApiError class + centralized error responses
│   └── asyncHandler.js       # Wraps async route handlers
├── controllers/            # Business logic per resource
├── routes/                 # Express routers, one per resource + webhookRoutes
├── services/
│   ├── claudeService.js      # Sage's system prompt + Claude API call
│   └── stripeService.js      # Checkout session creation + webhook verification
├── utils/
│   └── generateHandle.js     # Unique anon-XXXXXXXX generator
└── seed/
    └── seedTherapists.js     # Populates the 6 demo therapists
```

## Safety-critical notes

- **Sage's system prompt** (`services/claudeService.js`) establishes Sage
  as a supportive companion, never a clinician, and explicitly instructs
  it to redirect toward crisis resources on any self-harm signal rather
  than continuing with therapeutic technique-giving. Treat changes to
  this prompt with the same care as changes to a legal disclaimer.
- **No PII is required anywhere.** The `User` model has no name, email,
  or password field by default — `contactEmail` exists only for
  optional, explicitly-opted-in features and should stay that way.
- Rate limiting is enabled globally (`express-rate-limit`) as a basic
  abuse guard — tune the window/max in `app.js` for your real traffic.

## Next steps

1. `npm install && npm run seed`, point the Flutter app's
   `--dart-define=API_BASE_URL` at this server, and click through end to end.
2. Set up real Stripe products/prices and swap the `.env` placeholders.
3. Consider adding structured logging (e.g. pino) and a process manager
   (pm2) before deploying to production.
4. Add integration tests around the Stripe webhook handler in particular
   — it's the highest-stakes piece of business logic in this service.
