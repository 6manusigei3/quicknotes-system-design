# QuickNotes API Design

## 1. Overview

QuickNotes is a note-taking application that allows users to create, view, update and delete notes. The API follows REST principles and uses JSON for request and response bodies.

The proposed production API base URL is https://api.quicknotes.example/v1. The frontend demonstration uses JSONPlaceholder, which simulates write operations without permanently saving changes.

## 2. REST endpoints

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| GET | /notes | List the authenticated user's notes | 200 OK |
| GET | /notes/{id} | Retrieve one note | 200 OK |
| POST | /notes | Create a note | 201 Created |
| PUT | /notes/{id} | Replace an existing note | 200 OK |
| PATCH | /notes/{id} | Update selected note fields | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /users/me | Retrieve the current user's profile | 200 OK |
| GET | /notes/{id}/tags | List tags attached to a note | 200 OK |
| POST | /notes/{id}/tags | Attach a tag to a note | 201 Created |

## 3. List notes: GET /notes

Example request:

    GET /v1/notes?limit=10&offset=0
    Authorization: Bearer access-token

Successful response (200 OK):

    {
      "data": [
        {
          "id": 101,
          "user_id": 7,
          "title": "Revision plan",
          "body": "Revise databases and networking.",
          "created_at": "2026-10-18T10:00:00Z",
          "updated_at": "2026-10-18T10:00:00Z"
        }
      ],
      "pagination": {
        "limit": 10,
        "offset": 0,
        "total": 1
      }
    }

Pagination limits the number of records returned. An empty collection returns 200 OK with an empty data array.

## 4. Retrieve a note: GET /notes/{id}

Retrieves a note by its ID if the authenticated user is allowed to access it. A successful request returns 200 OK. A missing or inaccessible note returns 404 Not Found.

## 5. Create a note: POST /notes

Example request:

    POST /v1/notes
    Authorization: Bearer access-token
    Content-Type: application/json

Request body:

    {
      "title": "Database revision",
      "body": "Review transactions and recovery."
    }

Successful response (201 Created):

    {
      "data": {
        "id": 102,
        "user_id": 7,
        "title": "Database revision",
        "body": "Review transactions and recovery.",
        "created_at": "2026-10-18T10:15:00Z",
        "updated_at": "2026-10-18T10:15:00Z"
      }
    }

The server assigns the ID and timestamps. The authenticated user ID should come from the access token, not an untrusted client field. A production response can include a Location header pointing to /v1/notes/102.

## 6. Update a note

### PUT /notes/{id}

Replaces all editable fields of an existing note. A successful update returns 200 OK and the updated note.

### PATCH /notes/{id}

Changes only supplied fields. Example request:

    {
      "title": "Updated revision plan"
    }

Fields not supplied remain unchanged. A successful update returns 200 OK.

## 7. Delete a note: DELETE /notes/{id}

Example request:

    DELETE /v1/notes/102
    Authorization: Bearer access-token

A successful deletion returns 204 No Content with no response body. A missing note returns 404 Not Found.

## 8. Error handling

| Status | Meaning | Example cause |
|---|---|---|
| 400 Bad Request | Invalid input | Missing title or malformed JSON |
| 401 Unauthorized | Authentication required | Missing or expired token |
| 403 Forbidden | Permission denied | User is not permitted to perform an action |
| 404 Not Found | Resource unavailable | Note does not exist |
| 500 Internal Server Error | Unexpected server failure | Unhandled application or database error |

Example validation error:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "The request contains invalid fields.",
        "details": [
          {
            "field": "title",
            "message": "Title is required and must not exceed 100 characters."
          }
        ],
        "request_id": "req-example-001"
      }
    }

Example authentication error:

    {
      "error": {
        "code": "UNAUTHENTICATED",
        "message": "Please sign in to continue."
      }
    }

Error responses must not expose passwords, tokens, SQL queries or internal stack traces.

## 9. Validation and security

- A title is required and must contain 1 to 100 characters after trimming whitespace.
- The body may be empty, but its maximum length should be defined.
- The server validates IDs and all incoming data.
- Users may access only their own notes unless sharing permissions are implemented.
- Production traffic must use HTTPS.
- Protected endpoints must check authentication and authorization.
- Rate limiting helps prevent abuse.
- Parameterized SQL queries help prevent SQL injection.

## 10. Demo limitation

The frontend uses https://jsonplaceholder.typicode.com/posts to demonstrate GET, POST and DELETE. JSONPlaceholder simulates writes, so created and deleted posts are not permanently saved. The /v1/notes endpoints in this document describe the proposed production API and require a real backend and database.
