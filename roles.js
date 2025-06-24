// List of user email addresses allowed to access admin features
export const ADMIN_EMAILS = ['admin@example.com'];
export function isAdmin(user) {
  return !!(user && ADMIN_EMAILS.includes(user.email));
}
