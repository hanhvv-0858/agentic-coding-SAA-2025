# Database Design — Sun\* Annual Awards 2025

Snapshot ERD of the public schema after all 21 migrations. Source of truth for table shapes and relationships lives in [database-schema.sql](database-schema.sql).

## Reading the diagram

- **`||--||`** = one-to-one (e.g. `auth_users` ↔ `profiles`, `kudos` ↔ `kudo_recipients` — current spec is single-recipient per kudo)
- **`||--o{`** = one-to-many (standard FK relationship)
- **`PK`** marks the primary key. On junction tables (`kudo_recipients` / `kudo_hashtags` / `kudo_hearts`) the composite PK columns are also foreign keys to their parent tables — Mermaid's `erDiagram` syntax only supports a single marker per row, so FK semantics are noted in the column comment where helpful.

## ERD

```mermaid
erDiagram
    auth_users ||--|| profiles : "owns"
    departments ||--o{ profiles : "groups"
    profiles ||--o{ kudos : "sends"
    profiles ||--o{ kudo_recipients : "receives"
    profiles ||--o{ kudo_hearts : "hearts"
    profiles ||--o{ gift_redemptions : "earns"
    profiles ||--o{ secret_boxes : "owns"
    kudos ||--|| kudo_recipients : "delivered_to"
    kudos ||--o{ kudo_hashtags : "tagged_with"
    kudos ||--o{ kudo_hearts : "receives"
    kudos ||--o{ kudo_images : "attaches"
    hashtags ||--o{ kudo_hashtags : "categorises"

    auth_users {
        uuid id PK "supabase managed"
        text email
        jsonb raw_user_meta_data
    }

    departments {
        uuid id PK
        text code UK "49 canonical Sun* codes"
        text name_vi
        text name_en
        timestamptz created_at
    }

    profiles {
        uuid id PK "references auth.users"
        text email
        text display_name
        text avatar_url
        uuid department_id FK
        honour_title honour_title "enum: Legend/Rising/Super/New Hero"
        timestamptz created_at
    }

    hashtags {
        uuid id PK
        text slug UK
        text label_vi
        text label_en
        timestamptz created_at
    }

    kudos {
        uuid id PK
        uuid sender_id FK
        text body
        text title "default Lời cám ơn"
        boolean is_anonymous
        text anonymous_alias "2..40 chars when anon"
        timestamptz created_at
    }

    kudo_recipients {
        uuid kudo_id PK
        uuid recipient_id PK
    }

    kudo_hashtags {
        uuid kudo_id PK
        uuid hashtag_id PK
    }

    kudo_hearts {
        uuid kudo_id PK
        uuid user_id PK
        timestamptz created_at
    }

    kudo_images {
        uuid id PK
        uuid kudo_id FK
        text url "supabase storage path"
        smallint position "0..4"
        timestamptz created_at
    }

    gift_redemptions {
        uuid id PK
        uuid user_id FK
        text gift_name
        integer quantity "default 1"
        text source "default secret_box"
        timestamptz redeemed_at
        timestamptz created_at
    }

    secret_boxes {
        uuid id PK
        uuid user_id FK
        timestamptz opened_at "null when unopened"
        timestamptz created_at
    }
```
