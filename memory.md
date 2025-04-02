# Project Memory for Intra-Big-job

## Project Structure

-   **Backend:** Symfony 7 application (`backend/`)
    -   Domain-driven structure (`src/Domains/`)
    -   Shared entities (`src/Entity/`), repositories (`src/Repository/`), services (`src/Service/`)
    -   Controllers (`src/Controller/`, `src/Domains/.../Controller/`)
    -   API routes defined primarily using PHP Attributes (`#[Route('/api/...')`) in controllers.
-   **Frontend:** React 19 / Vite application (`frontend/`)
    -   Component-based structure (`src/components/`, `src/pages/`)
    -   Pages organized by domain (`src/pages/Admin/`, `src/pages/Student/`, etc.)
    -   Routing handled by `react-router-dom` v6 (`frontend/src/App.jsx`, `frontend/src/features/app/AppRoutes.jsx`). Routes are protected using `RoleGuard` and other specific guards.
    -   Uses Shadcn UI components (`src/components/ui/`).
    -   State management: React Context (`src/contexts/`), TanStack Query (`@tanstack/react-query`).
-   **Infrastructure:** Docker (`infra/`)
    -   `docker-compose.yml` defines services (backend, frontend, database, nginx).
    -   Mutagen for file synchronization (`mutagen.yml`).

## Key Dependencies

-   **Backend (composer.json):**
    -   PHP >= 8.2
    -   Symfony 7.2.*
    -   Doctrine ORM 3.3.*
    -   LexikJWTAuthenticationBundle 3.1.* (JWT Auth)
    -   NelmioCorsBundle 2.5.* (CORS)
    -   Twig 3.* (Templating - likely minimal usage given React frontend)
    -   Symfony Security Bundle
    -   Symfony Serializer
    -   Symfony Validator
    -   AWS SDK PHP Symfony (Likely for S3 document storage)
-   **Frontend (package.json):**
    -   React 19, React DOM 19
    -   Vite 6.2
    -   React Router DOM 6.29
    -   Tailwind CSS 3.4
    -   Axios 1.8 (HTTP Client)
    -   TanStack Query 5.67 (Data Fetching/State)
    -   Shadcn/Radix UI (Component Primitives)
    -   Lucide React (Icons)
    -   date-fns (Date utility)
    -   Recharts (Charts)
    -   React Hook Form (Forms)
    -   Sonner (Toasts/Notifications)

## Routing Overview

