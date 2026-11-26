# WorkSphere Frontend

Modern React + Vite + Tailwind CSS frontend for **WorkSphere**, an enterprise project management and team collaboration platform featuring multi-tenant workspaces, Kanban task boards, role-based access control (RBAC), real-time notifications, analytics dashboards, and CSV report exports.

## Tech Stack

- **Framework:** React 19, React Router v7
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4
- **Charts & Icons:** Recharts, Lucide React
- **HTTP & Auth:** Axios, `@react-oauth/google`

## Project Structure

```text
src/
├── assets/         # Brand logos & static assets
├── components/     # Reusable UI components (auth layouts, modals, loaders)
├── context/        # AuthContext & workspace state management
├── layouts/        # DashboardLayout (sidebar, top navbar, workspace switcher)
├── pages/          # Dashboard, Projects, TaskBoard, Tasks, Team, Reports, Notifications, Settings, Auth
├── services/       # Axios API client with JWT & x-workspace-id interceptors
└── App.jsx         # Route definitions & role-aware guards
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adeebadev198-create/WorkSphere-Frontend.git
   cd WorkSphere-Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api/v1` |

## Running Locally

Ensure **WorkSphere-Backend** is running on port `5000`, then start the frontend dev server (locked to port `5173` for Google OAuth):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Backend Repository

This frontend connects to **[WorkSphere-Backend](https://github.com/adeebadev198-create/WorkSphere-Backend)**.
