export function initSentry() {}

export function identifyUser(_userId: string, _l1?: string) {}

export function clearUser() {}

export function captureError(_error: unknown, _context?: Record<string, unknown>) {}

export function addBreadcrumb(
  _category: string,
  _message: string,
  _data?: Record<string, unknown>,
) {}
