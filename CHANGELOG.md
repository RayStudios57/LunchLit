📦 v0.2
✨ Added

Introduced a Today dashboard widget displaying upcoming classes and tasks for the logged-in user, ordered chronologically for quick at-a-glance planning.

Added import and export functionality for class schedules and tasks with support for .CSV and .JSON formats, including validation to prevent invalid or corrupted data.

Implemented Google Sign-In authentication with optional Google Calendar integration for syncing classes and tasks, with user-controlled sync settings.

Added a global theme customization system supporting multiple UI themes, including light and dark modes, with extensibility for future themes.

Added the ability for users to change their selected school at any time via settings.

Enabled school-managed meal schedules, allowing schools to upload and maintain meal data displayed dynamically to students.

Added grade level selection during onboarding, with options ranging from under 5th grade through senior year, stored in user profiles and editable from settings.

Introduced profile customization, allowing users to upload and update profile pictures across the app.

Added a discussion/community tab enabling user communication, designed with scalability in mind for future features such as school-based or class-based channels.

🧭 UI / UX Improvements

Improved overall usability with a focus on fast load times, compact layouts, and student-friendly workflows.

Ensured consistent application of themes and profile data across all views.

🧱 Architecture

Refactored components to be modular and reusable.

Designed all new systems to scale across multiple schools and a growing user base.

Built integrations with future extensibility in mind (e.g., additional calendar providers).
-------------------------------------------------------------------------------------------------------------------------------------------
📦 v0.1
✨ Added

Core student dashboard for viewing daily information in a single interface.

Class schedule viewer allowing students to see class times and periods.

School meal display based on the user’s selected school.

Basic task and planning functionality to help students organize their day.

Initial study tools and resources to support academic planning.

Ability to find available study halls and open periods.

Foundational UI layout and navigation for the application.

🧭 User Experience

Designed the initial interface with a focus on simplicity and ease of use.

Optimized core views for fast access to daily school information.

🧱 Architecture

Established the initial project structure and component layout.

Set up core data models for schedules, meals, and tasks.

Built the foundation for future authentication, integrations, and customization features.

⚠️ Known Limitations

No user authentication or account syncing.

Limited customization and personalization options.

Features and data are not yet portable across accounts.
