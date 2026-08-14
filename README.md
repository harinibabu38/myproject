# AI-Enabled SaaS Subscription & Analytics Platform

A robust, enterprise-grade backend service for a SaaS platform built with **NestJS**, **PostgreSQL**, **Redis**, **BullMQ**, **Stripe (Test Mode)**, and the **Model Context Protocol (MCP)**.

---

## 🌟 Key Features

1. **💳 Subscription Checkout & Webhook Handling**:
   - Seamless Stripe Test Mode checkout sessions.
   - Idempotent Stripe webhook receiver (`invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`).
   - Transactional PostgreSQL persistence for Users, Subscriptions, and Invoices.

2. **📄 Automated PDF Invoicing & Storage**:
   - Dynamic programmatic PDF invoice generation using **PDFKit**.
   - Structured local document storage (`uploads/invoices/`) with download endpoints.

3. **✉️ Transactional Email Delivery**:
   - Automated welcome and payment confirmation emails with invoice download links.
   - Integrated with **Mailtrap** SMTP sandbox for safe testing without real emails.

4. **⏰ Subscription Lifecycle & BullMQ Background Processing**:
   - Scheduled Cron job (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`) scanning for expiring subscriptions.
   - Non-blocking asynchronous job queuing powered by **BullMQ** & **Redis** to dispatch renewal reminders.

5. **⚡ Redis Caching & Platform Metrics**:
   - High-performance caching layer for active subscriber counts and simulated revenue totals.
   - Configurable TTL (60s) with automatic and manual cache invalidation (`DELETE /metrics/cache`).

6. **🤖 Model Context Protocol (MCP) AI Integration**:
   - Standalone MCP server exposing platform metrics tools over `stdio` transport.
   - Direct integration ready for **Claude Desktop**, MCP Inspector, or custom AI agents.
   - REST MCP bridge for browser and API-based AI interactions.

7. **🐳 Zero-Friction Docker Infrastructure**:
   - Complete `docker-compose.yml` configuration to spin up PostgreSQL, Redis, and the backend application with healthchecks.

---

## 🏗️ Architecture & Component Diagram

```
+-----------------------------------------------------------------------------------+
|                                  Client / Frontend                                |
+-----------------------------------------------------------------------------------+
       |                                      |                               |
       | POST /subscriptions/checkout         | Stripe Webhook Event          | AI Query
       v                                      v                               v
+------------------+                  +------------------+            +-------------+
| Subscriptions    |                  | Webhooks Module  |            | MCP Server  |
| Module           |                  | (Stripe Verified)|            | (stdio/api) |
+------------------+                  +------------------+            +-------------+
       |                                      |                              |
       | Stripe Checkout                      +------------+                 | Reads
       v                                      |            |                 v
+------------------+                          v            v          +-------------+
| Stripe API       |                  +------------+ +------------+   | Metrics     |
| (Test Mode)      |                  | Invoices   | | Mail       |   | Service     |
+------------------+                  | (PDFKit)   | | (Mailtrap) |   +-------------+
                                      +------------+ +------------+          |
                                            |              |                 |
+-------------------------------------------+--------------+                 v
|                                                                     +-------------+
|   PostgreSQL 16 (Relational DB) <---------------------------------- | Redis 7     |
|   (Users, Subscriptions, Invoices)                                  | (Cache &    |
|                                                                     |  BullMQ)    |
+---------------------------------------------------------------------+-------------+
```

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or higher
- **Docker & Docker Compose** (Recommended) or local instances of **PostgreSQL** (v15+) and **Redis** (v7+)
- **Stripe Account** (Free test mode API keys from [stripe.com](https://stripe.com))
- **Mailtrap Account** (Free sandbox credentials from [mailtrap.io](https://mailtrap.io))

---

## ⚙️ Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Application
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ai_saas_platform
DB_SYNCHRONIZE=true

# Redis (Cache & BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mailtrap / SMTP Sandbox
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
SMTP_FROM="AI SaaS <noreply@aisaassample.com>"

# Optional OpenAI API Key
OPENAI_API_KEY=sk-...
```

---

## 🚀 Quick Start Guide

### Option 1: Full Docker Compose Setup (Zero Friction)

To start PostgreSQL, Redis, and the NestJS backend together:

```bash
docker compose up -d --build
```

- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Option 2: Local Development Setup

1. **Start PostgreSQL and Redis via Docker**:
   ```bash
   docker compose up -d postgres redis
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run in Development Mode**:
   ```bash
   npm run start:dev
   ```

4. **Run Unit & E2E Tests**:
   ```bash
   npm run test
   npm run test:e2e
   ```

---

## 💳 Stripe Webhook Testing Guide

To test the payment lifecycle and webhook synchronization:

1. **Install Stripe CLI**:
   ```bash
   # Linux (Debian/Ubuntu)
   curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
   sudo apt-get update && sudo apt-get install stripe
   ```

2. **Forward Webhooks to Local Server**:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/webhooks/stripe
   ```
   *Copy the displayed webhook signing secret (starts with `whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in your `.env`.*

3. **Simulate a Payment Event**:
   ```bash
   stripe trigger invoice.payment_succeeded
   ```
   *Upon execution, the backend will automatically create/update the user, persist the subscription, generate a PDF invoice in `uploads/invoices/`, and send a Mailtrap confirmation email.*

---

## ✉️ Email Testing (Mailtrap Sandbox)

1. Sign up at [Mailtrap](https://mailtrap.io) and create an **Email Testing** sandbox inbox.
2. Copy your SMTP Host, Port, Username, and Password into `.env`.
3. When webhooks succeed or renewal reminders trigger, inspect your Mailtrap inbox to view the delivered HTML email with the invoice access link.

---

## ⏰ Background Renewal Queue (BullMQ & Cron)

- **Automated Schedule**: Every midnight, `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` runs `SubscriptionSchedulerService.handleDailyRenewalCheck()`.
- **Manual Trigger**: You can trigger the renewal scanning job on demand:
  ```bash
  curl -X POST "http://localhost:3000/subscriptions/trigger-renewal-check?days=7"
  ```
- **Worker**: `RenewalReminderProcessor` consumes jobs from the `renewal-reminder` Redis queue and sends reminder emails asynchronously.

---

## 🤖 Model Context Protocol (MCP) Setup & AI Client Integration

This platform includes a dedicated **MCP Server** exposing system metrics to AI assistants like **Claude Desktop** or the **MCP Inspector**.

### MCP Tools Available

| Tool Name | Parameters | Description |
|---|---|---|
| `get_active_subscribers` | `bypassCache` (bool, optional) | Returns count of active subscribers |
| `get_simulated_revenue` | `bypassCache` (bool, optional) | Returns total revenue and paid invoice count |
| `get_platform_metrics` | `bypassCache` (bool, optional) | Returns full platform metrics dashboard |

### 1. Running the MCP Server directly via Stdio
```bash
npm run start:mcp
```

### 2. Connecting to Claude Desktop
Add the following configuration to your `claude_desktop_config.json` (located at `~/.config/Claude/claude_desktop_config.json` on Linux or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "ai-saas-platform": {
      "command": "npx",
      "args": [
        "-y",
        "ts-node",
        "/absolute/path/to/ai-saas-platform/src/mcp-server.ts"
      ],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "postgres",
        "DB_NAME": "ai_saas_platform",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379"
      }
    }
  }
}
```

### 3. Testing with MCP Inspector
```bash
npx @modelcontextprotocol/inspector ts-node src/mcp-server.ts
```

---

## 📡 REST API Reference

### Subscriptions
- `POST /subscriptions/checkout` — Initiate Stripe checkout session.
  ```json
  {
    "email": "customer@example.com",
    "priceId": "price_1N...",
    "successUrl": "https://myapp.com/success",
    "cancelUrl": "https://myapp.com/cancel"
  }
  ```
- `GET /subscriptions/user/:userId` — Retrieve subscriptions for a user.
- `POST /subscriptions/trigger-renewal-check?days=7` — Trigger renewal queue scan.

### Webhooks
- `POST /webhooks/stripe` — Stripe signature-verified webhook handler.

### Invoices
- `GET /invoices/user/:userId` — List all invoices for a user.
- `GET /invoices/:id` — Get invoice details by ID.
- `GET /invoices/:id/download` — Download the generated PDF invoice file.

### Metrics & Caching
- `GET /metrics?bypassCache=true` — Get complete platform metrics.
- `GET /metrics/active-subscribers` — Get active subscriber count.
- `GET /metrics/revenue` — Get revenue summary.
- `DELETE /metrics/cache` — Invalidate cached platform metrics in Redis.

### MCP & AI
- `GET /mcp/info` — MCP server metadata and capabilities.
- `GET /mcp/tools` — List registered MCP tools.
- `POST /mcp/tools/call` — Execute an MCP tool via HTTP (`{ "name": "get_platform_metrics", "args": {} }`).
- `POST /ai/chat` — Query AI assistant with context access (`{ "message": "What is our revenue?" }`).

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Build check
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.
