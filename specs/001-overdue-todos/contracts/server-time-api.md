# API Contract: Server Time Endpoint

**Feature**: 001-overdue-todos  
**Date**: November 13, 2025  
**Version**: 1.0.0

## Overview

This document defines the API contract for the new server time endpoint used to provide authoritative time for overdue todo calculations.

---

## Endpoint: GET /api/server-time

**Description**: Returns the current server time in ISO 8601 format. This endpoint provides the authoritative time source for overdue status calculations on the frontend.

**Authentication**: None (single-user application)

**Rate Limiting**: None (frontend polls every 60 seconds)

---

### Request

**Method**: `GET`

**URL**: `/api/server-time`

**Headers**: None required

**Query Parameters**: None

**Request Body**: None

**Example Request**:
```http
GET /api/server-time HTTP/1.1
Host: localhost:3030
```

---

### Response

**Success Response (200 OK)**:

**Status Code**: `200 OK`

**Headers**:
```http
Content-Type: application/json
Cache-Control: no-store
```

**Body Schema**:
```json
{
  "serverTime": "string (ISO 8601 datetime)",
  "timestamp": "number (Unix timestamp in milliseconds)"
}
```

**Field Descriptions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serverTime` | string | Yes | Current server date/time in ISO 8601 format (e.g., "2025-11-13T18:30:00.000Z") |
| `timestamp` | number | Yes | Unix timestamp in milliseconds since epoch (e.g., 1731523800000) |

**Example Response**:
```json
{
  "serverTime": "2025-11-13T18:30:00.000Z",
  "timestamp": 1731523800000
}
```

**Response Validation**:
- `serverTime` MUST be valid ISO 8601 format
- `timestamp` MUST match `serverTime` value
- Response MUST NOT be cached (Cache-Control header prevents caching)

---

### Error Responses

This endpoint has no expected error conditions under normal operation. If the server is unreachable, the client will catch the network error and fall back to client time.

**Potential Client-Side Errors**:

**Network Error** (handled by frontend):
```javascript
// Frontend handles this gracefully
try {
  const response = await axios.get('/api/server-time');
  return new Date(response.data.serverTime);
} catch (error) {
  console.warn('Failed to fetch server time, using client time:', error);
  return new Date(); // Graceful fallback
}
```

---

## Usage Examples

### JavaScript (Frontend)

```javascript
// Using Axios (existing in project)
import axios from 'axios';

async function getServerTime() {
  try {
    const response = await axios.get('/api/server-time');
    return new Date(response.data.serverTime);
  } catch (error) {
    console.warn('Failed to fetch server time, using client time:', error);
    return new Date();
  }
}

// Usage in component
const serverTime = await getServerTime();
console.log('Server time:', serverTime.toISOString());
```

### cURL

```bash
curl -X GET http://localhost:3030/api/server-time
```

**Response**:
```json
{"serverTime":"2025-11-13T18:30:00.000Z","timestamp":1731523800000}
```

---

## Implementation Notes

### Backend (Express.js)

**Route Handler**:
```javascript
// Add to packages/backend/src/app.js

app.get('/api/server-time', (req, res) => {
  const now = new Date();
  res.set('Cache-Control', 'no-store');
  res.json({
    serverTime: now.toISOString(),
    timestamp: now.getTime()
  });
});
```

**Testing**:
```javascript
// packages/backend/__tests__/app.test.js

describe('GET /api/server-time', () => {
  it('should return current server time in ISO format', async () => {
    const response = await request(app).get('/api/server-time');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('serverTime');
    expect(response.body).toHaveProperty('timestamp');
    expect(new Date(response.body.serverTime).toISOString()).toBe(response.body.serverTime);
  });

  it('should not cache the response', async () => {
    const response = await request(app).get('/api/server-time');
    
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('should return timestamp matching serverTime', async () => {
    const response = await request(app).get('/api/server-time');
    
    const serverTimeMs = new Date(response.body.serverTime).getTime();
    expect(Math.abs(serverTimeMs - response.body.timestamp)).toBeLessThan(10); // Allow 10ms variance
  });
});
```

---

## Performance Considerations

**Expected Load**:
- Single user polling every 60 seconds
- ~1 request per minute
- ~1,440 requests per day
- Negligible server load

**Response Time**: <10ms (simple timestamp generation)

**Payload Size**: ~100 bytes (minimal JSON)

**Caching Strategy**: No caching (Cache-Control: no-store ensures fresh time on every request)

---

## Versioning

**Current Version**: 1.0.0

**Breaking Changes**: None planned

**Future Enhancements** (potential):
- Add timezone information
- Add server uptime
- Add server health status

**Deprecation Policy**: This endpoint is fundamental to the overdue feature and will not be deprecated.

---

## Security Considerations

**Authentication**: Not required (single-user application, read-only endpoint)

**Authorization**: Not required (time is public information)

**Input Validation**: No user input to validate

**Rate Limiting**: Not required for MVP (could add if abused)

**CORS**: Handled by existing CORS middleware in Express app

---

## Testing Checklist

### Backend Tests
- [x] Returns 200 status code
- [x] Response includes `serverTime` field
- [x] Response includes `timestamp` field
- [x] `serverTime` is valid ISO 8601 format
- [x] `timestamp` matches `serverTime` value
- [x] Response has `Cache-Control: no-store` header
- [x] Response time is <10ms

### Frontend Tests
- [x] Successfully fetches server time
- [x] Parses ISO string to Date object
- [x] Falls back to client time on network error
- [x] Retries on subsequent polls after failure

### Integration Tests
- [x] Frontend can call backend endpoint
- [x] Polling mechanism updates time every 60 seconds
- [x] Time is passed to components correctly

---

## Related Documentation

- [Data Model](../data-model.md) - Entity definitions including Server Time
- [Research](../research.md) - Decision rationale for server time approach
- [Functional Requirements](../../../../docs/functional-requirements.md) - FR-009 (server time requirement)

---

## Changelog

### Version 1.0.0 (2025-11-13)
- Initial API contract for server time endpoint
- Supports overdue todo feature (001-overdue-todos)
