# Project Memory Document

## Website Purpose and Core Features

### Overview
Intra-Big-Job is a comprehensive educational institution management platform (intranet) designed to facilitate interactions between students, teachers, administrators, and recruiters. The platform serves as a central hub for educational program management, student tracking, and career development.

### Primary Purpose
- Provide a centralized system for managing educational programs and student profiles
- Enable efficient communication between different stakeholders (students, teachers, admin staff)
- Streamline administrative processes for educational institutions
- Create a bridge between students and potential employers/recruiters
- Track student progress and document management (diplomas, CV, etc.)

### Core Features
1. **User Management**
   - Multi-role system (Admin, SuperAdmin, HR, Teacher, Student, Guest, Recruiter)
   - Comprehensive user profiles with personal information
   - Profile completion tracking for student/user documents

2. **Educational Program Management**
   - Formation (course/program) creation and enrollment
   - Specialization management
   - Group organization and management
   - Schedule management with calendar integration

3. **Document Management**
   - CV and diploma uploads and verification
   - Document categorization and tracking
   - Profile completion monitoring

4. **Ticketing System**
   - Support ticket creation and management
   - Service categorization
   - Comment threads on tickets

5. **Communication Tools**
   - Messaging between users
   - Group communications
   - Notifications

6. **Recruiter Portal**
   - Student profile browsing
   - CV and diploma access
   - Student-to-job matching capabilities

### Main User Journeys
1. **Student Journey**
   - Registration and profile creation
   - Document uploads (CV, diplomas)
   - Course enrollment
   - Progress tracking
   - Communication with teachers and admin
   - Job application through recruiters

2. **Teacher Journey**
   - Course/formation management
   - Student tracking and evaluation
   - Schedule management
   - Communication with students

3. **Admin/HR Journey**
   - User account management
   - System configuration
   - Ticket handling
   - Reports and analytics

4. **Recruiter Journey**
   - Browsing student profiles
   - Accessing student documents
   - Contacting potential candidates

### Key Technical Aspects for Quick Understanding
- RESTful API architecture with JWT authentication
- React frontend with role-based UI components
- Symfony backend with domain-driven design
- Document storage using AWS S3
- Docker-based development environment with Mutagen file sync

## Operational Rules for Claude 3.7 Sonnet

### Critical Workflow Requirements
1. **Always Check Terminal First**
   - When investigating issues, ALWAYS examine terminal logs first
   - Terminal output provides the most direct insight into errors, API calls, and system state
   - Pay special attention to PHP errors, Symfony exceptions, and database issues
   - Look for JWT authentication failures, permission errors, and file access problems

2. **Backend-First Investigation Approach**
   - Never modify frontend JSX files without first understanding the related backend components
   - For any frontend changes, first examine:
     - Controllers that handle the related functionality
     - Services that process the data
     - API endpoints being called
     - Entity structures and relationships

3. **Data Flow Verification**
   - Before suggesting code changes, trace the entire data flow:
     - API request from frontend → Controller → Service → Repository → Database
     - Database → Repository → Service → Controller → API response → Frontend

4. **Documentation Correlation**
   - When examining code, cross-reference with this documentation
   - Understand which domain/module the code belongs to
   - Check if the functionality spans multiple roles or user journeys

### Common Troubleshooting Starting Points
- Authentication issues: Check JWT token validity and AuthController
- Profile data problems: Examine UserProfileController and profile services
- Document upload issues: Look at document controllers and AWS configuration
- Form submission errors: Verify API endpoint format and validation rules
- Role-based access problems: Check user roles and permission configurations

## Project Architecture

This is a modern web application using a decoupled architecture with:
- **Frontend**: React 19 with modern React patterns and Tailwind CSS
- **Backend**: Symfony 7.2 with RESTful API endpoints
- **Infrastructure**: Docker containerization with Mutagen for file synchronization

## Directory Structure

