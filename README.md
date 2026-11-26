# Namastey

Namastey is an Expo mobile app backed by an Express API and MongoDB.

## Project layout

- `backend/` — Express API, deployable to Vercel
- `mobile/` — Expo app, buildable with EAS

## Run locally

### Backend

1. Install Node.js (LTS) and MongoDB access.
2. From `backend/`, install dependencies and create your local environment file:

   ```sh
   npm ci
   cp .env.example .env
   ```

3. Set `MONGODB_URI` and a private `JWT_SECRET` in `backend/.env`. Add Cloudinary credentials if image uploads are needed.
4. Start the API:

   ```sh
   npm start
   ```

The API listens on port `5000` by default. Its health endpoint is `/api/v1/health`.

### Mobile app

1. From `mobile/`, install dependencies and create a local environment file:

   ```sh
   npm ci
   cp .env.example .env
   ```

2. Set `EXPO_PUBLIC_API_URL` to the backend URL ending in `/api/v1`. For a physical device, use your computer's LAN address instead of `localhost`.
3. Start Expo:

   ```sh
   npx expo start
   ```

## Deploy

### API on Vercel

1. Create a Vercel project connected to this Git repository and set its **Root Directory** to `backend`.
2. Add the backend variables from `backend/.env.example` in Vercel Project Settings. Use production values, set `NODE_ENV=production`, and allowlist the app's web origins in `ALLOWED_ORIGINS` if web clients are used.
3. Deploy. Verify `https://<your-api-domain>/api/v1/health`.

The API needs a reachable MongoDB instance. Configure MongoDB network access to allow the Vercel deployment to connect. Configure the Cloudinary variables if image uploads are used.

### Mobile app with EAS

1. Set `EXPO_PUBLIC_API_URL` to the deployed API base URL (ending in `/api/v1`) in `mobile/eas.json` for each build profile, or configure the variable in EAS and remove profile-level overrides.
2. From `mobile/`, run:

   ```sh
   npx eas-cli build --platform all --profile production
   ```

For store submission, configure the required Apple and Google credentials with EAS, then use `npx eas-cli submit --platform all --profile production`.

## Git and secrets

Local `.env` files, dependencies, and build outputs are ignored. Commit the `.env.example` templates, never real credentials. If a credential has ever been committed or shared, rotate it before deployment.
