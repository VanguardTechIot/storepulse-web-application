# StorePulse · Local JSON API

Mock of the StorePulse REST API for frontend development, served by
[json-server](https://github.com/typicode/json-server) at `http://localhost:3000/api/v1`.

```bash
npm run mock:api
```

## Resources

| Bounded context | Resource | Path |
| --- | --- | --- |
| Identity and Access Management | Users | `/api/v1/users` |
| Identity and Access Management | Password recoveries | `/api/v1/password-recoveries` |

## Seed accounts

Both accounts use the password `StorePulse2026` (stored as a SHA-256 hash).

| Email | Role | Expected result in the web app |
| --- | --- | --- |
| `carmen.mendoza@galeriacentral.pe` | `GALLERY_ADMINISTRATOR` | Signs in (US-02). |
| `luis.paredes@galeriacentral.pe` | `TENANT` | Rejected: tenants use the mobile app (US-05). |

## Password recovery

There is no email service in local development: after requesting a code, the 6-digit code is
printed in the browser console (`[IAM] Password reset code: ...`) and saved in
`password-recoveries` inside `db.json`.
