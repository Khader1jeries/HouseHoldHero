# Continuous Integration

HouseHoldHero uses GitHub Actions to validate changes before they are merged.

The CI workflow runs automatically on:

- Pull requests targeting `main`
- Pushes to `main`

## Checks

### Backend

- Install dependencies with `npm ci`
- Validate JavaScript syntax

### Angular

- Install dependencies with `npm ci`
- Build the Angular application

### Android

- Set up Java 17
- Run Android unit tests
- Build the debug application with Gradle
