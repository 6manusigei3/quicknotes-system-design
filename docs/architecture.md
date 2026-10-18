# QuickNotes System Architecture

## 1. Overview

QuickNotes is a note-taking application where users create, read, update, delete, and organize notes. The browser provides the user interface, application servers handle requests, and a relational database stores persistent data.

## 2. Functional Requirements

- Users can register and sign in.
- Users can create, view, edit, and delete their own notes.
- Users can search notes and organize them using tags.
- The system supports pagination when listing notes.
- The system returns clear validation and error messages.

## 3. Non-Functional Requirements

- Availability: the service should remain available during individual server failures.
- Performance: common note operations should respond quickly under normal load.
- Security: authentication, authorization, input validation, and encrypted connections protect user data.
- Scalability: additional application servers can be added as demand increases.
- Reliability: database backups and monitoring help recover from failures.
- Maintainability: components have clearly separated responsibilities.

## 4. Assumptions and Capacity Estimates

Assume 1,000,000 registered users, with 10% active daily. Each daily active user performs approximately 20 reads and 2 writes per day.

Daily active users = 1,000,000 × 10% = 100,000.

Estimated daily reads = 100,000 × 20 = 2,000,000.
Estimated daily writes = 100,000 × 2 = 200,000.

Average reads per second = 2,000,000 / 86,400 ≈ 23.
Average writes per second = 200,000 / 86,400 ≈ 2.3.

For planning, assume peak traffic reaches five times the average: approximately 115 reads/sec and 12 writes/sec. Actual capacity should be confirmed through load testing.

For storage, assume each user creates 10 notes per month and each note averages 2 KB of stored text and metadata.

Annual notes = 1,000,000 × 10 × 12 = 120,000,000 notes.
Annual raw note storage = 120,000,000 × 2 KB ≈ 240 GB per year.

This estimate excludes indexes, replicas, backups, logs, and other database overhead. Provisioning additional capacity is necessary.

## 5. High-Level Architecture

```text
                       Users / Browsers
                              |
                             DNS
                              |
                         CDN / HTTPS
                              |
                       Load Balancer
                         /         \
                        /           \
                App Server 1     App Server 2
                        \           /
                         \         /
                         Application
                         /    |     \
                        /     |      \
                   Cache   Primary DB  Queue
                              |          |
                         Read Replica  Worker
```

## 6. Component Responsibilities

- Client: displays the interface and sends API requests.
- DNS: translates the application domain into the relevant network address.
- CDN: caches eligible static assets near users and reduces application-server load.
- Load balancer: distributes incoming requests across healthy application servers.
- Application servers: authenticate requests, validate input, enforce permissions, and execute application logic.
- Cache: stores frequently requested data temporarily to reduce database reads. Cache misses fall back to the database.
- Primary database: stores authoritative users, notes, tags, and relationships; handles writes.
- Read replica: serves suitable read queries and reduces read pressure on the primary. Replication may introduce short delays.
- Queue: holds background jobs such as notifications or expensive processing.
- Worker: processes queued jobs without delaying the original user request.

## 7. GET /notes Request Flow

1. The browser resolves the application domain through DNS.
2. The CDN serves cached static files when possible.
3. The request reaches the load balancer over HTTPS.
4. The load balancer forwards the request to a healthy application server.
5. The application server validates the user's authentication and permissions.
6. The application checks the cache for the requested notes.
7. On a cache miss, it queries the database or an appropriate read replica.
8. The application returns paginated JSON over HTTPS.
9. The browser displays the notes.

Private notes must not be placed in a shared cache in a way that could expose one user's data to another user.

## 8. POST /notes Request Flow

1. The browser sends a POST request containing the note title and body over HTTPS.
2. The load balancer forwards it to a healthy application server.
3. The application authenticates the user and checks authorization.
4. The server validates the title, body, and request format.
5. The application inserts the new note into the primary database.
6. After a successful database write, the server returns HTTP 201 Created with the new note.
7. Any affected cache entry is invalidated or updated.
8. If background work is required, the application places a job on the queue for a worker to process.

The database write must succeed before the application reports that the note has been saved.

## 9. Trade-offs

### SQL versus NoSQL

A relational database such as PostgreSQL is a good starting choice because notes, users, tags, and note-tag relationships have clear relationships. Transactions, constraints, and joins support data integrity. NoSQL may be useful if access patterns or scale later justify its flexibility, but it is not automatically better.

### Cache versus consistency

Caching improves read performance and reduces database load, but cached data may become stale. Cache invalidation and short expiration times help manage this risk. User-specific data must be isolated.

### Read replicas versus consistency

Read replicas improve read capacity, but replication lag may cause recently changed notes to appear late. Read-after-write requests can use the primary database when immediate consistency is required.

### CDN versus privacy

A CDN improves delivery of static resources, but private note content should not be publicly cached. Cache rules must distinguish public assets from authenticated API responses.

### Queue versus complexity

Queues let workers process slow tasks asynchronously, but introduce retry, monitoring, and duplicate-processing concerns. Jobs should be designed to be safely retried.

## 10. Avoiding Single Points of Failure

- Run at least two application servers behind a health-checking load balancer.
- Deploy across separate failure zones where practical.
- Configure automated database backups and regularly test restoration.
- Use database replication and a documented failover procedure.
- Monitor the primary database, replicas, queue, workers, and application servers.
- Use retries with limits and timeouts for temporary failures.
- Keep infrastructure configuration and deployment instructions under version control.

A read replica alone is not a complete high-availability strategy; failover must be configured and tested.

## 11. Monitoring and Security

Monitor request rate, latency, error rate, CPU, memory, database connections, cache hit rate, queue depth, and replication lag. Use structured logs while avoiding passwords, tokens, and private note contents. Apply least-privilege access, secure secret storage, regular backups, and HTTPS.

## 12. Conclusion

This architecture separates the client, request routing, application logic, storage, caching, and background processing. It can scale by adding application servers and improving database capacity as measured demand grows. Capacity estimates are planning assumptions and should be validated with realistic load tests.
