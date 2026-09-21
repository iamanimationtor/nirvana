export function siteUrl() {
  const value = process.env.APP_URL || process.env.URL || "http://localhost:3000";
  return value.replace(/\/$/, "");
}
