/**
 * Honeypot Field Unit Tests
 * 
 * Tests for bot detection honeypot field
 * 
 * Security: OWASP A04:2021 (Rate Limiting & Bot Protection)
 */

import React from 'react';
import { render } from '@testing-library/react';
import { HoneypotField } from '../../../src/shared/components/HoneypotField';

describe('HoneypotField', () => {
  it('should render hidden input field', () => {
    const mockOnChange = jest.fn();
    
    const { getByLabelText } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const input = getByLabelText('Website (leave blank)');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should have accessibility attributes to hide from screen readers', () => {
    const mockOnChange = jest.fn();
    
    const { container } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have tab-index -1 to prevent keyboard navigation', () => {
    const mockOnChange = jest.fn();
    
    const { getByLabelText } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const input = getByLabelText('Website (leave blank)');
    expect(input).toHaveAttribute('tabindex', '-1');
  });

  it('should be positioned off-screen', () => {
    const mockOnChange = jest.fn();
    
    const { container } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      position: 'absolute',
      left: '-9999px',
      opacity: 0,
    });
  });

  it('should have autocomplete off to avoid browser autofill', () => {
    const mockOnChange = jest.fn();
    
    const { getByLabelText } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const input = getByLabelText('Website (leave blank)');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('should call onChange when value changes', () => {
    const mockOnChange = jest.fn();
    
    const { getByLabelText } = render(<HoneypotField value="" onChange={mockOnChange} />);
    
    const input = getByLabelText('Website (leave blank)');
    
    // Simulate bot filling the field using fireEvent
    const { fireEvent } = require('@testing-library/react');
    fireEvent.change(input, { target: { value: 'bot-value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('bot-value');
  });

  it('should render with provided value', () => {
    const mockOnChange = jest.fn();
    
    const { getByLabelText } = render(<HoneypotField value="test-value" onChange={mockOnChange} />);
    
    const input = getByLabelText('Website (leave blank)');
    expect(input).toHaveValue('test-value');
  });
});
