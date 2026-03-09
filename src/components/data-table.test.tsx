/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from './data-table';
import React from 'react';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
import { ColumnDef } from '@tanstack/react-table';

// Mock ResizeObserver which is needed by Radix/Shadcn UI in jsdom
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

interface ITestData {
  id: string;
  name: string;
}

const columns: ColumnDef<ITestData>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

const data: ITestData[] = [
  { id: '1', name: 'Test 1' },
  { id: '2', name: 'Test 2' },
];

describe('DataTable Logic Characterization', () => {
  it('renders data correctly without tabs', () => {
    render(<DataTable columns={columns} data={data} />);

    // Should find multiple (Desktop and Mobile view)
    expect(screen.getAllByText('Test 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Test 2').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty message when no data', () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="No results found" />
    );

    expect(
      screen.getAllByText('No results found').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders active tab data when tabs are provided', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'Tab 1',
        data: [{ id: 't1', name: 'Tab 1 Data' }],
        columns: columns,
      },
      {
        value: 'tab2',
        label: 'Tab 2',
        data: [{ id: 't2', name: 'Tab 2 Data' }],
        columns: columns,
      },
    ];

    render(
      <DataTable columns={columns} data={tabs[0].data} tabs={tabs} tab="tab1" />
    );

    expect(screen.getAllByText('Tab 1 Data').length).toBeGreaterThanOrEqual(1);

    const tab2Elements = screen.queryAllByText('Tab 2 Data');
    tab2Elements.forEach(el => {
      const container = el.closest('[data-state]');
      const state = container?.getAttribute('data-state');
      expect(['inactive', 'false']).toContain(state);
    });
  });

  it('switches data when tab changes', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'Tab 1',
        data: [{ id: 't1', name: 'Tab 1 Data' }],
        columns: columns,
      },
      {
        value: 'tab2',
        label: 'Tab 2',
        data: [{ id: 't2', name: 'Tab 2 Data' }],
        columns: columns,
      },
    ];

    const { rerender } = render(
      <DataTable columns={columns} data={tabs[0].data} tabs={tabs} tab="tab1" />
    );
    expect(screen.getAllByText('Tab 1 Data').length).toBeGreaterThanOrEqual(1);

    rerender(
      <DataTable columns={columns} data={tabs[1].data} tabs={tabs} tab="tab2" />
    );
    expect(screen.getAllByText('Tab 2 Data').length).toBeGreaterThanOrEqual(1);

    const tab1Elements = screen.queryAllByText('Tab 1 Data');
    tab1Elements.forEach(el => {
      const container = el.closest('[data-state]');
      const state = container?.getAttribute('data-state');
      expect(['inactive', 'false']).toContain(state);
    });
  });

  it('renders pagination and filter toolbar when enabled', () => {
    const filterConfig = [
      {
        columnId: 'role',
        label: 'Role',
        type: 'select',
        options: [{ label: 'Admin', value: 'ADMIN' }],
        placeholder: 'Semua',
      },
    ];

    render(
      <DataTable
        columns={columns}
        data={data}
        columnFilters={true}
        filterConfigs={filterConfig as any}
        serverPagination={{
          enabled: true,
          total: 10,
          page: 1,
          limit: 10,
          onPageChange: vi.fn(),
          onLimitChange: vi.fn(),
          isLoading: false,
        }}
      />
    );

    // Check for pagination buttons
    expect(screen.getAllByText('Sebelumnya').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Selanjutnya').length).toBeGreaterThanOrEqual(1);

    // Check for filter toolbar (role filter select is rendered)
    const selectTrigger = document.querySelector(
      '[data-slot="select-trigger"]'
    );
    expect(selectTrigger).not.toBeNull();
  });

  it('renders tab-specific filters when provided', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'Tab 1',
        data: data,
        columns: columns,
        filters: <div data-testid="tab-filter">Custom Filter</div>,
      },
    ];

    render(<DataTable columns={columns} data={[]} tabs={tabs} tab="tab1" />);

    expect(screen.getByTestId('tab-filter')).toBeDefined();
    expect(screen.getByText('Custom Filter')).toBeDefined();
  });
});
