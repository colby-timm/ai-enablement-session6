# Research: Support for Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: November 13, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing overdue todo visual indicators. All technical decisions and unknowns from the Technical Context have been resolved through best practices analysis and architectural evaluation.

## Research Areas

### 1. Date Comparison Strategy

**Question**: What is the best approach for comparing dates at day-level precision in JavaScript?

**Decision**: Use UTC date normalization with day-level comparison

**Rationale**:
- JavaScript Date objects include time-of-day, which can cause comparison issues
- Normalizing to UTC midnight eliminates timezone and time-of-day complications
- Provides consistent behavior across different client timezones
- Simple implementation: `new Date(dateString).setHours(0,0,0,0)`

**Implementation Pattern**:
```javascript
/**
 * Checks if a date is in the past (before today)
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @param {Date} currentDate - Current date to compare against
 * @returns {boolean} True if date is before today
 */
export function isDateInPast(dateString, currentDate) {
  if (!dateString) return false;
  
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  return targetDate < today;
}
```

**Alternatives Considered**:
- **String comparison** (e.g., `"2025-11-10" < "2025-11-13"`) - Rejected: Fragile, breaks with non-ISO formats
- **Moment.js/date-fns** - Rejected: Adds unnecessary dependency for simple comparison
- **Time-of-day comparison** - Rejected: Spec requires day-level only

---

### 2. Server Time Synchronization

**Question**: How should the frontend obtain authoritative server time for overdue calculations?

**Decision**: Add `/api/server-time` endpoint with periodic polling

**Rationale**:
- Server time is authoritative source (per spec FR-009)
- Simple REST endpoint is easiest to implement and test
- Polling every 60 seconds balances accuracy with performance
- Graceful fallback to client time if server unavailable

**Implementation Pattern**:

**Backend (Express.js)**:
```javascript
// Add to app.js
app.get('/api/server-time', (req, res) => {
  res.json({ 
    serverTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});
```

**Frontend (Service)**:
```javascript
// Add to todoService.js
export async function getServerTime() {
  try {
    const response = await axios.get('/api/server-time');
    return new Date(response.data.serverTime);
  } catch (error) {
    console.warn('Failed to fetch server time, using client time:', error);
    return new Date(); // Graceful fallback
  }
}
```

**Alternatives Considered**:
- **WebSocket connection** - Rejected: Overkill for this feature, adds complexity
- **HTTP headers** - Rejected: Not all responses include accurate timestamps
- **Client time only** - Rejected: Violates spec requirement for server time

---

### 3. Real-Time Updates (Polling Mechanism)

**Question**: What is the best pattern for implementing minute-by-minute time updates in React?

**Decision**: Custom React hook with `setInterval` polling

**Rationale**:
- React hooks provide clean, reusable abstraction
- `setInterval` is sufficient for 60-second polling frequency
- Hook encapsulates polling logic, cleanup, and error handling
- Easy to test in isolation

**Implementation Pattern**:
```javascript
// hooks/useCurrentTime.js
import { useState, useEffect } from 'react';
import { getServerTime } from '../services/todoService';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch
    const fetchTime = async () => {
      try {
        const serverTime = await getServerTime();
        setCurrentTime(serverTime);
        setError(null);
      } catch (err) {
        setError(err);
        setCurrentTime(new Date()); // Fallback
      }
    };

    fetchTime();

    // Poll every 60 seconds
    const interval = setInterval(fetchTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return { currentTime, error };
}
```

**Alternatives Considered**:
- **Browser Visibility API** - Considered: Could pause polling when tab hidden, but adds complexity
- **Web Workers** - Rejected: Overkill for simple timer
- **RequestAnimationFrame** - Rejected: Too frequent, wastes resources

---

### 4. Visual Indicators for Accessibility

**Question**: What combination of visual indicators ensures accessibility for color-blind users?

**Decision**: Color change (red/orange tint) + warning icon + optional text label

**Rationale**:
- WCAG 2.1 Level AA requires information not conveyed by color alone
- Icon provides non-color visual cue (⚠️ or 🕐)
- Text label ("Overdue") provides explicit semantic meaning
- Multiple indicators ensure all users can identify overdue status

**Implementation Pattern**:
```jsx
// TodoCard.js
{isOverdue && (
  <div className="overdue-indicator" role="status" aria-label="Overdue">
    <span className="overdue-icon" aria-hidden="true">⚠️</span>
    <span className="overdue-text">Overdue</span>
  </div>
)}
```

**CSS (theme.css)**:
```css
/* Light mode */
.todo-card.overdue {
  border-left: 4px solid #c62828;
  background-color: #ffebee;
}

.overdue-indicator {
  color: #c62828;
  font-weight: 600;
}

/* Dark mode */
[data-theme="dark"] .todo-card.overdue {
  border-left: 4px solid #ef5350;
  background-color: rgba(239, 83, 80, 0.15);
}

[data-theme="dark"] .overdue-indicator {
  color: #ef5350;
}
```

**Alternatives Considered**:
- **Color only** - Rejected: Fails accessibility requirements
- **Icon only** - Rejected: May not be clear to all users
- **Animation/blinking** - Rejected: Can be distracting, accessibility concern

---

### 5. Performance Optimization

**Question**: How can we ensure <200ms render time for 100 todos with overdue calculations?

**Decision**: Memoize date comparison results with React.useMemo

**Rationale**:
- Date comparison is lightweight but can add up with many todos
- `useMemo` caches comparison results, recalculates only when dependencies change
- Prevents unnecessary re-renders when current time updates but overdue status doesn't change
- Minimal code change, significant performance gain

