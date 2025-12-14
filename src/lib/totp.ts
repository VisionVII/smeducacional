import crypto from 'crypto';

// Base32 decode (RFC 4648)
function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = input.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  let bits = '';
  for (const c of cleaned) {
    const val = alphabet.indexOf(c);
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(
  secretBase32: string,
  step: number = 30,
  digits: number = 6
): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  let counter = Math.floor(epoch / step);
  const buf = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter >>= 8;
  }
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = (code % 10 ** digits).toString().padStart(digits, '0');
  return otp;
}

export function verifyTOTP(
  secretBase32: string,
  token: string,
  window: number = 1,
  step: number = 30,
  digits: number = 6
): boolean {
  // allow +/- window steps
  const epoch = Math.floor(Date.now() / 1000);
  const current = Math.floor(epoch / step);
  for (let w = -window; w <= window; w++) {
    const counter = current + w;
    const buf = Buffer.alloc(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
      buf[i] = c & 0xff;
      c >>= 8;
    }
    const key = base32Decode(secretBase32);
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const otp = (code % 10 ** digits).toString().padStart(digits, '0');
    if (otp === token) return true;
  }
  return false;
}

export function generateSecretBase32(bytes: number = 20): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const random = crypto.randomBytes(bytes);
  // base32 encode
  let bits = '';
  for (const b of random) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    if (chunk.length < 5) out += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
    else out += alphabet[parseInt(chunk, 2)];
  }
  // pad to multiple of 8
  while (out.length % 8 !== 0) out += '=';
  return out;
}

export function buildOtpauthURL(
  secretBase32: string,
  email: string,
  issuer: string = 'SMEducacional'
): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const query = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}
