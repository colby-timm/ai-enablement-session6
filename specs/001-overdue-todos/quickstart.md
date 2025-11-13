# Quick Start Guide: Overdue Todo Items

**Feature**: 001-overdue-todos  
**Date**: November 13, 2025  
**For**: Developers implementing the overdue todos feature

## Overview

This guide provides step-by-step instructions for implementing the overdue todo items feature. Follow these steps in order to ensure proper implementation and testing.

---

## Prerequisites

- Node.js v16+ installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with React hooks and Express.js
- Understanding of the project structure (see [Project Overview](../../../docs/project-overview.md))

---

## Implementation Steps

### Phase 1: Backend - Server Time Endpoint (30 minutes)

#### Step 1.1: Add Server Time Route

**File**: `packages/backend/src/app.js`

Add the following route after existing todo routes:

```javascript
// Server time endpoint for overdue calculations
app.get('/api/server-time', (req, res) => {
  const now = new Date();
  res.set('Cache-Control', 'no-store');
  res.json({
    serverTime: now.toISOString(),
    timestamp: now.getTime()
  });
});
```

**Location**: Add before the error handling middleware

#### Step 1.2: Write Backend Tests

**File**: `packages/backend/__tests__/app.test.js`

Add test suite at the end of the file:

```javascript
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
    expect(Math.abs(serverTimeMs - response.body.timestamp)).toBeLessThan(10);
  });
});
```

#### Step 1.3: Verify Backend Tests Pass

```bash
npm run test:backend
```

Expected: All tests pass, including 3 new server-time tests

---

### Phase 2: Frontend - Date Utilities (45 minutes)

#### Step 2.1: Create Date Utilities File

**File**: `packages/frontend/src/utils/dateUtils.js` (NEW)

```javascript
/**
 * Checks if a date is in the past (before today)
 * Compares at day-level precision, ignoring time-of-day
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @param {Date} currentDate - Current date to compare against
 * @returns {boolean} True if date is before today
 */
export function isDateInPast(dateString, currentDate) {
  if (!dateString) return false;
  
  try {
    const targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) return false;
    
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    return targetDate < today;
  } catch (error) {
    console.error('Error parsing date:', error);
    return false;
  }
}

/**
 * Checks if a todo is overdue
 * @param {Object} todo - Todo object with completed and dueDate fields
 * @param {Date} currentDate - Current date to compare against
 * @returns {boolean} True if todo is incomplete and past due date
 */
export function isTodoOverdue(todo, currentDate) {
  return !todo.completed && isDateInPast(todo.dueDate, currentDate);
}
```

#### Step 2.2: Create Date Utilities Tests

**File**: `packages/frontend/src/utils/__tests__/dateUtils.test.js` (NEW)

```javascript
import { isDateInPast, isTodoOverdue } from '../dateUtils';

describe('dateUtils', () => {
  const mockCurrentDate = new Date('2025-11-13T12:00:00.000Z');

  describe('isDateInPast', () => {
    it('should return false for future dates', () => {
      expect(isDateInPast('2025-11-20', mockCurrentDate)).toBe(false);
    });

    it('should return false for today\'s date', () => {
      expect(isDateInPast('2025-11-13', mockCurrentDate)).toBe(false);
    });

    it('should return true for past dates', () => {
      expect(isDateInPast('2025-11-10', mockCurrentDate)).toBe(true);
    });

    it('should return false for null or undefined dates', () => {
      expect(isDateInPast(null, mockCurrentDate)).toBe(false);
      expect(isDateInPast(undefined, mockCurrentDate)).toBe(false);
    });

    it('should return false for invalid date strings', () => {
      expect(isDateInPast('invalid-date', mockCurrentDate)).toBe(false);
    });

    it('should normalize time-of-day to midnight', () => {
      const earlyMorning = new Date('2025-11-13T01:00:00.000Z');
      const lateNight = new Date('2025-11-13T23:59:59.000Z');
      
      expect(isDateInPast('2025-11-13', earlyMorning)).toBe(false);
      expect(isDateInPast('2025-11-13', lateNight)).toBe(false);
    });
  });

  describe('isTodoOverdue', () => {
    it('should return true for incomplete todo with past due date', () => {
      const todo = { completed: false, dueDate: '2025-11-10' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(true);
    });

    it('should return false for completed todo with past due date', () => {
      const todo = { completed: true, dueDate: '2025-11-10' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });

    it('should return false for incomplete todo with future due date', () => {
      const todo = { completed: false, dueDate: '2025-11-20' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });

    it('should return false for todo without due date', () => {
      const todo = { completed: false, dueDate: null };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });
  });
});
```

