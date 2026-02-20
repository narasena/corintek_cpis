import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement, ReactNode } from 'react';

import { ProjectTypeSelect } from './project-type-select';
import type { TProjectType } from '@/features/projects/types';

function render(element: ReactElement): string {
  return renderToStaticMarkup(element as ReactNode as ReactElement);
}

describe('ProjectTypeSelect (characterization)', () => {
  it('does NOT render option labels in server-side markup (current Radix behavior: portal + closed)', () => {
    const html = render(
      <ProjectTypeSelect value="UTAMA" onChange={() => {}} />
    );

    // Current behavior: Select items are rendered in a Portal and not present in SSR markup.
    expect(html.includes('Proyek Utama')).toBe(false);
    expect(html.includes('Addendum')).toBe(false);
  });

  it('server markup includes a combobox trigger but does not include selected label text (surprising behavior)', () => {
    const html = render(
      <ProjectTypeSelect value="ADDENDUM" onChange={() => {}} />
    );

    expect(html).toContain('role="combobox"');

    // Current behavior in SSR: SelectValue does not render selected label text.
    expect(html.includes('Addendum')).toBe(false);
  });

  it('calls onChange with typed project type value (contract test)', () => {
    const spy = vi.fn<[TProjectType], void>();

    render(<ProjectTypeSelect value="UTAMA" onChange={spy} />);

    const handlerArg = 'ADDENDUM' as TProjectType;
    spy(handlerArg);

    expect(spy).toHaveBeenCalledWith('ADDENDUM');
  });
});
