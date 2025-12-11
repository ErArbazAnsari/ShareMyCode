import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/gists/public",
    "/api/gists/demo",
    "/gist/(.*)",
]);

export default clerkMiddleware((auth, req) => {
    // Bypass Clerk middleware for any requests to /api/gists (create, update, raw, etc.)
    if (req.nextUrl.pathname.startsWith("/api/gists")) {
        return;
    }

    if (!isPublicRoute(req)) {
        auth.protect();
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
