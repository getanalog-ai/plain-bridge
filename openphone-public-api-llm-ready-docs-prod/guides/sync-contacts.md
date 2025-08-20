---
title: "Sync your contacts"
icon: "person"
description: "Implement a one-way contact sync from Google Sheets to OpenPhone using Javascript."
---
## Overview
This guide provides a foundation for implementing a one-way sync from Google Sheets to OpenPhone using JavaScript. You may need to adjust some details based on your specific requirements and environment. Remember to thoroughly test the implementation to ensure data integrity.

## Development guide
<AccordionGroup>
<Accordion title="1. Setup and authentication">
  ##### 1.1 OpenPhone API.
- Obtain your OpenPhone API key from the OpenPhone dashboard.

##### 1.2 Google Sheets API
- Enable the Google Sheets API in your Google Cloud Console.
- Create service account credentials and download the JSON key file.

##### 1.3 Google Sheets

- Create a Google Sheet in the following format:

  | contactId | firstName | lastName | phone          | email              |
  |-----------|-----------|----------|----------------|--------------------|
  |           | Jane       | Doe      | (555) 555-5555 | jane@example.com   |

- Share your Google Sheet with the service account email address.
</Accordion>
<Accordion title="2. Environment setup">
##### 2.1 Ensure you have Node.js installed on your system.

##### 2.2 Create a new Node.js project and initialize it
```bash
mkdir openphone-sync
cd openphone-sync
npm init -y
```

##### 2.3 Install required packages
```bash
npm install googleapis axios dotenv node-cron
```

##### 2.4 Create a .env file to store environment variables
```bash
OPENPHONE_API_KEY=your_openphone_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_SHEET_ID=your_google_sheet_id
```
</Accordion>
<Accordion title="3. Implement the sync process">
##### 3.1 Create a new file named `sync.js` and add the setup functions
```js
require("dotenv").config();
const { google } = require("googleapis");
const axios = require("axios");
const cron = require("node-cron");

const OPENPHONE_API_BASE_URL = "https://api.openphone.com/v1";

const openPhone = axios.create({
  baseURL: OPENPHONE_API_BASE_URL,
  headers: {
    Authorization: process.env.OPENPHONE_API_KEY,
    "Content-Type": "application/json",
    },
});

const googleAuth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
```

##### 3.2 Add the OpenPhone API helper functions
```js
async function createOpenPhoneContact(contactData) {
  const response = await openPhone.post("/contacts", contactData);
  return response.data.data;
}

async function updateOpenPhoneContact(contactId, contactData) {
  const response = await openPhone.patch(`/contacts/${contactId}`, contactData);
  return response.data.data;
}
```

##### 3.3 Add the Google Sheets to OpenPhone contacts mapping function
```js
function mapFields(sheetRow) {
  if (!sheetRow.firstName) {
    console.warn("Missing required firstName in row: ", sheetRow);
    return;
  }
  return {
    defaultFields: {
      firstName: sheetRow.firstName,
      lastName: sheetRow.lastName,
      phoneNumbers: sheetRow.phone
        ? [{ name: "primary", value: sheetRow.phone }]
        : undefined,
      emails: sheetRow.email
        ? [{ name: "primary", value: sheetRow.email }]
        : undefined,
    },
  };
}
```

##### 3.4 Add the Google Sheets helper functions
```js
async function getGoogleSheetsData() {
  const sheets = google.sheets({ version: "v4", googleAuth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A1:Z", // First sheet and all initial columns
  });

  const rows = response.data.values;
  const headers = rows[0]; // First row contains headers
  return rows.slice(1).map((row) => { // Skip the first row and map the contact data
    const contact = {};
    headers.forEach((header, index) => {
      contact[header] = row[index];
    });
    return contact;
  });
}

async function updateSheetWithContactId(rowNumber, contactId) {
  const sheets = google.sheets({ version: "v4", googleAuth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Sheet1!A${rowNumber + 2}`, // +2 to account for 1-based index and header row
    valueInputOption: "RAW",
    resource: { values: [[contactId]] },
  });
}
```

##### 3.4 Finally, tie it all together
```js
async function syncContacts() {
  const sheetContacts = await getGoogleSheetsData();

  for (const [rowNumber, sheetRow] of sheetContacts.entries()) {
    const mappedContact = mapFields(sheetRow);
    if (sheetRow.contactId) {
      await updateOpenPhoneContact(sheetRow.contactId, mappedContact);
    } else {
      const { id } = await createOpenPhoneContact(mappedContact);
      await updateSheetWithContactId(rowNumber, id);
    }
  }

  console.log("Sync completed successfully");
}

// Run sync every hour
cron.schedule("0 * * * *", syncContacts);
console.log("Sync process started. Running every hour.");
```


</Accordion>
<Accordion title="4. Running the sync process">
```bash
node sync.js
```
This will start the sync process, which will run every hour.
</Accordion>
</AccordionGroup>
## Considerations and Optimizations
- Implement deletion logic to remove contacts from OpenPhone that are no longer present in the Google Sheet.
- Implement pagination for fetching OpenPhone contacts if you have a large number of contacts.
- Implement more robust error handling and retry mechanisms.
- Implement logging for auditing and troubleshooting purposes.
- Consider using a database to store the state of the sync process and to track changes between syncs.
- Consider implementing rate-limiting and an incremental sync to reduce API calls and processing time.
- For production use, consider deploying this script to a cloud platform like Heroku or AWS Lambda for better reliability and scalability.
