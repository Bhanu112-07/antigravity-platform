# Hosting Rarewings on Railway.app

This guide explains how to host both the Frontend (Next.js) and Backend (Express + SQLite) on Railway.

## 1. Prerequisites
- A GitHub repository with this code pushed.
- A Railway.app account.

## 2. Deployment Steps

### Part A: Deploy the Backend
1. In Railway, click **New Project** -> **Deploy from GitHub repo**.
2. Select this repository.
3. Once the service is created, go to **Settings** -> **General** -> **Root Directory** and set it to `antigravity-backend`.
4. Go to **Variables** and add:
   - `JWT_SECRET`: A random string for security.
   - `SHIPROCKET_EMAIL`: your_shiprocket_api_email.
   - `SHIPROCKET_PASSWORD`: your_shiprocket_api_password.
   - `DATABASE_PATH`: `/data/database.sqlite` (This ensures it stays in the persistent volume).
5. Go to **Volumes** -> **Add Volume**:
   - Mount Path: `/data`
   - This ensures your SQLite database and uploads are not deleted when the server restarts.

### Part B: Deploy the Frontend
1. In the same Railway project, click **New** -> **GitHub Repo**.
2. Select the same repository again.
3. Go to **Settings** -> **General** -> **Root Directory** and set it to `antigravity-frontend`.
4. Go to **Variables** and add:
   - `NEXT_PUBLIC_API_URL`: The URL of your Backend Service (e.g., `https://your-backend.up.railway.app`).

## 3. Persistent Storage (Important)
Since we are using SQLite, the data is stored in `database.sqlite`. Always ensure you have a **Volume** mounted at `/data` and set `DATABASE_PATH=/data/database.sqlite`.

## 4. Environment Variables Checklist
| Variable | Service | Default/Example |
|----------|---------|-----------------|
| `PORT` | Backend | `5000` (Railway sets this automatically) |
| `DATABASE_PATH` | Backend | `/data/database.sqlite` |
| `JWT_SECRET` | Backend | `your-secret-key` |
| `NEXT_PUBLIC_API_URL`| Frontend | `https://your-backend.railway.app` |
| `SHIPROCKET_EMAIL` | Backend | `...` |
| `SHIPROCKET_PASSWORD`| Backend | `...` |
