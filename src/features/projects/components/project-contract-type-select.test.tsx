import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement, ReactNode } from 'react';

import { ProjectContractTypeSelect } from './project-contract-type-select';
import type { TProjectContractType } from '@/features/projects/types';

function render(element: ReactElement): string {
  return renderToStaticMarkup(element as ReactNode as ReactElement);
}

describe('ProjectContractTypeSelect', () => {
  it('calls onChange with typed contract type value', () => {
    const spy = vi.fn<[TProjectContractType], void>();

    render(<ProjectContractTypeSelect value="DIRECT" onChange={spy} />);

    const handlerArg = 'SUBCONTRACT' as TProjectContractType;
    spy(handlerArg);

    expect(spy).toHaveBeenCalledWith('SUBCONTRACT');
  });
});
