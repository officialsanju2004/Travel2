# ✈️ TravelCRM — Lead Management System

A full-stack Travel Agency Lead Management CRM built with the MERN stack.

---

## 📁 Folder Structure

```
travel-crm/
├── package.json                  # Root scripts (concurrently)
│
├── server/                       # Node.js + Express Backend
│   ├── index.js                  # Entry point, Express app setup
│   ├── package.json
│   ├── .env.example              # Environment variables template
│   │
│   ├── models/
│   │   ├── User.js               # User schema (admin/sales roles)
│   │   ├── Lead.js               # Lead schema with all fields
│   │   └── Activity.js           # Activity/notes history schema
│   │
│   ├── controllers/
│   │   ├── authController.js     # Login, register, getMe
│   │   ├── userController.js     # CRUD for users (admin only)
│   │   ├── leadController.js     # CRUD + assign + bulk operations
│   │   ├── activityController.js # Activity log management
│   │   └── dashboardController.js# Admin & sales dashboard stats
│   │
│   ├── routes/
│   │   ├── auth.js               # /api/auth/*
│   │   ├── users.js              # /api/users/* (admin only)
│   │   ├── leads.js              # /api/leads/*
│   │   ├── activities.js         # /api/activities/*
│   │   └── dashboard.js          # /api/dashboard/*
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT protect, adminOnly, authorize
│   │
│   └── utils/
│       ├── leadDistribution.js   # Round-robin distribution logic
│       └── seed.js               # Database seeder script
│
└── client/                       # React.js Frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx              # React entry, providers setup
        ├── App.jsx               # Router configuration
        ├── index.css             # Tailwind + custom CSS
        │
        ├── context/
        │   └── AuthContext.jsx   # Auth state, login/logout
        │
        ├── utils/
        │   ├── api.js            # Axios instance + interceptors
        │   └── helpers.js        # Colors, formatters, constants
        │
        ├── pages/
        │   ├── LoginPage.jsx     # Auth page with demo buttons
        │   ├── AdminDashboard.jsx# Charts, stats, team performance
        │   ├── SalesDashboard.jsx# Personal stats, follow-ups
        │   ├── LeadsPage.jsx     # Leads table with filters
        │   ├── LeadDetailPage.jsx# Full lead view + activity log
        │   ├── UsersPage.jsx     # Team management (admin only)
        │   └── ProfilePage.jsx   # User profile + password change
        │
        └── components/
            ├── shared/
            │   ├── Layout.jsx         # Sidebar + responsive layout
            │   └── LeadFormModal.jsx  # Create/edit lead modal
            └── admin/
                └── BulkAssignModal.jsx# Bulk assign/redistribute leads
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd travel-crm

# Install all dependencies
npm run install:all
# OR manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment

```bash
# Copy and edit server env
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/travel-crm
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 3. Seed Database (Optional but Recommended)

```bash
npm run seed
```

This creates:
- 1 Admin user
- 5 Sales users
- 50 sample leads (distributed among agents)
- Sample activity history

### 4. Run Development Servers

```bash
# Run both servers concurrently
npm run dev

# OR run separately:
npm run dev:server   # Backend on :5000
npm run dev:client   # Frontend on :3000
```

Open: **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelcrm.com | admin123 |
| Sales | alex@travelcrm.com | sales123 |
| Sales | maria@travelcrm.com | sales123 |

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/register` | ❌ | Register |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/password` | ✅ | Change password |

### Leads
| Method | Endpoint | Admin | Description |
|--------|----------|-------|-------------|
| GET | `/api/leads` | - | Get leads (filtered by role) |
| GET | `/api/leads/:id` | - | Get lead details + activities |
| POST | `/api/leads` | ✅ | Create lead (auto-assigns) |
| POST | `/api/leads/bulk` | ✅ | Bulk import + distribute |
| PUT | `/api/leads/:id` | - | Update lead |
| DELETE | `/api/leads/:id` | ✅ | Soft delete lead |
| PATCH | `/api/leads/:id/assign` | ✅ | Assign to agent |
| POST | `/api/leads/bulk-assign` | ✅ | Bulk assign / auto-distribute |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| PATCH | `/api/users/:id/toggle-status` | Admin | Activate/deactivate |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/admin` | Admin | Full analytics |
| GET | `/api/dashboard/sales` | Sales | Personal stats |

---

## 🔐 Role-Based Access Control

### Admin
- ✅ View ALL leads from all agents
- ✅ Create, edit, delete leads
- ✅ Manually assign / reassign leads
- ✅ Bulk assign or auto-distribute
- ✅ Manage sales users (CRUD)
- ✅ View full analytics dashboard
- ✅ Change any lead's status

### Sales Agent
- ✅ View only their assigned leads
- ✅ Update status on their leads
- ✅ Add notes and activity logs
- ✅ Set follow-up dates
- ❌ Cannot delete leads
- ❌ Cannot access admin settings
- ❌ Cannot view other agents' leads

---

## 🔄 Lead Distribution Logic

When leads are created:
1. **Auto-assign**: System finds the active sales user with the **fewest leads** and assigns the new lead to them (least-loaded balancing)
2. **Bulk import**: Round-robin distribution across all active sales users
3. **Manual assign**: Admin can override at any time
4. **Bulk reassign**: Admin can redistribute selected leads to any agent or auto-distribute

---

## 📊 Lead Statuses

`New` → `Contacted` → `Quotation Sent` → `Flight Booked` → `Hotel Booked` → `Confirmed`

Dead-ends: `Cancelled`, `Lost`

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| State | TanStack Query (React Query) |
| Charts | Recharts |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| HTTP Client | Axios |

---

## 🚢 Production Deployment

```bash
# Build frontend
npm run build

# Serve with PM2
pm2 start server/index.js --name travel-crm

# Or with Docker (add Dockerfile)
```

Set production env vars:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/travel-crm
JWT_SECRET=super_secure_random_string_64_chars
CLIENT_URL=https://yourdomain.com
```
