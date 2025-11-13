# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: November 13, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add visual indicators for overdue todos to help users quickly identify incomplete tasks past their due date. The feature will use color changes and icons to distinguish overdue items, with real-time status updates via polling mechanism. Implementation will extend existing TodoCard component and add date comparison logic using server time as authoritative source.

## Technical Context

**Language/Version**: JavaScript (Node.js v16+, React 18)  
**Primary Dependencies**: React 18.2.0, Express.js 4.18.2, Axios 1.6.2, better-sqlite3 11.10.0  
**Storage**: SQLite database (via better-sqlite3)  
**Testing**: Jest 29.7.0 with React Testing Library, Supertest for backend  
**Target Platform**: Web application (desktop-focused, responsive design)  
**Project Type**: Web (monorepo with frontend/backend)  
**Performance Goals**: <200ms render time for overdue status calculation (up to 100 todos)  
**Constraints**: 80%+ test coverage, WCAG AA accessibility, light/dark mode support  
**Scale/Scope**: Single-user todo app, expected ~100 todos max per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Code Quality & Maintainability
✅ **PASS** - Feature will follow DRY, KISS, and Single Responsibility principles:
- Date comparison logic extracted to utility function
- Visual indicator logic contained in TodoCard component
- Polling mechanism isolated in dedicated hook or service

### Principle II: Test-First Development
✅ **PASS** - Test coverage plan:
- Unit tests for date comparison utility (edge cases: past, today, future, no date)
- Unit tests for TodoCard overdue rendering
- Integration tests for polling mechanism
- Target: 80%+ coverage for new code

### Principle III: SOLID Principles
✅ **PASS** - Design adheres to SOLID:
- TodoCard maintains single responsibility (display)
- Date utility is open for extension (different comparison strategies)
- Minimal prop additions to TodoCard (no interface pollution)

### Principle IV: Error Handling & User Feedback
✅ **PASS** - Error handling planned:
- Graceful fallback if server time unavailable (use client time with warning)
- Try-catch around polling mechanism
- User feedback for date-related operations

### Principle V: Simplicity & Focus
✅ **PASS** - Feature scope is minimal:
- No sorting/filtering by overdue status
- No notifications or advanced actions
- Focus on visual indicators only (P1 requirement)

### Principle VI: Design Consistency & Accessibility
✅ **PASS** - Design compliance:
- Color + icon for accessibility (color-blind friendly)
- WCAG AA contrast requirements
- Light/dark mode support using existing theme system
- Halloween theme colors (orange/purple accent)

### Principle VII: Documentation & Code Clarity
✅ **PASS** - Documentation plan:
- JSDoc for date comparison utility
- Comments explaining "why" for polling frequency choice
- Updated component documentation

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── todoService.js          # Add server time endpoint
│   │   └── app.js                       # Add /api/server-time route
│   └── __tests__/
│       └── app.test.js                  # Add server time endpoint tests
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TodoCard.js              # Add overdue visual indicators
    │   │   └── __tests__/
    │   │       └── TodoCard.test.js     # Add overdue rendering tests
    │   ├── services/
    │   │   └── todoService.js           # Add getServerTime method
    │   ├── utils/
    │   │   ├── dateUtils.js             # NEW: Date comparison utilities
    │   │   └── __tests__/
    │   │       └── dateUtils.test.js    # NEW: Date utility tests
    │   ├── hooks/
    │   │   ├── useCurrentTime.js        # NEW: Polling hook for time updates
    │   │   └── __tests__/
    │   │       └── useCurrentTime.test.js # NEW: Hook tests
    │   └── App.js                        # Pass current time to TodoList
    └── public/
        └── index.html                    # No changes needed
```

**Structure Decision**: Web application structure (Option 2) with frontend/backend separation. The feature requires changes to both layers:
- **Backend**: Add server time endpoint to provide authoritative time source
- **Frontend**: Add date utilities, polling mechanism, and visual indicators to TodoCard

## Complexity Tracking

No constitution violations. All principles adhered to in the design.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion*

### Principle I: Code Quality & Maintainability
✅ **PASS** - Design maintains quality principles:
- Date comparison logic isolated in `dateUtils.js` (DRY)
- Polling mechanism encapsulated in `useCurrentTime` hook (Single Responsibility)
- Simple, straightforward implementation (KISS)

### Principle II: Test-First Development
✅ **PASS** - Comprehensive test coverage designed:
- Unit tests: dateUtils (6 tests), TodoCard overdue rendering (5 tests)
- Integration tests: useCurrentTime hook (4 tests), server time endpoint (3 tests)
- Estimated coverage: 85%+ for new code

### Principle III: SOLID Principles
✅ **PASS** - Design follows SOLID:
- Each component/utility has single responsibility
- Props interface minimal (only `currentTime` added to existing TodoCard)
- Hook design allows extension without modification

### Principle IV: Error Handling & User Feedback
✅ **PASS** - Error handling comprehensive:
- `getServerTime` has try-catch with fallback to client time
- `isDateInPast` handles invalid inputs defensively
- `useCurrentTime` hook catches polling errors

### Principle V: Simplicity & Focus
✅ **PASS** - Implementation remains simple:
- No complex state management introduced
- Simple prop drilling (App → TodoList → TodoCard)
- Minimal API surface (1 endpoint)

### Principle VI: Design Consistency & Accessibility
✅ **PASS** - Design meets accessibility requirements:
- Color + icon + text label for overdue indicator
- Proper ARIA roles and labels specified
- Light/dark mode support via existing theme system

### Principle VII: Documentation & Code Clarity
✅ **PASS** - Documentation complete:
- JSDoc comments planned for all utilities
- research.md explains all design decisions
- quickstart.md provides step-by-step implementation guide

**Final Verdict**: ✅ All constitution principles satisfied. Design is ready for implementation.
