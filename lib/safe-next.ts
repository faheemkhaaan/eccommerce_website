// Only allow same-site paths as a post-login redirect.
// Blocks "https://evil.com" and "//evil.com" style open-redirect tricks.
export const safeNext = (n?: string | null) =>
    n && n.startsWith("/") && !n.startsWith("//") ? n : "/";