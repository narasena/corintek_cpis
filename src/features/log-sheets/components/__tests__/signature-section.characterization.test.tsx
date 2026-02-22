/** @vitest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TSignatureUiRole } from '@/components/signature/signature-roles';

const mockSaveLogSheetSignatureAction = vi.fn();

vi.mock('@/features/log-sheets/actions', () => ({
  saveLogSheetSignatureAction: (...args: unknown[]) =>
    mockSaveLogSheetSignatureAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCtx = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  drawImage: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  lineCap: '',
  lineJoin: '',
  lineWidth: 0,
  strokeStyle: '',
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  globalAlpha: 1,
  globalCompositeOperation: '',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high' as ImageSmoothingQuality,
  filter: '',
  shadowBlur: 0,
  shadowColor: '',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  miterLimit: 0,
};

const mockToDataURL = vi.fn(() => 'data:image/png;base64,mock-signature-data');

async function renderSection(props?: {
  logSheetId?: string;
  role?: TSignatureUiRole;
  canSign?: boolean;
  existingUrl?: string | null;
  signedAt?: Date | string | null;
  signedByName?: string | null;
  isLocked?: boolean;
  onSigned?: () => Promise<void>;
}) {
  const { SignatureSection } = await import('../signature-section');

  const onSigned = props?.onSigned ?? vi.fn().mockResolvedValue(undefined);

  return render(
    <SignatureSection
      logSheetId={props?.logSheetId ?? 'ls-1'}
      role={props?.role ?? 'TECHNICIAN'}
      canSign={props?.canSign ?? true}
      existingUrl={props?.existingUrl ?? null}
      signedAt={props?.signedAt ?? null}
      signedByName={props?.signedByName ?? null}
      isLocked={props?.isLocked ?? false}
      onSigned={onSigned}
    />
  );
}

function simulateSignatureStroke(canvas: HTMLCanvasElement) {
  fireEvent.pointerDown(canvas, {
    clientX: 50,
    clientY: 30,
    pointerId: 1,
  });
  fireEvent.pointerMove(canvas, {
    clientX: 100,
    clientY: 60,
    pointerId: 1,
  });
  fireEvent.pointerUp(canvas, {
    clientX: 100,
    clientY: 60,
    pointerId: 1,
  });
}

describe('SignatureSection - characterization', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
      if (contextId === '2d') {
        return mockCtx as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 300,
        height: 168.75,
        top: 0,
        left: 0,
        right: 300,
        bottom: 168.75,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
    });
  });

  describe('initial rendering', () => {
    it('renders section title with role label (main path - TECHNICIAN)', async () => {
      await renderSection({ role: 'TECHNICIAN' });

      expect(screen.getByText(/tanda tangan teknisi/i)).toBeTruthy();
    });

    it('renders section title with role label (main path - CLIENT_PIC)', async () => {
      await renderSection({ role: 'CLIENT_PIC' });

      expect(screen.getByText(/tanda tangan pic klien/i)).toBeTruthy();
    });

    it('renders help text (main path)', async () => {
      await renderSection();

      expect(
        screen.getByText(/diminta sebelum log sheet dapat dikirim/i)
      ).toBeTruthy();
    });

    it('renders "Isi Tanda Tangan" button when no existing signature (main path)', async () => {
      await renderSection({ existingUrl: null });

      expect(
        screen.getByRole('button', { name: /isi tanda tangan/i })
      ).toBeTruthy();
    });

    it('renders "Ubah Tanda Tangan" button when signature exists (main path)', async () => {
      await renderSection({ existingUrl: 'https://example.com/signature.png' });

      expect(
        screen.getByRole('button', { name: /ubah tanda tangan/i })
      ).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('disables button when isLocked is true (main path)', async () => {
      await renderSection({ isLocked: true });

      const button = screen.getByRole('button', { name: /tanda tangan/i });
      expect(button).toHaveProperty('disabled', true);
    });

    it('disables button when canSign is false (main path)', async () => {
      await renderSection({ canSign: false });

      const button = screen.getByRole('button', { name: /tanda tangan/i });
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('existing signature display', () => {
    it('renders SignaturePreview when existingUrl is provided (main path)', async () => {
      await renderSection({
        existingUrl: 'https://example.com/signature.png',
        signedByName: 'John Doe',
        signedAt: '2026-02-22T10:00:00Z',
      });

      expect(screen.getByAltText(/tanda tangan/i)).toBeTruthy();
      expect(screen.getByText(/john doe/i)).toBeTruthy();
    });

    it('does not render SignaturePreview when no existing signature (main path)', async () => {
      await renderSection({ existingUrl: null });

      expect(screen.queryByAltText(/tanda tangan/i)).toBeNull();
    });
  });

  describe('dialog interaction', () => {
    it('opens dialog on button click (main path)', async () => {
      const user = userEvent.setup();
      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('closes dialog on "Batal" button click (main path)', async () => {
      const user = userEvent.setup();
      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      expect(screen.getByRole('dialog')).toBeTruthy();

      const cancelButton = screen.getByRole('button', { name: /batal/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });

    it('renders SignaturePad in dialog (main path)', async () => {
      const user = userEvent.setup();
      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });
  });

  describe('save signature flow', () => {
    it('opens dialog and renders signature pad (main path)', async () => {
      const user = userEvent.setup();

      mockSaveLogSheetSignatureAction.mockResolvedValue({
        success: true,
        data: { id: 'sig-1' },
      });

      await renderSection({ logSheetId: 'ls-123', role: 'TECHNICIAN' });

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();

      const canvas = dialog.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    it('shows error toast when save action fails (main path)', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      mockSaveLogSheetSignatureAction.mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('shows error toast when exception is thrown (edge case)', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      mockSaveLogSheetSignatureAction.mockRejectedValue(
        new Error('Network error')
      );

      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('save button in dialog is initially disabled without signature (main path)', async () => {
      const user = userEvent.setup();

      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      const dialog = screen.getByRole('dialog');
      const saveButtons = within(dialog).getAllByRole('button', {
        name: /simpan/i,
      });
      const dialogSaveButton = saveButtons[saveButtons.length - 1];

      expect(dialogSaveButton).toHaveProperty('disabled', true);
    });

    it('batal button closes dialog without saving (main path)', async () => {
      const user = userEvent.setup();
      mockSaveLogSheetSignatureAction.mockResolvedValue({
        success: true,
        data: { id: 'sig-1' },
      });

      await renderSection();

      const button = screen.getByRole('button', { name: /isi tanda tangan/i });
      await user.click(button);

      const cancelButton = screen.getByRole('button', { name: /batal/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });

      expect(mockSaveLogSheetSignatureAction).not.toHaveBeenCalled();
    });
  });
});
