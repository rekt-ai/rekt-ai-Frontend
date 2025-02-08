# Chat API Documentation

Base URL: `/api/chats`

## Endpoints

### Get All Chats

```http
GET /api/chats?limit={number}&offset={number}
```

Retrieves all chats with pagination support.

#### Query Parameters
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)

#### Response Format
```json
{
  "chats": [
    {
      "id": "string",
      "chatData": "object",
      "imageUrl": "string | null",
      "timestamp": "bigint",
      "userAddress": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

### Get Chats by Wallet Address

```http
GET /api/chats?userAddress={address}&limit={number}&offset={number}
```

Retrieves all chats for a specific wallet address with pagination support.

#### Query Parameters
- `userAddress` (required): Ethereum wallet address
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)

#### Response Format
Same as "Get All Chats"

### Get a Specific Chat

```http
GET /api/chats/{id}
```

Returns a single chat by ID.

#### Response Format
```json
{
  "id": "string",
  "chatData": "object",
  "imageUrl": "string | null",
  "timestamp": "bigint",
  "userAddress": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Create a New Chat

```http
POST /api/chats
```

Creates a new chat record.

#### Request Body
```json
{
  "chatData": "object (required)",
  "imageUrl": "string | null",
  "timestamp": "bigint (required)",
  "userAddress": "string (required)"
}
```

#### Response Format
Returns the created chat object with the same format as "Get a Specific Chat"

### Update a Chat

```http
PUT /api/chats/{id}
```

Updates an existing chat by ID.

#### Request Body
```json
{
  "chatData": "object (optional)",
  "imageUrl": "string | null (optional)",
  "timestamp": "bigint (optional)",
  "userAddress": "string (optional)"
}
```

#### Response Format
Returns the updated chat object with the same format as "Get a Specific Chat"

### Delete a Chat

```http
DELETE /api/chats/{id}
```

Deletes a chat by ID.

#### Response Format
```json
{
  "message": "Chat deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: When required parameters are missing or invalid
- `404 Not Found`: When the requested chat doesn't exist
- `405 Method Not Allowed`: When using an unsupported HTTP method
- `500 Internal Server Error`: When a server error occurs

Error response format:
```json
{
  "error": "string"
}
```
