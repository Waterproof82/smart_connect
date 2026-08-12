/**
 * EmailLeadRepositoryImpl Tests
 *
 * Clean Architecture: Data Layer Tests
 * Mirrors LeadRepositoryImpl's shape (design ADR-5) but for the email channel.
 */

import { EmailLeadRepositoryImpl } from '@/features/landing/data/repositories/EmailLeadRepositoryImpl';
import type { EmailNotifyDataSource } from '@/features/landing/data/datasources/EmailNotifyDataSource';
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

describe('EmailLeadRepositoryImpl', () => {
  it('maps the Lead fields onto the email payload', async () => {
    const sendLead = jest.fn().mockResolvedValue(true);
    const dataSource = { sendLead } as unknown as EmailNotifyDataSource;
    const repository = new EmailLeadRepositoryImpl(dataSource);

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
    const dataSource = { sendLead } as unknown as EmailNotifyDataSource;
    const repository = new EmailLeadRepositoryImpl(dataSource);

    await repository.submitLead(buildLead());

    const [payload] = sendLead.mock.calls[0];
    expect(payload.submittedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it('passes through the boolean result from the data source', async () => {
    const sendLead = jest.fn().mockResolvedValue(false);
    const dataSource = { sendLead } as unknown as EmailNotifyDataSource;
    const repository = new EmailLeadRepositoryImpl(dataSource);

    const result = await repository.submitLead(buildLead());

    expect(result).toBe(false);
  });
});
