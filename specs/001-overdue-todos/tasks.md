# Tasks: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`  
**Input**: Design documents from `/specs/001-overdue-todos/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-time-api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo web application with:
- Backend: `packages/backend/src/`
- Frontend: `packages/frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No additional project setup needed - using existing monorepo structure

*No tasks required - project structure already exists*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for overdue feature - server time endpoint and date utilities

**⚠️ CRITICAL**: These foundational tasks must be complete before any user story implementation

- [X] T001 Add server time endpoint GET /api/server-time in packages/backend/src/app.js
- [X] T002 [P] Write backend tests for server time endpoint in packages/backend/__tests__/app.test.js
- [X] T003 [P] Create date utility module with isDateInPast function in packages/frontend/src/utils/dateUtils.js
- [X] T004 [P] Write unit tests for date utilities in packages/frontend/src/utils/__tests__/dateUtils.test.js
- [X] T005 Add getServerTime method to todo service in packages/frontend/src/services/todoService.js
- [X] T006 Write service tests for getServerTime in packages/frontend/src/services/__tests__/todoService.test.js
- [X] T007 Create useCurrentTime custom hook with 60-second polling in packages/frontend/src/hooks/useCurrentTime.js
- [X] T008 Write hook tests for useCurrentTime in packages/frontend/src/hooks/__tests__/useCurrentTime.test.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visual Identification of Overdue Todos (Priority: P1) 🎯 MVP

**Goal**: Users can immediately identify overdue todos through visual indicators (color, icon, text) without manual date checking

**Independent Test**: Create a todo with a past due date and verify it displays with distinct visual styling (red/orange border, warning icon, "Overdue" text) that differentiates it from non-overdue todos

### Implementation for User Story 1

- [X] T009 [P] [US1] Update TodoCard component to accept currentTime prop and calculate overdue status in packages/frontend/src/components/TodoCard.js
- [X] T010 [P] [US1] Add overdue visual indicator (icon + text + styling) to TodoCard in packages/frontend/src/components/TodoCard.js
- [X] T011 [P] [US1] Write TodoCard tests for overdue rendering in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T012 [US1] Update TodoList component to pass currentTime to each TodoCard in packages/frontend/src/components/TodoList.js
- [X] T013 [US1] Update App component to use useCurrentTime hook and pass to TodoList in packages/frontend/src/App.js
- [X] T014 [P] [US1] Add overdue CSS styles for light and dark modes in packages/frontend/src/styles/theme.css

**Checkpoint**: User Story 1 complete - overdue todos are visually distinguishable with color, icon, and text

---

## Phase 4: User Story 2 - Overdue Status for Today's Due Date (Priority: P2)

**Goal**: Users understand that todos due today are treated as current (not overdue) until end of day, with automatic status update at midnight

**Independent Test**: Create todos with due dates set to today and verify they do NOT show overdue indicators. Wait for day transition and verify previously current todos now show as overdue

### Implementation for User Story 2

- [X] T015 [US2] Verify day-level date comparison in isDateInPast treats today as not overdue in packages/frontend/src/utils/__tests__/dateUtils.test.js
- [X] T016 [US2] Add edge case tests for midnight transitions and same-day due dates in packages/frontend/src/components/__tests__/TodoCard.test.js
- [X] T017 [US2] Verify polling mechanism detects midnight transitions in packages/frontend/src/hooks/__tests__/useCurrentTime.test.js

**Checkpoint**: User Story 2 complete - "due today" behavior is clear and consistent, automatic updates work at midnight

---

## Phase 5: User Story 3 - Overdue Count or Summary (Priority: P3)

**Goal**: Users can see at a glance how many todos are overdue without scanning the entire list

**Independent Test**: Create multiple overdue todos and verify that a count/summary appears showing total number. Complete one overdue todo and verify count decrements

### Implementation for User Story 3

- [X] T018 [P] [US3] Add overdue count calculation logic to TodoList component in packages/frontend/src/components/TodoList.js
- [X] T019 [P] [US3] Create OverdueSummary component to display count in packages/frontend/src/components/OverdueSummary.js
- [X] T020 [US3] Conditionally render OverdueSummary only when count > 0 in packages/frontend/src/components/TodoList.js
- [X] T021 [P] [US3] Write tests for OverdueSummary component in packages/frontend/src/components/__tests__/OverdueSummary.test.js
- [X] T022 [P] [US3] Add CSS styles for overdue summary in packages/frontend/src/styles/theme.css

**Checkpoint**: User Story 3 complete - overdue count visible at top of list when overdue todos exist

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T023 Run full test suite and verify 80%+ coverage with npm test -- --coverage
- [X] T024 [P] Manual accessibility testing with keyboard navigation and screen reader
- [X] T025 [P] Test overdue indicators in both light and dark themes
- [X] T026 [P] Verify performance for 100 todos is under 200ms render time
- [X] T027 Test all quickstart.md scenarios manually
- [X] T028 [P] Update any documentation as needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: None - skipped (project exists)
- **Foundational (Phase 2)**: No dependencies - can start immediately, BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - MVP priority
  - User Story 2 (P2): Can start after Foundational - Independent of US1
  - User Story 3 (P3): Depends on US1 (needs overdue status calculation in place)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends only on Foundational phase - No dependencies on other stories
