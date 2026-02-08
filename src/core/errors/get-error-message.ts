type ErrorLike = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

export function getErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === "string") return err;

  if (typeof err === "object") {
    const { message, details, hint, code } = err as ErrorLike;
    const parts = [
      code ? `[${String(code)}]` : null,
      message ? String(message) : null,
      details ? String(details) : null,
      hint ? String(hint) : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : fallback;
  }

  return fallback;
}

