# Sharp AI - Database Schema

This document outlines the database structure required for the SaaS monetization foundation.

## Tables

### 1. `users`
Stores user profile and authentication information.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `email` | String | Unique email address |
| `name` | String | User's full name |
| `created_at` | Timestamp | Account creation date |
| `updated_at` | Timestamp | Last update date |

### 2. `subscriptions`
Stores user subscription status and plan details.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key to `users.id` |
| `plan_id` | String | identifier for the plan (e.g., 'free', 'pro', 'enterprise') |
| `status` | String | 'active', 'past_due', 'canceled', 'incomplete' |
| `current_period_start` | Timestamp | Start of current billing period |
| `current_period_end` | Timestamp | End of current billing period |
| `stripe_customer_id` | String | External ID from payment provider |
| `stripe_subscription_id` | String | External ID from payment provider |
| `created_at` | Timestamp | Record creation date |
| `updated_at` | Timestamp | Last update date |

### 3. `usage_records`
Tracks AI generation usage per user.

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key to `users.id` |
| `type` | String | Type of usage (e.g., 'generation', 'stacker') |
| `count` | Integer | Number of units used |
| `period_start` | Timestamp | Billing period start this usage belongs to |
| `created_at` | Timestamp | Record creation date |

### 4. `plans` (Optional - can be hardcoded in app)
Defines the limits and features for each plan.

| Column | Type | Description |
| --- | --- | --- |
| `id` | String | Primary Key (e.g., 'free', 'pro') |
| `name` | String | Display name |
| `price_monthly` | Decimal | Monthly cost |
| `generation_limit` | Integer | Max generations per month (-1 for unlimited) |
| `features` | JSON | List of enabled features |

---

## Relationships

- A **User** has one **Subscription**.
- A **User** has many **UsageRecords**.
- A **Subscription** belongs to a **Plan**.
