/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HighlightText } from './highlight-text';

describe('HighlightText', () => {
  it('renders plain text when no query', () => {
    const { container } = render(<HighlightText text="hello world" query="" />);
    expect(container.textContent).toBe('hello world');
  });

  it('renders highlighted match', () => {
    const { container } = render(
      <HighlightText text="hello world" query="world" />
    );
    const mark = container.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('world');
  });

  it('renders multiple highlights', () => {
    const { container } = render(<HighlightText text="banana" query="an" />);
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBe(2);
  });

  it('is case insensitive by default', () => {
    const { container } = render(
      <HighlightText text="HELLO World" query="hello" />
    );
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('HELLO');
  });

  it('applies custom highlight class', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        highlightClassName="custom-highlight"
      />
    );
    const mark = container.querySelector('mark');
    expect(mark?.classList.contains('custom-highlight')).toBe(true);
  });

  it('applies custom container class', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        className="custom-container"
      />
    );
    const span = container.querySelector('.custom-container');
    expect(span).toBeTruthy();
  });

  it('handles no match', () => {
    const { container } = render(
      <HighlightText text="hello world" query="xyz" />
    );
    expect(container.textContent).toBe('hello world');
    expect(container.querySelector('mark')).toBeFalsy();
  });
});
