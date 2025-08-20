---
title: "API response codes"
icon: "circle-check"
description: "OpenPhone uses standard HTTP response codes to indicate request status.
"
---

## Response code categories

- 2xx: Success
- 4xx: Client-side errors
- 5xx: Server-side errors

<Info>
Some 4xx errors include specific error codes for programmatic handling.
</Info>

## Common response codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource successfully created |
| `202` | Accepted | Request accepted for processing |
| `204` | No Content | Request successful, no content returned |
| `400` | Bad Request | Invalid parameters |
| `401` | Unauthorized | Missing or invalid API key |
| `403` | Forbidden | Insufficient permissions or an account setting is not enabled |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Conflict with another request |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | OpenPhone-side issue |

<Tip>
For 429 errors, implement exponential backoff in your requests.
</Tip>
