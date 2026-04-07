# Implementation Plan: Personal Dashboard

## Overview

Implement a vanilla HTML/CSS/JS single-page dashboard in three files: `index.html`, `css/style.css`, and `js/app.js`. Build incrementally — Storage and pure logic functions first, then each UI component, then wire everything together.

## Tasks

- [x] 1. Project scaffold and HTML structure
  - Create `index.html` with the two-row layout: Row 1 (greeting + weekly calendar), Row 2 (timer + quick links)
  - Create `css/style.css` with base reset and grid/flex layout rules for both rows
  - Create `js/app.js` with an empty module skeleton (Storage, Greeting, WeeklyCalendar, DayColumn, TaskList, Timer, QuickLinks stubs)
  - _Requirements: 6.1, 6.4_

- [ ] 2. Storage module
  - [x] 2.1 Implement `storage.get(key, defaultValue)` and `storage.set(key, value)` with JSON serialization and try/catch error handling
    - Use keys `pd_tasks` and `pd_links`
    - Return `defaultValue` when key is absent, JSON is invalid, or `localStorage` is unavailable
    - _Requirements: 5.1, 5.3_

  - [ ]* 2.2 Write property test for storage round-trip (Property 8)
    - **Property 8: Task storage round-trip preserves data**
    - **Validates: Requirements 2.11, 5.1**
    - Use `fc.dictionary` of day keys mapped to task arrays; assert deep equality after `set`/`get`

  - [ ]* 2.3 Write property test for links storage round-trip (Property 13)
    - **Property 13: Quick Links storage round-trip preserves data**
    - **Validates: Requirements 4.7, 5.1**
    - Use `fc.array(linkArb)`; assert deep equality after `set`/`get`

- [ ] 3. Pure logic functions
  - [x] 3.1 Implement `formatTime(totalSeconds)` returning `MM:SS`, `formatGreetingTime(date)` returning `HH:MM`, `formatDate(date)` returning e.g. "Monday, July 14", and `getGreetingPhrase(hour)` with the three time-of-day ranges
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1_

  - [ ]* 3.2 Write property test for greeting time formatting (Property 1)
    - **Property 1: formatGreetingTime produces valid HH:MM output**
    - **Validates: Requirements 1.1, 3.1**
    - Use `fc.date()`; assert output matches `/^\d{2}:\d{2}$/` with values in range

  - [ ]* 3.3 Write property test for date formatting (Property 2)
    - **Property 2: formatDate includes day name and day number**
    - **Validates: Requirements 1.2**
    - Use `fc.date()`; assert output contains a valid English day-of-week name and correct numeric day-of-month

  - [ ]* 3.4 Write property test for greeting phrase classification (Property 3)
    - **Property 3: getGreetingPhrase covers all hours**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Use `fc.integer({min:0, max:23})`; assert correct phrase for each range

  - [x] 3.5 Implement `getWeekDays(today)` returning an array of 7 `Date` objects starting on Monday, and `toDayKey(date)` returning `"YYYY-MM-DD"`
    - _Requirements: 2.1_

  - [ ]* 3.6 Write property test for weekly calendar date calculation (Property 4)
    - **Property 4: getWeekDays always produces 7 consecutive days starting on Monday**
    - **Validates: Requirements 2.1**
    - Use `fc.date()`; assert length=7, first element is Monday, each subsequent day is +1, input date falls within range

  - [x] 3.7 Implement pure task CRUD functions: `addTask(tasks, text)`, `editTask(tasks, id, newText)`, `toggleTask(tasks, id)`, `deleteTask(tasks, id)`, and `uid()`
    - Validate non-empty/non-whitespace on add and edit; return original array unchanged on rejection
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 2.10_

  - [ ]* 3.8 Write property test for addTask grows list (Property 5)
    - **Property 5: Adding a valid task grows the task list by exactly one**
    - **Validates: Requirements 2.4**
    - Use `fc.array(taskArb)` and `fc.string().filter(s => s.trim().length > 0)`; assert length+1 and new task present

  - [ ]* 3.9 Write property test for whitespace task rejection (Property 6)
    - **Property 6: Whitespace-only task input is rejected**
    - **Validates: Requirements 2.5**
    - Use `fc.array(taskArb)` and `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))`; assert array unchanged

  - [ ]* 3.10 Write property test for editTask updates only target (Property 7)
    - **Property 7: Editing a task updates only the target task**
    - **Validates: Requirements 2.7**
    - Use `fc.array(taskArb, {minLength:1})` and valid text; assert same length and only target task changed

  - [x] 3.11 Implement `isValidUrl(str)` using `new URL()` try/catch, and pure link CRUD: `addLink(links, label, url)` and `deleteLink(links, id)`
    - Validate non-empty label and parseable URL on add; return original array unchanged on rejection
    - _Requirements: 4.4, 4.5, 4.6, 4.8_

  - [ ]* 3.12 Write property test for addLink grows list (Property 11)
    - **Property 11: Adding a valid link grows the link list by exactly one**
    - **Validates: Requirements 4.5**
    - Use `fc.array(linkArb)` and valid label+URL pair; assert length+1 and new link present

  - [ ]* 3.13 Write property test for invalid link rejection (Property 12)
    - **Property 12: Invalid link input is rejected**
    - **Validates: Requirements 4.8**
    - Use `fc.array(linkArb)` and empty/whitespace label or unparseable URL; assert array unchanged

