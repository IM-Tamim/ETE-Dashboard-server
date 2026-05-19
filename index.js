// ============================================================
//  ETE Department Dashboard — Express + MongoDB Backend v3
//  index.js  — Nested attendance & marks schema
// ============================================================
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const dotenv   = require("dotenv");

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => console.error("❌  MongoDB error:", err.message));

// ── Constants ─────────────────────────────────────────────────
const SERIES_LIST = ["20", "21", "22", "23", "24"];

const SERIES_SEM = {
  "20": "8th",
  "21": "7th",
  "22": "5th",
  "23": "3rd",
  "24": "2nd",
};

const SERIES_SUBJECTS = {
  "22": ["ETE-3111", "ETE-3113", "ETE-3115", "CSE-3154", "EEE-3153"],
  "23": ["ETE-2111", "ETE-2113", "CSE-2153", "HUM-2115", "ETE-2117"],
  "24": ["ETE-1110", "ETE-1113", "HUM-1115", "ETE-1111", "EEE-1153"],
  "21": ["ETE-4110", "ETE-4111", "ETE-4112", "ETE-4113", "CSE-4153"],
  "20": ["ETE-4210", "ETE-4211", "ETE-4213", "ETE-4215", "ETE-4217"],
};

// ── Schemas ───────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  gender:          { type: String, enum: ["Male", "Female"], required: true },
  dateOfBirth:     { type: String, trim: true },
  bloodGroup:      { type: String, trim: true },
  email:           { type: String, trim: true, lowercase: true },
  phone:           { type: String, trim: true },
  fatherName:      { type: String, trim: true },
  motherName:      { type: String, trim: true },
  religion:        { type: String, trim: true },
  roll:            { type: String, trim: true, unique: true },
  registrationNo:  { type: String, trim: true },
  series:          { type: String, enum: SERIES_LIST, required: true },
  semester:        { type: String, trim: true },
  section:         { type: String, trim: true },
  shift:           { type: String, trim: true },
  group:           { type: String, trim: true },
  studentCategory: { type: String, trim: true },
  status:          { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

const attendanceRecordSchema = new mongoose.Schema({
  date:   { type: String, required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
}, { _id: false });

const attendanceSubjectSchema = new mongoose.Schema({
  subject:              { type: String, required: true },
  records:              [attendanceRecordSchema],
  totalClasses:         { type: Number, default: 0 },
  totalPresent:         { type: Number, default: 0 },
  totalAbsent:          { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  roll:        { type: String, required: true, trim: true, unique: true },
  series:      { type: String, enum: SERIES_LIST, required: true },
  semester:    { type: String, trim: true },
  subjects:    [attendanceSubjectSchema],
}, { timestamps: true });

const marksSubjectSchema = new mongoose.Schema({
  subject:    { type: String, required: true },
  CT:         { type: Number, default: 0 },
  Assignment: { type: Number, default: 0 },
  Attendance: { type: Number, default: 0 },
  Semester:   { type: Number, default: 0 },
  total:      { type: Number, default: 0 },
  grade:      { type: String, trim: true },
  gradePoint: { type: Number, default: 0 },
}, { _id: false });

const marksSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  roll:        { type: String, required: true, trim: true, unique: true },
  series:      { type: String, enum: SERIES_LIST, required: true },
  semester:    { type: String, trim: true },
  subjects:    [marksSubjectSchema],
}, { timestamps: true });

const Student    = mongoose.model("Student",    studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const Marks      = mongoose.model("Marks",      marksSchema);

// ── Helpers ───────────────────────────────────────────────────
const getGrade = (total) => {
  if (total >= 80) return { grade: "A+", gradePoint: 4.0 };
  if (total >= 75) return { grade: "A",  gradePoint: 3.75 };
  if (total >= 70) return { grade: "A-", gradePoint: 3.5 };
  if (total >= 65) return { grade: "B+", gradePoint: 3.25 };
  if (total >= 60) return { grade: "B",  gradePoint: 3.0 };
  if (total >= 55) return { grade: "B-", gradePoint: 2.75 };
  if (total >= 50) return { grade: "C+", gradePoint: 2.5 };
  if (total >= 45) return { grade: "C",  gradePoint: 2.25 };
  if (total >= 40) return { grade: "D",  gradePoint: 2.0 };
  return { grade: "F", gradePoint: 0.0 };
};

// ── STUDENTS ──────────────────────────────────────────────────
app.get("/api/students", async (req, res) => {
  try {
    const filter = {};
    if (req.query.series) filter.series = req.query.series;
    if (req.query.status) filter.status = req.query.status;
    const students = await Student.find(filter).sort({ series: 1, roll: 1 });
    res.json(students);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const s = await Student.findById(req.params.id);
    if (!s) return res.status(404).json({ message: "Student not found" });
    res.json(s);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post("/api/students", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.series && !body.semester) body.semester = SERIES_SEM[body.series] || "";
    if (!body.group) body.group = "ETE";
    const student = new Student(body);
    await student.save();
    res.status(201).json(student);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.series) body.semester = SERIES_SEM[body.series] || body.semester;
    const student = await Student.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── ATTENDANCE ────────────────────────────────────────────────
app.get("/api/attendance", async (req, res) => {
  try {
    const filter = {};
    if (req.query.series) filter.series = req.query.series;
    const docs = await Attendance.find(filter).sort({ roll: 1 });
    res.json(docs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/attendance/roll/:roll", async (req, res) => {
  try {
    const doc = await Attendance.findOne({ roll: req.params.roll });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/attendance/summary", async (req, res) => {
  try {
    const filter = {};
    if (req.query.series) filter.series = req.query.series;
    const docs = await Attendance.find(filter);

    const subjectMap = {};
    docs.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        if (!subjectMap[sub.subject]) {
          subjectMap[sub.subject] = { totalClasses: 0, totalPresent: 0, studentCount: 0 };
        }
        subjectMap[sub.subject].totalClasses += sub.totalClasses;
        subjectMap[sub.subject].totalPresent += sub.totalPresent;
        subjectMap[sub.subject].studentCount += 1;
      });
    });

    const summary = Object.entries(subjectMap).map(([subject, v]) => ({
      subject,
      present: v.totalPresent,
      total:   v.totalClasses,
      avgPct:  v.totalClasses > 0 ? Math.round((v.totalPresent / v.totalClasses) * 100) : 0,
    })).sort((a, b) => a.subject.localeCompare(b.subject));

    res.json(summary);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.series && !body.semester) body.semester = SERIES_SEM[body.series] || "";
    if (Array.isArray(body.subjects)) {
      body.subjects = body.subjects.map((sub) => {
        const total   = sub.records?.length || 0;
        const present = sub.records?.filter((r) => r.status === "present").length || 0;
        return {
          ...sub,
          totalClasses:         total,
          totalPresent:         present,
          totalAbsent:          total - present,
          attendancePercentage: total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0,
        };
      });
    }
    const doc = await Attendance.findOneAndUpdate(
      { roll: body.roll },
      body,
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(doc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.patch("/api/attendance/:roll/subjects/:subject/records", async (req, res) => {
  try {
    const { roll, subject } = req.params;
    const { date, status } = req.body;
    const doc = await Attendance.findOne({ roll });
    if (!doc) return res.status(404).json({ message: "Attendance doc not found" });

    const subDoc = doc.subjects.find((s) => s.subject === subject);
    if (!subDoc) return res.status(404).json({ message: "Subject not found in doc" });

    const exists = subDoc.records.find((r) => r.date === date);
    if (exists) return res.status(409).json({ message: "Record for this date already exists" });

    subDoc.records.push({ date, status });
    subDoc.totalClasses         = subDoc.records.length;
    subDoc.totalPresent         = subDoc.records.filter((r) => r.status === "present").length;
    subDoc.totalAbsent          = subDoc.totalClasses - subDoc.totalPresent;
    subDoc.attendancePercentage = parseFloat(((subDoc.totalPresent / subDoc.totalClasses) * 100).toFixed(1));

    await doc.save();
    res.json(doc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete("/api/attendance/:id", async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── MARKS ─────────────────────────────────────────────────────
app.get("/api/marks", async (req, res) => {
  try {
    const filter = {};
    if (req.query.series) filter.series = req.query.series;
    const docs = await Marks.find(filter).sort({ roll: 1 });
    res.json(docs);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/marks/roll/:roll", async (req, res) => {
  try {
    const doc = await Marks.findOne({ roll: req.params.roll });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/marks/summary", async (req, res) => {
  try {
    const filter = {};
    if (req.query.series) filter.series = req.query.series;
    const docs = await Marks.find(filter);

    const subjectMap = {};
    const gradeDist  = { "A+": 0, "A": 0, "A-": 0, "B+": 0, "B": 0, "B-": 0, "C+": 0, "C": 0, "D": 0, "F": 0 };

    docs.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        if (!subjectMap[sub.subject]) subjectMap[sub.subject] = { sum: 0, count: 0 };
        subjectMap[sub.subject].sum   += sub.total;
        subjectMap[sub.subject].count += 1;
        if (gradeDist[sub.grade] !== undefined) gradeDist[sub.grade]++;
      });
    });

    const subjectPerformance = Object.entries(subjectMap).map(([subject, v]) => ({
      subject,
      avgMarks: v.count > 0 ? parseFloat((v.sum / v.count).toFixed(1)) : 0,
    })).sort((a, b) => a.subject.localeCompare(b.subject));

    res.json({ subjectPerformance, gradeDistribution: gradeDist });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post("/api/marks", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.series && !body.semester) body.semester = SERIES_SEM[body.series] || "";
    if (Array.isArray(body.subjects)) {
      body.subjects = body.subjects.map((sub) => {
        const total    = (sub.CT || 0) + (sub.Assignment || 0) + (sub.Attendance || 0) + (sub.Semester || 0);
        const computed = getGrade(total);
        return {
          ...sub,
          total:      sub.total      || total,
          grade:      sub.grade      || computed.grade,
          gradePoint: sub.gradePoint || computed.gradePoint,
        };
      });
    }
    const doc = await Marks.findOneAndUpdate(
      { roll: body.roll },
      body,
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(doc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.put("/api/marks/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.series) body.semester = SERIES_SEM[body.series] || body.semester;
    const doc = await Marks.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete("/api/marks/:id", async (req, res) => {
  try {
    await Marks.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── DASHBOARD STATS ───────────────────────────────────────────
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    // ── series filter from query param ────────────────────────
    const seriesFilter = req.query.series || null;
    const markFilter   = seriesFilter ? { series: seriesFilter } : {};
    const attFilter    = seriesFilter ? { series: seriesFilter } : {};

    const [totalStudents, series22Count, allAttendance, allMarks, seriesDist] = await Promise.all([
      Student.countDocuments(seriesFilter ? { series: seriesFilter, status: "active" } : { status: "active" }),
      Student.countDocuments({ series: "22", status: "active" }),
      Attendance.find(attFilter),   // ✅ now filtered by series
      Marks.find(markFilter),       // ✅ now filtered by series
      Student.aggregate([
        { $group: { _id: "$series", count: { $sum: 1 } } },
        { $project: { series: "$_id", count: 1, _id: 0 } },
        { $sort: { series: 1 } },
      ]),
    ]);

    // ── Avg attendance ────────────────────────────────────────
    let totalPresent = 0, totalClasses = 0;
    allAttendance.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        totalPresent += sub.totalPresent;
        totalClasses += sub.totalClasses;
      });
    });
    const avgAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // ── Avg marks ─────────────────────────────────────────────
    let markSum = 0, markCount = 0;
    allMarks.forEach((doc) => {
      doc.subjects.forEach((sub) => { markSum += sub.total; markCount++; });
    });
    const avgMarks = markCount > 0 ? Math.round(markSum / markCount) : 0;

    // ── Grade distribution ────────────────────────────────────
    const gradeDistribution = { "A+": 0, "A": 0, "A-": 0, "B+": 0, "B": 0, "B-": 0, "C+": 0, "C": 0, "D": 0, "F": 0 };
    allMarks.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        if (gradeDistribution[sub.grade] !== undefined) gradeDistribution[sub.grade]++;
      });
    });

    // ── Subject performance ───────────────────────────────────
    const subMap = {};
    allMarks.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        if (!subMap[sub.subject]) subMap[sub.subject] = { sum: 0, count: 0 };
        subMap[sub.subject].sum   += sub.total;
        subMap[sub.subject].count += 1;
      });
    });
    const subjectPerformance = Object.entries(subMap)
      .map(([subject, v]) => ({ subject, avgMarks: parseFloat((v.sum / v.count).toFixed(1)) }))
      .sort((a, b) => b.avgMarks - a.avgMarks)
      .slice(0, 6);

    // ── Top students — includes series field ──────────────────
    const studentAvgMap = {};
    allMarks.forEach((doc) => {
      const totals = doc.subjects.map((s) => s.total);
      const avg    = totals.length
        ? parseFloat((totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1))
        : 0;
      studentAvgMap[doc.roll] = {
        name:     doc.studentName,
        roll:     doc.roll,
        series:   doc.series,   // ✅ series field — was missing before
        avgMarks: avg,
      };
    });
    const topStudents = Object.values(studentAvgMap)
      .sort((a, b) => b.avgMarks - a.avgMarks)
      .slice(0, 5);

    // ── Low attendance ────────────────────────────────────────
    const studentAttMap = {};
    allAttendance.forEach((doc) => {
      let present = 0, classes = 0;
      doc.subjects.forEach((sub) => { present += sub.totalPresent; classes += sub.totalClasses; });
      const pct = classes > 0 ? Math.round((present / classes) * 100) : 0;
      studentAttMap[doc.roll] = {
        name:       doc.studentName,
        roll:       doc.roll,
        series:     doc.series,
        attendance: pct,
      };
    });
    const lowAttendance = Object.values(studentAttMap)
      .filter((s) => s.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance)
      .slice(0, 5);

    // ── Attendance trend ──────────────────────────────────────
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthMap   = {};
    allAttendance.forEach((doc) => {
      doc.subjects.forEach((sub) => {
        sub.records.forEach((rec) => {
          const d = new Date(rec.date);
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (!monthMap[key]) monthMap[key] = { year: d.getFullYear(), month: d.getMonth(), present: 0, total: 0 };
          monthMap[key].total++;
          if (rec.status === "present") monthMap[key].present++;
        });
      });
    });
    const attendanceTrend = Object.values(monthMap)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .slice(-6)
      .map((m) => ({ month: monthNames[m.month], pct: Math.round((m.present / m.total) * 100) }));

    // ── Series distribution (always all series) ───────────────
    const seriesDistribution = SERIES_LIST.map((s) => ({
      series: s,
      count:  seriesDist.find((d) => d.series === s)?.count || 0,
    }));

    res.json({
      totalStudents,
      series22Count,
      avgAttendance,
      avgMarks,
      attendanceTrend,
      gradeDistribution,
      subjectPerformance,
      topStudents,
      lowAttendance,
      seriesDistribution,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Subjects list helper ──────────────────────────────────────
app.get("/api/subjects/:series", (req, res) => {
  const subjects = SERIES_SUBJECTS[req.params.series];
  if (!subjects) return res.status(404).json({ message: "Series not found" });
  res.json(subjects);
});

// ── Health ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  ETE Dashboard API running on port ${PORT}`));