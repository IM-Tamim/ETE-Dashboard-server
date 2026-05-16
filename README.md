# ETE Department Dashboard — Backend

> Express + MongoDB REST API for the Electronics & Telecommunication Engineering Department dashboard. Serves student, attendance, and marks data with series-based filtering.

---
## Links

- Client Live: [Visit](https://ete-dashboard-client.vercel.app/)
- Client Repository: [GitHub](https://github.com/IM-Tamim/ETE-Dashboard-client)

- Server Live: [Visit](https://ete-dashboard-server.vercel.app/api/health)
- Server Repository: [GitHub](https://github.com/IM-Tamim/ETE-Dashboard-server)

---
## Tech Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime |
| Express | Web framework |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Database |
| dotenv | Environment config |
| CORS | Cross-origin requests |

---

## Project Structure

```
backend/
├── index.js        # Entry point — all routes, schemas, and server config
├── .env            # Environment variables (never commit this)
├── package.json
└── vercel.json     # Vercel deployment config (if deploying to Vercel)
```

---

## Database Collections

### `students`
One flat document per student — 18 fields.

```json
{
  "name": "FATIN AWSAF AMIN",
  "gender": "Male",
  "dateOfBirth": "13/04/2005",
  "bloodGroup": "O+",
  "email": "fatin@gmail.com",
  "phone": "01770917975",
  "fatherName": "Md. Al Wadud Amin",
  "motherName": "Fahima Khanam",
  "religion": "Islam",
  "roll": "2204001",
  "registrationNo": "725",
  "series": "22",
  "semester": "5th",
  "section": "A",
  "shift": "Day",
  "group": "ETE",
  "studentCategory": "Regular",
  "status": "active"
}
```

### `attendances`
One document per student. Nested `subjects[]` array, each with `records[]`.

```json
{
  "studentName": "FATIN AWSAF AMIN",
  "roll": "2204001",
  "series": "22",
  "semester": "5th",
  "subjects": [
    {
      "subject": "ETE-3111",
      "records": [
        { "date": "2025-01-06", "status": "present" },
        { "date": "2025-01-20", "status": "absent" }
      ],
      "totalClasses": 8,
      "totalPresent": 7,
      "totalAbsent": 1,
      "attendancePercentage": 87.5
    }
  ]
}
```

### `marks`
One document per student. Nested `subjects[]` array with component-wise marks.

```json
{
  "studentName": "FATIN AWSAF AMIN",
  "roll": "2204001",
  "series": "22",
  "semester": "5th",
  "subjects": [
    {
      "subject": "ETE-3111",
      "CT": 19,
      "Assignment": 7,
      "Attendance": 8,
      "Semester": 53,
      "total": 87,
      "grade": "A+",
      "gradePoint": 4.0
    }
  ]
}
```

> Link key across all three collections is `roll`.

---

## Series & Subjects Mapping

| Series | Semester | Subjects |
|---|---|---|
| 22 | 5th | ETE-3111, ETE-3113, ETE-3115, CSE-3154, EEE-3153 |
| 23 | 3rd | ETE-2111, ETE-2113, CSE-2153, HUM-2115, ETE-2117 |
| 24 | 2nd | ETE-1110, ETE-1113, HUM-1115, ETE-1111, EEE-1153 |
| 21 | 7th | ETE-4110, ETE-4111, ETE-4112, ETE-4113, CSE-4153 |
| 20 | 8th | ETE-4210, ETE-4211, ETE-4213, ETE-4215, ETE-4217 |

> Series 25 does not exist and is excluded from all logic.

---

## API Endpoints

### Students

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Get all students. Query: `?series=22&status=active` |
| GET | `/api/students/:id` | Get single student by MongoDB `_id` |
| POST | `/api/students` | Create student. Auto-fills `semester` from `series` |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance` | Get all attendance docs. Query: `?series=22` |
| GET | `/api/attendance/roll/:roll` | Get one student's full attendance doc |
| GET | `/api/attendance/summary` | Per-subject avg attendance %. Query: `?series=22` |
| POST | `/api/attendance` | Upsert full attendance doc for a student |
| PATCH | `/api/attendance/:roll/subjects/:subject/records` | Add a single date record to one subject |
| DELETE | `/api/attendance/:id` | Delete attendance doc |

### Marks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/marks` | Get all marks docs. Query: `?series=22` |
| GET | `/api/marks/roll/:roll` | Get one student's full marks doc |
| GET | `/api/marks/summary` | Grade distribution + subject avg. Query: `?series=22` |
| POST | `/api/marks` | Upsert full marks doc. Auto-computes grade/gradePoint |
| PUT | `/api/marks/:id` | Update marks doc |
| DELETE | `/api/marks/:id` | Delete marks doc |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Aggregated stats for all charts. Query: `?series=22` |

Returns: `totalStudents`, `series22Count`, `avgAttendance`, `avgMarks`, `attendanceTrend`, `gradeDistribution`, `subjectPerformance`, `topStudents`, `lowAttendance`, `seriesDistribution`

### Utility

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subjects/:series` | Get subject codes for a series |
| GET | `/api/health` | Health check — returns `{ status: "ok" }` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/your-username/ete-dashboard-backend.git
cd ete-dashboard-backend
npm install express mongoose cors dotenv
```

### Environment Variables

Create a `.env` file in the project root:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ete_dashboard
CLIENT_URL=http://localhost:5173
PORT=5000
```

> Never commit `.env` to GitHub. Add it to `.gitignore`.

### Run Locally

```bash
# Install nodemon globally if you haven't
npm install -g nodemon

# Start with auto-reload
nodemon index.js

# Or without nodemon
node index.js
```

Server runs at `http://localhost:5000`

Test it: `http://localhost:5000/api/health`

---

## Deployment (Vercel)

1. Add `vercel.json` to the project root:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "index.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "index.js" }]
   }
   ```

2. Push to GitHub and import in [vercel.com](https://vercel.com)

3. Add environment variables in Vercel dashboard:
   ```
   MONGO_URI     = mongodb+srv://...
   CLIENT_URL    = https://your-frontend.vercel.app
   PORT          = 5000
   ```

4. Deploy

> **Important:** In MongoDB Atlas → Network Access, add `0.0.0.0/0` to the IP allowlist so Vercel's dynamic IPs are not blocked.

---

## Grade Scale

| Total Marks | Grade | Grade Point |
|---|---|---|
| 80 – 100 | A+ | 4.00 |
| 75 – 79 | A | 3.75 |
| 70 – 74 | A- | 3.50 |
| 65 – 69 | B+ | 3.25 |
| 60 – 64 | B | 3.00 |
| 55 – 59 | B- | 2.75 |
| 50 – 54 | C+ | 2.50 |
| 45 – 49 | C | 2.25 |
| 40 – 44 | D | 2.00 |
| 0 – 39 | F | 0.00 |

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |
| `CLIENT_URL` | Frontend origin for CORS | ✅ Yes |
| `PORT` | Server port | No (default: 5000) |

---

## License

MIT