import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);
const isDashboardRoute = createRouteMatcher([
  "/owner(.*)",
  "/tenant(.*)",
  "/manager(.*)",
  "/admin(.*)",
]);

export default convexAuthNextjsMiddleware(async (request) => {
  const signedIn = await isAuthenticatedNextjs();

  if (isDashboardRoute(request) && !signedIn) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
  if (isAuthRoute(request) && signedIn) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
