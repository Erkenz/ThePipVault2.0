import crypto from 'crypto';

const CAPTCHA_SECRET = 
  process.env.CAPTCHA_SECRET || 
  process.env.SERVICE_KEY || 
  'pipvault-secure-anti-bot-captcha-secret-2026';

export interface CaptchaChallenge {
  token: string;
  svg: string;
  textPrompt?: string;
}

/**
 * Characters used for visual captcha (excludes easily confused chars like 0, O, 1, I, l)
 */
const CHARACTERS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(length = 5): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[idx];
  }
  return code;
}

/**
 * Generates an SVG string representation of the captcha code with noise,
 * wavy strike-throughs, and distorted character placement to prevent OCR bots.
 */
function renderCaptchaSvg(code: string): string {
  const width = 160;
  const height = 48;
  const chars = code.split('');

  // Randomized background lines (noise)
  let noiseLines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(width - Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const strokeColor = i % 2 === 0 ? '#cbd5e1' : '#e2e8f0';
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="1.5" stroke-linecap="round" />`;
  }

  // Noise dots
  let noiseDots = '';
  for (let i = 0; i < 18; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = Math.random() * 1.5 + 0.5;
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" opacity="0.4" />`;
  }

  // Wavy stroke line across text
  const waveY1 = Math.floor(Math.random() * 10) + 18;
  const waveY2 = Math.floor(Math.random() * 10) + 24;
  const wavePath = `<path d="M 5 ${waveY1} Q 40 ${waveY2} 80 ${height - waveY1} T 155 ${height - waveY2}" fill="none" stroke="#64748b" stroke-width="1.2" opacity="0.6" />`;

  // Render individual distorted characters
  const charElements = chars
    .map((char, index) => {
      const x = 20 + index * 26 + (Math.random() * 4 - 2);
      const y = 32 + (Math.random() * 6 - 3);
      const rotate = Math.floor(Math.random() * 30 - 15);
      const colors = ['#0f172a', '#1e293b', '#334155', '#475569', '#09090b'];
      const color = colors[index % colors.length];
      return `<text x="${x}" y="${y}" font-family="monospace, sans-serif" font-size="22" font-weight="bold" fill="${color}" transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
    })
    .join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #f8fafc; border-radius: 6px; user-select: none;">
      <rect width="100%" height="100%" fill="#f8fafc" rx="6" />
      ${noiseLines}
      ${noiseDots}
      ${wavePath}
      ${charElements}
    </svg>
  `.trim();
}

/**
 * Creates a signed challenge token containing the answer and expiration time.
 */
export function generateCaptchaChallenge(): CaptchaChallenge {
  const code = generateRandomCode(5);
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  const payloadObj = {
    answer: code.toLowerCase(),
    iat: now,
    exp: expiresAt,
  };

  const payloadStr = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', CAPTCHA_SECRET)
    .update(payloadStr)
    .digest('base64url');

  const token = `${payloadStr}.${signature}`;
  const svg = renderCaptchaSvg(code);

  return {
    token,
    svg,
    textPrompt: 'Type the 5 characters shown above',
  };
}

export interface VerifyCaptchaResult {
  valid: boolean;
  error?: string;
}

/**
 * Verifies a submitted captcha answer against the HMAC-signed token.
 */
export function verifyCaptchaAnswer(
  token: string | null | undefined,
  userAnswer: string | null | undefined,
  minSolveTimeMs = 800
): VerifyCaptchaResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Security challenge is missing. Please solve the captcha.' };
  }

  if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) {
    return { valid: false, error: 'Please enter the verification code.' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid security token format. Please refresh.' };
  }

  const [payloadStr, signature] = parts;

  // 1. Verify HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', CAPTCHA_SECRET)
    .update(payloadStr)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: 'Security token tampering detected. Please refresh.' };
  }

  // 2. Decode and parse payload
  let payload: { answer: string; iat: number; exp: number };
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
  } catch {
    return { valid: false, error: 'Failed to decode security token.' };
  }

  const now = Date.now();

  // 3. Check expiration
  if (now > payload.exp) {
    return { valid: false, error: 'Security challenge has expired. Please refresh and try again.' };
  }

  // 4. Inhuman speed check
  if (now - payload.iat < minSolveTimeMs) {
    return { valid: false, error: 'Automated script detected. Please solve the challenge normally.' };
  }

  // 5. Check answer match
  const sanitizedUserAnswer = userAnswer.trim().toLowerCase();
  if (sanitizedUserAnswer !== payload.answer) {
    return { valid: false, error: 'Incorrect verification code. Please try again.' };
  }

  return { valid: true };
}

/**
 * Optional Cloudflare Turnstile token verification
 */
export async function verifyCloudflareTurnstile(
  token: string,
  remoteIp?: string
): Promise<VerifyCaptchaResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return { valid: true }; // Turnstile not enforced if secret key not configured
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    if (data.success) {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'Cloudflare verification failed. Please try again.',
    };
  } catch (err: any) {
    console.error('Cloudflare Turnstile verification error:', err);
    return {
      valid: false,
      error: 'Security challenge verification error. Please retry.',
    };
  }
}
