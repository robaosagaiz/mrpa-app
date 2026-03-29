const ADMIN_EMAIL = "robsonachamon@gmail.com"
const ADMIN_PASSWORD = "robnelson"

export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export function isAdminAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || ""
  return cookieHeader.includes("mrpa_admin_session=authenticated")
}
