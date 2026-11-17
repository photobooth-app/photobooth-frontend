# Agent instructions

## Project overview

This repository contains the Vue 3 / Quasar frontend for photobooth-app. The Python backend is maintained in the separate `photobooth-app` repository and provides the API, media, and server-sent events (SSE).

## Repository layout

- `src/pages/`, `src/layouts/`, and `src/components/`: UI pages, layouts, and reusable components. `src/components/form/` contains the JSON Forms renderers used by the configuration UI.
- `src/router/`: routes and the admin navigation guard.
- `src/stores/`: Pinia stores for configuration, application state, and the media collection. `src/App.vue` initializes stores and handles SSE updates.
- `src/util/`: API, authentication, and media helpers.
- `src/i18n/` and `src/boot/i18n.js`: translations and locale setup.
- `src/dto/api.ts`: generated types for the backend's OpenAPI schema.
- `src/css/` and `public/`: application styles and public assets.

Follow nearby Vue, TypeScript/JavaScript, Quasar, and Pinia patterns. Preserve the kiosk, standby, standalone, and admin experiences, including hash routing and the existing admin route guard.

## Development and validation

- The README recommends Node.js 22 or above. Use npm and the tracked `package-lock.json`; `npm install` also runs `quasar prepare`. `tsconfig.json` extends the generated `.quasar/tsconfig.json`, so do not edit `.quasar/` by hand.
- `npm run dev` starts the frontend development server, which proxies backend requests to `127.0.0.1:8000`. Most frontend flows require the backend to be running; its virtual camera can be used without physical hardware.
- `npm run lint:check` checks formatting and lint without applying fixes. `npm run typecheck` runs `vue-tsc`.
- `npm run lint` and `npm run format` can modify files across the repository; prefer the non-mutating check when validating a focused change.
- `npm test` is currently a placeholder that prints `No test specified` and exits successfully. Do not report it as meaningful test coverage. Add focused tests when practical, and report manual verification or testing gaps explicitly.
- `npm run check-types` compares generated API types with `http://localhost:8000/api/openapi.json`. `npm run generate-types` rewrites `src/dto/api.ts` from that endpoint. Run these against the intended backend version and inspect the resulting diff.
- `npm run build` removes and rebuilds `../photobooth-app/src/web/frontend/`, outside this repository. Check the sibling repository's working tree first; do not overwrite user changes or run the build unless its output is intended.

Run the narrowest relevant checks for a change. Manual checks use the live backend: avoid deleting media, changing real configuration, or triggering host/service controls unless explicitly authorized.

## Change guidance

- Reuse existing Quasar components and styles, and keep changes focused. Avoid unrelated formatting or generated-file changes.
- Preserve the backend API and SSE contracts. For authenticated requests, use the existing `_fetch` helper in `src/util/fetch_api.js`; it attaches the session token and handles HTTP 401. `remoteProcedureCall` displays errors but does not propagate them or return a response, so use `_fetch` when the caller must handle the result.
- Use the generated API schema types where applicable. Do not hand-edit `src/dto/api.ts`; regenerate it when an intentional backend schema change requires it.
- Localize new user-facing text with Vue I18n and add or update the English source in `src/i18n/locales/en-US.json`. Preserve interpolation placeholders. Other locales are synchronized through Crowdin; register a new locale in `src/i18n/index.js` if adding one.
- Keep initial store loading and SSE updates consistent when changing shared application or media state.