-   **Backend API (Detailed from `debug:router`):**
    -   **Auth & Session:**
        -   `POST /api/login_check`
        -   `POST /api/register`
        -   `POST /api/logout`
        -   `POST /api/refresh` (Refresh token)
        -   `POST /api/revoke` (Revoke refresh token)
        -   `GET /api/refresh-token/devices`
        -   `DELETE /api/refresh-token/remove/{tokenId}`
        -   `POST /api/refresh-token/clean` (Clean expired)
        -   `POST /api/refresh-token/clean-all`
    -   **User & Profile:**
        -   `GET /api/me` (Basic user info)
        -   `GET /api/profile` (Current user full profile - specific controller not shown)
        -   `PUT /api/profile` (Update current user full profile)
        -   `GET /api/profile/consolidated` (Combined profile data)
        -   `GET /api/profile/user-data`
        -   `GET /api/profile/all`
        -   `GET /api/profile/completion-status`
        -   `POST /api/profile/picture` (Upload)
        -   `DELETE /api/profile/picture`
        -   `GET /api/profile/picture`
        -   `GET /api/users` (Get all users - likely admin)
        -   `PUT /api/users/{id}` (Update specific user - likely admin)
        -   `DELETE /api/users/{id}` (Delete specific user - likely admin)
        -   `GET /api/users/list`
    -   **Student Profile Specific (`/api/student/profile`):**
        -   `GET /api/student/profile` (Current student profile)
        -   `PATCH|PUT /api/student/profile/job-seeking-status`
        -   `PATCH|PUT /api/student/profile/portfolio-url`
        -   `GET /api/student/profile/seeking-internship`
        -   `GET /api/student/profile/seeking-apprenticeship`
        -   `GET /api/student/profile/seeking-jobs`
        -   `PATCH|PUT /api/student/profile/toggle-internship-seeking`
        -   `PATCH|PUT /api/student/profile/toggle-apprenticeship-seeking`
    -   **Roles & Permissions:**
        -   `GET /api/user-roles/users/{roleName}`
        -   `POST /api/user-roles/change-role` (Admin)
        -   `GET /api/user-roles/roles` (List available roles)
    -   **Password Management:**
        -   `POST /api/change-password` (For logged-in user)
        -   `POST /api/reset-password/request`
        -   `GET /api/reset-password/verify/{token}`
        -   `POST /api/reset-password/reset/{token}`
        -   *(OPTIONS routes for preflight requests)*
    -   **Email Verification:**
        -   `GET /api/verify-email/{token}`
        -   `POST /api/resend-verification-email`
    -   **Documents (`/api/documents`):**
        -   `GET /api/documents` (List user's documents)
        -   `POST /api/documents/upload/cv` (Upload current user CV)
        -   `POST /api/documents/upload/cv/{studentId}` (Upload CV for specific student)
        -   `GET /api/documents/{id}/download`
        -   `DELETE /api/documents/{id}`
        -   `GET /api/documents/type/{type}`
        -   `GET /api/documents/{id}`
    -   **Tickets (`/api/tickets`):**
        -   `GET /api/tickets` (List tickets)
        -   `GET /api/tickets/status` (List available statuses)
        -   `GET /api/tickets/raw-data`
        -   `GET /api/tickets/{id}` (Get specific ticket)
        -   `POST /api/tickets` (Create ticket)
        -   `PUT /api/tickets/{id}` (Update ticket)
        -   `PUT /api/tickets/{id}/assign`
        -   `PUT /api/tickets/actions/bulk-update-status`
        -   `POST /api/tickets/custom-bulk-update`
        -   `GET /api/tickets/{id}/comments`
        -   `POST /api/tickets/{id}/comments`
        -   `GET /api/tickets/tools/debug-token`
    -   **Ticket Services (`/api/ticket-services`):**
        -   `GET /api/ticket-services`
        -   `GET /api/ticket-services/{id}`
        -   `POST /api/ticket-services` (Create)
        -   `PUT /api/ticket-services/{id}` (Update)
        -   `DELETE /api/ticket-services/{id}`
    -   **Addresses:**
        -   `GET /addresses` (Current user addresses)
        -   `POST /addresses` (Add address for current user)
        -   `GET /api/address/search` (Proxy to data.gouv.fr)
        -   `GET /api/address/reverse` (Proxy to data.gouv.fr)
    -   **Diplomas:**
        -   `GET /api/profile/diplomas` (Current user diplomas)
        -   `POST /api/profile/diplomas` (Add diploma for current user)
        -   `GET /api/user-diplomas/available` (List available diploma types)
        -   `GET /api/user-diplomas` (Likely current user's diplomas - duplicate?)
        -   `POST /api/user-diplomas` (Add - duplicate?)
        -   `PUT /api/user-diplomas/{id}` (Update)
        -   `DELETE /api/user-diplomas/{id}` (Delete)
    -   **Formations:**
        -   `GET /api/formations`
        -   `POST /api/formations` (Create)
        -   `GET /api/formations/available-students`
        -   `POST /api/formations/{id}/students` (Add student)
    -   **Specializations (`/api/specialization`):**
        -   `GET /api/specialization/{id}`
        -   `GET /api/specialization` (List all)
        -   `GET /api/specialization/by-domain/{domainId}`
    -   **Schedule Events:**
        -   `POST /api/create-event`
        -   `GET /api/get-user-events`
    -   **Signatures (`/api/signatures`):**
        -   `GET /api/signatures/today`
        -   `GET /api/signatures/{id}`
        -   `GET /api/signatures` (List)
        -   `POST /api/signatures` (Create)
        -   `POST /api/signatures/{id}/validate`
    -   **Messages (`/api/messages`):**
        -   `GET /api/messages` (List general)
        -   `GET /api/messages/recent`
        -   `GET /api/messages/private/{userId}`
        -   `POST /api/messages` (Create general)
        -   `POST /api/messages/private` (Create private)
        -   `POST /api/messages/{id}/read`
        -   `POST /api/admin/messages/cleanup`
    -   **Search:**
        -   `GET /api/user-autocomplete`
        -   `GET /api/user-autocomplete-debug`
    -   **Testing/Debugging:**
        -   `GET /api/test/mail`
        -   `GET /api/test/mail/direct`
        -   `GET /api/test`
    *Note: Routes starting with `/_...` (like `/_wdt`, `/_profiler`) are Symfony development/debug routes.*
-   **Frontend (React Router):**
    -   Public Routes (`/`): `/`, `/login`, `/register`, `/registration-success`, `/verify-email/...`, `/reset-password/...`
    -   Protected Routes (`/` requires auth):
        -   Generic: `/dashboard` (redirects based on role), `/profile/...`, `/settings/...`, `/formations`, `/tickets/...`
        -   Role-specific prefixes:
            -   `/admin/...` (Dashboard, Users, Ticket Services, Formations)
            -   `/super-admin/...` (Dashboard)
            -   `/student/...` (Dashboard, Schedule, Grades, Absences, Projects, Attendance)
            -   `/teacher/...` (Dashboard, Attendance, Signature Monitoring)
            -   `/hr/...` (Dashboard)
            -   `/recruiter/...` (Dashboard, Guest Student Role Manager)
            -   `/guest/...` (Dashboard)

## Initial Setup & Observations (from logs)

-   Docker containers (nginx, backend, database) started.
-   Symfony cache cleared, assets installed.
-   Database schema up-to-date.
-   Fixtures initially failed (duplicate 'superadmin@bigproject.com') but succeeded after purging the database.
-   `UserDomainFixtures` indicated a potential need for a ManyToMany relationship between `User` and `Domain`.
-   Git branch `fix/fetch-issues-k` was created.

## Post-Login Dashboard Display Logic (Frontend)

1.  **Authentication/Role Context:** `AuthProvider` and `RoleProvider` wrap the app, managing auth state and user roles.
2.  **Protected Routes:** Routes requiring login are typically wrapped in `<ProtectedRoute>`, ensuring authentication.
3.  **Central Redirection:** Users are often directed to `/dashboard` after login.
4.  **`RoleDashboardRedirect` Component:** This component (at `/dashboard`) identifies the user's role from context.
5.  **Role-Specific Path Determination:** It determines the correct dashboard path (e.g., `/admin/dashboard`, `/student/dashboard`) based on the user's role(s).
6.  **Navigation:** It uses `<Navigate>` to redirect the user to their specific dashboard path.
7.  **Route Matching:** `App.jsx` matches the specific path (e.g., `/admin/dashboard`).
8.  **`RoleGuard` Verification:** The `<RoleGuard>` wrapping the specific dashboard route confirms the user possesses the necessary role.
9.  **Component Rendering:** If the role matches, the corresponding lazy-loaded dashboard component (e.g., `AdminDashboard`, `StudentDashboard`) is rendered within the `MainLayout`.

## Frontend API Call Configuration

-   **Base URL Source:** The absolute base URL for the backend API is defined in `frontend/.env` as `VITE_API_URL=http://localhost:8000/api`. This is accessed in the code via `import.meta.env.VITE_API_URL`.
-   **Development Proxy:** During development (`npm run dev`), `vite.config.js` sets up a proxy. Any frontend request starting with `/api` is forwarded by the Vite dev server to `http://nginx:80` (the Nginx container). This allows frontend code to use relative paths (e.g., `/api/users/me`) without CORS issues.
-   **Production:** After building (`npm run build`), the frontend code uses the absolute `VITE_API_URL` to make direct requests to the backend API endpoint.
-   **Backend Reference:** The `backend/.env` file contains `FRONTEND_URL=http://localhost:5173`, which is used by the backend (e.g., for CORS configuration).

## Backend Controller & Service Responsibilities

-   **Controllers (`src/Controller`, `src/Domains/.../Controller`):** Handle HTTP requests/responses, delegate business logic to services. Organized by feature/entity (e.g., `TicketController`, `UserRoleController`, `Profile/*`, `DocumentController`).
    -   **Core:** Auth, Registration, Password Reset, User/Profile, Roles, Tickets, Documents, Formations, Messages, etc.
    -   **Admin Specific:** User Admin actions (`UserAdminController`), Message Cleanup (`Admin/MessageCleanupController`).
    -   **Profile Specific (`Controller/Profile`, `Controller/User`):** Focus on fetching/updating data for the *currently authenticated* user.
    -   **Student Specific (`Domains/Student`):** Handle student-only profile fields.
-   **Services (`src/Service`):** Contain reusable business logic.
    -   `AuthService`: Core authentication.
    -   `RegistrationService`, `VerificationService`: New user signup and email verification.
    -   `PasswordService`, `ResetPasswordService`: Password updates and reset flow.
    -   `UserProfileService`, `UserService`: Fetching, updating, consolidating user data.
    -   `UserRoleService`: Role management logic.
    -   `TicketService` (likely inferred, not listed but used by `TicketController`), `TicketCommentService` (inferred): Ticket/comment logic.
    -   `DocumentStorageFactory`, `S3StorageService`: Document storage abstraction and S3 implementation.
    -   `EmailService`: Sending application emails.
    -   `RefreshTokenService`: JWT refresh token management.
    -   `MessageCleanupService`: Logic for deleting old messages.
    -   `ValidationService`: Reusable validation logic.

## Frontend Navbar Profile Menu

-   **Location:** The profile dropdown menu is located within the `UserMenu` component, which is rendered by `frontend/src/components/Navbar.jsx` (used within `MainLayout.jsx`).
-   **Items:**
    -   "Mon profil": Navigates to `/profile`.
    -   "Paramètres": Navigates to `/settings/profile`.
    -   "Déconnexion": Opens a confirmation dialog. If confirmed, calls `authService.logout('/login')`.
