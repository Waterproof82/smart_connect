/**
 * settingsSchema Tests
 *
 * Clean Architecture: Presentation Layer Tests
 */

import { settingsSchema } from '@/features/admin/presentation/schemas/settingsSchema';

const baseValidData = {
  n8nWebhookUrl: 'https://n8n.example.com/webhook',
  n8nEnabled: false,
  contactEmail: 'contact@example.com',
  whatsappPhone: '',
  physicalAddress: '',
};

describe('settingsSchema', () => {
  it('should require n8nEnabled as a boolean field', () => {
    const result = settingsSchema.safeParse(baseValidData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.n8nEnabled).toBe(false);
    }
  });

  it('should reject a non-boolean n8nEnabled value', () => {
    const result = settingsSchema.safeParse({
      ...baseValidData,
      n8nEnabled: 'yes',
    });

    expect(result.success).toBe(false);
  });

  it('should flag n8nWebhookUrl when n8nEnabled is true and the URL is empty', () => {
    const result = settingsSchema.safeParse({
      ...baseValidData,
      n8nEnabled: true,
      n8nWebhookUrl: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const urlIssue = result.error.issues.find((issue) =>
        issue.path.includes('n8nWebhookUrl')
      );
      expect(urlIssue).toBeDefined();
    }
  });

  it('should pass when n8nEnabled is true and n8nWebhookUrl is a valid URL', () => {
    const result = settingsSchema.safeParse({
      ...baseValidData,
      n8nEnabled: true,
      n8nWebhookUrl: 'https://n8n.example.com/webhook',
    });

    expect(result.success).toBe(true);
  });

  it('should pass when n8nEnabled is false even if n8nWebhookUrl is empty', () => {
    const result = settingsSchema.safeParse({
      ...baseValidData,
      n8nEnabled: false,
      n8nWebhookUrl: '',
    });

    expect(result.success).toBe(true);
  });
});
