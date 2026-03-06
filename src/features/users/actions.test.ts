import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/features/auth/lib/user-context', () => ({
  getCurrentUserDetails: vi.fn(),
  requireActor: vi.fn(),
}));

vi.mock('@/lib/auth-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth-helpers')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
  };
});

vi.mock('@/lib/r2-upload', () => ({
  uploadToR2: vi.fn(),
}));

vi.mock('./service', () => ({
  getCurrentUserProfile: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

// Now we can import the actions and the mocked helpers
import {
  getCurrentUserProfileAction,
  updateCurrentUserProfileAction,
  uploadAvatarAction,
} from './actions';
import { getCurrentUserDetails, requireActor } from '@/features/auth/lib/user-context';
import { uploadToR2 } from '@/lib/r2-upload';
import { getCurrentUserProfile, updateCurrentUserProfile } from './service';

const mockGetCurrentUserDetails = vi.mocked(getCurrentUserDetails);
const mockRequireActor = vi.mocked(requireActor);
const mockUploadToR2 = vi.mocked(uploadToR2);
const mockGetCurrentUserProfile = vi.mocked(getCurrentUserProfile);
const mockUpdateCurrentUserProfile = vi.mocked(updateCurrentUserProfile);

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    role: 'TECHNICIAN' as any,
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

// Define AuthenticationError locally for tests
class AuthenticationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

describe('getCurrentUserProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns profile for authenticated user', async () => {
    const user = makeUser();
    const profile = makeProfile();

    mockRequireActor.mockResolvedValue(user as any);
    mockGetCurrentUserProfile.mockResolvedValue(profile as any);

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.id).toBe('user-1');
    }
    expect(mockGetCurrentUserProfile).toHaveBeenCalledWith('user-1');
  });

  it('returns error when not authenticated', async () => {
    mockRequireActor.mockRejectedValue(new AuthenticationError());

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });

  it('returns error when service throws', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);
    mockGetCurrentUserProfile.mockRejectedValue(new Error('User not found'));

    const result = await getCurrentUserProfileAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('User not found');
    }
  });
});

describe('updateCurrentUserProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates profile successfully', async () => {
    const user = makeUser();
    const updatedProfile = makeProfile({ firstName: 'Jane' });

    mockRequireActor.mockResolvedValue(user as any);
    mockUpdateCurrentUserProfile.mockResolvedValue(updatedProfile as any);

    const result = await updateCurrentUserProfileAction({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.firstName).toBe('Jane');
    }
  });

  it('returns error when not authenticated', async () => {
    mockRequireActor.mockRejectedValue(new AuthenticationError());

    const result = await updateCurrentUserProfileAction({
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });

  it('validates input with zod schema', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);

    const result = await updateCurrentUserProfileAction({
      firstName: '',
      lastName: 'Doe',
      phoneNumber: '+62812345678',
      avatarUrl: null,
    });

    expect(result.success).toBe(false);
  });

  it('returns error when service throws', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);
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
    if (!result.success) {
      expect(result.error).toBe('Phone number already in use');
    }
  });
});

describe('uploadAvatarAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads avatar successfully', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);
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
    if (result.success) {
      expect(result.data?.url).toBe(
        'https://r2.example.com/avatars/user-1/test.webp'
      );
    }
    expect(mockUploadToR2).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.any(Buffer),
        contentType: 'image/webp',
      })
    );
  });

  it('returns error when not authenticated', async () => {
    mockRequireActor.mockRejectedValue(new AuthenticationError());

    const formData = new FormData();
    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });

  it('returns error when file is missing', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);

    const formData = new FormData();
    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('File tidak ditemukan');
    }
  });

  it('returns error when R2 upload fails', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);
    mockUploadToR2.mockRejectedValue(new Error('R2 connection failed'));

    const file = new File(['fake image'], 'avatar.webp', {
      type: 'image/webp',
    });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('R2 connection failed');
    }
  });

  it('generates unique key with timestamp', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);
    mockUploadToR2.mockResolvedValue(
      'https://r2.example.com/avatars/user-1/test.webp'
    );

    const file = new File(['fake image'], 'my-avatar.webp', {
      type: 'image/webp',
    });
    const formData = new FormData();
    formData.append('file', file);

    await uploadAvatarAction(formData);

    expect(mockUploadToR2).toHaveBeenCalled();
    const callArgs = mockUploadToR2.mock.calls[0][0];
    expect(callArgs.key).toMatch(/^avatars\/user-1\/\d+-my-avatar\.webp$/);
  });

  it('returns error when file is not an image', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);

    const file = new File(['fake content'], 'document.pdf', {
      type: 'application/pdf',
    });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('File harus berupa gambar');
    }
  });

  it('returns error when file exceeds 5MB', async () => {
    const user = makeUser();
    mockRequireActor.mockResolvedValue(user as any);

    const largeContent = 'x'.repeat(6 * 1024 * 1024);
    const file = new File([largeContent], 'large.webp', { type: 'image/webp' });
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadAvatarAction(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Ukuran file maksimal 5MB');
    }
  });
});
