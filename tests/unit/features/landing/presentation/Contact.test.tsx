import React from 'react';
import { render, screen } from '@testing-library/react';
import { Contact } from '../../../../../src/features/landing/presentation/components/Contact';

// Mocks
jest.mock('@shared/context/LanguageContext', () => ({ useLanguage: () => ({ t: { contactTitle: 'Contact Us' } }) }))

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn((callback) => callback({
      name: 'Test Name',
      company: 'Test Company',
      email: 'test@example.com',
      service: 'Carta Digital Premium',
      message: 'Test message',
    })),
    reset: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(() => ({})),
    trigger: jest.fn().mockResolvedValue(true),
    formState: {
      errors: {},
      isSubmitting: false,
      touchedFields: {},
    },
  }),
}))

jest.mock('@shared/services/settingsService', () => ({
  getAppSettings: () => Promise.resolve({
    contactEmail: 'contact@example.com',
    whatsappPhone: '+34600000000',
    physicalAddress: 'Calle de la Innovación, 123',
  }),
}))

jest.mock('@features/landing/presentation/LandingContainer', () => ({
  getLandingContainer: () => ({
    submitLeadUseCase: {
      execute: jest.fn().mockResolvedValue({ success: true }),
    },
  }),
}))

jest.mock('@features/landing/domain/entities/LeadEntity', () => ({
  LeadEntity: jest.fn((data) => data),
}))

describe('Contact Component', () => {
  it('should render the Contact component correctly', () => {
    render(<Contact />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });
});