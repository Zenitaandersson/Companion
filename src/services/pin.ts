/** Hashes a carer PIN with SHA-256 so it is never stored as plain text. */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`companion:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return (await hashPin(pin)) === hash;
}

export const PIN_LENGTH = 4;
