import { Hono } from 'hono';

type Bindings = {
  PLAIN_API_KEY: string;
  OPENPHONE_API_KEY: string;
  HUBSPOT_ACCESS_TOKEN: string;
  WEBHOOK_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.post('/webhooks/openphone', async (c) => {
  try {
    const payload = await c.req.json() as OpenPhoneWebhookPayload;
    console.log('OpenPhone webhook received:', JSON.stringify(payload, null, 2));
    
    switch (payload.type) {
      case 'call.completed':
        console.log('Handling call.completed');
        await handleCallCompleted(payload, c.env);
        break;
      case 'call.transcript.completed':
        console.log('Handling call.transcript.completed');
        await handleCallTranscript(payload, c.env);
        break;
      case 'message.received':
        console.log('Handling message.received');
        await handleMessageReceived(payload, c.env);
        break;
      default:
        console.log(`Unhandled OpenPhone webhook type: ${payload.type}`);
    }
    
    return c.text('OK');
  } catch (error) {
    console.error('Error handling OpenPhone webhook:', error);
    return c.text('Internal server error', 500);
  }
});

app.post('/webhooks/plain', async (c) => {
  try {
    const payload = await c.req.json() as PlainWebhookPayload;
    console.log('Plain webhook received:', JSON.stringify(payload, null, 2));
    
    if (payload.type === 'thread.chat_sent') {
      await handlePlainChatMessage(payload, c.env);
    }
    
    return c.text('OK');
  } catch (error) {
    console.error('Error handling Plain webhook:', error);
    return c.text('Internal server error', 500);
  }
});

async function handleCallCompleted(payload: OpenPhoneWebhookPayload, env: Bindings): Promise<void> {
  const callData = payload.data.object as CallData;
  const phoneNumber = callData.direction === 'incoming' ? callData.from : callData.to;
  
  // Look up customer info from HubSpot first  
  const hubspotContact = await lookupHubSpotContact(phoneNumber, env);
  
  // Create or get customer in Plain
  const customer = await upsertCustomerInPlain(phoneNumber, hubspotContact, env);
  
  // Create thread for the call
  const threadTitle = `Call ${callData.direction === 'incoming' ? 'from' : 'to'} ${phoneNumber}`;
  const thread = await createThreadInPlain(customer.id, threadTitle, env);
  
  // Add call details as thread event
  const callSummary = `
Call Duration: ${Math.floor(callData.duration / 60)}m ${callData.duration % 60}s
Direction: ${callData.direction}
Status: ${callData.status}
Started: ${callData.createdAt}
${callData.completedAt ? `Ended: ${callData.completedAt}` : ''}
`;
  
  await createThreadEvent(thread.id, 'Call Completed', callSummary, env);
}

async function handleCallTranscript(payload: OpenPhoneWebhookPayload, env: Bindings): Promise<void> {
  const transcriptData = payload.data.object as CallTranscriptData;
  const callId = transcriptData.callId;
  
  const transcript = transcriptData.dialogue
    .map(d => `${d.identifier}: ${d.content}`)
    .join('\n');
  
  console.log(`Call transcript ready for call ${callId}:\n${transcript}`);
}

async function handleMessageReceived(payload: OpenPhoneWebhookPayload, env: Bindings): Promise<void> {
  const messageData = payload.data.object as MessageData;
  const phoneNumber = messageData.from;
  
  console.log(`Processing message from ${phoneNumber}: "${messageData.body}"`);
  
  // Look up customer info from HubSpot first
  const hubspotContact = await lookupHubSpotContact(phoneNumber, env);
  
  // Create or get customer with HubSpot data
  const customer = await upsertCustomerInPlain(phoneNumber, hubspotContact, env);
  console.log('Customer created/updated:', customer.id);
  
  // Try to find existing recent thread first
  let thread = await findRecentThreadForCustomer(customer.id, env);
  
  if (!thread) {
    // No recent thread found, create new one
    const threadTitle = `SMS conversation with ${phoneNumber}`;
    thread = await createThreadInPlain(customer.id, threadTitle, env);
    console.log('New thread created:', thread.id);
  } else {
    console.log('Using existing thread:', thread.id);
  }
  
  // Send the message as a chat in Plain with attachments if present
  await sendCustomerChatToPlain(customer.id, thread.id, messageData.body, env, messageData.media || []);
  console.log('Chat message sent to Plain');
}

async function findRecentThreadForCustomer(customerId: string, env: Bindings) {
  const query = `
    query GetCustomerThreads($customerId: ID!) {
      threads(
        first: 10
        filters: {
          customerIds: [$customerId]
        }
        sortBy: { 
          field: CREATED_AT 
          direction: DESC 
        }
      ) {
        edges {
          node {
            id
            title
            updatedAt {
              iso8601
            }
            createdAt {
              iso8601
            }
          }
        }
      }
    }
  `;
  
  const variables = {
    customerId
  };
  
  const response = await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
  
  const result = await response.json() as any;
  
  if (result.errors) {
    console.error('Plain GraphQL errors:', result.errors);
    return null;
  }
  
  const threads = result.data?.threads?.edges || [];
  if (threads.length === 0) {
    return null;
  }
  
  // Check if the most recent thread was updated within 12 hours
  const mostRecentThread = threads[0].node;
  const updatedAt = new Date(mostRecentThread.updatedAt.iso8601);
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  
  if (updatedAt > twelveHoursAgo) {
    console.log(`Found recent thread updated at ${updatedAt.toISOString()}`);
    return mostRecentThread;
  }
  
  console.log(`Most recent thread was updated at ${updatedAt.toISOString()}, which is older than 12 hours`);
  return null;
}

async function handlePlainChatMessage(payload: PlainWebhookPayload, env: Bindings): Promise<void> {
  const phoneNumber = payload.payload.thread.customer.externalId;
  const message = payload.payload.chat.text;
  const createdBy = payload.payload.chat.createdBy;
  
  if (!phoneNumber || !message) {
    console.log('Missing phone number or message in Plain webhook');
    return;
  }
  
  // Skip messages created by machine users (i.e., messages we created from OpenPhone)
  if (createdBy.actorType === 'machineUser') {
    console.log('Skipping message created by machine user (avoiding echo loop)');
    return;
  }
  
  console.log(`Sending SMS to ${phoneNumber}: "${message}"`);
  await sendSMSViaOpenPhone(phoneNumber, message, env);
}


async function lookupHubSpotContact(phoneNumber: string, env: Bindings) {
  try {
    // Search both contacts and companies in parallel
    const [contactsResponse, companiesResponse] = await Promise.allSettled([
      // Contact search
      fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'phone',
              operator: 'EQ',
              value: phoneNumber
            }]
          }],
          properties: [
            'firstname', 'lastname', 'email', 'phone',
            'jobtitle', 'company', 'hs_object_id'
          ],
          limit: 10
        })
      }),
      // Company search  
      fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'phone',
              operator: 'EQ',
              value: phoneNumber
            }]
          }],
          properties: [
            'name', 'domain', 'phone', 'city',
            'state', 'country', 'industry', 'hs_object_id'
          ],
          limit: 10
        })
      })
    ]);

    let contacts = [];
    let companies = [];

    // Process contact search results
    if (contactsResponse.status === 'fulfilled' && contactsResponse.value.ok) {
      const contactData = await contactsResponse.value.json();
      contacts = contactData.results || [];
    }

    // Process company search results
    if (companiesResponse.status === 'fulfilled' && companiesResponse.value.ok) {
      const companyData = await companiesResponse.value.json();
      companies = companyData.results || [];
    }

    // Prefer contact data over company data
    if (contacts.length > 0) {
      const contact = contacts[0].properties;
      console.log(`Found HubSpot contact for ${phoneNumber}:`, contact);
      
      return {
        firstName: contact.firstname || '',
        lastName: contact.lastname || '',
        email: contact.email || null,
        phone: contact.phone
      };
    }
    
    // Fallback to company data if no contact found
    if (companies.length > 0) {
      const company = companies[0].properties;
      console.log(`Found HubSpot company for ${phoneNumber}:`, company);
      
      return {
        firstName: company.name || phoneNumber,
        lastName: '',
        email: company.domain ? `info@${company.domain}` : null,
        phone: company.phone
      };
    }

    console.log(`No HubSpot data found for ${phoneNumber}`);
    return null;
  } catch (error) {
    console.error('HubSpot lookup error:', error);
    return null;
  }
}

