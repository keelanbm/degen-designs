import { authMiddleware } from '@clerk/nextjs/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/", 
    "/:slug",
    "/api/health(.*)",
    "/api/webhooks(.*)"
  ],
  
  // Remove admin routes from ignoredRoutes since we need auth() to work there
  // We'll handle access control in the layout component
  ignoredRoutes: [
    // Paths that don't need authentication checks at all
    "/api/public/(.*)"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};