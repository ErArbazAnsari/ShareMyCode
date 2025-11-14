# Architecture Documentation

## System Overview

ShareMyCode is built as a modern full-stack web application using Next.js 15 with the App Router pattern. The application follows a serverless architecture with API routes, client-side rendering, and server-side rendering where appropriate.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Components  │  │   Hooks      │      │
│  │   Components │  │   (Radix UI) │  │   (Custom)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  API Routes   │  │  Middleware  │      │
│  │   (SSR/CSR)  │  │  (Serverless) │  │   (Auth)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │    Clerk     │  │  Cloudinary  │
│  (Database)  │  │ (Auth/Users) │  │  (Storage)   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

### Frontend Architecture

**Framework**: Next.js 15 with App Router
- **Server Components**: Used for initial page loads and SEO
- **Client Components**: Used for interactive features (marked with `"use client"`)
- **API Routes**: Serverless functions for backend logic

**State Management**:
- React Hooks (`useState`, `useEffect`, `useContext`)
- React Hook Form for form state
- Clerk hooks for authentication state

**Styling**:
- Tailwind CSS for utility-first styling
- CSS Variables for theme support
- Radix UI for accessible components

### Backend Architecture

**API Layer**: Next.js API Routes
- RESTful API design
- Serverless functions (Vercel/Edge compatible)
- FormData handling for file uploads

**Database**: MongoDB
- Document-based storage
- Single collection: `user_gist`
- ObjectId for document identification

**Authentication**: Clerk
- JWT-based authentication
- Middleware-based route protection
- User session management

**File Storage**: Cloudinary
- CDN for file delivery
- Automatic optimization
- Secure upload endpoints

## Data Flow

### Gist Creation Flow

```
User Input → Form Validation → API Route → File Upload (if any) → MongoDB → Response → Redirect
```

1. User fills form in `/create` page
2. Client-side validation (React Hook Form + Zod)
3. FormData sent to `/api/gists` (POST)
4. Server validates authentication (Clerk)
5. If file present, upload to Cloudinary
6. Save gist data to MongoDB
7. Return gist ID
8. Client redirects to `/gist/[id]`

### Gist Viewing Flow

```
Page Load → API Request → Auth Check → Visibility Check → View Counter Increment → Response → Render
```

1. User navigates to `/gist/[id]`
2. Client fetches from `/api/gists/[id]` (GET)
3. Server checks if gist exists
4. Server checks visibility (private gists require ownership)
5. Server increments view counter
6. Server returns gist data
7. Client renders with React components

### Authentication Flow

```
Page Load → Middleware Check → Clerk Auth → Protected Route Access
```

1. User navigates to protected route
2. Middleware (`middleware.ts`) intercepts request
3. Checks if route is public (via `isPublicRoute`)
4. If protected, verifies Clerk session
5. Redirects to sign-in if not authenticated
6. Allows access if authenticated

## File Structure Patterns

### API Routes Pattern

```typescript
// app/api/gists/[id]/route.ts
export async function GET(request, { params }) {
  // Handle GET request
}

export async function POST(request, { params }) {
  // Handle POST request
}

export async function PATCH(request, { params }) {
  // Handle PATCH request
}

export async function DELETE(request, { params }) {
  // Handle DELETE request
}
```

### Component Pattern

```typescript
// components/gist-card.tsx
"use client"  // Client component

interface Props {
  // TypeScript interface
}

export function Component({ props }: Props) {
  // React hooks and logic
  return (
    // JSX
  )
}
```

### Page Pattern

```typescript
// app/page.tsx
"use client"  // or server component

export default function Page() {
  // Page logic
  return (
    // Page JSX
  )
}
```

## Security Considerations

### Authentication
- All protected routes use Clerk middleware
- API routes verify authentication server-side
- Private gists check ownership before access

### Data Validation
- Client-side validation with Zod schemas
- Server-side validation in API routes
- File size limits enforced (2KB max)
- File type validation

### Database Security
- MongoDB connection string in environment variables
- No direct database access from client
- ObjectId validation before queries
- Input sanitization

### File Upload Security
- File size limits (2KB)
- Cloudinary secure upload
- File type validation
- CDN delivery for performance

## Performance Optimizations

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component (disabled in config)
- **Lazy Loading**: React lazy for components
- **Memoization**: React.memo for expensive components
- **Skeleton Loaders**: Better perceived performance

### Backend
- **Database Indexing**: MongoDB indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection reuse
- **CDN**: Cloudinary CDN for file delivery
- **Caching**: Browser caching for static assets

### API Routes
- **Serverless**: Automatic scaling
- **Error Handling**: Comprehensive error responses
- **Validation**: Early validation to prevent unnecessary processing

## Scalability Considerations

### Current Limitations
- Single file upload per gist (2KB limit)
- No pagination on gist lists
- No search functionality
- No real-time updates

### Future Improvements
- **Pagination**: Implement cursor-based pagination
- **Search**: Add full-text search with MongoDB Atlas Search
- **Caching**: Redis for frequently accessed gists
- **CDN**: Vercel Edge Network for static assets
- **Real-time**: WebSocket support for live updates
- **Rate Limiting**: Prevent abuse with rate limiting
- **File Storage**: Support for larger files with S3

## Error Handling Strategy

### Client-Side
- Try-catch blocks in async functions
- Error boundaries for component errors
- Toast notifications for user feedback
- Fallback UI for error states

### Server-Side
- Try-catch in all API routes
- Detailed error logging
- Appropriate HTTP status codes
- Error messages in responses

### Database
- Connection error handling
- Query error handling
- Graceful degradation

## Testing Strategy

### Current State
- No automated tests (to be implemented)

### Recommended Tests
- **Unit Tests**: Jest for utility functions
- **Component Tests**: React Testing Library
- **API Tests**: Supertest for API routes
- **E2E Tests**: Playwright or Cypress
- **Integration Tests**: Database operations

## Deployment Architecture

### Vercel (Recommended)
- Automatic deployments from Git
- Edge Network for global CDN
- Serverless function scaling
- Environment variable management

### Database
- MongoDB Atlas for managed database
- Automatic backups
- Global clusters for low latency

### File Storage
- Cloudinary for CDN delivery
- Automatic image optimization
- Global edge locations

## Monitoring & Logging

### Current Implementation
- Console logging for debugging
- Error logging in API routes

### Recommended Additions
- **Error Tracking**: Sentry or similar
- **Analytics**: Vercel Analytics or Google Analytics
- **Performance Monitoring**: Vercel Speed Insights
- **Uptime Monitoring**: UptimeRobot or similar

## Development Workflow

1. **Local Development**
   - `npm run dev` for development server
   - Hot reload for instant feedback
   - Environment variables in `.env.local`

2. **Code Quality**
   - TypeScript for type safety
   - ESLint for code linting
   - Prettier for code formatting (recommended)

3. **Version Control**
   - Git for version control
   - Feature branches for new features
   - Pull requests for code review

4. **Deployment**
   - Automatic deployment on push to main
   - Preview deployments for pull requests
   - Production environment variables

## Future Architecture Considerations

### Microservices (if needed)
- Separate API service
- Separate file upload service
- Separate authentication service

### Real-time Features
- WebSocket server for live updates
- Server-Sent Events for notifications
- WebRTC for collaboration (future)

### Mobile Support
- React Native app
- Progressive Web App (PWA)
- Responsive design improvements

---

