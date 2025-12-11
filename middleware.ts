import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/gists/public",
    "/api/gists/demo",
    "/gist/(.*)",
]);

const isUploadRoute = createRouteMatcher([
    "/api/gists/upload(.*)",
]);

export default clerkMiddleware((auth, req) => {
    // Skip middleware entirely for upload routes to avoid body size limits
    if (isUploadRoute(req)) {
        return;
    }
    
    if (!isPublicRoute(req)) {
        auth.protect();
    }
});

export const config = {
    matcher: [
        // Exclude upload routes from middleware processing to avoid body size limits
        "/((?!api/gists/upload)(?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Apply to API routes except upload
        "/(api(?!/gists/upload)|trpc)(.*)",
    ],
};
