# D10 — Notification and Communication

## Event model

Committed domain events create notification intents through an outbox: password reset, account invite, marks submitted/rejected, result published/reopened, document ready, and notice published. Provider delivery is asynchronous and cannot roll back an academic transaction.

## Channels and templates

Support in-app first, then email/SMS through adapters. Templates are versioned, localized, allowlisted, tested, and contain only necessary personal data. Preferences govern non-essential messages; security and required notices follow policy.

## Delivery operations

Record intent, channel, recipient, provider message ID, status, retry history, and redacted failure. Apply consent, rate limits, quiet hours where applicable, unsubscribe/preference management, and tenant branding without changing domain events.
