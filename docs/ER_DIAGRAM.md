# Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROBLEMS : owns
    USERS ||--o{ CONTESTS : logs
    USERS ||--o{ GOALS : sets
    USERS ||--o{ ACTIVITIES : accumulates
    USERS ||--o{ FAVORITES : marks
    PROBLEMS ||--o| FAVORITES : "favorited via"

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password "bcrypt hash"
        varchar target_company
        varchar bio
        datetime created_at
        datetime updated_at
    }

    PROBLEMS {
        int id PK
        int user_id FK
        varchar title
        enum platform
        enum difficulty
        varchar topic
        enum status
        text notes
        date solved_date
        int time_spent_minutes
        datetime created_at
        datetime updated_at
    }

    CONTESTS {
        int id PK
        int user_id FK
        varchar name
        enum platform
        date contest_date
        int rating
        int rank
        int problems_solved
        datetime created_at
        datetime updated_at
    }

    GOALS {
        int id PK
        int user_id FK
        enum period "daily|weekly|monthly"
        varchar title
        varchar target_topic "nullable"
        int target_count
        date start_date
        date end_date
        datetime created_at
        datetime updated_at
    }

    ACTIVITIES {
        int id PK
        int user_id FK
        date activity_date
        int problems_solved
        datetime created_at
        datetime updated_at
    }

    FAVORITES {
        int id PK
        int user_id FK
        int problem_id FK
        datetime created_at
    }
```

## Design notes

- **`goals` stores no progress/completion columns.** Progress is computed at read time by counting matching rows in `problems` (filtered by `solved_date` within `[start_date, end_date]` and, optionally, `topic`). This avoids a denormalized counter going stale if a problem is later edited or deleted.
- **`activities` is a daily rollup, not a raw event log.** One row per `(user_id, activity_date)`, incremented/decremented by `backend/src/utils/activitySync.js` whenever a problem's `status`/`solved_date` changes. It exists purely so the streak calculation and the analytics heatmap don't have to re-scan all of `problems` on every request.
- **`favorites` is a proper join table**, not a boolean column on `problems`, even though today a favorite can only reference a problem owned by the same user. This keeps the schema extensible (e.g. a future shared/public problem set) and demonstrates the many-to-many pattern explicitly.
- Every child table cascades on `user_id` (`ON DELETE CASCADE`) so deleting a user cleans up all of their data automatically.
