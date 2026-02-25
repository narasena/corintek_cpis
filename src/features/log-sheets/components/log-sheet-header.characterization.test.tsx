/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill ? 'true' : undefined}
      className={className}
      data-testid="mock-image"
    />
  ),
}));

import { LogSheetHeader } from './log-sheet-header';

describe('LogSheetHeader - characterization', () => {
  describe('rendering', () => {
    it('renders company name and tagline', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      expect(screen.getByText('PT. CORINTEK INTI SEJAHTERA')).not.toBeNull();
      expect(
        screen.getByText('Water Treatment and Chemicals Specialist')
      ).not.toBeNull();
    });

    it('renders customer name', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      expect(screen.getByText('PT Test Customer')).not.toBeNull();
    });

    it('renders "By" name', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      expect(screen.getByText('John Doe')).not.toBeNull();
    });

    it('renders logo image', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      const logo = screen.getByTestId('mock-image');
      expect(logo.getAttribute('src')).toBe('/logo.png');
      expect(logo.getAttribute('alt')).toBe('Corintek Logo');
    });
  });

  describe('date formatting', () => {
    it('formats Date object to Indonesian locale long format', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      const dateText = screen.getByText(/Senin.*15.*Januari.*2024/);
      expect(dateText.textContent).toContain('Senin');
    });

    it('formats string date to Indonesian locale long format', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date="2024-03-20"
          byName="John Doe"
        />
      );

      const dateText = screen.getByText(/Rabu.*20.*Maret.*2024/);
      expect(dateText.textContent).toContain('Rabu');
    });

    it('handles ISO date string format', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date="2024-12-25T00:00:00.000Z"
          byName="John Doe"
        />
      );

      expect(screen.getByText(/2024/)).not.toBeNull();
    });
  });

  describe('replacedByName prop', () => {
    it('does not render replacedByName section when not provided', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      expect(screen.queryByText(/Replaced By/)).toBeNull();
    });

    it('does not render replacedByName section when null', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
          replacedByName={null}
        />
      );

      expect(screen.queryByText(/Replaced By/)).toBeNull();
    });

    it('renders replacedByName section when provided', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
          replacedByName="Jane Smith"
        />
      );

      expect(screen.getByText(/Replaced By/)).not.toBeNull();
      expect(screen.getByText('Jane Smith')).not.toBeNull();
    });
  });

  describe('CSS classes', () => {
    it('has print-specific margin classes', () => {
      const { container } = render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv.className).toContain('mb-2');
      expect(rootDiv.className).toContain('print:mb-1');
    });

    it('company name has blue-900 color', () => {
      render(
        <LogSheetHeader
          customerName="PT Test Customer"
          date={new Date('2024-01-15')}
          byName="John Doe"
        />
      );

      const companyName = screen.getByText('PT. CORINTEK INTI SEJAHTERA');
      expect(companyName.className).toContain('text-blue-900');
    });
  });
});
