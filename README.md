# GIDS Apps

A collection of AI-powered apps built on top of Mesh API.

## Apps

| App | Path | Description |
| --- | --- | --- |
| Dashboard | `dashboard/` | Landing page that lists all apps |
| Multi-Model Chat | `chat-app/` | Compare responses from multiple models |
| Guess My Salary | `guess-my-salary/` | Resume → salary estimate |
| Resume Builder | `resume-builder/` | AI-assisted resume builder |

## Deployment

Each subdirectory is deployed as its own Vercel project. The dashboard links to each deployment via `NEXT_PUBLIC_*_URL` env vars set in the dashboard's Vercel project.

### Required env vars

All Mesh-backed apps require:

- `MESH_API_KEY`
- `MESH_API_URL`

`resume-builder` additionally requires:

- `APIFY_API_TOKEN`
- `GCS_BUCKET_NAME`
- `GCS_PROJECT_ID`
- `GCS_CLIENT_EMAIL`
- `GCS_PRIVATE_KEY`

The dashboard uses:

- `NEXT_PUBLIC_CHAT_APP_URL`
- `NEXT_PUBLIC_SALARY_APP_URL`
- `NEXT_PUBLIC_RESUME_APP_URL`

## Local development

```bash
cd <app-dir>
pnpm install
cp .env.local.example .env.local  # fill in values
pnpm dev
```
