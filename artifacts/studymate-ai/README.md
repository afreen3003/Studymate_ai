# StudyMate AI

A mobile-first study companion for trying sample question answers, revision notes, and study plans. Every response is clearly labeled as a demo sample. The app does not connect to live AI or Amazon/Alexa services, and no API key is needed.

## Run locally

From the workspace root, install dependencies:

```sh
pnpm install
```

Start the API server in one terminal:

```sh
pnpm --filter @workspace/api-server run dev
```

Start the web app in a second terminal:

```sh
pnpm --filter @workspace/studymate-ai run dev
```

In Replit, the API server and web app have their own configured workflows, so both run in the preview environment.

## Main source files

- `src/App.tsx` — dashboard, question chat, notes, planner, and About panel
- `src/index.css` — responsive styling and theme
- `../api-server/src/routes/study.ts` — demo responses returned by the backend
- `../../lib/api-spec/openapi.yaml` — request and response contracts
