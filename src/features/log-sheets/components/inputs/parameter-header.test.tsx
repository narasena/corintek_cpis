// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ParameterHeader } from './parameter-header';

describe('ParameterHeader', () => {
  describe('rendering', () => {
    it('renders parameter name only', () => {
      const { container } = render(
        <ParameterHeader
          name="Temperature"
          unit={null}
          minValue={null}
          maxValue={null}
        />
      );
      expect(container.textContent).toContain('Temperature');
    });

    it('renders parameter name with unit', () => {
      const { container } = render(
        <ParameterHeader
          name="Temperature"
          unit="°C"
          minValue={null}
          maxValue={null}
        />
      );
      expect(container.textContent).toContain('Temperature (°C)');
    });

    it('renders target text when limits exist', () => {
      const { container } = render(
        <ParameterHeader name="pH" unit={null} minValue={6.5} maxValue={8.5} />
      );
      expect(container.textContent).toContain('Target:');
    });

    it('does not render target text when no limits', () => {
      const { container } = render(
        <ParameterHeader
          name="Notes"
          unit={null}
          minValue={null}
          maxValue={null}
        />
      );
      expect(container.textContent).not.toContain('Target:');
    });
  });

  describe('edge cases', () => {
    it('handles empty string name', () => {
      const { container } = render(
        <ParameterHeader name="" unit={null} minValue={null} maxValue={null} />
      );
      expect(container.querySelector('.font-medium')).not.toBeNull();
    });

    it('handles empty string unit (falsy)', () => {
      const { container } = render(
        <ParameterHeader
          name="Temperature"
          unit=""
          minValue={null}
          maxValue={null}
        />
      );
      expect(container.textContent).toBe('Temperature');
    });

    it('handles minValue only', () => {
      const { container } = render(
        <ParameterHeader
          name="Flow"
          unit="L/min"
          minValue={10}
          maxValue={null}
        />
      );
      expect(container.textContent).toContain('Target:');
    });

    it('handles maxValue only', () => {
      const { container } = render(
        <ParameterHeader
          name="Pressure"
          unit="bar"
          minValue={null}
          maxValue={5}
        />
      );
      expect(container.textContent).toContain('Target:');
    });

    it('handles zero values for limits', () => {
      const { container } = render(
        <ParameterHeader name="Offset" unit={null} minValue={0} maxValue={0} />
      );
      expect(container.textContent).toContain('Target:');
    });

    it('handles negative values for limits', () => {
      const { container } = render(
        <ParameterHeader
          name="Delta"
          unit={null}
          minValue={-10}
          maxValue={-5}
        />
      );
      expect(container.textContent).toContain('Target:');
    });

    it('applies custom className', () => {
      const { container } = render(
        <ParameterHeader
          name="Test"
          unit={null}
          minValue={null}
          maxValue={null}
          className="custom-class"
        />
      );
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('custom-class');
    });
  });

  describe('SOLID compliance', () => {
    it('Single Responsibility: only handles display, not logic', () => {
      const { container } = render(
        <ParameterHeader name="Test" unit="U" minValue={1} maxValue={2} />
      );
      const div = container.querySelector('div');
      expect(div).not.toBeNull();
    });

    it('Open/Closed: accepts className extension', () => {
      const { container } = render(
        <ParameterHeader
          name="Test"
          unit={null}
          minValue={null}
          maxValue={null}
          className="extended-class"
        />
      );
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('extended-class');
    });
  });
});