**Implementation Pattern**:
```jsx
// TodoCard.js
import { useMemo } from 'react';
import { isDateInPast } from '../utils/dateUtils';

function TodoCard({ todo, currentTime, onToggle, onDelete, onEdit }) {
  const isOverdue = useMemo(() => {
    return !todo.completed && isDateInPast(todo.dueDate, currentTime);
  }, [todo.completed, todo.dueDate, currentTime]);

  return (
    <div className={`todo-card ${isOverdue ? 'overdue' : ''}`}>
      {/* ... rest of component */}
    </div>
  );
}
```

**Alternatives Considered**:
- **Computed property in backend** - Rejected: Overdue status changes based on client's "now", not request time
- **Virtualization** - Rejected: Premature optimization, 100 todos is manageable
- **Web Workers** - Rejected: Overkill for simple comparison

---

### 6. Testing Strategy

**Question**: How should we structure tests to achieve 80%+ coverage?

**Decision**: Layer tests by type: unit (utilities), component (visual), integration (polling)

**Rationale**:
- Unit tests for date utilities ensure correctness of core logic
- Component tests verify visual rendering and accessibility
- Integration tests validate polling mechanism and state updates
- Layered approach provides comprehensive coverage without duplication

**Test Plan**:

**Unit Tests (dateUtils.test.js)**:
- ✓ Returns false for future dates
- ✓ Returns false for today's date
- ✓ Returns true for past dates
- ✓ Returns false for null/undefined dates
- ✓ Handles invalid date strings
- ✓ Normalizes time-of-day to midnight

**Component Tests (TodoCard.test.js)**:
- ✓ Renders overdue indicator for incomplete past-due todo
- ✓ Does not render indicator for completed past-due todo
- ✓ Does not render indicator for future-due todo
- ✓ Does not render indicator for todo without due date
- ✓ Applies correct CSS classes for overdue state
- ✓ Overdue indicator has proper ARIA labels
- ✓ Icon and text are both present for accessibility

**Integration Tests (useCurrentTime.test.js)**:
- ✓ Fetches server time on mount
- ✓ Polls server time every 60 seconds
- ✓ Cleans up interval on unmount
- ✓ Falls back to client time on error
- ✓ Updates component when time changes

**Alternatives Considered**:
- **E2E tests** - Deferred: Out of scope per testing guidelines
- **Snapshot tests** - Rejected: Brittle for this feature, prefer explicit assertions

---

## Best Practices Summary

### React Best Practices
1. **Custom Hooks**: Encapsulate polling logic in `useCurrentTime` hook
2. **Memoization**: Use `useMemo` for expensive computations (date comparison across many todos)
3. **Prop Drilling**: Pass `currentTime` from App → TodoList → TodoCard (acceptable for single-user app)
4. **Effect Cleanup**: Always clear intervals in `useEffect` cleanup function

### Express.js Best Practices
1. **Minimal Endpoints**: Single `/api/server-time` endpoint, no authentication needed (single-user app)
2. **Standard Response Format**: JSON with `serverTime` (ISO string) and `timestamp` (Unix ms)
3. **No Caching**: Ensure response is not cached (add `Cache-Control: no-store` header)

### Testing Best Practices
1. **Mock Time**: Use Jest's `jest.useFakeTimers()` to control time in tests
2. **Mock Services**: Mock `getServerTime` in component tests
3. **Accessibility Testing**: Verify ARIA labels and roles in component tests
4. **Coverage Threshold**: Enforce 80%+ via Jest config

### Performance Best Practices
1. **Polling Frequency**: 60 seconds balances accuracy with server load
2. **Memoization**: Prevent unnecessary re-renders with `useMemo`
3. **Graceful Degradation**: Fall back to client time if server unavailable

---

## Implementation Checklist

- [ ] Create `dateUtils.js` utility with `isDateInPast` function
- [ ] Add `/api/server-time` endpoint to backend
- [ ] Create `useCurrentTime` custom hook with polling
- [ ] Update `TodoCard` component with overdue indicators
- [ ] Add CSS styles for overdue state (light/dark mode)
- [ ] Update `todoService.js` with `getServerTime` method
- [ ] Pass `currentTime` from App through TodoList to TodoCard
- [ ] Write unit tests for dateUtils
- [ ] Write component tests for TodoCard overdue rendering
- [ ] Write integration tests for useCurrentTime hook
- [ ] Verify 80%+ test coverage
- [ ] Manual accessibility testing (screen reader, keyboard nav)

---

## Open Questions / Future Considerations

**Q: Should we add a "days overdue" indicator (e.g., "3 days overdue")?**  
A: Out of scope for initial implementation (per spec). Could be added as P3 feature in future.

**Q: Should we notify users when a todo becomes overdue?**  
A: Out of scope (per spec: "Out of Scope: Notifications or reminders"). Browser notifications could be future enhancement.

**Q: Should we allow users to customize the polling frequency?**  
A: Not needed for MVP. 60 seconds provides good balance. Could be added as user preference later.

**Q: What happens if the user's system clock is drastically wrong?**  
A: Server time is authoritative, so overdue status will be correct relative to server. Client clock inaccuracy won't affect correctness, only the perceived "now" until next poll.

---

## Conclusion

All technical unknowns have been resolved. The implementation approach is:
1. **Backend**: Add simple server time endpoint
2. **Frontend**: Create date utility, polling hook, and visual indicators
3. **Testing**: Comprehensive unit, component, and integration tests
4. **Performance**: Memoization and 60-second polling meet <200ms requirement

Ready to proceed to Phase 1: Data Model & Contracts.
