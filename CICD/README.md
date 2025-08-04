# MyDormStore — Assignment 2 (Deployment Guide)

This repository includes Docker/Compose assets and helper scripts to deploy **MyDormStore** (backend) with a **PostgreSQL 15** database, and to run a simple HTTP health check.

---

## What’s included

- **`docker-compose.yml`**
  - **Compose version:** `3.8`
  - **Services**
    - **`app`**
      - **Image:** `ashleylinn/mydormstore:1.0.41`
      Note: the image is tagged as both `latest` and versioned `1.0.<run_number>`
      - **Ports:** `5001:5000` (host → container)
      - **Environment:**
        - `PORT=5000`
        - `PG_USER=postgres`
        - `PG_HOST=db`
        - `PG_DATABASE=mydormstore`
        - `PG_PWD=password`
        - `PG_PORT=5432`
      - **depends_on:** `db`
    - **`db`**
      - **Image:** `postgres:15`
      - **Environment:**
        - `POSTGRES_DB=mydormstore`
        - `POSTGRES_USER=postgres`
        - `POSTGRES_PASSWORD=password`
      - **Ports:** `5432:5432`
      - **Volumes:** `postgres_data:/var/lib/postgresql/data`
      - **Restart:** `unless-stopped`
  - **Volumes**
    - `postgres_data`

- **`deploy.sh`**
  - Prints start messages.
  - Pulls the image tagged `ashleylinn/mydormstore:<version>` (e.g., `1.0.41`)
  - Changes into `CICD/` and runs `docker compose up -d`.
  - Waits **15 seconds**.
  - Health checks `http://localhost:5001/` (root path). Exits non-zero on failure.

- **`test-script.sh`**
  - Waits **5 seconds**.
  - Runs `docker ps`.
  - Health checks `http://localhost:5001/`. Exits `0` on success, `1` on failure.

- **`Dockerfile.txt`** *(optional; for building your own backend image)*
  - **Base:** `node:18`
  - `WORKDIR /app`
  - Copies `backend/package*.json` and runs `npm install`
  - Copies `backend/` source
  - `EXPOSE 5000`
  - `CMD ["node", "server.js"]`

---

## Prerequisites

- Docker (Desktop or Engine) and **Docker Compose v2**
- Network access to pull images from Docker Hub

---

## Repository layout (required by the scripts)

> **Important:** `deploy.sh` changes into `CICD/` before running Compose. Ensure your `docker-compose.yml` is located inside a `CICD/` folder.

```
repo-root/
  CICD/
    docker-compose.yml
  deploy.sh
  test-script.sh
  Dockerfile.txt            # only needed if you plan to build locally
  backend/                  # only needed if you plan to build locally
    package.json
    server.js
    ...
```

If your `docker-compose.yml` is elsewhere, either move it under `CICD/` or edit the `cd CICD` line in `deploy.sh` to match your structure.

---

## Quick start (deploy + verify)

From the repository root:

```bash
# Make scripts executable (first time)
chmod +x deploy.sh test-script.sh

# Deploy
./deploy.sh
```

What it does:
1. Pulls `ashleylinn/mydormstore:<version>` (e.g., 1.0.41), as defined in your deploy pipeline.
2. Runs `docker compose up -d` in `CICD/`
3. Waits ~15s
4. Health checks `http://localhost:5001/`

**Post-deploy smoke test:**
```bash
./test-script.sh
```

---

## Manual deployment (alternative)

```bash
cd CICD
docker compose pull
docker compose up -d
curl -f http://localhost:5001/
```

---

## Build the image locally (optional)

The Compose setup uses the prebuilt image tagged as `ashleylinn/mydormstore:<version>` (e.g., 1.0.41).
A latest tag is also available but not used by default in deployment.  
If you want to build your own image (and then update Compose to use it):

```bash
# From repo root
docker build -f Dockerfile.txt -t mydormstore-local:latest .
```

Ensure your `backend/` folder exists and the server listens on **port 5000** (the Compose file maps `5001:5000`).

---

## Ports & connectivity

- **Application:** `http://localhost:5001/` → container `5000`
- **Database:** `localhost:5432` (PostgreSQL 15)
- The app uses `db:5432` on the Compose network (see `PG_HOST=db`, `PG_PORT=5432`).

---

## Troubleshooting

- **Health check fails** (`http://localhost:5001/`)
  - Ensure nothing else is using host port **5001**.
  - Confirm the app inside the container listens on **5000**.
  - Check logs: `docker logs <app_container_id>`
- **Database issues**
  - Verify credentials match `docker-compose.yml`.
  - Check DB logs: `docker logs <db_container_id>`
- **Compose file not found by `deploy.sh`**
  - Make sure `docker-compose.yml` is under `CICD/`, or modify `deploy.sh` to `cd` into the correct directory.

---

## Notes

- The credentials in `docker-compose.yml` are for local/demo use. Change them before any real deployment.
- To stop services: from `CICD/` run `docker compose down`.  
  To remove the DB volume as well: `docker compose down -v`.
