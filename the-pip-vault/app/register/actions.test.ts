import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerAction, getCaptchaChallengeAction } from './actions';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (name: string) => (name === 'host' ? 'localhost:3000' : 'http'),
  }),
}));

// Mock supabase server client
const mockSignUp = vi.fn().mockResolvedValue({
  data: { user: { id: 'test-user-id' }, session: null },
  error: null,
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

vi.mock('@/utils/supabase/admin', () => ({
  getAdminClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

describe('Register Action Bot Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks registration when honeypot field is filled by bots', async () => {
    const formData = new FormData();
    formData.append('email', 'bot@spambot.com');
    formData.append('password', 'ValidPass123!');
    formData.append('confirmPassword', 'ValidPass123!');
    formData.append('website_hp', 'http://spamurl.com'); // Bot filled honeypot

    const result = await registerAction(formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/automated registration/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('blocks registration when submitted in under 1.5 seconds (automated script)', async () => {
    const formData = new FormData();
    formData.append('email', 'instant@spambot.com');
    formData.append('password', 'ValidPass123!');
    formData.append('confirmPassword', 'ValidPass123!');
    formData.append('formRenderTime', String(Date.now())); // Submitted in 0ms

    const result = await registerAction(formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/too fast/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('blocks registration when captcha is missing or invalid', async () => {
    const formData = new FormData();
    formData.append('email', 'user@example.com');
    formData.append('password', 'ValidPass123!');
    formData.append('confirmPassword', 'ValidPass123!');
    formData.append('formRenderTime', String(Date.now() - 5000)); // 5s elapsed
    formData.append('captchaToken', 'invalid.token');
    formData.append('captchaAnswer', 'ABCDE');

    const result = await registerAction(formData);

    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/security token|verification code/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('allows registration when valid captcha is provided', async () => {
    const challenge = await getCaptchaChallengeAction();
    const [payloadStr] = challenge.token.split('.');
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));

    const formData = new FormData();
    formData.append('email', 'legituser@example.com');
    formData.append('password', 'ValidPass123!');
    formData.append('confirmPassword', 'ValidPass123!');
    formData.append('formRenderTime', String(Date.now() - 5000));
    formData.append('captchaToken', challenge.token);
    formData.append('captchaAnswer', payload.answer);

    const result = await registerAction(formData);

    expect(result).toHaveProperty('success', true);
    expect(mockSignUp).toHaveBeenCalled();
  });
});
