import React from 'react';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Honeypot Field Component
 * 
 * Invisible field to trap bots. Human users won't see or interact with it.
 * If the field is filled, it indicates bot activity.
 * 
 * Security: OWASP A04:2021 (Rate Limiting & Bot Protection)
 * 
 * Implementation:
 * - Hidden via CSS (not display:none to avoid bot detection)
 * - Positioned off-screen with opacity:0
 * - Tab-index -1 to prevent keyboard navigation
 * - Aria-hidden for screen readers
 */
export const HoneypotField: React.FC<HoneypotFieldProps> = ({ value, onChange }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <label htmlFor="website_url">
        Website (leave blank)
      </label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
};
