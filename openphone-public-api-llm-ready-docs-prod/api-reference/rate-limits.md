---
title: "Rate limits"
icon: "bars-filter"
description: "OpenPhone implements rate limiting to ensure API stability and fair usage."
---
Each API key may make up to **10 requests per second.**

Exceeding this limit may result in `429` status code errors. If you'd like to request a higher rate limit, reach out to us at support+developers@openphone.com.

<Tip>
Implement request throttling in your application to stay within rate limits and optimize API usage.
</Tip>
