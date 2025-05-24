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

- `MONGODB_URI`: MongoDB connection string
- AWS S3 credentials for file uploads

## Key Patterns

- Database connections use cached global instances to prevent connection pooling issues
- TypeScript interfaces mirror Mongoose models for type safety
- CSS Modules naming convention: `ComponentName.module.css`
- API responses follow consistent error/success structure
- Mobile-first responsive design with viewport optimization