#### Step 2.3: Verify Utilities Tests Pass

```bash
npm run test:frontend
```

Expected: All tests pass, including new dateUtils tests

---

### Phase 3: Frontend - Service Layer (30 minutes)

#### Step 3.1: Update Todo Service

**File**: `packages/frontend/src/services/todoService.js`

Add at the end of the file:

```javascript
/**
 * Fetches current server time
 * @returns {Promise<Date>} Current server time as Date object
 */
export async function getServerTime() {
  try {
    const response = await axios.get('/api/server-time');
    return new Date(response.data.serverTime);
  } catch (error) {
    console.warn('Failed to fetch server time, using client time:', error);
    return new Date();
  }
}
```

#### Step 3.2: Update Service Tests

**File**: `packages/frontend/src/services/__tests__/todoService.test.js`

Add at the end of the test suite:

```javascript
describe('getServerTime', () => {
  it('should fetch server time successfully', async () => {
    const mockServerTime = '2025-11-13T18:30:00.000Z';
    server.use(
      rest.get('/api/server-time', (req, res, ctx) => {
        return res(ctx.json({ 
          serverTime: mockServerTime,
          timestamp: new Date(mockServerTime).getTime()
        }));
      })
    );

    const result = await getServerTime();
    
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(mockServerTime);
  });

  it('should fallback to client time on error', async () => {
    server.use(
      rest.get('/api/server-time', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const beforeCall = Date.now();
    const result = await getServerTime();
    const afterCall = Date.now();
    
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThanOrEqual(beforeCall);
    expect(result.getTime()).toBeLessThanOrEqual(afterCall);
  });
});
```

---

### Phase 4: Frontend - Polling Hook (1 hour)

#### Step 4.1: Create useCurrentTime Hook

**File**: `packages/frontend/src/hooks/useCurrentTime.js` (NEW)

```javascript
import { useState, useEffect } from 'react';
import { getServerTime } from '../services/todoService';

/**
 * Custom hook to fetch and poll server time
 * Updates current time every 60 seconds
 * @returns {Object} { currentTime: Date, error: Error|null }
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const serverTime = await getServerTime();
        setCurrentTime(serverTime);
        setError(null);
      } catch (err) {
        console.error('Error fetching server time:', err);
        setError(err);
        setCurrentTime(new Date()); // Fallback to client time
      }
    };

    // Initial fetch
    fetchTime();

    // Poll every 60 seconds
    const interval = setInterval(fetchTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return { currentTime, error };
}
```

#### Step 4.2: Create Hook Tests

**File**: `packages/frontend/src/hooks/__tests__/useCurrentTime.test.js` (NEW)

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentTime } from '../useCurrentTime';
import * as todoService from '../../services/todoService';

jest.mock('../../services/todoService');

