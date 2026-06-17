# Deployment Guide — workout-gym-admin-panel

Runs as a single Docker container serving the Next.js standalone build on port **3001** (host).

---

## Prerequisites

- Docker + Docker Compose v2
- Git

---

## Important: Build-time Environment Variables

`NEXT_PUBLIC_*` variables in Next.js are **inlined at build time**, not injected at runtime. This means:

- The API URL is compiled into the JavaScript bundle during `docker compose up --build`
- Changing `NEXT_PUBLIC_API_URL` in `.env` requires a **rebuild** (`docker compose up -d --build`)
- The `.env` file is read by Docker Compose to pass the value as a build argument — the running container itself does not need it

---

## Steps

### 1. Clone the repository

```bash
git clone <your-repo-url> workout-gym-admin-panel
cd workout-gym-admin-panel
```

### 2. Create `.env`

```bash
cp .env.example .env
```

Open `.env` and set:

```
NEXT_PUBLIC_API_URL=http://your-server-ip-or-domain:4000/api/v1
```

Use the public IP or domain where `workout-gym-api` is reachable from the admin user's browser — not `localhost`.

### 3. Make `deploy.sh` executable (first time only)

```bash
chmod +x deploy.sh
```

### 4. Deploy

```bash
bash deploy.sh
```

This pulls the latest code, builds the Docker image (with `NEXT_PUBLIC_API_URL` baked in), and starts the container.

### 5. Verify

```bash
curl -I http://localhost:3001
# HTTP/1.1 200 OK (or 307 redirect to /login)
```

View logs:

```bash
docker logs -f workout-gym-admin-panel
```

---

## Subsequent Deploys

```bash
bash deploy.sh
```

If `NEXT_PUBLIC_API_URL` has not changed, the Docker layer cache means the rebuild is fast.

---

## Ports

| Host port | Container port | Description |
|---|---|---|
| 3001 | 3000 | Admin panel |

The admin panel uses host port **3001** to avoid conflict with the user-facing app on 3000. To change it, edit `docker-compose.yml`:
```yaml
ports:
  - "4001:3000"   # serve on host port 4001
```

---

## Troubleshooting

**App loads but API calls fail (network errors or CORS)**
- Confirm `NEXT_PUBLIC_API_URL` points to the public IP/domain of the API, not `localhost` or an internal Docker address
- Rebuild after changing: `docker compose up -d --build`

**Container crashes immediately**
```bash
docker logs workout-gym-admin-panel
```
A build error during `npm run build` inside Docker usually means a TypeScript or ESLint error. Run `npm run build` locally to reproduce.

**Old API URL still baked in after updating `.env`**
Run a full rebuild: `docker compose up -d --build --no-cache`
