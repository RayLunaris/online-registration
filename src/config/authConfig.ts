/**
 * Admin Authentication & Portal Entry Configuration
 * 
 * Sesuai standar keamanan web profesional:
 * 1. Path login admin tidak menggunakan path umum (/admin/login).
 * 2. Path dapat dikustomisasi melalui .env (VITE_ADMIN_LOGIN_PATH).
 * 3. Default path rahasia: /portal-panitia
 */

export const ADMIN_AUTH_CONFIG = {
  // Secret path to access login page (bisa diubah di .env)
  loginPath: (import.meta.env.VITE_ADMIN_LOGIN_PATH as string) || '/portal-panitia',

  // Keyboard shortcut: Ctrl + Shift + A (atau Cmd + Shift + A di Mac)
  shortcutKey: 'a',

  // Helper untuk memastikan format URL valid diawali slash
  getLoginPath(): string {
    const path = this.loginPath.trim();
    return path.startsWith('/') ? path : `/${path}`;
  },
};
