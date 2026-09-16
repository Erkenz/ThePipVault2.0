import { describe, it, expect } from 'vitest';
import { generateCaptchaChallenge, verifyCaptchaAnswer } from './captcha';
import crypto from 'crypto';

describe('Captcha Utility', () => {
  it('generates a valid challenge with SVG and HMAC token', () => {
    const challenge = generateCaptchaChallenge();

    expect(challenge).toBeDefined();
    expect(challenge.token).toContain('.');
    expect(challenge.svg).toContain('<svg');
    expect(challenge.svg).toContain('</svg>');
    expect(challenge.textPrompt).toBeDefined();
  });

  it('validates a correct captcha answer successfully', () => {
    // Generate a challenge
    const challenge = generateCaptchaChallenge();

    // Decode token payload to get the answer for testing
    const [payloadStr] = challenge.token.split('.');
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));

    // Verify correct answer (case-insensitive)
    const result = verifyCaptchaAnswer(challenge.token, payload.answer.toUpperCase(), 0);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects an incorrect captcha answer', () => {
    const challenge = generateCaptchaChallenge();

    const result = verifyCaptchaAnswer(challenge.token, 'WRONG', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Incorrect verification code/i);
  });

  it('rejects empty or missing tokens', () => {
    expect(verifyCaptchaAnswer(null, 'ABCDE').valid).toBe(false);
    expect(verifyCaptchaAnswer('', 'ABCDE').valid).toBe(false);
    expect(verifyCaptchaAnswer('invalid-token', 'ABCDE').valid).toBe(false);
  });

  it('rejects tampered tokens', () => {
    const challenge = generateCaptchaChallenge();
    const [payloadStr] = challenge.token.split('.');

    // Tamper with payload
    const tamperedPayload = Buffer.from(
      JSON.stringify({ answer: 'hackd', iat: Date.now(), exp: Date.now() + 100000 })
    ).toString('base64url');

    // Reattach original signature
    const [, originalSig] = challenge.token.split('.');
    const tamperedToken = `${tamperedPayload}.${originalSig}`;

    const result = verifyCaptchaAnswer(tamperedToken, 'hackd', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/tampering/i);
  });

  it('rejects expired tokens', () => {
    const secret = process.env.CAPTCHA_SECRET || process.env.SERVICE_KEY || 'pipvault-secure-anti-bot-captcha-secret-2026';
    const expiredPayload = {
      answer: 'abcde',
      iat: Date.now() - 20 * 60 * 1000,
      exp: Date.now() - 10 * 60 * 1000, // expired 10 mins ago
    };

    const payloadStr = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url');
    const token = `${payloadStr}.${signature}`;

    const result = verifyCaptchaAnswer(token, 'abcde', 0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/expired/i);
  });
});
