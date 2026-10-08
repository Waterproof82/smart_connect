/**
 * LandingContainer Tests
 *
 * Clean Architecture: Composition Root Tests
 * sdd/notify-lead-antibot (D13, D14): notify-lead is the single lead entry
 * point, so the container takes no config and always wires the same
 * NotifyLeadDataSource -> NotifyLeadRepositoryImpl -> SubmitLeadUseCase
 * chain. Still proves there is NO module-level memoization (design ADR-2
 * regression guard, carried forward).
 */

jest.mock('@/features/landing/data/datasources', () => ({
  NotifyLeadDataSource: jest.fn().mockImplementation(() => ({ __kind: 'notify-lead-datasource' })),
}));

jest.mock('@/features/landing/data/repositories', () => ({
  NotifyLeadRepositoryImpl: jest
    .fn()
    .mockImplementation((dataSource: unknown) => ({ __kind: 'notify-lead-repo', dataSource })),
}));

jest.mock('@/features/landing/domain/usecases', () => ({
  SubmitLeadUseCase: jest.fn().mockImplementation((repository: unknown) => ({ repository })),
}));

import {
  createLandingContainer,
  LandingContainer,
} from '@/features/landing/presentation/LandingContainer';
import { NotifyLeadDataSource } from '@/features/landing/data/datasources';
import { NotifyLeadRepositoryImpl } from '@/features/landing/data/repositories';

describe('createLandingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('takes no config and wires NotifyLeadDataSource -> NotifyLeadRepositoryImpl', () => {
    createLandingContainer();

    expect(NotifyLeadDataSource).toHaveBeenCalledTimes(1);
    expect(NotifyLeadDataSource).toHaveBeenCalledWith();
    expect(NotifyLeadRepositoryImpl).toHaveBeenCalledTimes(1);
  });

  it('SINGLETON REGRESSION GUARD: two calls produce different instances (no module-level cache)', () => {
    const a = createLandingContainer();
    const b = createLandingContainer();

    expect(a).not.toBe(b);
    expect(NotifyLeadDataSource).toHaveBeenCalledTimes(2);
  });

  it('exposes a submitLeadUseCase built from the NotifyLeadRepositoryImpl', () => {
    const container = createLandingContainer();

    expect(container.submitLeadUseCase).toBeDefined();
  });

  it('the LandingContainer class can be constructed directly with no arguments', () => {
    const container = new LandingContainer();

    expect(container.submitLeadUseCase).toBeDefined();
  });
});
