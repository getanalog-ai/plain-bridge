---
title: "Authentication"
icon: "key"
description: "Learn how to gain API access."
---

## Prerequisites

Before you begin using the OpenPhone API, ensure you have:

<CardGroup cols={2}>
  <Card title="An active OpenPhone subscription" icon="check">
    Need an account? Follow our [account creation
    guide](https://support.openphone.com/hc/en-us/articles/1500009886621-How-to-create-an-OpenPhone-account).
  </Card>
  <Card title="Admin access" icon="user-shield">
    Owner or admin privileges in your OpenPhone workspace.
  </Card>
</CardGroup>

<Warning>
  **US Messaging Registration Required:** To send text messages to US numbers
  via the API, you must complete US Carrier Registration. Learn more
  [here](https://support.openphone.com/hc/en-us/articles/15519949741463-Guide-to-US-carrier-registration-for-OpenPhone-customers).
</Warning>

## API key generation

The OpenPhone API uses API keys for secure authentication. Follow these steps to get started:

<Steps>
  <Step title="Log in to OpenPhone">Access your OpenPhone account.</Step>
  <Step title="Access API Settings">
    Navigate to the "API" tab under workspace settings. Remember, you need
    workspace owner or admin privileges to access this tab.
  </Step>

  <Step title="Generate your key">
    Click "Generate API key" and provide a descriptive label. Each key provides
    full API access.
    <Tip>
      Label your keys based on their intended use (e.g., "Production
      Environment" or "Testing Integration")
    </Tip>
  </Step>

  <Step title="Implement authentication">
    Include your API key in the Authorization header of each request: ```
    Authorization: YOUR_API_KEY ```
    <Tip>The OpenPhone API does not use a Bearer token for authentication.</Tip>
  </Step>
</Steps>

## Security guidelines

<Info>
  Your API key carries the same privileges as your OpenPhone account. Treat it
  with the same level of security as your password.
</Info>

### Best practices

- Keep your API keys confidential
- Don’t share your API keys in publicly accessible areas such as GitHub or client-side code
- Regularly rotate your API keys to enhance security
- If a key is compromised, revoke it immediately and generate a new one

### Revoking access

If a key is compromised or no longer needed:

1. Navigate to the "API" tab in Workspace Settings
2. Locate the specific key
3. Click the ellipsis (three dots) icon and select 'delete' to immediately revoke access
4. Generate a new key if needed

<Note>
  Deleting an API key only affects the integrations using that specific key.
  Other keys and integrations will continue to function normally.
</Note>
