# Data Model: Support for Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: November 13, 2025  
**Status**: Complete

## Overview

This document defines the data structures, entities, and relationships for the overdue todos feature. The overdue status is a **derived property** calculated at runtime, not stored in the database.

## Entities

### 1. Todo (Existing Entity - No Changes)

**Description**: Represents a task with completion status and optional due date. The existing Todo entity schema remains unchanged - no database modifications required.

**Fields**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID or auto-increment | Unique identifier |
| `title` | string | Yes | Max 255 characters | Task description |
| `dueDate` | string (ISO 8601) | No | Valid ISO date format (YYYY-MM-DD) | Optional deadline |
| `completed` | boolean | Yes | Default: false | Completion status |
| `createdAt` | string (ISO 8601) | Yes | Auto-generated | Creation timestamp |

**Indexes**: 
- Primary key on `id`
- Consider index on `completed, dueDate` for future filtering queries (not needed for initial implementation)

**Constraints**:
- `title` cannot be empty string
- `dueDate` must be valid ISO 8601 date format if provided
- `completed` defaults to `false` on creation

**Example**:
```json
{
  "id": "abc123",
  "title": "Complete project documentation",
  "dueDate": "2025-11-10",
  "completed": false,
  "createdAt": "2025-11-01T14:30:00.000Z"
}
```

---

### 2. Overdue Status (Derived Property - Not Stored)

**Description**: A computed property indicating whether an incomplete todo is past its due date. This is calculated on the frontend using the current date (from server time) and the todo's `dueDate` field.

**Derivation Logic**:
```javascript
isOverdue = (
  todo.completed === false && 
  todo.dueDate !== null && 
  todo.dueDate !== undefined &&
  isDateInPast(todo.dueDate, currentDate)
);
```

**Conditions for Overdue Status**:
1. Todo must be **incomplete** (`completed === false`)
2. Todo must have a **due date** (`dueDate` is not null/undefined)
3. Due date must be **before today** (day-level comparison, not time-of-day)

**Not Overdue When**:
- Todo is completed (regardless of due date)
- Todo has no due date
- Due date is today or in the future

**Validation Rules**:
- Always calculated fresh on render (no caching beyond React memoization)
- Uses server time as authoritative source via `/api/server-time` endpoint
- Falls back to client time if server unavailable

---

### 3. Server Time (New Entity)

**Description**: Represents the authoritative server time used for overdue calculations. This is not persisted; it's a runtime endpoint response.

**Response Format**:
```json
{
  "serverTime": "2025-11-13T18:30:00.000Z",
  "timestamp": 1731523800000
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `serverTime` | string (ISO 8601) | Current server date/time in ISO format |
| `timestamp` | number | Unix timestamp in milliseconds (for client-side comparison) |

**Usage**:
- Frontend fetches server time on initial load
- Frontend polls every 60 seconds to update current time
- Used for date comparison in `isDateInPast` utility

---

## Relationships

No new entity relationships are introduced. The overdue status is a **view concern**, not a data relationship.

**Existing Relationships** (unchanged):
- None (single-user app with flat todo list)

---

## State Transitions

### Overdue Status State Machine

```
┌─────────────┐
│   Created   │ (completed: false, dueDate: future)
└──────┬──────┘
       │
       │ Time passes (due date arrives)
       │
       ▼
┌─────────────┐
│   Current   │ (completed: false, dueDate: today)
└──────┬──────┘
       │
       │ Midnight transition (day changes)
       │
       ▼
┌─────────────┐
│  OVERDUE    │ (completed: false, dueDate: past)
└──────┬──────┘
       │
       │ User marks complete OR updates due date
       │
       ▼
┌─────────────┐
│ Not Overdue │ (completed: true OR dueDate: future)
└─────────────┘
```

**State Transitions**:

| From State | Event | To State | Notes |
|------------|-------|----------|-------|
| Current | Midnight passes | Overdue | Automatic transition detected by polling |
| Overdue | User completes todo | Not Overdue | Immediate transition on status update |
| Overdue | User changes due date to future | Not Overdue | Immediate transition on date update |
| Current | User changes due date to past | Overdue | Immediate transition on date update |
| No Due Date | User adds past due date | Overdue | Immediate transition (if incomplete) |

---

## Validation Rules

### Frontend Validation

**Before Rendering Overdue Indicator**:
1. Verify `todo.completed === false`
2. Verify `todo.dueDate` is not null/undefined
3. Verify `isDateInPast(todo.dueDate, currentDate)` returns true

**Date Comparison Validation** (`isDateInPast` utility):
1. Input must be valid date string or return false
2. Normalize both dates to UTC midnight (ignore time-of-day)
3. Return `false` for null/undefined inputs (defensive programming)

### Backend Validation (Existing - No Changes)

**Todo Creation/Update** (existing validations):
1. `title` is non-empty string (max 255 chars)
2. `dueDate` matches ISO 8601 format if provided (YYYY-MM-DD)
3. `completed` is boolean

**Server Time Endpoint** (new validation):
1. No input validation needed (no parameters)
2. Always returns valid ISO 8601 timestamp
3. Response includes `Cache-Control: no-store` header

---

## Data Flow

### Overdue Status Calculation Flow

```
┌──────────────┐
│   App.js     │ Fetches server time on mount + every 60s
└──────┬───────┘
       │ currentTime (Date object)
       ▼
