# ShareMyCode

A modern web application built with Next.js, TypeScript, and Tailwind CSS for sharing and collaborating on code snippets.

## 🚀 Features

- Modern UI with Radix UI components
- Dark/Light theme support
- Responsive design
- Code syntax highlighting
- Form validation with Zod
- Authentication with Clerk
- MongoDB integration
- Cloud storage with Cloudinary

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Authentication:** Clerk
- **Database:** MongoDB
- **Storage:** Cloudinary
- **Form Handling:** React Hook Form + Zod
- **State Management:** React Hooks

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ShareMyCode.git
cd ShareMyCode
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🚀 Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Build

To build the project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🚀 Production

To start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## 📝 Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/ShareMyCode/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Clerk](https://clerk.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
