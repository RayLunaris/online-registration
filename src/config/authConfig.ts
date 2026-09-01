/**
 * Admin Authentication & Routing Configuration
 * 
 * Direct URL Routing:
 * - URL login standar: /admin/login (dapat dikustomisasi via VITE_ADMIN_LOGIN_PATH di .env)
 */

export const ADMIN_AUTH_CONFIG = {
  // Path to access login page (default /admin/login, dapat di-override di .env)
  loginPath: (import.meta.env.VITE_ADMIN_LOGIN_PATH as string) || '/admin/login',

  // Keyboard shortcut: Ctrl + Shift + A (atau Cmd + Shift + A di Mac)
  shortcutKey: 'a',

  // Helper untuk memastikan format URL valid diawali slash
  getLoginPath(): string {
    const path = this.loginPath.trim();
    return path.startsWith('/') ? path : `/${path}`;
  },
};
