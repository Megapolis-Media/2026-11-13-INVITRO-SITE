export function studioAuthorization(username: string, secret: string) {
  if (!username) return `Bearer ${secret}`;
  const credentials = new TextEncoder().encode(`${username}:${secret}`);
  return `Basic ${btoa(String.fromCharCode(...credentials))}`;
}
