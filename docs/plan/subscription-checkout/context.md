# Feature Context: Subscription Checkout & Payments

## 1. Overview & Description

- **Ticket / Task**: Task 2: Subscription Checkout & Payments (from `task.md`)
- **Description**: Implementation of subscription creation, Stripe Checkout session integration, customer management, PostgreSQL persistence for users and subscriptions, and webhook processing.
- **Objective**: Allow users to purchase subscriptions via Stripe Test Mode, record User and Subscription entities in PostgreSQL, and maintain real-time subscription lifecycle synchronization via idempotent Stripe webhooks.

## 2. Acceptance Criteria

- [x] Configure Stripe Test Mode (API keys & SDK integration)
- [x] Create Stripe customer for new users
- [x] Create subscription checkout session endpoint (`POST /subscriptions/checkout`)
- [x] Store user information in PostgreSQL (`User` entity: id, email, stripeCustomerId, createdAt)
- [x] Store subscription information in PostgreSQL (`Subscription` entity: id, userId, stripeSubscriptionId, status, priceId, currentPeriodEnd)
- [x] Implement Stripe webhook handler endpoint (`POST /webhooks/stripe`)
- [x] Handle successful payment events (`checkout.session.completed`, `invoice.payment_succeeded`)
- [x] Synchronize payment/subscription status with database
- [x] Handle duplicate webhook events with idempotency checks
- [x] Handle webhook errors gracefully (signature verification & error logging)

## 3. Technical & Architectural Context

- **Impacted Modules**:
  - `SubscriptionsModule` (`src/modules/subscriptions/subscriptions.module.ts`)
  - `UsersModule` (`src/modules/users/users.module.ts`)
  - `WebhooksModule` / `StripeModule` (`src/modules/webhooks/webhooks.module.ts`)
- **Database / Schema**:
  - `User` entity: `id` (UUID), `email` (string, unique), `stripeCustomerId` (string), `createdAt`, `updatedAt`
  - `Subscription` entity: `id` (UUID), `userId` (FK to User), `stripeSubscriptionId` (string, unique), `status` (enum: ACTIVE, CANCELED, PAST_DUE, INCOMPLETE), `priceId` (string), `currentPeriodStart` (Date), `currentPeriodEnd` (Date)
- **APIs & Webhooks**:
  - `POST /subscriptions/checkout`: Creates/retrieves user and returns Stripe Checkout URL
  - `POST /webhooks/stripe`: Public raw-body endpoint verifying Stripe signature (`stripe-signature` header)
- **Background Jobs & Services**:
  - Prepare hooks for subsequent email notifications (Task 4) and renewal reminder queues (Task 6)

## 4. Dependencies & Prerequisites

- **Prerequisites**:
  - Task 1 (Project Setup & PostgreSQL database connection) completed
  - Stripe account test keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- **External Dependencies**:
  - `stripe` npm package
  - `@nestjs/typeorm`, `typeorm`

## 5. Implementation Notes & Constraints

- Webhook endpoint `POST /webhooks/stripe` must receive raw request body to pass `stripe.webhooks.constructEvent` verification.
- Idempotency must be enforced for webhook processing using database lookup on `stripeSubscriptionId` / event ID to prevent duplicate database updates.
- Store test Stripe keys securely in `.env`.

## 6. Definition of Done

- [x] User and Subscription TypeORM entities defined and registered
- [x] Stripe SDK integrated via service module
- [x] Checkout endpoint returns valid checkout URL
- [x] Webhook endpoint correctly parses raw body and updates database status on payment success
- [x] All code implemented and passing type checks (`npm run build`)
- [x] Related documentation updated
