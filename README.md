# HouseHoldHero

## Run with Docker

### Requirements

Install Docker Desktop with Docker Compose support.

### Start the application

From the repository root, run:

```bash
docker compose up --build
```

This builds and starts:

- Angular frontend on `http://localhost:4200`
- Node.js/Express backend on `http://localhost:3000`

### Environment configuration

The backend reads environment variables from:

```text
household-hero-api/.env
```

Create this file based on:

```text
household-hero-api/.env.example
```

The Firebase service account file is mounted into the backend container at runtime and is not included in the Docker image.

Expected local path:

```text
household-hero-api/serviceAccountKey.json
```

### Stop the application

```bash
docker compose down
```

### Rebuild after changes

```bash
docker compose up --build
```

For environment variable details, see:

```text
docs/ENVIRONMENT.md
```
