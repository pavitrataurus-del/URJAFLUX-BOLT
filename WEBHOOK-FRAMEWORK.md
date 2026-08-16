# Webhook Framework (WEBHOOK-FRAMEWORK.md)

## 1. Description
The Webhook Framework distributes real-time, asynchronous event payloads to registered client-side endpoints.

## 2. Signature Verification
All webhook requests include the header `X-Urjaflux-Signature` to protect client receiving endpoints from replay or forgery attacks.
- **Algorithm:** HMAC-SHA256
- **Signature Formula:**
  ```
  Signature = HMAC_SHA256(PayloadString, SecretToken)
  ```

## 3. Resilience Engine & Retries
- **Retry Policy:** Exponential backoff with a customizable base multiplier (default 2).
- **Max Attempts:** 3 to 5 attempts based on the webhook subscription configuration.
- **Dead Letter Queue (DLQ):** Messages failing all retry attempts are routed to a persistent DLQ for manual intervention and event replay tracking.
- **Replay Support:** Deliveries are cached, allowing administrators to replay any specific webhook event history.