async function upsertCustomerInPlain(phoneNumber: string, hubspotContact: any, env: Bindings) {
  const mutation = `
    mutation UpsertCustomer($input: UpsertCustomerInput!) {
      upsertCustomer(input: $input) {
        result
        customer {
          id
          externalId
          fullName
          email {
            email
            isVerified
          }
        }
      }
    }
  `;
  
  // Use HubSpot data if available, otherwise fallback to phone number
  const fullName = hubspotContact 
    ? `${hubspotContact.firstName} ${hubspotContact.lastName}`.trim() || phoneNumber
    : phoneNumber;
  
  const email = hubspotContact?.email 
    ? { email: hubspotContact.email, isVerified: false }
    : null;

  const variables = {
    input: {
      identifier: {
        externalId: phoneNumber
      },
      onCreate: {
        externalId: phoneNumber,
        fullName,
        ...(email && { email })
      },
      onUpdate: {}
    }
  };
  
  const response = await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });
  
  const result = await response.json() as any;
  
  if (result.errors) {
    console.error('Plain GraphQL errors:', result.errors);
    throw new Error(`Plain API error: ${result.errors[0].message}`);
  }
  
  return result.data.upsertCustomer.customer;
}

async function createThreadInPlain(customerId: string, title: string, env: Bindings) {
  const mutation = `
    mutation CreateThread($input: CreateThreadInput!) {
      createThread(input: $input) {
        thread {
          id
          title
          channel
        }
      }
    }
  `;
  
  const variables = {
    input: {
      customerIdentifier: {
        customerId
      },
      title
    }
  };
  
  const response = await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });
  
  const result = await response.json() as any;
  
  if (result.errors) {
    console.error('Plain GraphQL errors:', result.errors);
    throw new Error(`Plain API error: ${result.errors[0].message}`);
  }
  
  const thread = result.data.createThread.thread;
  if (!thread) {
    console.error('Thread creation failed - no thread returned:', result);
    throw new Error('Thread creation failed');
  }
  console.log('Thread created with channel:', thread.channel);
  
  return thread;
}

