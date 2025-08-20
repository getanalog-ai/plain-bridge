---
title: "Automate your messages"
icon: "messages"
description: "This guide will walk you through the process of setting up automated messages using the OpenPhone API."
---

### Prerequisites

1. An OpenPhone account with API access
2. Your API key
3. A server or script environment capable of making HTTP requests

### Steps to automate messages

1. Set up your environment

   Create a server or script that can be triggered by specific events. Ensure it can make HTTP requests and handle JSON responses.

2. Authenticate your requests

   Include your API key in the headers of all requests:

   ```
   Authorization: YOUR_API_KEY
   ```

3. Retrieve OpenPhone numbers

   Make a GET request to fetch your OpenPhone numbers:

   ```
   GET https://api.openphone.com/v0/phone-numbers
   ```

   Parse the response to find the desired phone number ID.

4. Send an automated message

   When your trigger event occurs, make a POST request to send a message:

   ```
   POST https://api.openphone.com/v0/messages
   ```

   Include in the request body:
   ```json
   {
     "from": "YOUR_OPENPHONE_NUMBER_ID",
     "to": "RECIPIENT_PHONE_NUMBER",
     "text": "Your automated message here"
   }
   ```



### Best practices

1. Store your API key securely and never expose it in client-side code.
2. Implement proper error handling and logging.
3. Use webhooks (if available) for real-time updates on message status.
4. Respect rate limits to ensure reliable operation.
