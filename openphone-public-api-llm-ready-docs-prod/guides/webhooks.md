---
title: "Webhooks"
icon: "webhook"
description: "A reference for API-generated webhook payloads."
---
## Overview
OpenPhone API webhooks allow developers to receive real-time notifications for various events, such as calls, messages, and transcripts. By integrating webhooks into your workflows, you can automate processes, enhance user experiences, and seamlessly connect OpenPhone with other systems.

<Note>**Important note:** Webhooks created in the OpenPhone app are not compatible with those created via the API. You cannot access or modify app webhooks through the API, or API webhooks in the app.</Note>

## Webhooks payload sample data models
Each webhook event provides a structured payload with specific data. We've provided sample payloads below for the most common webhook events.


### Calls
These webhooks are triggered in response  in response to call-related events: `call.ringing`, `call.completed`, and `call.recording.completed`.
The following is an example of the payload for a `call.ringing` event.


```json
{
  "id": "EV0ea54cadfbf342e6ac4ca1f22ed1700c",
  "object": "event",
  "apiVersion": "v4",
  "createdAt": "2022-06-24T19:35:46.825Z",
  "type": "call.ringing",
  "data": {
   "object": {
        "id": "ACsXlF0",
        "object": "call",
        "answeredAt": "2022-01-01T00:00:00Z",
        "answeredBy": "USlHhXmRMz",
        "initiatedBy": "USlHhXmRMz",
        "direction": "outgoing",
        "status": "ringing",
        "completedAt": "2022-01-01T00:10:00Z",
        "createdAt": "2022-01-01T00:00:00Z",
        "duration": 60,
        "forwardedFrom": "UShYmRNzlm",
        "forwardedTo": "UShXmRMzln",
        "phoneNumberId": "PN1ZmRMzlx",
        "participants": [
          "+15555555555"
        ],
        "updatedAt": "2022-01-01T00:00:00Z",
        "userId": "USlHhXmRMz"
      }
  }
}
```

### Call Summaries
This webhook is triggered in response to a `call.summary.completed` event. 

```json
{
  "id": "EV0ea54cadfbf342e6ac4ca1f22ed1700c",
  "object": "event",
  "apiVersion": "v4",
  "createdAt": "2022-06-24T19:35:46.825Z",
  "type": "callSummary",
  "data": {
    "object": {
      "callId":"AC16558bc5f73445598a2627f5a94fe014",
      "object": "callSummary",
      "status": "completed",
      "summary": [
        "You talked about the weather."
      ],
      "nextSteps": [
        "Bring an umbrella."
      ]
    }
  }
}
```

### Call Transcripts
This webhook is triggered in response to a `call.transcript.completed` event.

```json
{
  "id": "EV0ea54cadfbf342e6ac4ca1f22ed1700c",
  "object": "event",
  "apiVersion": "v4",
  "createdAt": "2022-06-24T19:35:46.825Z",
  "type": "callTranscript",
  "data": {
    "object": {
      "callId": "AC16558bc5f73445598a2627f5a94fe014",
      "object": "callTranscript",
      "createdAt": "2022-06-24T19:34:50.279Z",
      "dialogue": [
        {
          "content": "Hello, world!",
          "start": 5.123456,
          "end": 10.123456,
          "identifier": "+19876543210",
          "userId": "USlHhXmRMz"
        }
      ],
      "duration": 5,
      "status": "completed"
    }
  }
}
```


### Messages
This webhook is triggered in response to message events such as `message.received` and `message.delivered`. Below is a sample payload for a `message.received` event.
```json
{
  "id": "EVc67ec998b35c41d388af50799aeeba3e",
  "object": "event",
  "apiVersion": "v4",
  "createdAt": "2022-01-23T16:55:52.557Z",
  "type": "message.received",
  "data": {
    "object": {
      "id": "AC24a8b8321c4f4cf2be110f4250793d51",
      "object": "message",
      "from": "+19876543210",
      "to": ["+15555555555"],
      "direction": "incoming",
      "text": "Hello, world!",
      "status": "delivered",
      "createdAt": "2022-01-23T16:55:52.420Z",
      "userId": "USu5AsEHuQ",
      "phoneNumberId": "PNtoDbDhuz"
    }
  }
}
```



