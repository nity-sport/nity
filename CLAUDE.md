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

**Styling System**: CSS custom properties design system defined in `styles/theme-config.css` with comprehensive color palette, typography scales, spacing tokens, and responsive breakpoints. Combines CSS Modules with global styles.

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
- Mobile-first responsive design with viewport optimization
- Component composition with Layout wrapper pattern
- CSS custom properties from `theme-config.css` for consistent design tokens

**File Upload Architecture**:
- Uses Formidable for multipart form parsing with 5MB limits
- Direct S3 upload via `@aws-sdk/client-s3`
- UUID-based file naming for uniqueness
- Files served from S3 bucket with Next.js Image optimization