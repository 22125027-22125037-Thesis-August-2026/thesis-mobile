## 8080 Gateway (Axios)

This app uses a single Axios client pointed at the 8080 API Gateway. All API modules under [src/api](src/api) call the gateway and use service prefixes to reach each backend service.

### Base URL

- `http://161.118.252.10:8080`

### Axios Client

The Axios client is defined in [src/api/axiosClient.ts](src/api/axiosClient.ts) and reused across all API modules.

- Authorization header is injected from `AsyncStorage` (`userToken`).
- 401/403 responses auto-clear auth storage and trigger logout.
- Request/response logs are enabled in dev only.

### Service Prefixes

When calling the gateway, each service is namespaced by a prefix in the URL path. Always include the service prefix shown below.

| Service | Prefix | Notes |
| --- | --- | --- |
| Therapist | `/api/v1/therapist` | Therapist booking, reviews, notes, matching |
| Social | `/api/v1/social` | Social posts, comments, reactions |
| Tracking | `/api/v1/tracking` | Tracking, health metrics |
| Notification | `/api/v1/notification` | Notifications, FCM, push |
| Authentication | `/api/v1/auth` | Login, refresh, profile auth |
| Other | `/api/v1/<service>` | Follow the matching Controller.md doc |

### Example: Add Therapist Prefix

Controller doc example:

| Method | Path | Auth | Role | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/bookings/{appointmentId}/join` | Yes | Any authenticated user | Join a video session |

Gateway usage in the app:

```
GET /api/v1/therapist/bookings/{appointmentId}/join
```

Example Axios call (see [src/api/therapistApi.ts](src/api/therapistApi.ts)):

```
axiosClient.get(`/api/v1/therapist/bookings/${appointmentId}/join`)
```

### Guidelines for UI Teams

- Always call the 8080 gateway base URL, not individual services.
- Always include the correct service prefix before the endpoint path from Controller.md.
- Keep API calls inside `src/api/*` modules and reuse `axiosClient`.
