# User CRUD - Soft Delete Behavior

## Issue: Unique Constraint with Soft Deletes

When a user is **soft deleted** (their `deletedAt` field is set), they remain in the database. The database-level unique constraints on `email` and `phoneNumber` still apply, preventing creation of new users with the same credentials.

## Current Behavior

1. **Delete a user** → Sets `deletedAt` timestamp (user stays in DB)
2. **Try to create user with same email** → ❌ Error: "A deleted user with this email or phone exists..."

## Solutions Implemented

### For MVP (Current)

- **Better error message**: Tells user that a deleted account exists
- **Admin utilities**: Created [`service-admin.ts`](file:///home/cursemaker/02_Projects/02_Freelance/01_corintek_cpis/src/features/users/service-admin.ts) with:
  - `restoreUser(id)` - Restore a soft-deleted user
  - `permanentlyDeleteUser(id)` - Permanently remove from database (IRREVERSIBLE)

### Workarounds for Testing

**Option 1:** Use different emails each time

```
corintek01@mail.com
corintek02@mail.com
corintek03@mail.com
```

**Option 2:** Manually clear deleted users from Supabase

- Open Prisma Studio: `npm run prisma:studio`
- Find records with `deletedAt` set
- Permanently delete them

**Option 3:** Use the admin service (future)

- Implement server actions for `restoreUser` and `permanentlyDeleteUser`
- Add admin UI to manage deleted users

## Future Production Solutions

For production, consider one of these approaches:

1. **Append suffix on delete** - Change email to `email_DELETED_timestamp` when deleting
   - Pros: Allows immediate reuse of email
   - Cons: Complicates data, harder to restore

2. **Composite unique constraint** - Make uniqueness include `deletedAt`
   - Pros: Allows same email for deleted users
   - Cons: Requires Prisma schema changes and migration

3. **No unique constraints** - Remove DB constraints, rely on app logic only
   - Pros: Maximum flexibility
   - Cons: Potential race conditions

4. **Hard delete by default** - Remove soft delete for users
   - Pros: Simple
   - Cons: Lose user history and can't restore

## Recommendation for MVP

**Keep current implementation** - It's the safest approach:

- ✅ Prevents accidental data loss
- ✅ Clear error messages
- ✅ Admin can restore if needed
- ✅ Follows data retention best practices

For testing, just use different email addresses each time (corintek01, corintek02, etc).