┌──────────────┐
│  TodoList    │ Passes currentTime to each TodoCard
└──────┬───────┘
       │ currentTime + todo
       ▼
┌──────────────┐
│  TodoCard    │ Calculates isOverdue = isDateInPast(todo.dueDate, currentTime)
└──────┬───────┘
       │ isOverdue (boolean)
       ▼
┌──────────────┐
│ Visual Layer │ Renders overdue indicator if isOverdue === true
└──────────────┘
```

**Step-by-Step**:
1. **App.js** uses `useCurrentTime()` hook to fetch and poll server time
2. **useCurrentTime** hook calls `/api/server-time` endpoint every 60 seconds
3. **App.js** passes `currentTime` to `TodoList` component
4. **TodoList** passes `currentTime` to each `TodoCard` component
5. **TodoCard** uses `isDateInPast(todo.dueDate, currentTime)` to determine overdue status
6. **TodoCard** conditionally renders overdue indicator based on result

---

## Performance Considerations

### Memory

- **No additional storage**: Overdue status is computed, not stored
- **Minimal state**: Only `currentTime` added to App state (single Date object)
- **Memoization**: `useMemo` prevents recalculation unless dependencies change

### Computation

- **Date Comparison Complexity**: O(1) per todo
- **Total Complexity**: O(n) where n = number of todos
- **Expected Performance**: ~1-2ms for 100 todos (well under 200ms requirement)
- **Optimization**: `useMemo` in TodoCard prevents redundant calculations

### Network

- **Polling Frequency**: 60 seconds (3,600 requests/hour max)
- **Payload Size**: ~100 bytes per server time response (negligible)
- **Fallback**: Uses client time if server unreachable (no blocking)

---

## Migration Plan

**No database migration required.** This feature adds:
- New backend endpoint (additive, no schema changes)
- New frontend utilities and components (no breaking changes)
- New CSS styles (additive)

**Backward Compatibility**: 100% - existing todos continue to work without modification.

---

## Testing Data Requirements

### Test Fixtures

**Test Todos for Overdue Status**:
```javascript
export const testTodos = [
  {
    id: '1',
    title: 'Overdue incomplete todo',
    dueDate: '2025-11-10', // Past date
    completed: false,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Current todo (due today)',
    dueDate: '2025-11-13', // Today (assuming test runs on 2025-11-13)
    completed: false,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Future todo',
    dueDate: '2025-11-20', // Future date
    completed: false,
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: '4',
    title: 'Completed overdue todo',
    dueDate: '2025-11-10', // Past date
    completed: true, // Should NOT show overdue
    createdAt: '2025-11-01T00:00:00.000Z'
  },
  {
    id: '5',
    title: 'No due date todo',
    dueDate: null, // Should NOT show overdue
    completed: false,
    createdAt: '2025-11-01T00:00:00.000Z'
  }
];
```

**Mock Current Date**:
```javascript
const mockCurrentDate = new Date('2025-11-13T12:00:00.000Z');
```

**Expected Overdue Status**:
- Todo 1: ✅ Overdue (past due, incomplete)
- Todo 2: ❌ Not Overdue (due today)
- Todo 3: ❌ Not Overdue (future due date)
- Todo 4: ❌ Not Overdue (completed)
- Todo 5: ❌ Not Overdue (no due date)

---

## Edge Cases

### Edge Case Handling

| Edge Case | Expected Behavior | Validation |
|-----------|-------------------|------------|
| Todo with due date = today | Not overdue (treat as current) | `isDateInPast` returns false for today |
| Todo with no due date | Never overdue | Check `todo.dueDate` is truthy before calculation |
| Completed todo with past due date | Not overdue | Check `todo.completed === false` before calculation |
| Invalid due date format | Not overdue (defensive) | `isDateInPast` returns false for invalid dates |
| Server time unavailable | Use client time (fallback) | `getServerTime` catches error and returns `new Date()` |
| Midnight transition | Automatically detected by polling | Poll every 60 seconds ensures detection within 1 minute |
| User changes due date from past to future | Overdue indicator removed immediately | React re-renders on todo prop change |

---

## Summary

**Data Model Changes**: None (overdue is derived property)

**New Entities**: Server Time (runtime endpoint response, not persisted)

**Modified Entities**: None

**Key Design Decisions**:
1. Overdue status is **computed on-demand**, not stored
2. Server time is **authoritative source** via polling endpoint
3. Date comparison uses **day-level precision** (not time-of-day)
4. All validation happens **frontend-side** (backend unchanged)

**Ready for Phase 1 Contracts**: Yes - proceed to API contract definition.
