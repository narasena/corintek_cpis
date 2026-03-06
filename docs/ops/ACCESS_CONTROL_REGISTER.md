# ACCESS_CONTROL_REGISTER

## 1) Purpose

Track privileged and role-sensitive access changes for CPIS maintainability and auditability.

## 2) Rules

- Every access change must have requester, approver, reason, and date.
- Temporary access must include explicit expiry date.
- No undocumented privileged access paths are allowed.

## 3) Access Change Log

| Date | User | Change Type | Old Role/Access | New Role/Access | Reason | Approved By | Expiry | Ticket |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| YYYY-MM-DD | user@example.com | Role Update | TECHNICIAN | SUPERVISOR | Operational need | Owner | N/A | INC-001 |

## 4) Quarterly Review Checklist

- [ ] Remove stale or temporary elevated access.
- [ ] Validate role assignments against current org structure.
- [ ] Confirm access model still matches RBAC matrix.
- [ ] Confirm no emergency bypass access was introduced.
