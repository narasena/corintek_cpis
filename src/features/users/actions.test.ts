import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  getCurrentUserProfileAction,
  updateCurrentUserProfileAction,
  uploadAvatarAction,
} from './actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/lib/r2-upload', () => ({
  uploadToR2: vi.fn(),
}));

vi.mock('./service', () => ({
  getCurrentUserProfile: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

const mockGetCurrentUser = vi.mocked(
  await import('@/lib/auth-helpers').then(m => m.getCurrentUser)
);
const mockUploadToR2 = vi.mocked(
  await import('@/lib/r2-upload').then(m => m.uploadToR2)
);
const mockGetCurrentUserProfile = vi.mocked(
  await import('./service').then(m => m.getCurrentUserProfile)
);
const mockUpdateCurrentUserProfile = vi.mocked(
  await import('./service').then(m => m.updateCurrentUserProfile)
);

function makeJwtPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'john@example.com',
    role: 'TECHNICIAN',
    iat: Date.now(),
    exp: Date.now() + 3600000,
    ...overrides,
  };
}

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+62812345678',
    avatarUrl: null,
    role: 'TECHNICIAN',
    employmentStatus: 'PERMANENT',
    ...overrides,
  };
}

describe('getCurrentUserProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns profile for authenticated user', async () => {
    const payload = makeJwtPayload();
    const profile = makeProfile();

    mockGetCurrentUser.mockResolvedValue(payload);
    mockGetCurrentUserProfile.mockResolvedValue(profile);

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('user-1');
    expect(mockGetCurrentUserProfile).toHaveBeenCalledWith('user-1');
  });

  it('returns error when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('returns error when service throws', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);
    mockGetCurrentUserProfile.mockRejectedValue(new Error('User not found'));

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not found');
  });
});

describe('updateCurrentUserProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates profile successfully', async () => {
    const payload = makeJwtPayload();
    const updatedProfile = makeProfile({ firstName: 'Jane' });

    mockGetCurrentUser.mockResolvedValue(payload);
    mockUpdateCurrentUserProfile.mockResolvedValue(updatedProfile);

    const result = await updateCurrentUserProfileAction({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(true);
    expect(result.data?.firstName).toBe('Jane');
  });

  it('returns error when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const result = await updateCurrentUserProfileAction({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('validates input with zod schema', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);

    const result = await updateCurrentUserProfileAction({
      firstName: '',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
  });

  it('returns error when service throws', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);
    mockUpdateCurrentUserProfile.mockRejectedValue(
      new Error('Phone number already in use')
    );

    const result = await updateCurrentUserProfileAction({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+62899999999',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Phone number already in use');
  });
});

describe('uploadAvatarAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads avatar successfully', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);
    mockUploadToR2.mockResolvedValue(
      'https://r2.example.com/avatars/user-1/test.webp'
    );

    const file = new File(['fake image'], 'avatar.webp', {
      type: 'image/webp',
    });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(true);
    expect(result.data?.url).toBe(
      'https://r2.example.com/avatars/user-1/test.webp'
    );
    expect(mockUploadToR2).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.any(Buffer),
        contentType: 'image/webp',
      })
    );
  });

  it('returns error when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const formData = new FormData();
    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });

  it('returns error when file is missing', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);

    const formData = new FormData();
    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('File tidak ditemukan');
  });

  it('returns error when R2 upload fails', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);
    mockUploadToR2.mockRejectedValue(new Error('R2 connection failed'));

    const file = new File(['fake image'], 'avatar.webp', {
      type: 'image/webp',
    });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('R2 connection failed');
  });

  it('generates unique key with timestamp', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);
    mockUploadToR2.mockResolvedValue(
      'https://r2.example.com/avatars/user-1/test.webp'
    );

    const file = new File(['fake image'], 'my-avatar.webp', {
      type: 'image/webp',
    });
    const formData = new FormData();
    formData.append('file', file);

    await uploadAvatarAction(formData);

    const callArgs = mockUploadToR2.mock.calls[0][0];
    expect(callArgs.key).toMatch(/^avatars\/user-1\/\d+-my-avatar\.webp$/);
  });

  it('returns error when file is not an image', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);

    const file = new File(['fake content'], 'document.pdf', {
      type: 'application/pdf',
    });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('File harus berupa gambar');
  });

  it('returns error when file exceeds 5MB', async () => {
    const payload = makeJwtPayload();
    mockGetCurrentUser.mockResolvedValue(payload);

    const largeContent = 'x'.repeat(6 * 1024 * 1024);
    const file = new File([largeContent], 'large.webp', { type: 'image/webp' });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ukuran file maksimal 5MB');
  });
});
