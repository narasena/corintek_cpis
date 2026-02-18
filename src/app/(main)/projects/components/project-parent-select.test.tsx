import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProjectParentSelect } from './project-parent-select';

describe('ProjectParentSelect', () => {
  it('returns empty markup when project type is not ADDENDUM', () => {
    const html = renderToString(
      <ProjectParentSelect
        projectType="UTAMA"
        clientId="client-1"
        value={null}
        onChange={() => {}}
        disabled={false}
      />
    );

    expect(html).toBe('');
  });

  it('renders select placeholder for ADDENDUM with clientId', () => {
    const html = renderToString(
      <ProjectParentSelect
        projectType="ADDENDUM"
        clientId="client-1"
        value={null}
        onChange={() => {}}
        disabled={false}
      />
    );

    expect(html).toContain('Pilih project utama');
  });
});
