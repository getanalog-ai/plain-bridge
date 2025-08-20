---
title: "Pricing overview"
icon: "circle-info"
description: "Welcome to OpenPhone's simple and transparent API pricing structure."
---

## Our pricing philosophy

At OpenPhone, we believe in transparent and fair pricing. Sometimes it can be hard to understand the true cost of something when it’s buried in the fine print. We are committed to helping you clearly understand and manage your costs when using our platform.

## Core pricing model

Our pricing is based on message segments, making it easy to calculate costs:

<CardGroup cols={2}>
  <Card title="Local (US and Canada) SMS" icon="location-pin">
    <p>$0.01 per segment</p>
  </Card>
  <Card title="International SMS" icon="globe">
    <p>$0.01 + country-specific rate per segment</p>
    <p className="text-sm">Rates vary by destination country</p>
  </Card>
</CardGroup>

<Info>
For detailed international rates by country, see our [International Pricing Guide](https://www.openphone.com/rates).
</Info>

## Understanding message segments

A message segment is our basic billing unit. Learn more below:

<AccordionGroup>
  <Accordion title="Segment length">
    Each segment can contain up to 160 standard characters (letters, numbers, spaces, basic punctuation)
  </Accordion>
  
  <Accordion title="Special characters">
    Messages with special characters (é, ñ, emoji) have a 70 character limit per segment
  </Accordion>
  
  <Accordion title="Long messages">
    Messages longer than one segment are automatically split and billed as multiple segments
  </Accordion>

  <Accordion title="Segment calculator">
    Use our recommended [Segment Calculator](https://twiliodeved.github.io/message-segment-calculator/) to estimate message costs
  </Accordion>
</AccordionGroup>

## API message types

You're only charged for outgoing API-powered messages, which include:

<CardGroup cols={2}>
  <Card title="Direct API Usage" icon="code">
    Messages sent through direct API calls
  </Card>
  <Card title="Integration Messages" icon="puzzle-piece">
    Messages sent via applications built with our API
  </Card>
</CardGroup>

## How our billing works

We use a credit-based system for all API messaging charges:

<Steps>
  <Step title="Purchase credits">
    Add funds to your account through the "Plans & Billing" tab
  </Step>
  <Step title="Automatic deduction">
    Credits are automatically deducted when messages are sent
  </Step>
  <Step title="Credit management">
    Monitor your balance and enable auto-recharge to prevent service interruptions
  </Step>
</Steps>

## Important service notes 

### Requirements & limitations

1. An active OpenPhone subscription is required for API access.
2. MMS is not supported in the current API version.
3. Partial credits cannot be used for sending messages; the API will return an error.

<Warning>
If your credit balance is insufficient for a message's full cost, the API will return an error and the message won't be sent.
</Warning>

### Support & assistance

<Info>Need help understanding our pricing or managing your costs? Our team is here to help. Email us at support+developers@openphone.co with any questions. </Info>

