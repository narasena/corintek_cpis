/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, TableSkeleton, CardSkeleton, Spinner } from './loading';

describe('Loading', () => {
  it('renders spinner variant by default', () => {
    render(<Loading />);

    expect(screen.getByText('Memuat...')).not.toBeNull();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('renders with custom message', () => {
    render(<Loading message="Loading data..." />);

    expect(screen.getByText('Loading data...')).not.toBeNull();
  });

  it('renders skeleton variant', () => {
    const { container } = render(<Loading variant="skeleton" />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders skeleton-table variant with correct structure', () => {
    const { container } = render(
      <Loading variant="skeleton-table" skeletonRows={3} columnCount={4} />
    );

    // Should have header + 3 data rows = 4 rows total
    const rows = container.querySelectorAll('.flex');
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it('applies fullPage class when specified', () => {
    const { container } = render(<Loading fullPage />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('min-h-[50vh]');
  });

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
  });
});

describe('TableSkeleton', () => {
  it('renders table skeleton with default rows', () => {
    const { container } = render(<TableSkeleton />);

    const rows = container.querySelectorAll('.flex');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('renders with specified row count', () => {
    const { container } = render(<TableSkeleton rows={3} columns={3} />);

    const rows = container.querySelectorAll('.flex');
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton structure', () => {
    const { container } = render(<CardSkeleton />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Spinner', () => {
  it('renders with default medium size', () => {
    const { container } = render(<Spinner />);

    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('h-6');
    expect(spinner.className).toContain('w-6');
  });

  it('renders with small size', () => {
    const { container } = render(<Spinner size="sm" />);

    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('h-4');
    expect(spinner.className).toContain('w-4');
  });

  it('renders with large size', () => {
    const { container } = render(<Spinner size="lg" />);

    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('h-8');
    expect(spinner.className).toContain('w-8');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-spinner" />);

    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('custom-spinner');
  });

  it('has animation class', () => {
    const { container } = render(<Spinner />);

    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('animate-spin');
  });
});
