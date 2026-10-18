# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database such as PostgreSQL. The database stores users, notes, tags, and the relationships between notes and tags. Primary keys identify records, while foreign keys maintain relationships and data integrity.

## 2. Entities and Columns

### Users

| Column | Type | Description |
|---|---|---|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | User's display name |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Secure password hash |
| created_at | TIMESTAMP | Account creation time |

### Notes

| Column | Type | Description |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key referencing users |
| title | VARCHAR(100) | Note title |
| body | TEXT | Note content |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

### Tags

| Column | Type | Description |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key referencing users |
| name | VARCHAR(50) | Tag name |

### Note_Tags

| Column | Type | Description |
|---|---|---|
| note_id | BIGINT | Foreign key referencing notes |
| tag_id | BIGINT | Foreign key referencing tags |

The combination of `note_id` and `tag_id` forms the composite primary key.

## 3. Relationships

- One user can have many notes. Each note belongs to one user.
- One user can create many tags. Each tag belongs to one user.
- One note can have many tags, and one tag can be assigned to many notes. The `note_tags` junction table implements this many-to-many relationship.

## 4. SQL Table Definitions

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## 5. Example SQL Queries

### Query 1: Retrieve a user's notes

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

This retrieves notes belonging to user 1, showing the most recently updated first.

### Query 2: Retrieve one note

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE id = 10 AND user_id = 1;
```

Checking the user ID helps ensure that a user only retrieves their own note.

### Query 3: Join notes with tags

```sql
SELECT n.title, t.name AS tag
FROM notes AS n
JOIN note_tags AS nt ON nt.note_id = n.id
JOIN tags AS t ON t.id = nt.tag_id
WHERE n.user_id = 1
ORDER BY n.title;
```

This JOIN query lists the tags assigned to a user's notes.

### Query 4: Count notes per user

```sql
SELECT u.id, u.name, COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name;
```

The LEFT JOIN includes users who have not created any notes.

## 6. Indexes

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);

CREATE INDEX idx_notes_user_title
ON notes (user_id, title);
```

The first index supports retrieving a user's notes in update order. The second can help when filtering or sorting a user's notes by title. Indexes improve some reads but use storage and add overhead to writes, so they should be reviewed using actual query patterns.

The primary keys and unique constraints also create indexes in PostgreSQL.

## 7. SQL versus NoSQL

A relational database is appropriate because users, notes, and tags have clear relationships. Foreign keys and transactions help preserve data integrity, while JOIN operations make it easier to retrieve notes with their tags.

A NoSQL database can be useful for flexible document structures or particular high-scale access patterns. However, it may require additional application logic to maintain relationships. For this project, PostgreSQL is a suitable starting point because the data is structured and relational.

## 8. Security and Integrity

- Store password hashes, never plaintext passwords.
- Authenticate users and verify ownership before reading, changing, or deleting notes.
- Use parameterized queries to reduce SQL injection risk.
- Apply database permissions according to least privilege.
- Back up the database and test restoration.
- Validate input in the application and enforce appropriate database constraints.
