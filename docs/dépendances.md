# BigProject Project Specifications

This document provides a comprehensive overview of all technologies, frameworks, libraries, and tools used in the BigProject project, along with their specific versions.

## Project Architecture

The BigProject project follows a modern client-server architecture with:
- Frontend: React-based single-page application
- Backend: Symfony-based RESTful API
- Database: MySQL
- Infrastructure: Docker containerization

## Frontend Technologies

### Core Framework and Libraries
- **Node.js**: 18.x (Alpine-based Docker image)
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **React Router DOM**: 6.29.0
- **Axios**: 1.8.1 (HTTP client)

### UI Components and Icons
- **shadcn/ui**: 1.0.0 (Component library)
- **Lucide React**: 1.0.0 (Icon library)

### Build Tools and Development Environment
- **Vite**: 6.2.0 (Build tool and development server)
- **@vitejs/plugin-react**: 4.3.4

### CSS and Styling
- **Tailwind CSS**: 3.4.17
- **PostCSS**: 8.5.3
- **Autoprefixer**: 10.4.20

### Code Quality and Linting
- **ESLint**: 9.21.0
- **eslint-plugin-react**: 7.37.4
- **eslint-plugin-react-hooks**: 5.0.0
- **eslint-plugin-react-refresh**: 0.4.19
- **@eslint/js**: 9.21.0
- **globals**: 15.15.0

### TypeScript Support
- **@types/react**: 19.0.10
- **@types/react-dom**: 19.0.4

## Backend Technologies

### Core Framework
- **PHP**: 8.2 (FPM version in Docker)
- **Symfony**: 7.2.* (All Symfony components use this version)
- **Composer**: Latest (Package manager)

### Symfony Components
- **symfony/framework-bundle**: 7.2.*
- **symfony/console**: 7.2.*
- **symfony/dotenv**: 7.2.*
- **symfony/yaml**: 7.2.*
- **symfony/asset**: 7.2.*
- **symfony/asset-mapper**: 7.2.*
- **symfony/form**: 7.2.*
- **symfony/security-bundle**: 7.2.*
- **symfony/validator**: 7.2.*
- **symfony/mailer**: 7.2.*
- **symfony/twig-bundle**: 7.2.*
- **symfony/stimulus-bundle**: 2.23+
- **symfony/ux-turbo**: 2.23+
- **symfony/translation**: 7.2.*
- **symfony/serializer**: 7.2.*
- **symfony/property-access**: 7.2.*
- **symfony/property-info**: 7.2.*
- **symfony/runtime**: 7.2.*
- **symfony/http-client**: 7.2.*
- **symfony/doctrine-messenger**: 7.2.*
- **symfony/messenger**: 7.2.*

### Database and ORM
- **MySQL**: 8.0.32
- **doctrine/orm**: 3.3.*
- **doctrine/dbal**: 3.*
- **doctrine/doctrine-bundle**: 2.13.*
- **doctrine/doctrine-migrations-bundle**: 3.4.*

### API and Cross-Origin Resource Sharing
- **nelmio/cors-bundle**: 2.5+

### Template Engine
- **Twig**: 2.12+ or 3.0+
- **twig/extra-bundle**: 2.12+ or 3.0+

### Documentation and Type Handling
- **phpdocumentor/reflection-docblock**: 5.6+
- **phpstan/phpdoc-parser**: 2.1+

## Infrastructure

### Web Server
- **Nginx**: Alpine version

### Containerization
- **Docker** and **Docker Compose** for containerization and orchestration

### Database
- **MySQL**: 8.0
  - Authentication Plugin: mysql_native_password
  - Database Name: BigProject
  - Character Set: utf8mb4

## Development Tools
- **DBeaver**: Database management tool for MySQL

## Notes
- The project uses environment variables for configuration
- CORS is configured to allow requests from localhost
- Doctrine is configured for MySQL with specific server version 8.0.32
- The frontend is served via Vite's development server on port 5173
- The backend API is served via Nginx on port 8000

---

*Last updated: February 26, 2025*
