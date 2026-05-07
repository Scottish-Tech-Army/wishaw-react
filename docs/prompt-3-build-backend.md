# Prompt 3: Build Spring Boot Backend for the React UI

> Use this prompt after the React frontend is built. Provide the frontend's API client, types, and mock data so the backend implements the exact contract the UI expects.

---

## PROMPT START

You are a senior backend developer. Build me a **complete Spring Boot REST API** that serves as the backend for an existing React frontend. The frontend already works with a mock API — I need a real backend that matches exactly the same API contract, request/response shapes, and endpoint paths.

---

### Frontend context:

Here is the frontend's API client that defines every endpoint the UI calls:

[PASTE YOUR api-client.ts HERE]

Here is the TypeScript types file that defines all request/response shapes:

[PASTE YOUR types/index.ts HERE]

Here is the mock data the frontend uses (so you can seed the same demo data):

[PASTE YOUR mock JSON files OR mock-api.ts HERE]

---

### Tech Stack:

- **Framework:** Spring Boot 3.4 with Java 17
- **Build:** Maven
- **Database:** H2 (in-memory, default dev profile) + PostgreSQL (production profile)
- **Auth:** JWT (access token + refresh token) using jjwt library
- **Validation:** spring-boot-starter-validation (Jakarta Bean Validation)
- **API docs:** springdoc-openapi (Swagger UI)
- **File processing:** Apache POI for spreadsheet imports
- **Utilities:** Lombok
- **Testing:** Spring Boot Test + Spring Security Test + JaCoCo coverage
- **Containerization:** Dockerfile (eclipse-temurin:17-jre base)
- **Orchestration:** Kubernetes manifests (Deployment, Service, Ingress, HPA, ConfigMap, Secret)

---

### What I need you to build:

**1. Project structure**
Follow standard Spring Boot layered architecture:
```
config/       — App properties, CORS, OpenAPI config, data seeder, correlation ID filter
controller/   — One controller per domain (Auth, Profile, Sports, Tournaments, Matches, Teams, Leaderboard, Badges/Catalogue, Modules, Stats, Notifications, AdminImport)
dto/          — Request/response DTOs grouped by domain (use Java records)
entity/       — JPA entities for every domain object
enums/        — Java enums for all status types, roles, badge levels
exception/    — Global exception handler, custom exceptions (BadRequest, ResourceNotFound), error response DTO
mapper/       — Entity ↔ DTO mapping (static methods or a mapper class)
repository/   — Spring Data JPA repositories
security/     — JWT service, JWT filter, SecurityConfig, UserDetailsService, access denied & auth entry point handlers
service/      — Business logic, one service per domain
migration/    — Spreadsheet import service (POI) + optional startup import runner
```

**2. Security & Authentication**
- JWT-based auth: access token (configurable expiry, default 60 min) + refresh token (default 7 days)
- Endpoints: POST login, POST register, POST logout, POST refresh, GET me
- Password hashing with BCrypt
- Role-based access: PLAYER, ADMIN, SUPER_ADMIN
- Secure all endpoints except: auth endpoints, actuator health, swagger docs
- Return proper JSON error responses (not Spring's default HTML) for 401/403
- CORS configured for the frontend origin (default http://localhost:3000)
- Correlation ID filter for request tracing in logs

**3. Database & JPA**
- Entities for: UserAccount, UserProfile, Centre, GameGroup, Sport, Tournament, TournamentParticipant, Team, TeamMember, MatchRecord, MatchParticipant, MainBadge, SubBadge, UserSubBadge, LearningModule, ModuleSessionItem, NotificationRecord, CaloriesLog
- Use JPA annotations, generated UUIDs or auto-increment IDs
- H2 profile: `create-drop` DDL, in-memory with PostgreSQL compatibility mode
- PostgreSQL profile: `validate` or `update` DDL with real connection pool
- K8s profile: reads DB URL, username, password from environment variables

**4. Data Seeding**
- On startup (when seed enabled), populate the database with demo data matching the frontend mock data:
  - Demo users: admin@wymca.org (ADMIN), player1@wymca.org (PLAYER), player2@wymca.org (PLAYER) — all with bcrypt-hashed passwords
  - Centres and groups
  - 5 main badges with sub-badges linked to modules
  - Training modules with weekly session schedules
  - Sports
  - Tournaments with participants, matches, and leaderboard-ready data
  - Sample notifications
- Guard against duplicate seeding (check if data already exists)

**5. REST Controllers**
Implement every endpoint from the frontend's API client. Ensure:
- Paths match exactly (the frontend hardcodes them)
- Request/response JSON shapes match the frontend's TypeScript types
- Proper HTTP methods and status codes
- Validation on request bodies
- Role-based authorization annotations (@PreAuthorize or SecurityConfig rules)
- Pagination support where the frontend sends query params

**6. Business Logic**
- Tournament lifecycle: DRAFT → PUBLISHED → COMPLETED / CANCELLED
- Join/leave tournaments with capacity checks and participant count sync
- Badge progress calculation: aggregate sub-badge XP per main badge, derive level (Platinum≥121, Gold≥71, Silver≥31, Bronze≥1)
- Match scoring, attendance tracking
- Notification creation on key events (tournament published, badge awarded)
- Global leaderboard ranked by total XP
- Player stats aggregation (tournaments, wins, losses, draws, attendance rate)

**7. Spreadsheet Import**
- POST endpoint for admin to upload Excel/spreadsheet file
- Parse with Apache POI, create H2 tables dynamically from sheet data
- Return import summary (sheets imported, rows per sheet, table names)
- Configurable option to drop existing import tables before re-import
- Max upload size: 25MB

**8. Application Configuration**
- `application.yml`: server port, active profile, multipart limits, actuator exposure, swagger paths, CORS origins, JWT secret/expiry, seed toggle
- `application-h2.yml`: H2 in-memory, create-drop, H2 console enabled
- `application-postgres.yml`: PostgreSQL datasource, validate DDL
- `application-k8s.yml`: reads everything from env vars, PostgreSQL, seed disabled

**9. Dockerfile**
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**10. Kubernetes Manifests** (`k8s/` folder)
- **Deployment**: 2 replicas, resource limits (500m CPU / 512Mi), readiness probe on `/actuator/health/readiness`, liveness probe on `/actuator/health/liveness`, env vars from ConfigMap + Secret, Spring profile set to `k8s`
- **Service**: ClusterIP, port 80 → 8080
- **Ingress**: Route a hostname to the service
- **HPA**: Scale 2–5 replicas on 75% CPU
- **ConfigMap**: UI_ORIGIN, DB_URL
- **Secret (example)**: JWT_SECRET, DB_USERNAME, DB_PASSWORD (placeholder values, not real)

**11. Testing foundation**
- At minimum: application context loads test
- Auth controller integration test (login success, login failure, register)
- Security configuration test (protected endpoints return 401 without token)

---

### Key constraints:
- The **frontend is already built and deployed** — the backend must match its API contract exactly. Do not change endpoint paths or response shapes.
- Return proper JSON error bodies: `{ "error": "message", "code": "ERROR_CODE" }` — the frontend checks for `code: "TOKEN_EXPIRED"` specifically.
- Date fields should serialize as ISO-8601 strings.
- IDs can be strings or numbers — the frontend treats them as strings.
- Sport icons and badge icons are emoji strings — store them as-is.

### Deliver:
- Every Java file, every config file, every K8s manifest. The project should build with `mvn clean package` and run with `mvn spring-boot:run`, then serve the existing frontend correctly.

## PROMPT END