async function createThreadEvent(threadId: string, title: string, description: string, env: Bindings) {
  const mutation = `
    mutation CreateThreadEvent($input: CreateThreadEventInput!) {
      createThreadEvent(input: $input) {
        threadEvent {
          id
        }
      }
    }
  `;
  
  const variables = {
    input: {
      threadId,
      title,
      components: [
        {
          componentText: {
            text: description
          }
        }
      ]
    }
  };
  
  await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });
}

async function sendChatToPlain(customerId: string, threadId: string, message: string, media: Array<{url: string, type: string}>, env: Bindings, phoneNumber: string) {
  const mutation = `
    mutation ReplyToThread($input: ReplyToThreadInput!) {
      replyToThread(input: $input) {
        __typename
      }
    }
  `;
  
  // Include media URLs in the text message since Plain doesn't support attachments in SendChatInput
  let fullMessage = message;
  if (media.length > 0) {
    const mediaUrls = media.map(item => `${item.type}: ${item.url}`).join('\n');
    fullMessage = message ? `${message}\n\n${mediaUrls}` : mediaUrls;
  }

  const variables = {
    input: {
      threadId,
      textContent: fullMessage,
      impersonation: {
        asCustomer: {
          customerIdentifier: {
            externalId: phoneNumber
          }
        }
      }
    }
  };
  
  const response = await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });
  
  const result = await response.json() as any;
  
  if (result.errors) {
    console.error('Plain GraphQL errors:', result.errors);
    throw new Error(`Plain API error: ${result.errors[0].message}`);
  }
}

async function sendCustomerChatToPlain(customerId: string, threadId: string, message: string, env: Bindings, media: Array<{url: string, type: string}> = []) {
  const mutation = `
    mutation SendCustomerChat($input: SendCustomerChatInput!) {
      sendCustomerChat(input: $input) {
        chat {
          id
        }
      }
    }
  `;
  
  // Include media URLs in the text message since Plain doesn't support attachments in SendCustomerChatInput
  let fullMessage = message;
  if (media.length > 0) {
    const mediaUrls = media.map(item => `${item.type}: ${item.url}`).join('\n');
    fullMessage = message ? `${message}\n\n${mediaUrls}` : mediaUrls;
  }

  const variables = {
    input: {
      customerId,
      threadId,
      text: fullMessage
    }
  };
  
  await fetch('https://core-api.uk.plain.com/graphql/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.PLAIN_API_KEY}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables
    })
  });
}

async function sendSMSViaOpenPhone(to: string, message: string, env: Bindings) {
  const response = await fetch('https://api.openphone.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': env.OPENPHONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '+16464441357',
      to: [to],
      content: message,
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenPhone API error (${response.status}):`, errorText);
    throw new Error(`OpenPhone API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log('SMS sent successfully:', result);
}

interface OpenPhoneWebhookPayload {
  id: string;
  object: string;
  apiVersion: string;
  createdAt: string;
  type: string;
  data: {
    object: CallData | MessageData | CallTranscriptData;
  };
}

interface CallData {
  id: string;
  object: string;
  direction: 'incoming' | 'outgoing';
  status: string;
  duration: number;
  from: string;
  to: string;
  participants: string[];
  createdAt: string;
  completedAt?: string;
  userId: string;
  phoneNumberId: string;
}

interface MessageData {
  id: string;
  object: string;
  from: string;
  to: string;
  direction: 'incoming' | 'outgoing';
  body: string;
  media?: Array<{
    url: string;
    type: string;
  }>;
  status: string;
  createdAt: string;
  userId: string;
  phoneNumberId: string;
}

interface CallTranscriptData {
  callId: string;
  object: string;
  dialogue: Array<{
    content: string;
    start: number;
    end: number;
    identifier: string;
    userId?: string;
  }>;
  duration: number;
  status: string;
}

interface PlainWebhookPayload {
  type: string;
  payload: {
    thread: {
      customer: {
        id: string;
        externalId: string;
      };
    };
    chat: {
      id: string;
      text: string;
      createdBy: {
        actorType: 'user' | 'machineUser';
        userId?: string;
        machineUserId?: string;
      };
    };
  };
}

export default app;