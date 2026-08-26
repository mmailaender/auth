---
"auth": minor
---

Add the Better Auth admin plugin as a feature-toggled capability. Enable it with `admin: true` in `auth.constants.ts` to get an application-level admin dashboard at the `/admin` route for managing all users (create, set role, ban/unban, reset password, revoke sessions, impersonate, delete) and — when `organizations` is also enabled — all organizations (list, view members, force-delete). Distributed via jsrepo as the new `admin/convex`, `admin/lib`, and `admin/routes` registry items. While impersonating, a banner with a one-click return to the admin session is shown app-wide. Bootstrap the first admin with the `ADMIN_USER_IDS` Convex env var.
