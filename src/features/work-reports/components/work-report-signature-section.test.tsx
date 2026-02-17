import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import { SignaturePreviewInternal } from './work-report-signature-section';

function render(element: ReactElement): string {
  return renderToStaticMarkup(element as ReactNode as ReactElement);
}

describe('SignaturePreview', () => {
  const label = 'Teknisi';

  it('returns null markup when there is no url and no valid date', () => {
    const html = render(
      <SignaturePreviewInternal label={label} url={null} signedAt={null} />
    );
    expect(html).toBe('');
  });

  it('renders image when url is provided', () => {
    const url = 'https://example.com/signature.png';
    const html = render(
      <SignaturePreviewInternal label={label} url={url} signedAt={null} />
    );
    expect(html).toContain(`src="${url}"`);
    expect(html).toContain(`alt="Tanda tangan ${label}"`);
  });

  it('renders formatted date when signedAt is a valid value', () => {
    const signedAt = '2024-01-01T10:30:00.000Z';
    const date = new Date(signedAt);
    const formatted = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);

    const html = render(
      <SignaturePreviewInternal label={label} url={null} signedAt={signedAt} />
    );

    expect(html).toContain('Waktu:');
    expect(html).toContain(formatted);
  });

  it('does not render when signedAt is invalid', () => {
    const html = render(
      <SignaturePreviewInternal
        label={label}
        url={null}
        signedAt="not-a-date"
      />
    );
    expect(html).toBe('');
  });

  it('renders signer name when signedByName is provided', () => {
    const html = render(
      <SignaturePreviewInternal
        label={label}
        url={null}
        signedAt={null}
        signedByName="John Doe"
      />
    );
    expect(html).toContain('Ditandatangani oleh: John Doe');
  });

  it('renders image and signer name together when both are provided', () => {
    const url = 'https://example.com/signature.png';
    const html = render(
      <SignaturePreviewInternal
        label={label}
        url={url}
        signedAt={null}
        signedByName="Jane Doe"
      />
    );
    expect(html).toContain(`src="${url}"`);
    expect(html).toContain('Ditandatangani oleh: Jane Doe');
  });
});
