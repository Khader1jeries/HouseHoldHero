# Environment Configuration

HouseHoldHero uses different configuration values for local development and production.

## Backend

Create a local `.env` file based on `.env.example` and provide the required values before starting the backend.

Required variables:

- `PORT` - backend HTTP port
- `GOOGLE_APPLICATION_CREDENTIALS` - path to the Firebase service-account JSON file
- `SMTP_USER` - SMTP account username/email
- `SMTP_PASS` - SMTP authentication credential

Firebase requires a service-account JSON credential file for local development.

Download a service-account key from the Firebase / Google Cloud project and save it locally as:

`household-hero-api/serviceAccountKey.json`

The `.env` file should point to it with:

```env
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

Both `.env` and `serviceAccountKey.json` contain sensitive information and must never be committed to Git.

## Angular

Development uses:

```text
http://localhost:3000/api
```

Production uses:

```text
/api
```

Angular replaces the development environment file with the production environment file during a production build.

## Android

Debug builds use:

```text
http://10.0.2.2:3000/api/
```

Release builds receive the API base URL externally through either:

- Gradle property `API_BASE_URL`
- Environment variable `API_BASE_URL`

Example:

```bash
./gradlew assembleRelease -PAPI_BASE_URL=https://api.example.com/api/
```

## Secrets

Real credentials and environment files must not be committed to Git.

The following remain local:

- `household-hero-api/.env`
- `household-hero-api/serviceAccountKey.json`
