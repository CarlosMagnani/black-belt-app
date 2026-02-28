/**
 * Guesses the file extension for an image from its MIME type or URI.
 * Falls back to "jpg" when neither source yields a result.
 */
export const guessImageExt = (localUri: string, mimeType?: string | null): string => {
  const guessFromMime = (mime?: string | null): string | null => {
    const value = (mime ?? "").toLowerCase();
    if (!value.startsWith("image/")) return null;
    const subtype = value.slice("image/".length);
    if (subtype === "jpeg" || subtype === "jpg") return "jpg";
    if (subtype === "png") return "png";
    if (subtype === "webp") return "webp";
    if (subtype === "gif") return "gif";
    if (subtype === "heic") return "heic";
    if (subtype === "heif") return "heif";
    return null;
  };

  const guessFromUri = (uri: string): string | null => {
    const match = uri.toLowerCase().match(/\.([a-z0-9]{1,10})(?:$|[?#])/);
    if (!match?.[1]) return null;
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    if (!/^[a-z0-9]{1,10}$/.test(ext)) return null;
    return ext;
  };

  return guessFromMime(mimeType) ?? guessFromUri(localUri) ?? "jpg";
};
