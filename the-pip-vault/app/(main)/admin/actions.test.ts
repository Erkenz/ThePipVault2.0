import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bulkDeleteUsersAdminAction, deleteUserAccountAdminAction } from './actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockVerifyAdminUser = vi.fn();
const mockDeleteUserCascade = vi.fn();

vi.mock('@/utils/supabase/admin', () => ({
  verifyAdminUser: () => mockVerifyAdminUser(),
  deleteUserCascade: (id: string) => mockDeleteUserCascade(id),
}));

describe('Admin Bulk Delete Actions', () => {
  const currentAdmin = { id: 'admin-123', email: 'admin@pipvault.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdminUser.mockResolvedValue({
      authorized: true,
      user: currentAdmin,
      adminClient: {},
    });
    mockDeleteUserCascade.mockResolvedValue({ success: true });
  });

  it('rejects unauthorized users', async () => {
    mockVerifyAdminUser.mockResolvedValueOnce({
      authorized: false,
      error: 'Unauthorized: Admin access required.',
    });

    const result = await bulkDeleteUsersAdminAction(['user-1', 'user-2']);
    expect(result).toEqual({ error: 'Unauthorized: Admin access required.' });
    expect(mockDeleteUserCascade).not.toHaveBeenCalled();
  });

  it('filters out the admin own account and deletes the remaining selected users', async () => {
    const userIds = ['bot-1', 'admin-123', 'bot-2'];
    const result = await bulkDeleteUsersAdminAction(userIds);

    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(2);
    expect(mockDeleteUserCascade).toHaveBeenCalledTimes(2);
    expect(mockDeleteUserCascade).toHaveBeenCalledWith('bot-1');
    expect(mockDeleteUserCascade).toHaveBeenCalledWith('bot-2');
    expect(mockDeleteUserCascade).not.toHaveBeenCalledWith('admin-123');
  });

  it('returns an error if only the current admin id is selected', async () => {
    const result = await bulkDeleteUsersAdminAction(['admin-123']);

    expect(result.error).toMatch(/no valid user accounts/i);
    expect(mockDeleteUserCascade).not.toHaveBeenCalled();
  });

  it('single deleteUserAccountAdminAction prevents admin from deleting themselves', async () => {
    const result = await deleteUserAccountAdminAction('admin-123');

    expect(result.error).toMatch(/cannot delete your own admin account/i);
    expect(mockDeleteUserCascade).not.toHaveBeenCalled();
  });

  it('single deleteUserAccountAdminAction successfully deletes a selected user', async () => {
    const result = await deleteUserAccountAdminAction('bot-456');

    expect(result.success).toBe(true);
    expect(mockDeleteUserCascade).toHaveBeenCalledWith('bot-456');
  });
});
