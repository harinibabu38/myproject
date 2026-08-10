# Feature Context: Subscription Lifecycle & Scheduled Renewal Reminders

## 1. Overview & Description

- **Ticket / Task**: Task 5: Subscription Lifecycle (from `task.md`)
- **Description**: Automated lifecycle management of subscriptions, including tracking expiration/renewal dates, setting up automated background Cron jobs (`@nestjs/schedule`), identifying subscriptions nearing expiration (e.g., within 7 days), and preparing renewal reminder events.
- **Objective**: Integrate NestJS Scheduler (`ScheduleModule`), create `SubscriptionSchedulerService` to run cron tasks (e.g. daily at midnight), query PostgreSQL for subscriptions expiring within a threshold window, and log/prepare renewal reminder actions for queue processing.

## 2. Acceptance Criteria

- [x] Install and configure `@nestjs/schedule` in NestJS core application
- [x] Verify `Subscription` entity stores accurate `currentPeriodEnd` timestamps
- [x] Create `SubscriptionSchedulerService` with `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
- [x] Implement query method `findSubscriptionsNearingExpiration(days: number)` in `SubscriptionsService`
- [x] Execute daily cron scan, identify expiring subscriptions, and log/prepare renewal reminders

## 3. Technical & Architectural Context

- **Impacted Modules**:
  - `SubscriptionsModule` (`src/modules/subscriptions/subscriptions.module.ts`)
  - Core `AppModule` (`src/app.module.ts` - imports `ScheduleModule.forRoot()`)
- **Services & Scheduled Tasks**:
  - `SubscriptionSchedulerService`: Decorates task with `@Cron('0 0 * * *')` (Daily at midnight) or custom cron interval for testing.
  - `SubscriptionsService.findExpiringSubscriptions(daysAhead: number)`: Queries TypeORM where `currentPeriodEnd` is between NOW and NOW + `daysAhead` days, and status is `ACTIVE`.

## 4. Dependencies & Prerequisites

- **Prerequisites**:
  - Task 1 (NestJS & PostgreSQL setup) completed
  - Task 2 (User & Subscription entities) completed
- **External Dependencies**:
  - `@nestjs/schedule`

## 5. Implementation Notes & Constraints

- Ensure date arithmetic handles timezone variations cleanly by using UTC date ranges (`Between(now, targetDate)` in TypeORM).
- Provide a manual trigger endpoint (`POST /subscriptions/trigger-renewal-check`) so renewal check can be tested on demand without waiting for midnight cron.

## 6. Definition of Done

- [x] `@nestjs/schedule` installed and registered in `AppModule`
- [x] `findExpiringSubscriptions` method added to `SubscriptionsService`
- [x] `SubscriptionSchedulerService` implemented with scheduled cron task and manual test endpoint
- [x] All code implemented and passing type checks (`npm run build`)
- [x] Related documentation (`task.md` & `context.md`) updated
