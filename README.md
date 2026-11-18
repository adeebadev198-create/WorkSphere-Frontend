# 🌐 WorkSphere – Project & Team Management SaaS Platform

WorkSphere is an enterprise-grade full-stack Project & Team Management SaaS Web Application built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and styled with **Tailwind CSS**.

---

## 🚀 Key Features & Modules

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- Secure user registration, login, logout, and password recovery.
- Passwords encrypted with **bcrypt**.
- Authentication managed through **JSON Web Tokens (JWT)**.
- 3 Primary Workspace Roles:
  - **Workspace Owner**: Full workspace ownership, member invitation, role promotion, project & task deletion, settings.
  - **Project Manager**: Project creation, team assignment, task prioritization, deadlines, status updates, reports.
  - **Team Member**: View assigned projects and tasks, drag-and-drop Kanban updates, comment on discussions, personal dashboard.
- Backend permission enforcement preventing ID manipulation (BR-015).

### 2. 🏢 Multi-Tenant Workspace Isolation
- Support for multiple organizational workspaces (e.g. *Engineering*, *Marketing*, *Product*).
- One-click workspace switching on the top navigation bar.
- Isolated database records per workspace.
- Member management with role assignment and removal with task reassignment flags.

### 3. 📁 Project Management
- Project creation with start date, deadline, priority (*Low, Medium, High, Critical*), and status.
- Real-time task completion progress bar calculated dynamically from database records (BR-007).
- Soft-delete / project archiving.
- Detailed project view with deliverables and assigned teams.

### 4. 📋 Interactive Kanban Board & Task Management
- **Visual Kanban Board** with columns: `To Do`, `In Progress`, `In Review`, and `Completed`.
- **HTML5 Drag-and-Drop**: Moving cards between columns instantly updates task status in MongoDB through `PATCH /api/v1/tasks/:id/status`.
- Optimistic updates with rollback on permission or network errors.
- Task search, priority filters, and project filtering.
- Overdue task calculation (BR-006: completed tasks are never counted as overdue).
- Optimistic Concurrency Control (Scenario 10) to detect simultaneous update conflicts.

### 5. 💬 Discussions & Comments
- Real-time comment threads on tasks.
- Immediate activity history logging.
- Comment notifications for assignees and project managers.

### 6. 🔔 In-App Notifications & Activity Logs
- Live notification badge with unread counter.
- Notifications generated on task assignment, deadline changes, status moves, and comments.
- Complete audit trail tracking user actions (`ActivityLog` collection).

### 7. 📊 Analytics Dashboard & CSV Reports
- Real-time KPI summaries: Total Projects, Active Projects, In-Progress Tasks, Overdue Count, Completion Rate.
- Recharts visualizations: Monthly task trends and status distribution donut chart.
- Upcoming deadlines due within the next 7 days.
- **Export to CSV**: Server-side CSV streaming for tasks and projects report.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Lucide React, Recharts |
| **Routing & Client** | React Router DOM 7, Axios (with auth & workspace interceptors) |
| **Backend** | Node.js, Express.js |
| **Database & ODM** | MongoDB, Mongoose 9 |
| **Security** | JWT, bcryptjs, CORS |
| **Export** | json2csv |

---

## 📦 Directory Structure

```text
WorkSphere/
├── backend/
│   ├── src/
│   │   ├── config/           # MongoDB connection
│   │   ├── models/           # Mongoose schemas (User, Workspace, Project, Task, etc.)
│   │   ├── middlewares/      # authMiddleware, workspaceMiddleware, errorMiddleware
│   │   ├── controllers/      # Business logic (auth, projects, tasks, kanban, etc.)
│   │   ├── routes/           # REST endpoints
│   │   ├── utils/            # JWT token, activity logger, response handlers
│   │   ├── app.js            # Express app configuration & CORS
│   │   ├── server.js         # HTTP server entrypoint
│   │   └── seed.js           # Database seeder with realistic test data
│   ├── .env                  # Backend environment variables
│   └── package.json
│
├── src/
│   ├── assets/               # Branding and logos
│   ├── components/           # Reusable UI components
│   ├── context/              # AuthContext (user, token, active workspace)
│   ├── layouts/              # DashboardLayout & AuthLayout
│   ├── pages/                # Dashboard, Projects, TaskBoard (Kanban), Tasks, Team, Reports, Settings
│   ├── routes/               # AppRoutes with ProtectedRoute guard
│   ├── services/             # Axios API client with interceptors
│   ├── App.jsx
│   └── main.jsx
│
├── package.json              # Frontend package & root scripts
└── vite.config.js
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local Community Server running on `27017` or a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster URI)

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/worksphere
JWT_SECRET=worksphere_jwt_secret_super_secure_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/worksphere?retryWrites=true&w=majority`)*

### 3. Install Dependencies
```bash
# In root directory (Frontend)
npm install

# In backend directory (Backend)
cd backend
npm install
cd ..
```

### 4. Seed Realistic Initial Data
To populate pre-configured workspaces, projects, Kanban tasks across all columns, comments, and users:
```bash
npm run seed
# or: cd backend && node src/seed.js
```

### 5. Run the Application
Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run server
# or: cd backend && npm run dev
# Server will run at: http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Client will run at: http://localhost:5173
```

---

## 🔑 Demo Credentials

All test accounts share the password: `password123`

| Role | Email | Permissions |
|---|---|---|
| **Workspace Owner** | `admin@worksphere.com` | Full workspace controls, invite members, change roles, manage all projects |
| **Project Manager** | `manager@worksphere.com` | Create projects, assign tasks, update deadlines, view team reports |
| **Team Member** | `ahmed@worksphere.com` | View assigned work, drag-and-drop Kanban updates, post comments |
| **Team Member** | `jaylon@worksphere.com` | View assigned work, drag-and-drop Kanban updates, post comments |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user & auto-create workspace | Public |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/v1/auth/me` | Current profile and workspaces | Private |
| `GET` | `/api/v1/workspaces` | Get all authorized workspaces | Private |
| `POST` | `/api/v1/workspaces` | Create new workspace | Private |
| `GET` | `/api/v1/workspaces/:id/members` | List members of workspace | Workspace Member |
| `POST` | `/api/v1/workspaces/:id/invitations` | Invite new member | Workspace Owner |
| `GET` | `/api/v1/projects` | List projects with dynamic progress % | Workspace Member |
| `POST` | `/api/v1/projects` | Create new project | Owner / Manager |
| `GET` | `/api/v1/tasks` | Get tasks with filter/search | Workspace Member |
| `POST` | `/api/v1/tasks` | Create task with assignees & deadline | Owner / Manager |
| `PATCH`| `/api/v1/tasks/:id/status` | **Kanban drag-and-drop status update** | Assignee / Manager / Owner |
| `POST` | `/api/v1/tasks/:id/comments` | Add comment to task | Workspace Member |
| `GET` | `/api/v1/notifications` | Get in-app notifications | Private |
| `GET` | `/api/v1/dashboard/overview` | Full analytics KPIs & charts data | Workspace Member |
| `GET` | `/api/v1/reports/export?type=tasks`| **Download CSV export file** | Workspace Member |
