/**
 * LandingContainer Tests
 *
 * Clean Architecture: Composition Root Tests
 * Design ADR-2 — proves createLandingContainer is a pure factory with NO
 * memoization. This is the regression guard that would have caught the
 * original getLandingContainer singleton bug.
 */

jest.mock('@/features/landing/data/datasources', () => ({
  N8NWebhookDataSource: jest
    .fn()
    .mockImplementation((webhookUrl: string) => ({ __kind: 'n8n-datasource', webhookUrl })),
  EmailNotifyDataSource: jest.fn().mockImplementation(() => ({ __kind: 'email-datasource' })),
}));

jest.mock('@/features/landing/data/repositories', () => ({
  LeadRepositoryImpl: jest
    .fn()
    .mockImplementation((dataSource: unknown) => ({ __kind: 'n8n-repo', dataSource })),
  EmailLeadRepositoryImpl: jest
    .fn()
    .mockImplementation((dataSource: unknown) => ({ __kind: 'email-repo', dataSource })),
}));

jest.mock('@/features/landing/domain/usecases', () => ({
  SubmitLeadUseCase: jest.fn().mockImplementation((repository: unknown) => ({ repository })),
}));

import {
  createLandingContainer,
  LandingContainer,
} from '@/features/landing/presentation/LandingContainer';
import { N8NWebhookDataSource, EmailNotifyDataSource } from '@/features/landing/data/datasources';
import { LeadRepositoryImpl, EmailLeadRepositoryImpl } from '@/features/landing/data/repositories';

describe('createLandingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes to the n8n channel when n8nEnabled is true', () => {
    const container = createLandingContainer({
      n8nEnabled: true,
      n8nWebhookUrl: 'https://n8n.example.com/webhook',
    });

    expect(container.leadChannel).toBe('n8n');
    expect(N8NWebhookDataSource).toHaveBeenCalledWith('https://n8n.example.com/webhook');
    expect(LeadRepositoryImpl).toHaveBeenCalledTimes(1);
    expect(EmailNotifyDataSource).not.toHaveBeenCalled();
    expect(EmailLeadRepositoryImpl).not.toHaveBeenCalled();
  });

  it('routes to the email channel when n8nEnabled is false', () => {
    const container = createLandingContainer({
      n8nEnabled: false,
      n8nWebhookUrl: '',
    });

    expect(container.leadChannel).toBe('email');
    expect(EmailNotifyDataSource).toHaveBeenCalledTimes(1);
    expect(EmailLeadRepositoryImpl).toHaveBeenCalledTimes(1);
    expect(N8NWebhookDataSource).not.toHaveBeenCalled();
    expect(LeadRepositoryImpl).not.toHaveBeenCalled();
  });

  it('forwards the webhook URL unmodified — no fabricated placeholder URL (ADR-3)', () => {
    createLandingContainer({ n8nEnabled: true, n8nWebhookUrl: '' });

    expect(N8NWebhookDataSource).toHaveBeenCalledWith('');
  });

  it('SINGLETON REGRESSION GUARD: two calls with different configs produce different instances and different channels', () => {
    const a = createLandingContainer({
      n8nEnabled: true,
      n8nWebhookUrl: 'https://a.example.com/webhook',
    });
    const b = createLandingContainer({ n8nEnabled: false, n8nWebhookUrl: '' });

    // Not the same object reference — proves there is no module-level cache.
    expect(a).not.toBe(b);
    expect(a.leadChannel).toBe('n8n');
    expect(b.leadChannel).toBe('email');
  });

  it('SINGLETON REGRESSION GUARD: calling twice with the SAME config still returns independent instances (no memoization anywhere in the factory)', () => {
    const config = { n8nEnabled: true, n8nWebhookUrl: 'https://n8n.example.com/webhook' };
    const first = createLandingContainer(config);
    const second = createLandingContainer(config);

    expect(first).not.toBe(second);
    expect(N8NWebhookDataSource).toHaveBeenCalledTimes(2);
  });

  it('exposes a submitLeadUseCase built from the selected repository', () => {
    const container = createLandingContainer({ n8nEnabled: false, n8nWebhookUrl: '' });

    expect(container.submitLeadUseCase).toBeDefined();
  });

  it('the LandingContainer class can be constructed directly with the same config shape', () => {
    const container = new LandingContainer({ n8nEnabled: true, n8nWebhookUrl: 'https://x.com' });

    expect(container.leadChannel).toBe('n8n');
  });
});
