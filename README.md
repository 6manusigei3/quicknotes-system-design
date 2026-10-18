# QuickNotes System Design

QuickNotes is a note-taking application project demonstrating a browser-based API client and the design of a scalable REST API backend. The project includes a working frontend demo using JSONPlaceholder and documentation for a production-style system.

## Features

- Load and display notes from a REST API.
- Create notes through a form with title validation.
- Delete notes and display request status messages.
- Handle loading, empty, and error states.
- Document REST API endpoints, database design, and scalable architecture.

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## How to Run

1. Clone or download this repository.
2. Open `index.html` in a browser, or serve the folder using a local development server.
3. Select **Load Notes** to retrieve sample notes.
4. Use the form to create a sample note or the Delete button to remove one.
5. An internet connection is required to access the JSONPlaceholder API.

The frontend uses `https://jsonplaceholder.typicode.com/posts` for demonstration. JSONPlaceholder simulates write operations, so created and deleted notes are not permanently stored on the service.

## System Design Documentation

- [API Design](docs/api-design.md) — REST endpoints, JSON examples, status codes, and error handling.
- [Data Model](docs/data-model.md) — entities, relationships, SQL table definitions, queries, indexes, and database choice.
- [Architecture](docs/architecture.md) — requirements, traffic and storage estimates, architecture diagram, request flows, trade-offs, and reliability.

## What I Learned

1. How to use the Fetch API and handle HTTP responses, errors, and asynchronous requests.
2. How REST endpoints use HTTP methods and status codes to represent operations and outcomes.
3. How relational database tables, primary keys, foreign keys, and joins represent connected data.
4. How caching, load balancing, read replicas, and background queues can support application growth.
5. Why security, validation, monitoring, and recovery planning matter when designing production systems.

## Future Improvements

- Add user authentication and authorization.
- Replace the demonstration API with a persistent backend and database.
- Add automated tests, pagination, search, and note tagging.
- Deploy the application with monitoring and backups.
