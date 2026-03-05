/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HighlightText } from './highlight-text';

describe('HighlightText - Custom Renderers', () => {
  it('uses default renderer when no custom renderer provided', () => {
    const { container } = render(
      <HighlightText text="hello world" query="world" />
    );
    const mark = container.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('world');
  });

  it('uses custom match renderer', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderMatch={text => (
          <strong className="custom-match">{text.toUpperCase()}</strong>
        )}
      />
    );
    const strong = container.querySelector('strong.custom-match');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('WORLD');
  });

  it('uses custom non-match renderer', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderNonMatch={text => <span className="custom-text">{text}</span>}
      />
    );
    const spans = container.querySelectorAll('span.custom-text');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('hello ');
  });

  it('uses both custom renderers together', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderMatch={text => <em>{text}</em>}
        renderNonMatch={text => <span className="non-match">{text}</span>}
      />
    );
    const em = container.querySelector('em');
    const span = container.querySelector('span.non-match');
    expect(em?.textContent).toBe('world');
    expect(span?.textContent).toBe('hello ');
  });

  it('handles multiple matches with custom renderer', () => {
    const { container } = render(
      <HighlightText
        text="banana"
        query="an"
        renderMatch={text => <strong>{text}</strong>}
      />
    );
    const strongs = container.querySelectorAll('strong');
    expect(strongs.length).toBe(2);
    expect(strongs[0].textContent).toBe('an');
    expect(strongs[1].textContent).toBe('an');
  });

  it('preserves React keys with custom renderers', () => {
    const { container } = render(
      <HighlightText
        text="hello world test"
        query="world"
        renderMatch={text => <mark key="match">{text}</mark>}
        renderNonMatch={text => <span key="non-match">{text}</span>}
      />
    );
    // Should render without key warnings
    expect(container.textContent).toBe('hello world test');
  });

  it('custom renderer receives correct text segments', () => {
    const matchTexts: string[] = [];
    const nonMatchTexts: string[] = [];

    render(
      <HighlightText
        text="hello world"
        query="world"
        renderMatch={text => {
          matchTexts.push(text);
          return <mark>{text}</mark>;
        }}
        renderNonMatch={text => {
          nonMatchTexts.push(text);
          return <span>{text}</span>;
        }}
      />
    );

    expect(matchTexts).toEqual(['world']);
    expect(nonMatchTexts).toEqual(['hello ']);
  });

  it('custom renderer can modify text', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderMatch={text => <mark>{text.toUpperCase()}</mark>}
        renderNonMatch={text => <span>{text.toLowerCase()}</span>}
      />
    );
    expect(container.textContent).toBe('hello WORLD');
  });

  it('falls back to default when renderMatch is undefined', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderNonMatch={text => <span>{text}</span>}
      />
    );
    const mark = container.querySelector('mark');
    expect(mark).toBeTruthy();
    expect(mark?.textContent).toBe('world');
  });

  it('falls back to default when renderNonMatch is undefined', () => {
    const { container } = render(
      <HighlightText
        text="hello world"
        query="world"
        renderMatch={text => <strong>{text}</strong>}
      />
    );
    // The non-match part should be rendered with default (plain text in span)
    expect(container.textContent).toBe('hello world');
    const strong = container.querySelector('strong');
    expect(strong?.textContent).toBe('world');
  });
});
