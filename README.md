# n8n-nodes-simgate

Send and receive SMS from n8n through your own phone, using [SimGate](https://simgate.app).

SimGate turns an Android phone into an SMS gateway. Your messages go out from your own number and your own SIM — no sender IDs, no per-message pricing, no third party holding the number.

This package adds two nodes:

- **SimGate** — send an SMS, check a message's status, list your phones, read your quota.
- **SimGate Trigger** — start a workflow when your phone receives an SMS or a call.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [SimGate Trigger](#simgate-trigger) · [Compatibility](#compatibility)

## Installation

### n8n Cloud

Search for `SimGate` in the nodes panel and add it to your canvas.

### Self-hosted

Go to **Settings → Community nodes → Install**, enter `n8n-nodes-simgate`, and confirm.

## Credentials

You need a SimGate account with at least one phone registered.

1. In the [SimGate dashboard](https://simgate.app/dashboard), open **API** and create an API key.
2. In n8n, create a new **SimGate API** credential and paste the key.
3. Leave **Base URL** as `https://api.simgate.app` unless you self-host the backend.
4. Leave **Webhook Signing Secret** empty. The SimGate Trigger captures it automatically when it registers; fill it in only if you set the webhook up by hand in the dashboard.

Use **Test** in the credential dialog to confirm the key works — it reads your account usage.

## Operations

### Message

| Operation | What it does |
| --- | --- |
| Send | Sends an SMS from one of your phones |
| Get | Returns the current delivery status of a message you sent |

**Send** takes a device, a recipient number in international format, and the message text. Turn on **Test Mode** to draw from your test quota instead of your SMS quota.

The response looks like this:

```json
{
  "success": true,
  "messageId": "6f2b1c1e-2b9a-4f1a-9a1e-3a5d6c8b7e40",
  "queued": false,
  "connectionStatus": "online",
  "message": "SMS command accepted by device."
}
```

If the phone is briefly offline, SimGate queues the message and retries automatically. The node still succeeds, but the item carries `"queued": true`. Use **Message → Get** with the `messageId` to poll for the final state.

### Device

| Operation | What it does |
| --- | --- |
| Get Many | Lists every phone registered to your account |
| Get | Returns one phone |
| Get Status | Returns whether a phone is online right now |

### Account

| Operation | What it does |
| --- | --- |
| Get Usage | Returns your plan, billing period, and remaining inbound and outbound quota |

## SimGate Trigger

The trigger registers itself. Add the node, choose your events, and activate the workflow — SimGate is pointed at this workflow's URL and the signing secret is stored with it. Deactivating the workflow releases the webhook again.

SimGate delivers to one endpoint per account. If your account already sends webhooks somewhere else, activation stops with a clear error instead of taking the slot over — turn the existing webhook off in the SimGate dashboard first.

Every delivery is verified with HMAC-SHA256 over `timestamp.body`, and anything older than five minutes is rejected as a replay. You do not need to fill in the credential's **Webhook Signing Secret** unless you configured the webhook by hand in the dashboard.

An `sms.received` event arrives as:

```json
{
  "id": "3f8f0b16-84e3-4a37-9b0e-53b0d2d1d1a1",
  "type": "sms.received",
  "createdAt": "2026-08-20T09:12:44.001Z",
  "data": {
    "deviceId": "android-5q15b182f2704gbz",
    "from": "+391234567890",
    "body": "Yes, 3pm works",
    "receivedAt": "2026-08-20T09:12:43.880Z"
  }
}
```

Call events (`call.incoming`, `call.answered`, `call.ended`) use the same envelope, with `callId`, `direction`, and — on `call.ended` — `durationSeconds`.

## Compatibility

Requires n8n 1.0 or later and Node.js 20.19 or later. Tested against the SimGate API v1.

## Resources

- [SimGate documentation](https://simgate.app/integrations/n8n)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
