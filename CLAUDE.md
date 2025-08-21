# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
yarn dev          # Start development server
yarn build        # Create production build
yarn start        # Start production server
yarn type-check   # Run TypeScript type checking
```

## Architecture Overview

**Framework**: Next.js with TypeScript using pages router architecture. The application is a sports platform called Nity that connects users with coaches and sports facilities.

**Data Layer**: MongoDB with Mongoose ODM using connection pooling via cached global connections. Models are defined in `/src/models/` with corresponding TypeScript interfaces in `/src/types/`. Key entities: Coach, SportCenter, Accommodation, Facility.

**File Upload System**: AWS S3 integration using `@aws-sdk/client-s3` with Formidable for multipart parsing. Files are uploaded directly to S3 via API routes with UUID-based naming.

**Component Structure**: Uses CSS Modules for styling with a Layout wrapper pattern (Header/Footer). Pages are composed of sections (Hero, Sports) with mobile-responsive design.

**Styling System**: CSS custom properties design system defined in `styles/theme-config.css` with comprehensive color palette, typography scales, spacing tokens, and responsive breakpoints. Uses rem-based units throughout (16px = 1rem ratio) for consistent scaling. Combines CSS Modules with global styles.

**API Routes**: RESTful endpoints in `/pages/api/` following CRUD patterns with structured error handling. Includes specialized file upload endpoint with S3 integration.

## Required Environment Variables

**Database**:
- `MONGODB_URI`: MongoDB connection string

**AWS S3 File Uploads**:
- `AWS_S3_REGION`: AWS region (e.g., us-east-2)  
- `AWS_S3_ACCESS_KEY_ID`: AWS access key
- `AWS_S3_SECRET_ACCESS_KEY`: AWS secret key

**Authentication**:
- `JWT_SECRET`: Secret for JWT token signing
- `NEXTAUTH_SECRET`: NextAuth.js secret for session encryption
- `NEXTAUTH_URL`: Base URL for authentication callbacks

## Testing

The project uses Jest for unit testing with mocking of external dependencies:
- Test files are located in `__tests__/` directory
- Database connections and models are mocked in tests
- Uses `node-mocks-http` for API route testing
- No specific test runner script - run tests via `jest` command

## Key Patterns

**Database & Backend**:
- Database connections use cached global instances to prevent connection pooling issues
- TypeScript interfaces mirror Mongoose models for type safety
- API responses follow consistent error/success structure
- JWT-based authentication with role-based access control
- File uploads limited to 5MB with automatic S3 integration

**Frontend & Styling**:
- CSS Modules naming convention: `ComponentName.module.css`
- Rem-based unit system (16px = 1rem) for consistent scaling and accessibility
- Mobile-first responsive design with viewport optimization
- Component composition with Layout wrapper pattern
- CSS custom properties from `theme-config.css` for consistent design tokens
- Modular CSS architecture: complex forms use separate CSS files per component/step

**File Upload Architecture**:
- Uses Formidable for multipart form parsing with 5MB limits
- Direct S3 upload via `@aws-sdk/client-s3`
- UUID-based file naming for uniqueness
- Files served from S3 bucket with Next.js Image optimization

## CSS Architecture & Modularization

**MultiStepSportCenterForm Structure**:
- Located in `components/forms/MultiStepSportCenterForm/`
- Modular CSS architecture with separate files per step
- Common styles in `Steps/styles/BaseStep.module.css`
- Step-specific styles in `Steps/styles/StepX.module.css` files
- Each component imports both base styles and step-specific styles

**CSS File Organization**:
```
Steps/styles/
├── BaseStep.module.css      # Common step container, title, button styles
├── Step1.module.css         # Name Input (127 lines)
├── Step2.module.css         # Basic Data Form (197 lines)
├── Step4.module.css         # Host Profile (282 lines) 
├── Step5.module.css         # Photos section (453 lines)
├── Step6.module.css         # Achievements (341 lines)
├── Step8.module.css         # Location Form (39 lines)
├── Step9.module.css         # Categories management (583 lines)
├── Step10.module.css        # Accommodation sub-steps (320 lines)
└── Step12.module.css        # Create Account (156 lines)
```

**CSS Standards**:
- All units in rem (16px = 1rem conversion ratio)
- Media query breakpoints remain in px (768px, 480px, etc.)
- Border widths of 1px preserved for crisp rendering
- Box shadows converted for larger values, small values kept in px
- Consistent responsive design patterns across all steps

## Error Handling & API Standards

**Standardized Error System**: Custom error classes and structured logging implemented for consistent API responses and better debugging.

**Error Classes** (`src/utils/errors.ts`):
- `AppError`: Base class for operational errors with codes and structured data
- Specific classes: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`
- Factory functions for common error scenarios

**API Response Format** (`src/utils/apiResponse.ts`):
- Standardized success/error response structure with metadata
- Built-in pagination support
- Automatic request ID generation for tracing
- Consistent error formatting with security considerations

**Middleware System** (`src/middleware/errorHandler.ts`):
- `withErrorHandler`: Automatic error catching and response formatting
- `withMethods`: HTTP method validation
- `withRateLimit`: Request rate limiting
- `withCors`: CORS configuration
- Composable middleware pattern for API routes

**Structured Logging** (`src/utils/logger.ts`):
- Environment-aware logging (JSON in production, readable in development)
- Specialized logging methods: `apiRequest`, `dbOperation`, `securityEvent`, `performance`
- Contextual logging with request IDs, user data, and operation metadata
- Performance monitoring and error tracking

**Usage Pattern**:
```typescript
// API Route with middleware
export default compose(
  withMethods(['GET', 'POST']),
  withRateLimit({ windowMs: 60000, max: 100 }),
  withErrorHandler
)(handler);

// Structured error throwing
throw new ValidationError('Email is required', { field: 'email' });

// Standardized responses
ResponseHandler.success(res, data, { requestId: req.requestId });
ResponseHandler.paginated(res, items, pagination);
```