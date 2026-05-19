# ETE Department Dashboard — Backend

> Express + MongoDB REST API for the ETE Department dashboard.

---

## Links

| | |
|---|---|
| 🌐 Client Live | [ete-dashboard-client.vercel.app](https://ete-dashboard-client.vercel.app/) |
| 📦 Client Repository | [github.com/IM-Tamim/ETE-Dashboard-client](https://github.com/IM-Tamim/ETE-Dashboard-client) |
| 🚀 Server Live | [ete-dashboard-server.onrender.com/api/health](https://ete-dashboard-server.onrender.com/api/health) |
| 📦 Server Repository | [github.com/IM-Tamim/ETE-Dashboard-server](https://github.com/IM-Tamim/ETE-Dashboard-server) |

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Node.js + Express | Runtime & web framework |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Database |
| dotenv + CORS | Config & cross-origin |

---

## API Endpoints

All routes prefixed with `/api`.

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | All students. Query: `?series=22&status=active` |
| GET | `/students/:id` | Single student by `_id` |
| POST | `/students` | Create — auto-fills `semester` from `series` |
| PUT | `/students/:id` | Update |
| DELETE | `/students/:id` | Delete |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | All docs. Query: `?series=22` |
| GET | `/attendance/roll/:roll` | One student's full attendance doc |
| GET | `/attendance/summary` | Per-subject avg %. Query: `?series=22` |
| POST | `/attendance` | Upsert full attendance doc |
| PATCH | `/attendance/:roll/subjects/:subject/records` | Add a single date record |
| DELETE | `/attendance/:id` | Delete doc |

### Marks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/marks` | All docs. Query: `?series=22` |
| GET | `/marks/roll/:roll` | One student's full marks doc |
| GET | `/marks/summary` | Grade distribution + subject avg. Query: `?series=22` |
| POST | `/marks` | Upsert — auto-computes grade & gradePoint |
| PUT | `/marks/:id` | Update |
| DELETE | `/marks/:id` | Delete |

### Dashboard & Utility
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | All chart data. Query: `?series=22` |
| GET | `/subjects/:series` | Subject codes for a series |
| GET | `/health` | Health check |

---

## Database Schema

All three collections link on `roll`.

- **students** — one flat doc per student (18 fields)
- **attendances** — one doc per student → `subjects[]` → `records[]` with date + status
- **marks** — one doc per student → `subjects[]` with CT, Assignment, Attendance, Semester, total, grade, gradePoint

---

## Grade Scale

| Marks | Grade | GP |
|---|---|---|
| 80–100 | A+ | 4.00 |
| 75–79 | A | 3.75 |
| 70–74 | A- | 3.50 |
| 65–69 | B+ | 3.25 |
| 60–64 | B | 3.00 |
| 55–59 | B- | 2.75 |
| 50–54 | C+ | 2.50 |
| 45–49 | C | 2.25 |
| 40–44 | D | 2.00 |
| 0–39 | F | 0.00 |

---

## Local Setup

```bash
git clone https://github.com/IM-Tamim/ETE-Dashboard-server.git
cd ETE-Dashboard-server
npm install express mongoose cors dotenv
```

Create `.env`:
```dotenv
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ete_dashboard
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
nodemon index.js   # or: node index.js
```

Test: `http://localhost:5000/api/health`

---

## Deployment (Render)

1. Push to GitHub → create **Web Service** on [render.com](https://render.com)
2. Build command: `npm install` · Start command: `node index.js`
3. Add env vars in Render dashboard:
   ```
   MONGO_URI  = mongodb+srv://...
   CLIENT_URL = https://ete-dashboard-client.vercel.app
   PORT       = 5000
   ```
4. MongoDB Atlas → **Network Access** → add `0.0.0.0/0`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `CLIENT_URL` | ✅ | Frontend origin for CORS |
| `PORT` | No | Default: `5000` |

---

## License

IMT — [IM-Tamim](https://github.com/IM-Tamim)