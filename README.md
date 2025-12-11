# ShareMyCode 🚀

<div align="center">

![ShareMyCode Logo](./public/favicon.png)

**A modern, feature-rich platform for sharing and discovering code snippets**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)](https://clerk.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-blue?style=flat-square)](https://cloudinary.com/)

[Features](#-features) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [Core Features Explained](#-core-features-explained)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**ShareMyCode** is a modern, full-stack web application inspired by GitHub Gists, designed to make code sharing simple, beautiful, and accessible. Whether you're a developer looking to share a quick snippet, save code for later, or discover solutions from the community, ShareMyCode provides an intuitive platform with powerful features.

### What Makes ShareMyCode Special?

- ✨ **Beautiful UI/UX** - Modern, responsive design with dark/light theme support
- 🔒 **Secure Authentication** - Powered by Clerk for seamless user management
- 📝 **Rich Code Editor** - Custom code editor with line numbers, syntax highlighting, and customizable settings
- 🌐 **Public & Private Gists** - Share publicly or keep your code private
- 📎 **File Attachments** - Attach additional files to your gists (up to 200MB each)
- 👤 **User Profiles** - Showcase your gists with personalized profiles
- 📊 **View Tracking** - See how many times your gists have been viewed
- 🎨 **Theme Support** - Switch between light and dark modes seamlessly

---

## ✨ Features

### 🔐 Authentication & User Management
- **Clerk Integration** - Secure authentication with social login support
- **User Profiles** - Personalized profile pages showing all user gists
- **Session Management** - Automatic session handling and protection

### 📝 Gist Management
- **Create Gists** - Rich code editor with syntax highlighting
- **Edit Gists** - In-place editing with real-time updates
- **Delete Gists** - Secure deletion with confirmation dialogs
- **Public/Private Visibility** - Control who can see your code
- **View Counter** - Track how many times your gists are viewed

### 💻 Code Editor Features
- **Line Numbers** - Easy navigation with numbered lines
- **Tab Support** - Configurable tab size (2, 4, or 8 spaces)
- **Word Wrap** - Toggle word wrapping for long lines
- **Syntax Highlighting** - Beautiful code rendering
- **Copy to Clipboard** - One-click code copying
- **Download Code** - Download gists as files
- **Raw View** - View raw code without formatting

### 📎 File Attachments
- **Single File Upload** - Attach one file per gist
- **Cloudinary Storage** - Secure cloud storage for attachments
- **File Management** - Upload, view, and delete attachments
- **Download Support** - Download attached files directly

### 🎨 UI/UX Features
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme** - System-aware theme switching
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - Comprehensive error messages
- **Toast Notifications** - User-friendly feedback system

### 🔍 Discovery
- **Public Gists Feed** - Browse public code snippets
- **Demo Gists** - Example gists for non-authenticated users
- **User Profiles** - Explore gists by specific users
- **Search & Filter** - Find gists by language, user, or description

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database for gist storage
- **Clerk** - Authentication and user management
- **Cloudinary** - Cloud storage for file uploads

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (recommended: latest LTS version)
- **npm**, **yarn**, or **pnpm** package manager
- **MongoDB** database (local or cloud instance like MongoDB Atlas)
- **Clerk** account (for authentication)
- **Cloudinary** account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ShareMyCode.git
   cd ShareMyCode
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (see below)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Setting Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. Add them to your `.env.local` file

#### Setting Up MongoDB

1. Go to [mongodb.com](https://www.mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user
3. Get your connection string
4. Replace `<password>` with your actual password
5. Add the connection string to your `.env.local` file

#### Setting Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Navigate to your dashboard
3. Copy your cloud name, API key, and API secret
4. Add them to your `.env.local` file

### Running the Application

#### Development Mode
```bash
npm run dev
```
Starts the development server with hot-reload at `http://localhost:3000`

#### Production Build
```bash
npm run build
npm start
```
Creates an optimized production build and starts the server

#### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality issues

---

## 📁 Project Structure

```
ShareMyCode/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   └── gists/                # Gist-related endpoints
│   │       ├── [id]/             # Individual gist operations
│   │       │   ├── [filename]/   # Raw file endpoint
│   │       │   ├── raw/          # Raw code endpoint
│   │       │   └── route.ts      # GET, PATCH, DELETE
│   │       ├── demo/             # Demo gists endpoint
│   │       ├── public/           # Public gists endpoint
│   │       ├── user/             # User-specific gists
│   │       │   └── [userId]/     # Get gists by user ID
│   │       └── route.ts         # POST (create gist)
│   ├── create/                   # Create gist page
│   │   └── page.tsx
│   ├── gist/                     # Gist detail page
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── not-found.tsx
│   ├── profile/                  # User profile page
│   │   └── [userId]/
│   │       └── page.tsx
│   ├── sign-in/                  # Sign in page
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   ├── sign-up/                  # Sign up page
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...                   # More UI components
│   ├── code-editor.tsx           # Code editor component
│   ├── gist-card.tsx             # Gist card component
│   ├── navbar.tsx                # Navigation bar
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Theme switcher
├── hooks/                        # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                          # Utility libraries
│   ├── models/                   # TypeScript models
│   │   └── gist.ts               # Gist data model
│   ├── cloudinary.ts             # Cloudinary integration
│   ├── mongodb.ts                # MongoDB connection
│   └── utils.ts                  # Utility functions
├── middleware.ts                 # Next.js middleware (auth)
├── public/                       # Static assets
│   ├── favicon.png
│   └── ...
├── styles/                       # Additional styles
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🎨 Core Features Explained
 📎 **File Attachments** - Attach additional files to your gists (up to 200MB each)
### 1. Authentication Flow

 **Large File Support**: Up to 200MB files supported
- **Social Login** - Sign in with Google, GitHub, etc.
- **Email/Password** - Traditional authentication
- **Session Management** - Automatic session handling
- **Protected Routes** - Middleware-based route protection

**Protected Routes:**
- `/create` - Requires authentication
- `/profile/[userId]` - Requires authentication
- `/api/gists` (POST) - Requires authentication

**Public Routes:**
- `/` - Home page (shows demo gists for non-authenticated users)
- `/gist/[id]` - View public gists
- `/api/gists/public` - Public gists API
- `/api/gists/demo` - Demo gists API

### 2. Gist Creation Flow

1. User clicks "Create New Gist" button
2. Redirected to `/create` page (requires authentication)
3. User fills in:
   - **Description** - Optional description of the gist
   - **Filename** - Filename with extension (e.g., `example.js`)
   - **Code** - The actual code content
   - **Visibility** - Public or Private
   - **Attachments** - Optional file upload 
4. Form submission sends data to `/api/gists` (POST)
5. Server:
   - Validates authentication
   - Uploads file to Cloudinary (if provided)
   - Saves gist to MongoDB
   - Returns gist ID
6. User redirected to `/gist/[id]` to view the created gist

### 3. Gist Viewing Flow

1. User navigates to `/gist/[id]`
2. Client fetches gist from `/api/gists/[id]` (GET)
3. Server:
   - Checks if gist exists
   - Validates visibility (private gists require ownership)
   - Increments view counter
   - Returns gist data
4. Client displays:
   - Gist metadata (author, date, views)
   - Code with line numbers
   - Attachments (if any)
   - Edit/Delete buttons (if owner)

### 4. File Upload System

- **Storage**: Cloudinary cloud storage
- **Limits**: 
  - Maximum files per gist: 1
- **Supported Types**: All file types
- **Process**:
  1. User selects file in create/edit form
  2. File validated (size check)
  3. Uploaded to Cloudinary
  4. URL stored in MongoDB
  5. File accessible via Cloudinary CDN

### 5. Theme System

- **Implementation**: `next-themes` library
- **Modes**: Light, Dark, System
- **Persistence**: Theme preference saved in localStorage
- **Components**: All components support both themes via Tailwind CSS classes

---

## 🗄️ Database Schema

### Gist Collection (`user_gist`)

```typescript
{
  _id: ObjectId                    // MongoDB document ID
  userId: string                   // Clerk user ID
  user_fullName: string            // User's full name
  gistViews: number                // View counter
  gistDescription: string          // Gist description
  fileNameWithExtension: string    // Filename with extension
  gistCode: string                 // The actual code
  sharedFile: SharedFile[]         // Array of attached files
  visibility: "public" | "private" // Visibility setting
  createdAt: Date                  // Creation timestamp
  updatedAt: Date                  // Last update timestamp
  userImageUrl?: string            // Optional user image URL
}
```

### SharedFile Interface

```typescript
{
  fileName: string    // Original filename
  fileUrl: string    // Cloudinary CDN URL
  fileSize: number   // File size in bytes
  uploadedAt: Date   // Upload timestamp
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Vercel will automatically detect Next.js

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in minutes!

### Other Platforms

ShareMyCode can be deployed to any platform that supports Next.js:
- **Netlify** - Similar to Vercel
- **AWS Amplify** - AWS hosting
- **Railway** - Simple deployment
- **DigitalOcean App Platform** - Cloud hosting
- **Self-hosted** - Docker, PM2, etc.

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL` (for production URL)

### Production Monitoring

- **Health Check**: `GET /api/health` - Monitor service status
- **Large File Support**: Up to 200MB files supported
- **Error Logging**: All errors are logged to console
- **Performance**: Optimized with SWC minification and compression

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run build
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Link any related issues
   - Request review from maintainers

### Code Style

- Use TypeScript for all new files
- Follow the existing component structure
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### Reporting Issues

If you find a bug or have a feature request:
1. Check if the issue already exists
2. Create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if applicable)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Clerk](https://clerk.com/) - Authentication made easy
- [MongoDB](https://www.mongodb.com/) - Database solution
- [Cloudinary](https://cloudinary.com/) - Cloud storage
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">


⭐ Star this repo if you find it helpful!

</div>

