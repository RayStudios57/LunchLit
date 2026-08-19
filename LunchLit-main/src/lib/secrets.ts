// Hidden redemption + secret-unlock helpers for LunchLIT

// The exact, case-sensitive redemption code (revealed via the secret rickroll page)
export const MATRIX_CODE = "YOUDIDN'TFALLFORIT:(";

const MATRIX_KEY = 'lunchlit_matrix_unlocked';
const CODE_REDEEMED_KEY = 'lunchlit_code_redeemed';
const VISITED_VIEWS_KEY = 'lunchlit_visited_views';
const SECRET_WARNING_KEY = 'lunchlit_secret_warning_seen';

export function isMatrixUnlocked(): boolean {
  return localStorage.getItem(MATRIX_KEY) === 'true';
}

export function isCodeRedeemed(): boolean {
  return localStorage.getItem(CODE_REDEEMED_KEY) === 'true';
}

/** Returns true if the code was correct */
export function redeemSecretCode(input: string): boolean {
  if (input === MATRIX_CODE) {
    localStorage.setItem(MATRIX_KEY, 'true');
    localStorage.setItem(CODE_REDEEMED_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
    return true;
  }
  return false;
}

export function markSecretWarningSeen() {
  localStorage.setItem(SECRET_WARNING_KEY, 'true');
  window.dispatchEvent(new Event('secret-unlock'));
}

export function hasSeenSecretWarning(): boolean {
  return localStorage.getItem(SECRET_WARNING_KEY) === 'true';
}

// ── Deep Diver: track which core views have been visited ──
const CORE_VIEWS = [
  'home', 'menu', 'classes', 'bragsheet', 'portfolio',
  'tasks', 'discuss', 'study', 'chat', 'tutor', 'profiles', 'settings',
];

export function recordViewVisit(view: string) {
  try {
    const raw = localStorage.getItem(VISITED_VIEWS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(view)) {
      set.push(view);
      localStorage.setItem(VISITED_VIEWS_KEY, JSON.stringify(set));
      window.dispatchEvent(new Event('secret-unlock'));
    }
  } catch {
    /* ignore */
  }
}

export function hasVisitedAllViews(): boolean {
  try {
    const raw = localStorage.getItem(VISITED_VIEWS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    return CORE_VIEWS.every((v) => set.includes(v));
  } catch {
    return false;
  }
}

// ── En Passant: detect that the dev console was opened ──
const CONSOLE_KEY = 'lunchlit_console_opened';
export function markConsoleOpened() {
  if (localStorage.getItem(CONSOLE_KEY) !== 'true') {
    localStorage.setItem(CONSOLE_KEY, 'true');
    window.dispatchEvent(new Event('secret-unlock'));
  }
}
export function wasConsoleOpened(): boolean {
  return localStorage.getItem(CONSOLE_KEY) === 'true';
}

export const OWNER_EMAIL = 'kutturam0912@gmail.com';

/** A friendly, copyable friend code / UID derived from the user id */
export function friendCodeFromUserId(userId?: string | null): string {
  if (!userId) return 'LIT-000000';
  const clean = userId.replace(/-/g, '').toUpperCase();
  return `LIT-${clean.slice(0, 3)}${clean.slice(6, 9)}`;
}