```
Intra-Bigjob-Group-5/
├── backend/               # Application backend Symfony
│   ├── assets/           # Assets gérés par Symfony Asset Mapper
│   ├── bin/              # Binaires et commandes Symfony 
│   ├── config/           # Configuration de l'application et des bundles
│   ├── migrations/       # Migrations de base de données Doctrine
│   ├── public/           # Point d'entrée web et fichiers publics
│   ├── src/              # Code source de l'application backend
│   │   ├── Domain/       # Logique métier par domaine
│   │   │   ├── Admin/    # Fonctionnalités Admin
│   │   │   ├── HR/       # Fonctionnalités RH
│   │   │   ├── Student/  # Fonctionnalités Étudiant
│   │   │   ├── SuperAdmin/# Fonctionnalités Super Admin
│   │   │   ├── Teacher/  # Fonctionnalités Professeur
│   │   │   └── User/     # Fonctionnalités Utilisateur
│   │   ├── Controller/   # Contrôleurs publics partagés
│   │   ├── Entity/       # Entités Doctrine partagées
│   │   ├── Repository/   # Repositories Doctrine partagés
│   │   ├── Service/      # Services publics partagés
│   │   └── DataFixtures/ # Fixtures pour charger des données de test
│   ├── templates/        # Templates Twig
│   ├── tests/            # Tests unitaires et fonctionnels
│   ├── translations/     # Fichiers de traduction
│   └── var/              # Fichiers temporaires (cache, logs)
│
├── frontend/             # Application frontend React/Vite
│   ├── public/           # Ressources statiques publiques
│   ├── src/              # Code source du frontend
│   │   ├── assets/       # Images, polices et autres fichiers statiques
│   │   ├── components/   # Composants React réutilisables
│   │   │   ├── ui/       # Composants UI de base (Shadcn)
│   │   │   └── shared/   # Composants partagés entre domaines
│   │   ├── lib/          # Utilitaires et fonctions d'aide
│   │   ├── pages/        # Pages par domaine
│   │   │   ├── Admin/    # Pages Admin
│   │   │   ├── HR/       # Pages RH
│   │   │   ├── Student/  # Pages Étudiant
│   │   │   ├── SuperAdmin/# Pages Super Admin
│   │   │   ├── Teacher/  # Pages Professeur
│   │   │   └── User/     # Pages Utilisateur
│   │   ├── services/     # Services partagés (API, auth, etc.)
│   │   ├── layouts/      # Layouts de l'application
│   │   ├── hooks/        # Hooks React personnalisés
│   │   └── context/      # Contextes React
│   ├── Dockerfile        # Configuration Docker pour le frontend
│   └── vite.config.js    # Configuration de Vite
│
├── infra/                # Configuration d'infrastructure
│   ├── docker-compose.yml# Configuration Docker Compose
│   └── nginx/            # Configuration Nginx
```

## Backend (Symfony 7.2)

### Entities and Database Structure

The project has 34 database tables with key relationships:

- **User**: Core entity with personal information
  - Has many UserRole, Address, Signature, UserDiploma entities
  - Belongs to Nationality, Theme, Specialization
  - Many-to-many with Formation, Group

- **Role**: Defines user permissions in the system
  - Connected to User via UserRole junction table

- **UserRole**: Junction table between User and Role

- **Document-related**: document, document_category, document_type, document_history

- **Ticket system**: ticket, ticket_status, ticket_comment, ticket_service

- **Formation system**: formation, formation_student (junction), specialization

- **Location**: address, city, postal_code, nationality

### Key Controllers

The backend has several controllers for different aspects of the application:
- User management (UserController, UserRoleController, UserProfileController)
- Authentication (AuthController, RefreshTokenController)
- Ticket management (TicketController, TicketCommentController)
- Document handling (DocumentController)
- Formation management (FormationController, FormationApiController)

### Role System

The system has 7 defined roles:

