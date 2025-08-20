---
title: "Changelog"
description: "Stay up to date with the latest improvements to the API."
icon: "code-branch"
rss: true
---
<Update label="January 22, 2025" description="1.2.0">

### Minor Changes

- Adds a property `externalId` to the contact model. Adds `externalId` and `source` as optional parameters to the Create Contact (`POST /contacts`) request.
- Adds `externalId` and `source` as optional parameters to the Update Contact (`PATCH /contacts/:id`) request.
- Added a route to list contacts (`GET /contacts`).



### Patch Changes

- Fixed an issue where creating or updating a contact with an invalid custom field would result in 500 error. Sending an invalid custom field will now result in a 400 "Invalid Custom Field Item" error.

</Update>

<Update label="December 6, 2024" description="1.1.2">


### Patch Changes

- Fixed an issue where paginated endpoints would return a string token for the next page at the end of paginated results. Now, they will correctly return the next page token as `null`.
- Added a callout that the `totalItems` result field for the paginated endpoints is not functioning as expected and is not returning the true total items count.

  
</Update>


<Update label="November 25, 2024" description="1.1.1">


### Patch Changes

- Fixes an issue where phone numbers in various routes were expected to be in E164 format, but the format was not being validated correctly.

</Update>

<Update label="November 7, 2024" description="1.1.0">

## 1.1.0

### Minor Changes

- Adds a property, `restrictions`, to the objects in the response from list phone numbers (`GET /phone-numbers`). The new property contains information about regional restrictions for outbound calling and messaging from a phone number.

</Update>

<Update label="November 4, 2024" description="1.0.2">


### Patch Changes

- Fixed an issue with list calls (`GET /calls`) where sending an empty participants param resulted in a 500 response. Sending an empty participants param will now result in a descriptive 400 response.
- Fixes an issue where attempting to send a message to an international number would result in a 500 response if international messaging is not enabled in the workspace. With this fix, the 500 error response changed to a 403 with a descriptive message
- Fixes a bug where the GET call recordings endpoint sometimes returned an empty array.
- Fixes an issue that was preventing some call records from returning successfully from `GET /calls`
- Fixes an issue where getting a contact by id would result in a 500 instead of a 404 when contact is not found. Now this will respond in a 404 with a descriptive message.
- Fixes an issue where sending a message that contained only whitespace (`' '`, `'\n'`, etc.) resulted in a 500 error response. Now, this will respond with 400 and a validation error message instead.

</Update>

<Update label="October 22, 2024" description="1.0.1">

### Patch Changes

- Fixes an issue with List Calls (`GET /calls`) where the user ID applied by default when the user ID parameter was not sent was being set to the workspace owner instead of the phone number owner.

</Update>

<Update label="October 21, 2024" description="1.0.0">

## 1.0.0

### Major Changes

OpenPhone's Public API v1 release 🚀

Changes from the beta version include:

- The `since` query parameter on "list calls" and "list messages" has been deprecated. It used to incorrectly behave as a `createdBefore`. Please use `createdAfter` instead, or `createdBefore` to maintain current functionality.
- The `phoneNumberId` field for "send text message" has been deprecated. Please use `from` instead.
- `/v0` endpoints have been deprecated. Please use `/v1` instead.
</Update>
