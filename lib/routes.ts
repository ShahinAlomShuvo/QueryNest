/**
 * Application routes configuration
 */
export const routes = {
  // Public routes
  home: "/",
  login: "/login",
  register: "/register",

  // Protected routes
  chat: "/chat",
  settings: "/settings",
} as const;

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  routes.home,
  routes.login,
  routes.register,
] as const;
