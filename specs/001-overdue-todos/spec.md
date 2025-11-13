# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`  
**Created**: November 13, 2025  
**Status**: Draft  
**Input**: User description: "Support for Overdue Todo Items - Users need a clear, visual way to identify which todos have not been completed by their due date."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Identification of Overdue Todos (Priority: P1)

Users can immediately identify overdue todos in their list through visual indicators without having to manually check dates or perform mental calculations.

**Why this priority**: This is the core value proposition of the feature - enabling users to quickly spot overdue tasks is the primary need. Without this, users must manually compare each due date to today's date, which is time-consuming and error-prone.

**Independent Test**: Can be fully tested by creating a todo with a past due date and verifying that it displays with distinct visual styling (color, icon, or label) that differentiates it from non-overdue todos. Delivers immediate value by reducing cognitive load.

**Acceptance Scenarios**:

1. **Given** a todo with a due date in the past and incomplete status, **When** the user views the todo list, **Then** the overdue todo is visually distinguished from other todos with clear visual indicators
2. **Given** multiple todos with varying due dates (past, today, future), **When** the user views the list, **Then** only incomplete todos with past due dates display overdue visual indicators
3. **Given** a todo that was overdue but is now marked complete, **When** the user views the list, **Then** the completed todo does not display overdue indicators

---

### User Story 2 - Overdue Status for Today's Due Date (Priority: P2)

Users understand whether todos due today should be treated as overdue or current, with clear handling of same-day due dates.

**Why this priority**: This clarifies an important edge case but doesn't block the core functionality. Users need consistent behavior for "due today" scenarios.

**Independent Test**: Create todos with due dates set to today's date at various times of day and verify consistent overdue status determination. Delivers clear expectations for same-day deadlines.

**Acceptance Scenarios**:

1. **Given** a todo with a due date matching today's date and incomplete status, **When** the user views the list, **Then** the todo is treated as current (not overdue) until the end of the day
2. **Given** the system time transitions to a new day, **When** the user views the list, **Then** previously current todos with yesterday's due date now display as overdue

---

### User Story 3 - Overdue Count or Summary (Priority: P3)

Users can see at a glance how many todos are overdue without scanning the entire list, especially useful for long todo lists.

**Why this priority**: This is a nice-to-have enhancement that improves usability for users with many todos but isn't essential for the core value proposition.

**Independent Test**: Create multiple overdue todos and verify that a count or summary appears showing the total number of overdue items. Delivers quick awareness of workload backlog.

**Acceptance Scenarios**:

1. **Given** multiple incomplete todos with past due dates, **When** the user views the list, **Then** a count or summary displays the total number of overdue items
2. **Given** no overdue todos exist, **When** the user views the list, **Then** the overdue count is not displayed (conditional visibility)
3. **Given** the user completes an overdue todo, **When** the list refreshes, **Then** the overdue count decrements by one (or disappears if it was the last overdue item)

---

### Edge Cases

- What happens when a todo has no due date set? (It should not be treated as overdue)
- How does the system handle todos with due dates in the past that get completed today? (They should no longer show overdue indicators)
- What happens at midnight when today's date changes? (Previously current todos should become overdue if incomplete; handled via polling mechanism checking every minute)
- How are overdue todos displayed when the user's system clock is incorrect? (Use server time as source of truth)
- What happens when a user changes a todo's due date from past to future? (Overdue indicator should disappear immediately)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST visually distinguish incomplete todos with due dates in the past from other todos in the list
- **FR-002**: System MUST apply overdue visual indicators only to todos that are both incomplete and have a due date in the past
- **FR-003**: System MUST remove overdue visual indicators when an overdue todo is marked complete
- **FR-004**: System MUST remove overdue visual indicators when a todo's due date is changed to today or a future date
- **FR-005**: System MUST treat todos with due dates matching today's date as current (not overdue)
- **FR-006**: System MUST treat todos without a due date as never overdue
- **FR-007**: System MUST use consistent date comparison logic (comparing dates at day-level, not time-of-day)
- **FR-008**: System MUST update overdue status dynamically through a polling mechanism that checks every minute to detect day transitions and other date changes
- **FR-009**: System MUST use server time as the authoritative source for determining current date when calculating overdue status

### Visual Design Requirements

- **FR-010**: Overdue visual indicators MUST include both a color change and an icon (e.g., warning icon or clock icon) to ensure accessibility for color-blind users
- **FR-011**: Overdue visual styling MUST maintain readability and not obscure todo content
- **FR-012**: Overdue indicators MUST be consistent with the application's existing design system (light/dark mode support, color palette, Halloween theme)
- **FR-013**: The overdue icon MUST be positioned consistently relative to the todo item and be clearly associated with the overdue todo

### Key Entities

- **Todo Item**: Represents a task with attributes including title, due date (optional), completion status, and creation date. The overdue state is a derived property based on comparing due date to current date when the todo is incomplete.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify overdue todos within 2 seconds of viewing their todo list without manual date comparison
- **SC-002**: 100% of incomplete todos with past due dates display overdue visual indicators
- **SC-003**: 0% of completed todos or todos without due dates display overdue indicators (no false positives)
- **SC-004**: Overdue status updates automatically when a todo's completion status or due date changes, visible immediately without page refresh
- **SC-005**: Users can distinguish overdue todos from current todos in both light and dark theme modes
- **SC-006**: Overdue status calculation and display completes in under 200ms for todo lists of up to 100 items

## Clarifications

### Session 2025-11-13

- Q: What specific visual indicator(s) should be used for overdue todos? → A: Color change + icon (e.g., warning icon or clock icon)
- Q: For date comparison to determine overdue status, should the system use server time or client time as the authoritative source? → A: Server time (authoritative, consistent across all users)
- Q: How should the system handle automatic overdue status updates at midnight (day transition)? → A: Real-time update with WebSocket/polling timer checking every minute
- Q: Should the overdue count/summary (User Story 3 - P3) be displayed persistently or only conditionally? → A: Only displayed when one or more overdue todos exist
- Q: What is the acceptable performance threshold for calculating and displaying overdue status, especially for users with large todo lists? → A: Under 200ms render time

## Assumptions *(optional)*

- The application already has a concept of "due date" for todos
- The system has access to current date/time information
- Users want overdue items to be visually prominent (not hidden or de-emphasized)
- The application uses date-level comparison (not time-of-day specific, e.g., 11:59 PM cutoff)
- Server time is the authoritative source for "today's date" to handle timezone and clock discrepancies (confirmed in clarifications)
- The existing design system includes colors appropriate for warning/alert states (consistent with Halloween theme: oranges, purples)

## Dependencies *(optional)*

- Existing todo list display functionality
- Existing due date field and date handling logic
- Access to current date/time (system or server time)
- Existing theme system (light/dark mode toggle)

## Out of Scope

- Sorting or filtering todos by overdue status
- Notifications or reminders about overdue todos
- Automatic actions on overdue todos (e.g., auto-delete, auto-archive)
- Customization of overdue visual indicators by users
- Grouping overdue todos into a separate section
- Showing "how many days overdue" a todo is
- Priority levels or urgency indicators beyond overdue status
