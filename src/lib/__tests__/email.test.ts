import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

vi.mock('@/lib/emailTemplates', () => ({
  welcomeEmailHtml: vi.fn((email: string, locale: string) => `<html>${email}-${locale}</html>`),
}));

import { sendWelcomeEmail } from '@/lib/email';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sendWelcomeEmail', () => {
  it('is a function that accepts email and locale', () => {
    expect(typeof sendWelcomeEmail).toBe('function');
  });

  describe('when RESEND_API_KEY is not set', () => {
    const originalKey = process.env.RESEND_API_KEY;

    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    afterEach(() => {
      if (originalKey !== undefined) {
        process.env.RESEND_API_KEY = originalKey;
      }
    });

    it('skips sending and does not throw', async () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await expect(sendWelcomeEmail('test@example.com')).resolves.toBeUndefined();
      expect(mockSend).not.toHaveBeenCalled();

      infoSpy.mockRestore();
    });
  });

  describe('when RESEND_API_KEY is set', () => {
    const originalKey = process.env.RESEND_API_KEY;

    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      if (originalKey !== undefined) {
        process.env.RESEND_API_KEY = originalKey;
      } else {
        delete process.env.RESEND_API_KEY;
      }
    });

    it('sends an email with correct parameters', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await sendWelcomeEmail('user@example.com', 'en');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Welcome to AI Educademy! 🎓',
          html: expect.stringContaining('user@example.com'),
        }),
      );

      infoSpy.mockRestore();
    });

    it('uses locale-specific subject for French', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-456' }, error: null });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await sendWelcomeEmail('user@example.com', 'fr');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Bienvenue sur AI Educademy ! 🎓',
        }),
      );

      infoSpy.mockRestore();
    });

    it('defaults to English locale when not specified', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-789' }, error: null });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await sendWelcomeEmail('user@example.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to AI Educademy! 🎓',
        }),
      );

      infoSpy.mockRestore();
    });

    it('falls back to English subject for unknown locale', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-000' }, error: null });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await sendWelcomeEmail('user@example.com', 'zz');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to AI Educademy! 🎓',
        }),
      );

      infoSpy.mockRestore();
    });

    it('handles API error response without throwing', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Rate limited' } });

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(sendWelcomeEmail('user@example.com')).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it('handles send throwing an exception without crashing', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(sendWelcomeEmail('user@example.com')).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it('uses RESEND_FROM_EMAIL when set', async () => {
      process.env.RESEND_FROM_EMAIL = 'Custom <noreply@custom.com>';
      mockSend.mockResolvedValue({ data: { id: 'msg-custom' }, error: null });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      await sendWelcomeEmail('user@example.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Custom <noreply@custom.com>',
        }),
      );

      delete process.env.RESEND_FROM_EMAIL;
      infoSpy.mockRestore();
    });
  });
});
