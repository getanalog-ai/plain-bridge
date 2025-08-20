# Plain-Bridge

A Cloudflare Worker that serves as a bridge between Plain (support ticketing) and OpenPhone (phone support system).

## Features

### V1 Implementation
- **Call Integration**: Automatically creates Plain threads when OpenPhone calls complete
- **SMS Integration**: Two-way SMS sync between Plain and OpenPhone
- **Customer Management**: Automatically creates/updates customers in Plain using phone numbers

### Supported Webhooks

#### OpenPhone → Plain
- `call.completed`: Creates customer + thread with call details
- `call.transcript.completed`: Adds transcript to existing thread
- `message.received`: Creates customer chat message in Plain

#### Plain → OpenPhone  
- `thread.chat_created`: Sends SMS via OpenPhone when Plain user sends message

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   wrangler secret put PLAIN_API_KEY
   wrangler secret put OPENPHONE_API_KEY
   ```

3. **Deploy to Cloudflare**:
   ```bash
   npm run deploy
   ```

## Webhook URLs

After deployment, configure these webhook URLs:

- **OpenPhone**: `https://your-worker.workers.dev/webhooks/openphone`
- **Plain**: `https://your-worker.workers.dev/webhooks/plain`

## Required Permissions

### Plain API Key
- `customer:read`
- `customer:create` 
- `thread:create`
- `thread:read`
- `chat:create`

### OpenPhone API Key
- Read calls, messages, transcripts
- Send messages

## Development

```bash
npm run dev
```

## Architecture

The bridge implements a simple flow:

1. **OpenPhone call ends** → Create Plain customer + thread
2. **OpenPhone SMS received** → Create Plain customer chat
3. **Plain user sends message** → Send SMS via OpenPhone

Customer matching is done via phone number stored as `externalId` in Plain.