export function isEmailSignUpPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, "").endsWith("/sign-up/email");
}
