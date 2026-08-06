# AI-Enabled SaaS Subscription & Analytics Platform

## Project Objective

Build a backend service for a mini-SaaS application that manages subscriptions,
payments, invoices, emails, scheduled alerts, Redis-based processing and caching,
and exposes platform metrics through the Model Context Protocol (MCP).

---

## Tasks

### 1. Project Setup
- [x] Create NestJS application
- [x] Configure environment variables
- [x] Configure PostgreSQL
- [x] Configure TypeORM
- [x] Create initial project structure

### 2. Subscription Checkout & Payments
- [x] Configure Stripe Test Mode
- [x] Create Stripe customer
- [x] Create subscription checkout
- [x] Store user information in PostgreSQL
- [x] Store subscription information in PostgreSQL
- [x] Implement Stripe webhook
- [x] Handle successful payment events
- [x] Synchronize payment/subscription status with database
- [x] Handle duplicate webhook events
- [x] Handle webhook errors

### 3. Invoice Generation & Storage
- [ ] Generate invoice after successful payment
- [ ] Generate basic PDF/text invoice
- [ ] Store invoice locally
- [ ] Save invoice information in database
- [ ] Make stored invoice accessible to the user

### 4. Welcome Email
- [ ] Configure Mailtrap/Ethereal
- [ ] Create email service
- [ ] Send payment confirmation email
- [ ] Include subscription details
- [ ] Include invoice access in email

### 5. Subscription Lifecycle
- [ ] Store subscription expiry/renewal information
- [ ] Configure scheduled Cron job
- [ ] Find subscriptions nearing expiration
- [ ] Prepare renewal reminder

### 6. Redis & Background Jobs
- [ ] Configure Redis
- [ ] Configure BullMQ
- [ ] Create renewal reminder queue
- [ ] Create background worker
- [ ] Queue renewal reminder emails
- [ ] Process queued email jobs

### 7. Redis Caching & Metrics
- [ ] Create platform metrics service
- [ ] Calculate active subscriber count
- [ ] Calculate simulated revenue
- [ ] Cache frequently requested metrics in Redis
- [ ] Implement cache expiration
- [ ] Test cached responses

### 8. MCP Integration
- [ ] Understand MCP architecture
- [ ] Create MCP server
- [ ] Connect MCP server with backend
- [ ] Create platform metrics MCP tool
- [ ] Expose active subscriber statistics
- [ ] Expose simulated revenue statistics
- [ ] Test MCP tool using an AI client/local MCP client

### 9. Docker & Infrastructure
- [ ] Create Docker Compose configuration
- [ ] Configure PostgreSQL container
- [ ] Configure Redis container
- [ ] Verify application connectivity
- [ ] Test complete infrastructure locally

### 10. Documentation
- [ ] Create `.env.example`
- [ ] Document required environment variables
- [ ] Document project setup
- [ ] Document database setup
- [ ] Document Stripe setup
- [ ] Document email setup
- [ ] Document Redis/background jobs
- [ ] Document MCP setup
- [ ] Update `context.md`
- [ ] Update `task.md`

### 11. Final Testing
- [ ] Test subscription checkout
- [ ] Test Stripe webhook
- [ ] Test database synchronization
- [ ] Test invoice generation
- [ ] Test email delivery
- [ ] Test renewal reminder job
- [ ] Test Redis caching
- [ ] Test MCP metrics tool
- [ ] Test Docker Compose
- [ ] Prepare Loom walkthrough


