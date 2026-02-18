import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement, ReactNode } from 'react';

import { ProjectTypeSelect } from './project-type-select';
import type { TProjectType } from '@/features/projects/types';

function render(element: ReactElement): string {
  return renderToStaticMarkup(element as ReactNode as ReactElement);
}

describe('ProjectTypeSelect', () => {
  it('renders localized labels for UTAMA and ADDENDUM', () => {
    const html = render(
      <ProjectTypeSelect value="UTAMA" onChange={() => {}} />
    );

    expect(html).toContain('Proyek Utama');
    expect(html).toContain('Addendum');
  });

  it('passes current value to underlying select', () => {
    const html = render(
      <ProjectTypeSelect value="ADDENDUM" onChange={() => {}} />
    );

    expect(html).toContain('Addendum');
  });

  it('calls onChange with typed project type value', () => {
    const spy = vi.fn<[TProjectType], void>();

    render(<ProjectTypeSelect value="UTAMA" onChange={spy} />);

    const handlerArg = 'ADDENDUM' as TProjectType;
    spy(handlerArg);

    expect(spy).toHaveBeenCalledWith('ADDENDUM');
  });
});