- [x] 4. Checkpoint — ensure all pure logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Greeting component
  - [x] 5.1 Implement `greeting.init(containerEl)` and `greeting.update()` — render time (HH:MM), date string, and greeting phrase; wire `setInterval` at 60 000 ms
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 5.2 Write unit tests for Greeting
    - Test that `init` renders the correct DOM structure
    - Test that `update` patches time, date, and phrase text nodes correctly for a mocked date
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 6. TaskList and DayColumn components
  - [x] 6.1 Implement `taskList.create(tasks, onTasksChange)` — render task items with checkbox, edit control, and delete control; wire add-task form with empty-input rejection and inline error
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 6.2 Implement `dayColumn.create(date, tasks, onTasksChange)` — render day header (day name + date number) and embed the TaskList element
    - _Requirements: 2.1, 2.2_

  - [ ]* 6.3 Write unit tests for TaskList
    - Test add with valid text appends item to DOM
    - Test add with empty/whitespace shows error and does not append
    - Test delete removes item from DOM
    - Test checkbox toggles completed visual state
    - Test edit updates displayed text
    - _Requirements: 2.3, 2.4, 2.5, 2.7, 2.8, 2.9, 2.10_

- [ ] 7. WeeklyCalendar component
  - [x] 7.1 Implement `weeklyCalendar.init(containerEl, tasksStore)` — call `getWeekDays`, create 7 DayColumns, wire `onTasksChange` to write updated tasks back to Storage via `storage.set('pd_tasks', ...)`
    - _Requirements: 2.1, 2.2, 2.11_

  - [ ]* 7.2 Write unit tests for WeeklyCalendar
    - Test that exactly 7 day columns are rendered
    - Test that task changes trigger a Storage write
    - _Requirements: 2.1, 2.2, 2.11_

- [ ] 8. Timer component
  - [x] 8.1 Implement `timer.init(containerEl)` with internal state (`totalSeconds`, `intervalId`, `isRunning`), `start()`, `stop()`, `reset()`, and `tick()` — render MM:SS display and Start/Stop/Reset buttons; apply completion CSS class at 00:00
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 8.2 Write property test for timer reset (Property 9)
    - **Property 9: Timer reset always produces the initial state**
    - **Validates: Requirements 3.5**
    - Use `fc.integer({min:0, max:1500})` and `fc.boolean()` for arbitrary timer state; assert `totalSeconds === 1500` and `isRunning === false` after `reset()`

  - [ ]* 8.3 Write unit tests for Timer
    - Test initializes to "25:00"
    - Test start begins countdown and updates display
    - Test stop pauses at current time
    - Test reset restores "25:00" and stops interval
    - Test completion class applied at 00:00
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 9. QuickLinks component
  - [x] 9.1 Implement `quickLinks.init(containerEl, linksStore)` — render link buttons that open URLs in a new tab; wire add-link form with label/URL validation and inline error; wire delete controls; pre-seed defaults when `linksStore` is empty; write to Storage on every change
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 9.2 Write property test for all links rendered (Property 10)
    - **Property 10: All links in the store are rendered**
    - **Validates: Requirements 4.2**
    - Use `fc.array(linkArb)`; assert rendered DOM contains exactly one button/anchor per link, each displaying the link's label

  - [ ]* 9.3 Write unit tests for QuickLinks
    - Test pre-seeds Google, YouTube, Spotify when storage is empty
    - Test add valid link appends button to DOM and writes to Storage
    - Test add with empty label shows error and does not append
    - Test add with invalid URL shows error and does not append
    - Test delete removes button from DOM and writes to Storage
    - Test clicking a link calls `window.open` with `_blank`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 10. Checkpoint — ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. App entry point and wiring
  - [x] 11.1 Implement the `DOMContentLoaded` bootstrap in `app.js` — read `pd_tasks` and `pd_links` from Storage, then call `greeting.init`, `weeklyCalendar.init`, `timer.init`, and `quickLinks.init` with the correct container elements and data
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 11.2 Write unit tests for app bootstrap
    - Test that Storage is read on load and each component init is called with the persisted data
    - Test that corrupted Storage falls back to defaults without throwing
    - _Requirements: 5.2, 5.3_

- [ ] 12. Styling
  - [x] 12.1 Style Row 1 (full-width greeting left + calendar right) and Row 2 (timer left column + quick links right column) using CSS Grid/Flexbox; add completed-task strikethrough, timer completion highlight, and responsive layout
    - _Requirements: 2.9, 3.6, 6.2, 6.3, 6.4_

- [x] 13. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use [fast-check](https://github.com/dubzzz/fast-check); tag each test with `// Feature: personal-dashboard, Property N: <property text>`
- Each task references specific requirements for traceability
- All state mutations go through pure functions first, then Storage write, then DOM re-render
