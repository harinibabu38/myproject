Backend Engineering Assignment: AI-Enabled SaaS Subscription & Analytics Platform

Objective
Build the backend services for a mini-SaaS application that automates user subscriptions, manages document storage, handles time-sensitive background alerts, and allows an AI agent to interact with system metrics via the Model Context Protocol (MCP).

Timeline & Budget

Timeframe: 1 Week
Cost: Rs.0 (All components must use local configurations or free developer testing tiers).


Core Functional Requirements
1. Subscription Checkout & Webhook Handling (Payments & Database)

Checkout Flow: Enable users to initiate a subscription purchase using a payment gateway in Test Mode (e.g., Stripe Test Mode).
Payment Synchronization: Listen for asynchronous payment success events from the payment gateway. Once payment is confirmed, create/update the user's profile and subscription status inside a relational database (PostgreSQL).
2. Automated Invoicing & Document Delivery (Storage & Email)

Document Generation & Storage: Immediately following a successful payment event, dynamically generate a basic text or PDF invoice file for the transaction. Save this file into a storage solution (local file storage or a free cloud bucket is perfectly fine).
Welcome Email: Send a transaction confirmation email to the user utilizing a free email testing sandbox (e.g., Mailtrap or Ethereal Email). The email must include the subscription details and access to the stored invoice.
3. Subscription Lifecycle & Performance Tuning (Scheduling & Redis)

Automated Renewal Alerts: Implement a scheduled task (Cron) that runs periodically to scan the database for subscriptions nearing their expiration date.
Asynchronous Queueing: Offload the delivery of renewal reminder emails to a background job queue (Redis-backed) to avoid blocking the main application thread during bulk operations.
Data Caching: Implement a caching mechanism using Redis for frequently requested platform metrics or summaries to optimize database performance and prevent redundant queries.
4. AI Agent Interface (MCP Integration)

AI Tooling Accessibility: Build an integration using the Model Context Protocol (MCP) that allows an external AI Assistant (like Claude Desktop or a local LLM client) to communicate with your backend.
Contextual Data Sharing: Expose a functional capability through the MCP server that allows an AI agent to query the system for real-time platform statistics, such as total active subscribers or simulated revenue totals.


Submission Expectations

Local Setup: Provide a Docker Compose setup to spin up the required infrastructure (PostgreSQL and Redis) locally with zero friction.
Environment Configuration: Include a sample environment file with instructions on how to link free developer credentials (e.g., Stripe test keys, Mailtrap tokens) safely.
Documentation: Include a clear instructions file detailing how to run the application, verify the background processes, and expose the MCP tool to an AI client.
Loom Video: Walkthrough of the Application by running it and explaining about the components.