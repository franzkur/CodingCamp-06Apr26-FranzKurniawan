# Requirements Document

## Introduction

A personal dashboard web app built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser with no backend, using Local Storage for persistence. The dashboard is laid out in two rows: the top row spans the full width and contains a greeting with the current time and date alongside a weekly calendar where each day has its own to-do list. The bottom row is split into two columns — a fixed 25-minute focus timer on the left and a quick links panel on the right.

## Glossary

- **Dashboard**: The single-page web application rendered in the browser.
- **Greeting**: The component that displays the current time, date, and a time-of-day message.
- **Weekly_Calendar**: The component that displays all 7 days of the current week, each with its own Day_Task_List.
- **Day_Task_List**: The per-day to-do list component associated with a single day in the Weekly_Calendar.
- **Task**: A single to-do item managed within a Day_Task_List.
- **Timer**: The fixed 25-minute focus countdown timer component.
- **Quick_Links**: The component that stores and displays shortcut buttons to external URLs.
- **Storage**: The browser's Local Storage API used for all client-side persistence.

---

## Requirements

### Requirement 1: Greeting Display

**User Story:** As a user, I want to see the current time, date, and a time-appropriate greeting when I open the dashboard, so that I have immediate context about the current moment.

#### Acceptance Criteria

1. THE Greeting SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting SHALL display the current date including the day of the week, month, and day number.
3. WHEN the local time is between 05:00 and 11:59, THE Greeting SHALL display "Good morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting SHALL display "Good afternoon".
5. WHEN the local time is between 18:00 and 04:59, THE Greeting SHALL display "Good evening".

---

### Requirement 2: Weekly Calendar with Per-Day To-Do Lists

**User Story:** As a user, I want to see all 7 days of the current week and manage a separate to-do list for each day, so that I can plan and track tasks day by day.

#### Acceptance Criteria

1. THE Weekly_Calendar SHALL display all 7 days of the current week, labeled with the day name and date number.
2. THE Weekly_Calendar SHALL render one Day_Task_List for each of the 7 days.
3. THE Day_Task_List SHALL provide an input field and a submit control for adding new Tasks to that day.
4. WHEN the user submits a new Task, THE Day_Task_List SHALL add the Task to the list and display it immediately.
5. IF the user submits an empty Task, THEN THE Day_Task_List SHALL reject the input and not add a Task to the list.
6. THE Day_Task_List SHALL provide an edit control for each Task that allows the user to modify the Task's text.
7. WHEN the user saves an edit, THE Day_Task_List SHALL update the displayed Task text immediately.
8. THE Day_Task_List SHALL provide a checkbox control for each Task that toggles the Task between complete and incomplete states.
9. WHEN a Task is marked complete, THE Day_Task_List SHALL apply a visual distinction to differentiate it from incomplete Tasks.
10. THE Day_Task_List SHALL provide a delete control for each Task that removes the Task from the list.
11. WHEN a Day_Task_List is modified, THE Storage SHALL persist the updated Task data for that day so it is restored on subsequent page loads.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer so that I can track focused work sessions.

#### Acceptance Criteria

1. THE Timer SHALL display the remaining time in MM:SS format.
2. THE Timer SHALL default to a duration of 25 minutes.
3. WHEN the user activates the start control, THE Timer SHALL begin counting down from the current displayed time.
4. WHEN the user activates the stop control, THE Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user activates the reset control, THE Timer SHALL restore the countdown to 25 minutes and stop counting.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and provide a visual signal to the user.
7. WHILE the Timer is counting down, THE Timer SHALL update the displayed time every second.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and access shortcut buttons to my favorite websites so that I can navigate to them quickly.

#### Acceptance Criteria

1. THE Quick_Links SHALL pre-seed the link list with entries for Google, YouTube, and Spotify on first load when no saved data exists in Storage.
2. THE Quick_Links SHALL display each saved link as a labeled button or anchor that opens the target URL.
3. WHEN the user activates a Quick Link, THE Quick_Links SHALL open the target URL in a new browser tab.
4. THE Quick_Links SHALL provide a form that allows the user to add a new link by entering a label and a URL.
5. WHEN the user submits a new link, THE Quick_Links SHALL add the link to the display immediately.
6. THE Quick_Links SHALL provide a delete control for each link that removes it from the list.
7. WHEN the Quick Links list is modified, THE Storage SHALL persist the updated list so it is restored on subsequent page loads.
8. IF the user submits a link with an empty label or an invalid URL, THEN THE Quick_Links SHALL reject the input and display an error message.

---

### Requirement 5: Data Persistence

**User Story:** As a user, I want my data to be saved automatically so that I do not lose my tasks or links when I close or refresh the browser.

#### Acceptance Criteria

1. THE Storage SHALL persist all Day_Task_List data and Quick Links data using the browser Local Storage API.
2. WHEN the Dashboard loads, THE Dashboard SHALL read all persisted data from Storage and restore the UI to the previously saved state.
3. IF Storage is unavailable or returns a parse error, THEN THE Dashboard SHALL fall back to default values and continue operating normally.

---

### Requirement 6: Browser Compatibility and File Structure

**User Story:** As a developer, I want the codebase to follow a clean structure and run in all modern browsers so that the app is easy to maintain and widely accessible.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file, one CSS file located in `css/`, and one JavaScript file located in `js/`.
2. THE Dashboard SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari without requiring any build tools or server.
3. THE Dashboard SHALL load and render all components within 2 seconds on a standard broadband connection.
4. WHILE the Dashboard is rendering, THE Dashboard SHALL not display unstyled or partially rendered content to the user.
