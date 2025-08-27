# Fanvue AppStore Dashboard

A Next.js 15 dashboard for moderating app submissions with real-time updates and compliance features.

## Getting Started (formatted with LLM)

### Environment Variables

```bash
# API Configuration
API_CACHE_MAX_AGE=300
API_CACHE_STALE_WHILE_REVALIDATE=600
NEXT_PUBLIC_API_BASE_URL="/api/v1"

# Mock Data Configuration
MOCK_DATA_COUNT=1000
MOCK_SUBMISSION_DATE_RANGE_DAYS=30
MOCK_UPDATE_DATE_RANGE_DAYS=7

# Security Configuration
CORS_ORIGIN="https://dashboard.fanvue.com"
PORT=3000

# Node Environment
NODE_ENV="development"
```

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with the values shown above
   ```

3. Run database migrations and seed data:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## Database Commands (formatted with LLM)

- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with mock app submissions
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Deployment & Performance

### Performance Considerations

The current implementation works fine for development, but there are some obvious bottlenecks that will cause issues at scale. SQLite is the biggest problem - it will start failing around 50 concurrent connections. I've seen this before with internal tools that suddenly get popular.

The app table loads everything upfront (1000 rows) instead of virtualizing, which means we're hitting the database and rendering way more than needed. Each image request for app screenshots hits the origin server directly since there's no CDN. The database has no connection pooling or read replicas, and while filter state persists to localStorage, other client state gets wiped on refresh. Search is debounced but there's no server-side indexing or full-text search capability.

The dashboard hydrates the entire app table on initial load, causing a 2-3 second delay before users can interact with anything. We should split the table into a client component with skeleton states while keeping the header as a server component. Search functionality triggers full re-renders of the entire table - React 19's useDeferredValue would help keep the UI responsive during search operations.

Bundle size is currently 280KB gzipped, but we can cut this down significantly. Dynamic imports for moderation modals would save about 50KB on initial load since most users won't need those immediately. The table component could be code split entirely, and the API is sending full app objects when the table only needs basic display information. We're missing gzip compression on API responses, which would reduce payload by about 70%, and there's no Next.js Image optimization for app screenshots.

For caching strategy, we need Redis write-through for app metadata with 5-minute TTL, write-behind for user sessions with 24-hour TTL, and cache-aside pattern for search results with 1-minute TTL. The CDN should cache static assets for 1 year with immutable headers and API responses for 30 seconds with stale-while-revalidate. If we implement WebSocket connections for real-time updates, memory becomes an issue - each connection holds 2KB metadata, so 10k users equals 20MB just for connection state. The bigger issue would be Next.js handling both API routes and WebSocket connections in the same process.
Lazy loading needed: virtualize table rows with react-window, lazy load moderation modals, intersection observer for image loading, and infinite scroll instead of pagination.

### Infrastructure & Observability

For production, I would split this into separate services running on EKS. The UI can stay as a Next.js app, but the API should be independent. If we add WebSocket handling for real-time updates, that should be a separate service too. PostgreSQL RDS with read replicas in EU and US regions handles the GDPR data residency requirements.
Core infrastructure: EKS Fargate for containers, ALB (with sticky sessions if we add WebSockets), Redis Cluster for caching, RDS PostgreSQL with cross-region read replicas, Kafka MSK for events, and KMS for encryption.
CQRS pattern works well - moderation actions go through Kafka topics while dashboard queries hit read models. This separates write/read load and gives us audit trails for compliance.
For environments, I'd use GitOps with ArgoCD. Development gets a single cluster with reduced resources, staging mirrors production with anonymized data, and production runs multi-AZ with blue-green deployments. Feature flags through LaunchDarkly for gradual rollouts.
API scalability needs rate limiting (100 req/min per user), load balancing with least-connections (WebSocket stickiness if implemented), circuit breakers for failing dependencies, and HPA based on request volume or WebSocket connections per pod.
Logging uses structured JSON with correlation IDs across all services. ELK stack for processing and visualization, 90 days retention for audit compliance, 30 days for operational logs. Centralized through Fluentd daemonsets. Alerting with clear SLAs: P0 system down (99.9% uptime) escalates to PagerDuty in 2 minutes, P1 performance issues (95th percentile >1s) go to Slack and escalate after 15 minutes, P2 high error rates (>1% 5XX) email and escalate after 1 hour.
Datadog dashboards track API latency, database connection pools, Kafka lag, moderation queue depth, moderator productivity, pod resources, and real-user monitoring for page loads and JavaScript errors.

### Security

CORS setup uses Next.js headers configuration for static rules or middleware for dynamic CORS. For this project, middleware handles API route preflight requests with origin whitelisting:

```typescript
const allowedOrigins = ['https://dashboard.fanvue.com']
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)
  // Handle CORS headers for API routes
}
export const config = { matcher: '/api/:path*' }
```

XSS protection relies on React's built-in sanitization by avoiding `dangerouslySetInnerHTML` for app descriptions and user content. Content Security Policy headers block inline scripts and `unsafe-eval` through Next.js CSP configuration.

CSRF protection uses `httpOnly` and `secure` cookies for sessions, server actions with explicit origin validation (never wildcard), and prevents GET mutations for moderation actions like approve/reject operations.

### Real-world Scaling Experience

I ran into a similar situation at Nike in 2023 with an internal product management tool. Started with maybe 150 users in the US, but when other regions adopted it we jumped to 2800+ users across Europe and Asia Pacific. The original MySQL setup could not handle the read load, especially during those few hours when all time zones overlapped.

Nike had strict data residency rules. Product images and pricing data had to stay in specific regions. We ended up migrating to RDS PostgreSQL with a write primary in us-west-2 and read replicas in eu-west-1 and ap-southeast-1. Added some logic to route read queries to the nearest replica based on the user's location.

The results were significant - average query time dropped from around 750ms to under 180ms. We also added PgBouncer for connection pooling, which cut our database connection overhead by about 65%. The regional teams stopped filing tickets about slow performance, and we handled the growth to 4500+ users without major issues.

## AI Tools

I used AI code tools to quickly generate UI components within the 2-hour challenge timeframe rather than pixel-perfecting everything manually. About 80% of the UI implementation is my own code - I focused on the core challenge requirements like API design, state management, and architecture decisions. AI helped accelerate boilerplate component creation and database migration scripts so I could spend more time on the substantial parts of the challenge.

## Improvements

Given more time, I would implement:

- **Real backend server** - Separate API service instead of Next.js API routes for better scalability
- **gRPC implementation** - Reduced payload size and better performance than REST JSON
- **Enhanced UI/UX** - Proper component library, animations, responsive design, and accessibility
- **PostgreSQL database** - Replace SQLite with proper ACID compliance and connection pooling
- **Type-safe API layer** - OpenAPI/Swagger with codegen for end-to-end type safety between frontend and backend
- **Redis caching** - In-memory caching layer for frequently accessed data
- **Request queue management** - Background job processing for moderation actions and audit logging
- **Multi language support** - Add i18n
- **Server Side rendering** - Use Next js SSR
- **Make it responsive** 
