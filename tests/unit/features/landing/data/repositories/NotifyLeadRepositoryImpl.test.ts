/**
 * NotifyLeadRepositoryImpl Tests
 *
 * Clean Architecture: Data Layer Tests
 * Uses NotifyLeadDataSource — the single lead entry point (D13).
 */

import { NotifyLeadRepositoryImpl } from '@/features/landing/data/repositories/NotifyLeadRepositoryImpl';
import type { NotifyLeadDataSource } from '@/features/landing/data/datasources/NotifyLeadDataSource';
import { LeadEntity } from '@/features/landing/domain/entities';

function buildLead(): LeadEntity {
  return new LeadEntity({
    name: 'Ada Lovelace',
    company: 'Analytical Engines Inc',
    email: 'ada@example.com',
    service: 'Consultoría IA',
    message: 'Hola, quiero más info',
  });
}

describe('NotifyLeadRepositoryImpl', () => {
  it('maps the Lead fields onto the email payload', async () => {
    const sendLead = jest.fn().mockResolvedValue(true);
    const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
    const repository = new NotifyLeadRepositoryImpl(dataSource);

    await repository.submitLead(buildLead());

    expect(sendLead).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ada Lovelace',
        company: 'Analytical Engines Inc',
        email: 'ada@example.com',
        service: 'Consultoría IA',
        message: 'Hola, quiero más info',
      }),
    );
  });

  it('stamps submittedAt as an ISO-8601 string', async () => {
    const sendLead = jest.fn().mockResolvedValue(true);
    const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
    const repository = new NotifyLeadRepositoryImpl(dataSource);

    await repository.submitLead(buildLead());

    const [payload] = sendLead.mock.calls[0];
    expect(payload.submittedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it('passes through the boolean result from the data source', async () => {
    const sendLead = jest.fn().mockResolvedValue(false);
    const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
    const repository = new NotifyLeadRepositoryImpl(dataSource);

    const result = await repository.submitLead(buildLead());

    expect(result).toBe(false);
  });

  describe('anti-bot meta passthrough (sdd/notify-lead-antibot, D12)', () => {
    it('includes website and elapsedMs in the payload when meta is provided', async () => {
      const sendLead = jest.fn().mockResolvedValue(true);
      const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
      const repository = new NotifyLeadRepositoryImpl(dataSource);

      await repository.submitLead(buildLead(), { website: '', elapsedMs: 4200 });

      const [payload] = sendLead.mock.calls[0];
      expect(payload.website).toBe('');
      expect(payload.elapsedMs).toBe(4200);
    });

    it('still sends a 0ms elapsedMs (falsy but valid) rather than dropping it', async () => {
      const sendLead = jest.fn().mockResolvedValue(true);
      const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
      const repository = new NotifyLeadRepositoryImpl(dataSource);

      await repository.submitLead(buildLead(), { website: '', elapsedMs: 0 });

      const [payload] = sendLead.mock.calls[0];
      expect(payload.elapsedMs).toBe(0);
    });

    it('omits website/elapsedMs from the payload when no meta is provided (backward compatible)', async () => {
      const sendLead = jest.fn().mockResolvedValue(true);
      const dataSource = { sendLead } as unknown as NotifyLeadDataSource;
      const repository = new NotifyLeadRepositoryImpl(dataSource);

      await repository.submitLead(buildLead());

      const [payload] = sendLead.mock.calls[0];
      expect(payload.website).toBeUndefined();
      expect(payload.elapsedMs).toBeUndefined();
    });
  });
});
