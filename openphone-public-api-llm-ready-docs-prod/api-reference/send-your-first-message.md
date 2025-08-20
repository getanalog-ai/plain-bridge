---
title: "Send your first message"
icon: "rocket"
description: "This is a step-by-step guide for sending your first text message."
---
## Ping!
Let's get started sending text messages via the OpenPhone API.

<Note> **Have you completed Carrier Registration?** If you plan to send text messages to US numbers via the API, you will also need to complete US Carrier Registration. Learn more [here](https://support.openphone.com/hc/en-us/articles/15519949741463-Guide-to-US-carrier-registration-for-OpenPhone-customers).</Note>

### 1. Get phone numbers (optional)
Make a call to the `GET Phone Numbers` endpoint to retrieve `userId` and `from` for the desired number (the phone number from which you'd like to send a text message). This step is optional if you already know the `userId` and `from` for the desired sending number.
```
curl --request GET \
  --url https://api.openphone.com/v1/phone-numbers \
  --header 'Authorization: YOUR_API_KEY'
```

### 2. Specify user ID (optional)
If you'd like to send the text message as a particular OpenPhone member in your workspace, make sure to include this `userId` in your request body. If `userId` is not specified, the sender will default to the phone number owner.

### 3. Send your message
You are now ready to send your first text message! Once you send your text message, you will receive a 202 Success Message via the API. Nice!
```
 curl --request POST \
  --url https://api.openphone.com/v1/messages \
  --header 'Authorization: YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "content": "<string>",
  "from": "<string>",
  "to": [
    "+15555555555"
  ],
  "userId": "<string>"
}'
```
<Tip>Be sure to format phone numbers in E.164 format (+1234567890).</Tip>
### Summary
You are now able to send a text message to anyone in US or Canada. By using the API, you are able to programmatically send texts to your customers.