describe('useCurrentTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch server time on mount', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    todoService.getServerTime.mockResolvedValue(mockDate);

    const { result } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(result.current.currentTime).toEqual(mockDate);
    });

    expect(todoService.getServerTime).toHaveBeenCalledTimes(1);
  });

  it('should poll server time every 60 seconds', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    todoService.getServerTime.mockResolvedValue(mockDate);

    renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(todoService.getServerTime).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(todoService.getServerTime).toHaveBeenCalledTimes(2);
    });

    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(todoService.getServerTime).toHaveBeenCalledTimes(3);
    });
  });

  it('should cleanup interval on unmount', async () => {
    const mockDate = new Date('2025-11-13T18:30:00.000Z');
    todoService.getServerTime.mockResolvedValue(mockDate);

    const { unmount } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(todoService.getServerTime).toHaveBeenCalledTimes(1);
    });

    unmount();

    jest.advanceTimersByTime(60000);

    expect(todoService.getServerTime).toHaveBeenCalledTimes(1);
  });

  it('should fallback to client time on error', async () => {
    todoService.getServerTime.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCurrentTime());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.currentTime).toBeInstanceOf(Date);
    });
  });
});
```

---

### Phase 5: Frontend - Component Updates (1 hour)

#### Step 5.1: Update TodoCard Component

**File**: `packages/frontend/src/components/TodoCard.js`

1. Add imports:
```javascript
import { useMemo } from 'react';
import { isTodoOverdue } from '../utils/dateUtils';
```

2. Update component signature to accept `currentTime`:
```javascript
function TodoCard({ todo, currentTime, onToggle, onDelete, onEdit }) {
```

3. Calculate overdue status with memoization:
```javascript
const isOverdue = useMemo(() => {
  return isTodoOverdue(todo, currentTime);
}, [todo.completed, todo.dueDate, currentTime]);
```

4. Update className:
```javascript
<div className={`todo-card ${isOverdue ? 'overdue' : ''} ${todo.completed ? 'completed' : ''}`}>
```

5. Add overdue indicator after title:
```javascript
{isOverdue && (
  <div className="overdue-indicator" role="status" aria-label="Overdue">
    <span className="overdue-icon" aria-hidden="true">⚠️</span>
    <span className="overdue-text">Overdue</span>
  </div>
)}
```

#### Step 5.2: Update TodoCard Tests

**File**: `packages/frontend/src/components/__tests__/TodoCard.test.js`

Add test suite:

```javascript
describe('Overdue todos', () => {
  const mockCurrentDate = new Date('2025-11-13T12:00:00.000Z');

  it('should display overdue indicator for incomplete past-due todo', () => {
    const overdueTodo = {
      id: '1',
      title: 'Overdue task',
      dueDate: '2025-11-10',
      completed: false
    };

    render(<TodoCard todo={overdueTodo} currentTime={mockCurrentDate} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.getByRole('status', { name: /overdue/i })).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should not display overdue indicator for completed past-due todo', () => {
    const completedTodo = {
      id: '1',
      title: 'Completed overdue task',
      dueDate: '2025-11-10',
      completed: true
    };

    render(<TodoCard todo={completedTodo} currentTime={mockCurrentDate} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.queryByRole('status', { name: /overdue/i })).not.toBeInTheDocument();
  });

  it('should not display overdue indicator for future-due todo', () => {
    const futureTodo = {
      id: '1',
      title: 'Future task',
      dueDate: '2025-11-20',
      completed: false
    };

    render(<TodoCard todo={futureTodo} currentTime={mockCurrentDate} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.queryByRole('status', { name: /overdue/i })).not.toBeInTheDocument();
  });

  it('should not display overdue indicator for todo without due date', () => {
    const noDueDateTodo = {
      id: '1',
      title: 'No due date task',
      dueDate: null,
      completed: false
    };

    render(<TodoCard todo={noDueDateTodo} currentTime={mockCurrentDate} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.queryByRole('status', { name: /overdue/i })).not.toBeInTheDocument();
  });

  it('should apply overdue CSS class', () => {
    const overdueTodo = {
      id: '1',
      title: 'Overdue task',
      dueDate: '2025-11-10',
      completed: false
    };

    const { container } = render(<TodoCard todo={overdueTodo} currentTime={mockCurrentDate} onToggle={jest.fn()} onDelete={jest.fn()} onEdit={jest.fn()} />);

    const todoCard = container.querySelector('.todo-card');
    expect(todoCard).toHaveClass('overdue');
  });
});
```

#### Step 5.3: Update TodoList Component

**File**: `packages/frontend/src/components/TodoList.js`

Update component signature and pass currentTime to TodoCard:

```javascript
function TodoList({ todos, currentTime, onToggle, onDelete, onEdit }) {
  // ... existing code ...
  
  return (
    <div className="todo-list">
      {todos.length === 0 ? (
        <p className="empty-message">No todos yet. Add one to get started! 👻</p>
      ) : (
        todos.map(todo => (
          <TodoCard
            key={todo.id}
            todo={todo}
            currentTime={currentTime}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  );
}
```

#### Step 5.4: Update App Component

**File**: `packages/frontend/src/App.js`

1. Import the hook:
```javascript
import { useCurrentTime } from './hooks/useCurrentTime';
```

2. Use the hook:
```javascript
function App() {
  const { currentTime } = useCurrentTime();
  // ... existing state ...
```

3. Pass currentTime to TodoList:
```javascript
<TodoList
  todos={todos}
  currentTime={currentTime}
  onToggle={handleToggle}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

---

### Phase 6: Styling (30 minutes)

#### Step 6.1: Add Overdue Styles

**File**: `packages/frontend/src/styles/theme.css`

Add at the end of the file:

```css
/* Overdue Todo Styles */
.todo-card.overdue {
  border-left: 4px solid var(--color-danger);
  background-color: var(--color-danger-bg);
}

.overdue-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-danger);
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 4px;
}

.overdue-icon {
  font-size: 1rem;
}

/* Light mode overdue colors */
:root {
  --color-danger-bg: #ffebee;
}

/* Dark mode overdue colors */
[data-theme="dark"] {
  --color-danger-bg: rgba(239, 83, 80, 0.15);
}
```

---

### Phase 7: Testing & Verification (30 minutes)

#### Step 7.1: Run All Tests

```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# All tests
npm test
```

Expected: All tests pass with 80%+ coverage

#### Step 7.2: Manual Testing

1. Start the application:
```bash
npm start
```

2. Test scenarios:
   - [ ] Create a todo with a past due date → Should show overdue indicator
   - [ ] Create a todo with today's date → Should NOT show overdue indicator
   - [ ] Create a todo with a future date → Should NOT show overdue indicator
   - [ ] Mark an overdue todo complete → Overdue indicator should disappear
   - [ ] Edit overdue todo's date to future → Overdue indicator should disappear
   - [ ] Verify overdue indicator has icon + text
   - [ ] Test in light mode → Red/pink styling
   - [ ] Test in dark mode → Light red styling
   - [ ] Wait 60 seconds → Verify polling works (check network tab)

#### Step 7.3: Accessibility Testing

- [ ] Use keyboard only to navigate (Tab, Enter)
- [ ] Verify overdue indicator has proper ARIA label
- [ ] Test with screen reader (if available)
- [ ] Verify color contrast meets WCAG AA standards

---

## Troubleshooting

### Tests Failing

**Issue**: Date comparison tests failing intermittently  
**Solution**: Use fixed mock dates in tests, not `new Date()`

**Issue**: Hook tests failing with "act" warnings  
**Solution**: Use `waitFor` from @testing-library/react

### Runtime Errors

**Issue**: "Cannot read property 'dueDate' of undefined"  
**Solution**: Add defensive checks in `isDateInPast` function

**Issue**: Polling continues after component unmount  
**Solution**: Ensure `useEffect` cleanup function clears interval

### Styling Issues

**Issue**: Overdue indicator not visible  
**Solution**: Check CSS variables are defined in theme.css

**Issue**: Dark mode colors not applying  
**Solution**: Verify `[data-theme="dark"]` selector matches your theme implementation

---

## Performance Checklist

- [ ] Date comparison uses `useMemo` to prevent unnecessary calculations
- [ ] Polling interval is 60 seconds (not more frequent)
- [ ] Server time endpoint response is <10ms
- [ ] Total render time for 100 todos is <200ms
- [ ] No memory leaks from unmounted interval timers

---

## Code Review Checklist

Before submitting PR:
- [ ] All tests pass
- [ ] Test coverage is 80%+
- [ ] No ESLint errors or warnings
- [ ] Code follows project naming conventions
- [ ] All components have proper PropTypes (or TypeScript types)
- [ ] Error handling implemented (try-catch, graceful fallbacks)
- [ ] Accessibility features present (ARIA labels, keyboard nav)
- [ ] Comments explain "why" not "what"
- [ ] No console.log statements in production code
- [ ] Git commits are atomic and well-described

---

## Next Steps

After completing implementation:
1. Run full test suite: `npm test`
2. Generate coverage report: `npm test -- --coverage`
3. Manual testing in browser (all scenarios above)
4. Create PR with descriptive title and body
5. Request code review from team
6. Address review feedback
7. Merge to main branch

---

## Support & Resources

- **Feature Spec**: [spec.md](../spec.md)
- **Data Model**: [data-model.md](../data-model.md)
- **API Contract**: [contracts/server-time-api.md](../contracts/server-time-api.md)
- **Research**: [research.md](../research.md)
- **Coding Guidelines**: [docs/coding-guidelines.md](../../../docs/coding-guidelines.md)
- **Testing Guidelines**: [docs/testing-guidelines.md](../../../docs/testing-guidelines.md)

---

**Estimated Total Time**: 4-5 hours (including testing and verification)

**Priority**: P1 (Core feature - visual identification of overdue todos)
