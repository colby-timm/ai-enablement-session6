<!--
  =============================================================================
  SYNC IMPACT REPORT - Constitution Update
  =============================================================================
  Version Change: NONE → 1.0.0
  Modified Principles: All principles newly created
  Added Sections: All sections newly created from project guidelines
  Removed Sections: None
  
  Templates Status:
  ✅ plan-template.md - Reviewed and aligned with Constitution Check requirements
  ✅ spec-template.md - Reviewed and aligned with user story priorities and requirements
  ✅ tasks-template.md - Reviewed and aligned with test-first and quality principles
  
  Follow-up TODOs: None - all placeholders filled
  
  Rationale: Initial constitution creation (v1.0.0) based on existing project 
  guidelines in docs/ folder. Principles extracted from coding-guidelines.md, 
  testing-guidelines.md, functional-requirements.md, and ui-guidelines.md.
  =============================================================================
-->

# Todo App Constitution

## Core Principles

### I. Code Quality & Maintainability

All code MUST adhere to established quality principles to ensure long-term maintainability:

- **DRY (Don't Repeat Yourself)**: Extract common code into shared functions or utilities. No duplication allowed across modules.
- **KISS (Keep It Simple)**: Prefer simple, straightforward implementations. Complexity must be justified.
- **Single Responsibility**: Each module, component, or function MUST have one clear purpose.
- **Naming Clarity**: Use descriptive names (camelCase for variables/functions, PascalCase for components/classes, UPPER_SNAKE_CASE for constants).
- **Code Organization**: Follow consistent import order (external libraries, internal modules, styles). Maintain logical file structure.

**Rationale**: These principles prevent technical debt accumulation and ensure code remains readable and maintainable as the project grows.

### II. Test-First Development (NON-NEGOTIABLE)

Testing is mandatory and MUST follow test-driven practices:

- **80%+ Coverage Target**: Minimum 80% code coverage across all packages. Critical paths require 100% coverage.
- **Test Organization**: Tests colocated with source files in `__tests__/` directories. Use descriptive test names following Arrange-Act-Assert pattern.
- **Test Behavior Not Implementation**: Focus on what code does, not how. Tests should survive refactoring.
- **Test Independence**: Each test MUST be independent. Mock external dependencies. No shared state.
- **Test Types Required**:
  - Unit tests for all components, functions, and modules
  - Integration tests for component interactions and API communication
  - End-to-end tests out of scope for initial development

**Rationale**: Comprehensive testing ensures reliability, documents behavior, and enables confident refactoring.

### III. SOLID Principles

Object-oriented design MUST follow SOLID principles:

- **Single Responsibility Principle**: A module/component has one reason to change.
- **Open/Closed Principle**: Open for extension via props/composition, closed for modification.
- **Liskov Substitution Principle**: Subtypes must be substitutable for parent types.
- **Interface Segregation Principle**: Minimal, focused prop lists. No unnecessary dependencies.
- **Dependency Inversion Principle**: Depend on abstractions. Inject dependencies via props or context.

**Rationale**: SOLID principles create flexible, maintainable architectures that resist brittleness.

### IV. Error Handling & User Feedback

All operations that can fail MUST handle errors gracefully:

- **Try-Catch Required**: Wrap all async operations and operations that can fail.
- **Meaningful Error Messages**: Provide clear, actionable error messages to users.
- **User Feedback**: Inform users of success and failure states.
- **Logging**: Log errors for debugging (console.error for development).

**Rationale**: Graceful error handling prevents crashes and improves user experience.

### V. Simplicity & Focus

Features MUST remain simple and focused on core functionality:

- **No Premature Features**: YAGNI (You Aren't Gonna Need It). Only implement requested features.
- **Core Features Only**: Focus on essential todo management (create, read, update, delete, status toggle).
- **Out of Scope Enforcement**: No advanced features (search, filtering, categories, bulk operations, undo/redo) unless explicitly specified.
- **Simple UI**: Clean, minimal interface. Desktop-focused. No mobile optimization required unless specified.

**Rationale**: Simplicity reduces complexity, development time, and maintenance burden. Focus delivers value faster.

### VI. Design Consistency & Accessibility

UI implementation MUST follow established design guidelines:

- **Design System Adherence**: Follow Material Design principles with Halloween theme as specified in ui-guidelines.md.
- **Color & Typography**: Use defined color palette (light/dark mode), typography scale, and 8px spacing grid.
- **Component Structure**: Follow specified component layouts (TodoCard, TodoForm, TodoList, ConfirmDialog).
- **Accessibility Required**: Keyboard accessibility, WCAG AA color contrast, proper ARIA labels, visible focus indicators.
- **Responsive Design**: Support mobile (<768px), tablet (768-1024px), and desktop (>1024px) breakpoints.

**Rationale**: Consistent design creates professional, polished UX. Accessibility ensures inclusivity.

### VII. Documentation & Code Clarity

Code MUST be self-documenting with strategic comments:

- **Comment Why Not What**: Only comment on non-obvious reasoning. Code should be self-explanatory.
- **JSDoc for Public APIs**: Document public functions and components with JSDoc.
- **Keep Comments Updated**: Outdated comments are worse than no comments. Delete stale comments.
- **Avoid Obvious Comments**: Do not state what the code clearly shows.

**Rationale**: Good documentation reduces cognitive load and helps future maintainers (including future you).

## Code Standards & Formatting

All code MUST adhere to consistent formatting standards:

- **Indentation**: 2 spaces for JavaScript, JSON, CSS, Markdown.
- **Line Length**: Max 100 characters for code readability.
- **Line Endings**: LF (Unix-style) only.
- **Trailing Whitespace**: Remove all trailing whitespace.
- **ESLint Compliance**: All code must pass ESLint checks. Fix all errors and warnings before committing.
- **Import Organization**: External libraries, internal modules, then styles. Separate groups with blank lines.

**File Organization Standards**:
- Frontend: `src/components/`, `src/services/`, `src/utils/`, `src/__tests__/`
- Backend: `src/routes/`, `src/controllers/`, `src/services/`, `src/middleware/`, `src/__tests__/`
- Tests colocated with source in `__tests__/` directories

## Development Workflow

### Git & Code Review Requirements

- **Atomic Commits**: Each commit represents one logical change with clear commit message explaining "why".
- **Feature Branches**: Use feature branches for new work (e.g., `feature/todo-editing`).
- **Pull Requests Required**: All changes must go through PR review before merging.
- **Pre-commit Checks**:
  - All tests pass
  - ESLint has no errors or warnings
  - Code follows naming conventions
  - Functions/components have single responsibility
  - Error handling is implemented
  - Documentation is updated
  - No console.log statements in production code

### Testing Workflow

- **Write Tests First**: Tests describe expected behavior before implementation (TDD encouraged).
- **Run Tests Locally**: Ensure all tests pass before committing.
- **Review Coverage**: Check coverage reports to identify gaps. Aim for 80%+ coverage.
- **Test Commands**:
  - `npm test` - Run all tests
  - `npm test -- --coverage` - Generate coverage report
  - `npm test -- --watch` - Watch mode for development

## Governance

This constitution supersedes all other development practices and guidelines. All code must comply with these principles.

### Amendment Process

- **Documentation Required**: All amendments must document rationale and impact.
- **Version Bump**: Follow semantic versioning (MAJOR.MINOR.PATCH):
  - MAJOR: Backward incompatible governance/principle changes
  - MINOR: New principle/section additions or material expansions
  - PATCH: Clarifications, wording fixes, non-semantic refinements
- **Migration Plan**: Breaking changes require migration plan and update to dependent artifacts.

### Compliance & Enforcement

- **All PRs Must Verify Compliance**: Code reviews must check adherence to constitution principles.
- **Complexity Justification Required**: Violations must be explicitly justified in plan.md Complexity Tracking section.
- **Runtime Guidance**: See docs/coding-guidelines.md, docs/testing-guidelines.md, docs/ui-guidelines.md, docs/functional-requirements.md for detailed implementation guidance.

### Related Documentation

- **Coding Guidelines**: docs/coding-guidelines.md - Detailed coding standards and best practices
- **Testing Guidelines**: docs/testing-guidelines.md - Comprehensive testing strategy
- **Functional Requirements**: docs/functional-requirements.md - Feature scope and requirements
- **UI Guidelines**: docs/ui-guidelines.md - Design system and component specifications
- **Project Overview**: docs/project-overview.md - Architecture and technology stack

**Version**: 1.0.0 | **Ratified**: 2025-11-13 | **Last Amended**: 2025-11-13
