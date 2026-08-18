/**
 * Settings Entity Tests
 *
 * Clean Architecture: Domain Layer Tests
 */

import { Settings } from '@/features/admin/domain/entities/Settings';

describe('Settings Entity', () => {
  describe('createDefault', () => {
    it('should default n8nEnabled to false', () => {
      const settings = Settings.createDefault();

      expect(settings.n8nEnabled).toBe(false);
    });
  });

  describe('create', () => {
    it('should set n8nEnabled from props', () => {
      const now = new Date();
      const settings = Settings.create({
        id: 'global',
        n8nWebhookUrl: 'https://n8n.example.com/webhook',
        n8nEnabled: true,
        contactEmail: 'contact@example.com',
        whatsappPhone: '',
        physicalAddress: '',
        createdAt: now,
        updatedAt: now,
      });

      expect(settings.n8nEnabled).toBe(true);
    });
  });

  describe('withUpdates', () => {
    it('should turn n8nEnabled OFF when updating with false (?? not ||)', () => {
      const now = new Date();
      const enabled = Settings.create({
        id: 'global',
        n8nWebhookUrl: 'https://n8n.example.com/webhook',
        n8nEnabled: true,
        contactEmail: 'contact@example.com',
        whatsappPhone: '',
        physicalAddress: '',
        createdAt: now,
        updatedAt: now,
      });

      const disabled = enabled.withUpdates({ n8nEnabled: false });

      expect(disabled.n8nEnabled).toBe(false);
    });

    it('should preserve n8nEnabled when not included in the update', () => {
      const now = new Date();
      const enabled = Settings.create({
        id: 'global',
        n8nWebhookUrl: 'https://n8n.example.com/webhook',
        n8nEnabled: true,
        contactEmail: 'contact@example.com',
        whatsappPhone: '',
        physicalAddress: '',
        createdAt: now,
        updatedAt: now,
      });

      const updated = enabled.withUpdates({ contactEmail: 'new@example.com' });

      expect(updated.n8nEnabled).toBe(true);
      expect(updated.contactEmail).toBe('new@example.com');
    });
  });
});
