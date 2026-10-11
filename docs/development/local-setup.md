# Local Setup

## Prerequisites

- Node.js 20.11+
- pnpm 9+
- Docker Desktop
- Python 3.12+

## Development Flow

1. Install the locked JavaScript workspace dependencies:

   ```powershell
   pnpm install --frozen-lockfile
   ```

2. Create a local environment file only if one does not already exist. Keep real credentials out of Git:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

3. Set up the AI service's isolated Python environment:

   ```powershell

   ```

py -m venv .\apps\ai-service\.venv
.\apps\ai-service\.venv\Scripts\python.exe -m pip install -r .\apps\ai-service\requirements.txt

````

4. Start local PostgreSQL, Redis, and MinIO with Docker Desktop:

```powershell
docker compose up -d
````

5. Generate the Prisma client and start the workspace:

   ```powershell
   pnpm db:generate
   pnpm dev
   ```

## Ports

- Web: 3000
- API: 4000
- AI service: 8000
- PostgreSQL: 5432
- Redis: 6379
- MinIO: 9000
- MinIO console: 9001

The AI service's Python environment is separate from the pnpm workspace. Activate it with
`.\apps\ai-service\.venv\Scripts\Activate.ps1` in PowerShell when running Python commands manually.

The root Docker Compose file starts PostgreSQL, Redis, and MinIO. The AI service is not part of
`pnpm dev`; to run it manually, open a second PowerShell window:

```powershell
Set-Location .\apps\ai-service
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
