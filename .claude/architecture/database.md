# Database

Supabase PostgreSQL. Migrations in `supabase/migrations/`.

## Tables

| Table           | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `nutritionists` | Nutritionist profiles, business hours, FAQ config |
| `patients`      | Patient profiles, diet PDF URL + extracted text   |
| `chat_sessions` | Conversation sessions (web/whatsapp)              |
| `messages`      | Individual messages with sender, intent, metadata |
| `appointments`  | Scheduled appointments with status                |
| `handoffs`      | Escalated conversations needing human response    |

## Key Relationships

```
nutritionists
    │
    ├──▶ patients (1:N)
    │        │
    │        ├──▶ chat_sessions (1:N)
    │        │        │
    │        │        └──▶ messages (1:N)
    │        │
    │        └──▶ appointments (1:N)
    │
    └──▶ handoffs (via chat_sessions)
```

## Enums

| Type                 | Values                                   |
| -------------------- | ---------------------------------------- |
| `channel_type`       | web, whatsapp                            |
| `session_status`     | active, closed                           |
| `sender_type`        | patient, nina, nutritionist              |
| `appointment_status` | scheduled, completed, cancelled, no_show |
| `handoff_status`     | pending, resolved                        |

## Realtime

Enabled on `messages` table for instant updates:

- Dashboard sees nutritionist replies immediately
- Patient chat sees nutritionist replies immediately

**Migration**: `003_enable_realtime.sql`

## Supabase Clients

Located in `src/lib/supabase/`:

| Client      | Use Case                               |
| ----------- | -------------------------------------- |
| `client.ts` | Browser (anon key, read-only)          |
| `server.ts` | Server components                      |
| `admin.ts`  | API routes (service role, full access) |

## Storage

- **Bucket**: `diet-pdfs`
- **Purpose**: Patient diet PDF files
- **Access**: Private, served via signed URLs