1. **ADMIN (ID: 100)** - Administrateur du système avec des droits étendus
2. **SUPERADMIN (ID: 101)** - Super Administrateur avec tous les droits système
3. **HR (ID: 102)** - Ressources Humaines - Gestion des utilisateurs et des profils
4. **TEACHER (ID: 103)** - Formateur - Création et gestion des formations
5. **STUDENT (ID: 104)** - Élève - Accès aux formations et aux ressources pédagogiques
6. **GUEST (ID: 105)** - Invité - Accès limité en lecture seule
7. **RECRUITER (ID: 106)** - Recruteur - Gestion des candidatures et des offres d'emploi

## Frontend (React 19)

### Key Technologies

- **React 19**: Modern React with new features
- **TanStack Query**: For data fetching and state management
- **React Router DOM 6**: For application routing
- **Tailwind CSS**: For styling
- **Radix UI**: For accessible UI components
- **Framer Motion**: For animations
- **Recharts**: For data visualization
- **React Hook Form**: For form handling

### Structure

- **Components**: Reusable UI components (forms, buttons, cards)
- **Pages**: Domain-specific pages organized by user role
- **Services**: API communication and data management
- **Hooks**: Custom React hooks for shared logic
- **Context**: Global state management
- **Features**: Feature-specific modules

### API Services

The frontend communicates with the backend via a comprehensive apiService.js that handles:
- Authentication with JWT tokens
- Request caching and deduplication
- Performance optimization
- Error handling
- Rate limiting

## Infrastructure

### Docker Configuration

The project uses Docker with services for:
- Frontend (React/Vite)
- Backend (Symfony/PHP-FPM)
- Database (MySQL)
- Nginx (Web server)
- PHPMyAdmin
- Redis

### Mutagen Configuration

Mutagen is used for efficient file synchronization between local dev environment and Docker containers:

```yaml
sync:
  frontend:
    alpha: "./frontend"
    beta: "docker://infra-frontend-1:/app"
    ignore:
      paths:
        - node_modules
        - .git
        - dist

  backend:
    alpha: "./backend"
    beta: "docker://infra-backend-1:/var/www/symfony"
    ignore:
      paths:
        - vendor
        - var
        - .git
        - var/cache
        - var/log
```

### Environment Variables

#### Backend (.env)
```
# Database
DATABASE_URL="mysql://user:password@database:3306/bigproject?serverVersion=8.0.32&charset=utf8mb4"

# JWT Authentication
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf

# Mail (via Mailtrap)
MAILTRAP_USER=d8e54e4fea5bd6
MAILTRAP_PASS=7756fb0c1d1ac5
MAILER_DSN=smtp://d8e54e4fea5bd6:7756fb0c1d1ac5@sandbox.smtp.mailtrap.io:2525

# AWS S3 Storage
AWS_ACCESS_KEY_ID=AKIASBGQLFE4VN6IB5UD
AWS_SECRET_ACCESS_KEY=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
AWS_BUCKET=bigproject-storage
AWS_REGION=eu-north-1

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

#### Vite Configuration
The Vite configuration includes:
- Path aliases for clean imports
- Development server configuration (port 5173)
- HMR settings
- Proxy configuration for API calls
- Build optimization settings
- Package preloading

## Workflow and Scripts

Custom scripts for managing the development environment:

### start-mutagen.sh / start-mutagen.bat
- Checks for Mutagen installation
- Starts Docker containers
- Initializes Mutagen sync
- Provides log monitoring options

### stop-mutagen.bat
- Stops Mutagen synchronization
- Stops all Docker containers
- Cleans up resources

## Development Workflow
1. Start the environment with start-mutagen.sh (Unix) or start-mutagen.bat (Windows)
2. Monitor logs through the provided menu
3. Access the application at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - PHPMyAdmin: http://localhost:8080
4. Stop the environment with stop-mutagen.bat when finished

## Previous Conversations

Previous work included addressing issues with:
- `ProfileProgress` component
- Profile completion status for LinkedIn, CV, and diplomas
- Document uploads (CV, diplomas)
- Data fetching and caching mechanisms
- Transaction handling in the backend

The main focus was on ensuring the profile completion status was correctly updated when documents were uploaded, particularly CV and diploma files and we fixed it. 