- **User Story 2 (P2)**: Depends only on Foundational phase - Validates edge cases of US1 but independently testable
- **User Story 3 (P3)**: Depends on US1 completion (needs overdue calculation logic) - Adds summary display

### Within Foundational Phase (Phase 2)

**Sequential order**:
1. T001: Add server time endpoint (blocks T002)
2. T002-T004: Backend tests, date utils, date tests (all parallel after T001)
3. T005: Add getServerTime (depends on T001)
4. T006: Test getServerTime (depends on T005)
5. T007: Create useCurrentTime hook (depends on T005)
6. T008: Test useCurrentTime (depends on T007)

### Within User Story 1 (Phase 3)

**Parallel opportunities**:
- T009, T010, T011 can all be done in parallel (different aspects of TodoCard)
- T014 can be done in parallel with T009-T011
- T012 depends on T009 completion
- T013 depends on T012 completion

### Within User Story 2 (Phase 4)

**All parallel**: T015, T016, T017 add tests to existing test files (different files, no conflicts)

### Within User Story 3 (Phase 5)

**Parallel opportunities**:
- T018, T019, T021, T022 can all be done in parallel (different files)
- T020 depends on T018 and T019 completion

---

## Parallel Opportunities Summary

### Foundational Phase (after T001 completes)
```bash
# Can run in parallel:
T002: Backend tests for server time endpoint
T003: Create date utility module
T004: Date utility unit tests
```

```bash
# Can run in parallel (after T005 completes):
T006: Test getServerTime
T007: Create useCurrentTime hook (technically depends on T005)
```

### User Story 1
```bash
# Can run in parallel:
T009: Update TodoCard to calculate overdue status
T010: Add overdue visual indicator to TodoCard
T011: Write TodoCard overdue tests
T014: Add overdue CSS styles
```

### User Story 2
```bash
# Can run in parallel (all are test additions):
T015: Test today's date edge case
T016: Test midnight transitions
T017: Test polling mechanism
```

### User Story 3
```bash
# Can run in parallel:
T018: Add count calculation logic
T019: Create OverdueSummary component
T021: Write OverdueSummary tests
T022: Add summary CSS styles
```

### Polish Phase
```bash
# Can run in parallel:
T024: Accessibility testing
T025: Theme testing
T026: Performance testing
T028: Documentation updates
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T008) - **~2 hours**
   - Backend endpoint and tests
   - Frontend utilities and polling
2. Complete Phase 3: User Story 1 (T009-T014) - **~1.5 hours**
   - Visual indicators for overdue todos
3. **STOP and VALIDATE**: Test US1 independently
   - Create overdue, current, future todos
   - Verify visual indicators
   - Test light/dark modes
4. Deploy/demo MVP if ready

**Estimated MVP Time**: 3.5-4 hours

### Incremental Delivery

1. **Foundation + US1** → MVP with visual indicators (P1)
2. **+ US2** → Edge case handling refined (P2)
3. **+ US3** → Overdue count summary added (P3)
4. **+ Polish** → Production-ready

Each addition is independently testable without breaking previous functionality.

### Parallel Team Strategy

With multiple developers (after Foundational phase completes):
- **Developer A**: User Story 1 (T009-T014) - Core feature
- **Developer B**: User Story 2 (T015-T017) - Edge cases
- Developer B can then work on User Story 3 (depends on US1)

---

## Task Count Summary

- **Foundational**: 8 tasks (blocking)
- **User Story 1** (P1 - MVP): 6 tasks
- **User Story 2** (P2): 3 tasks
- **User Story 3** (P3): 5 tasks
- **Polish**: 6 tasks
- **Total**: 28 tasks

---

## Validation Checkpoints

### After Foundational Phase
- [ ] Backend endpoint returns server time in ISO format
- [ ] Date utilities correctly identify past, present, future dates
- [ ] Polling hook fetches and updates time every 60 seconds
- [ ] All foundational tests pass with coverage

### After User Story 1 (MVP)
- [ ] Overdue todos display red/orange border
- [ ] Warning icon (⚠️) appears on overdue todos
- [ ] "Overdue" text label appears
- [ ] Completed overdue todos do NOT show indicator
- [ ] Future/current todos do NOT show indicator
- [ ] Works in both light and dark themes
- [ ] All US1 tests pass

### After User Story 2
- [ ] Todos due today are NOT marked overdue
- [ ] Midnight transition automatically updates status
- [ ] Edge case tests all pass

### After User Story 3
- [ ] Overdue count displays when > 0 overdue todos exist
- [ ] Count is hidden when no overdue todos
- [ ] Count updates when completing overdue todo
- [ ] All US3 tests pass

### Final Validation
- [ ] All 28 tasks complete
- [ ] Test coverage ≥ 80%
- [ ] Performance < 200ms for 100 todos
- [ ] Accessibility requirements met (WCAG AA)
- [ ] All quickstart.md scenarios verified
- [ ] No console errors or warnings

---

## Notes

- **[P] tasks** = Different files, can run in parallel
- **[Story] labels** = Map task to specific user story (US1, US2, US3)
- **MVP scope** = Foundational + User Story 1 (14 tasks, ~4 hours)
- **Estimated full feature time**: 7-8 hours including testing and polish
- **Test-first recommended**: Write tests before implementation for cleaner code
- **Commit strategy**: Commit after each task or logical group for easy rollback

