import React from 'react';
import { cn } from '@/lib/utils';
import { highlightMatches, IHighlightPart } from '@/lib/utils/string-algorithms';

/**
 * Highlight text component props
 */
interface IHighlightTextProps {
  /** Text to display */
  text: string;
  /** Search query */
  query: string;
  /** Whether to ignore case */
  caseInsensitive?: boolean;
  /** CSS class for highlighted text */
  highlightClassName?: string;
  /** CSS class for normal text */
  className?: string;
  /** Custom renderer for matched text */
  renderMatch?: (text: string) => React.ReactNode;
  /** Custom renderer for non-matched text */
  renderNonMatch?: (text: string) => React.ReactNode;
}

/**
 * Component: HighlightText
 * Responsibility: Render text with highlighted search matches
 * Pattern: Functional component with text segmentation
 */
export function HighlightText(props: IHighlightTextProps): React.JSX.Element {
  const {
    text,
    query,
    caseInsensitive = true,
    highlightClassName = 'bg-yellow-200 font-semibold',
    className,
    renderMatch,
    renderNonMatch,
  } = props;

  if (!query) {
    return <span className={className}>{text}</span>;
  }

  const parts = highlightMatches(text, query, caseInsensitive);

  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const defaultRenderMatch = (t: string) => (
    <mark className={cn('rounded px-0.5', highlightClassName)}>{t}</mark>
  );
  const defaultRenderNonMatch = (t: string) => <span>{t}</span>;

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.isMatch ? (
          <React.Fragment key={i}>
            {(renderMatch ?? defaultRenderMatch)(part.text)}
          </React.Fragment>
        ) : (
          <React.Fragment key={i}>
            {(renderNonMatch ?? defaultRenderNonMatch)(part.text)}
          </React.Fragment>
        )
      )}
    </span>
  );
}
