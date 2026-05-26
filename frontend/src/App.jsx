import { useState } from "react";
import axios from "axios";
import CourseInput from "./components/CourseInput";
import ConstraintPanel from "./components/ConstraintPanel";
import TimetableGrid from "./components/TimetableGrid";
import SharePanel from "./components/SharePanel";

export default function App() {
  const [courses, setCourses] = useState([]);
  const [constraints, setConstraints] = useState({ avoid_before: "09:00", avoid_back_to_back: false });
  const [timetables, setTimetables] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareCode, setShareCode] = useState("");

  async function generate() {
    if (courses.length === 0) return;
    setLoading(true); setError(""); setTimetables([]); setShareCode("");
    try {
      const { data } = await axios.post("/api/generate", { courses, constraints });
      if (data.timetables.length === 0) setError("No valid timetable found. Try relaxing constraints or adding more slot options per course.");
      else { setTimetables(data.timetables); setSelected(0); }
    } catch { setError("Failed to generate. Is the backend running?"); }
    finally { setLoading(false); }
  }

  async function saveTimetable() {
    if (!timetables[selected]) return;
    const { data } = await axios.post("/api/save", { timetable: timetables[selected] });
    setShareCode(data.share_code);
  }

  return (
    <div className="app">
      <header>
        <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
        <h1>Smart Timetable Generator</h1>
        <p>Build conflict-free schedules · Share with friends · Find common free time</p>
      </header>

      <div className="layout">
        <div className="sidebar">
          <CourseInput courses={courses} onChange={setCourses} />
          <ConstraintPanel constraints={constraints} onChange={setConstraints} />
          <button className="btn" onClick={generate} disabled={loading || courses.length === 0}>
            {loading ? "⚙️ Generating..." : "✨ Generate Timetables"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="main">
          {timetables.length > 0 && (
            <>
              <div className="tt-nav">
                {timetables.map((_, i) => (
                  <button key={i} className={`tt-tab ${i === selected ? "active" : ""}`} onClick={() => setSelected(i)}>
                    Option {i + 1}
                  </button>
                ))}
                <button className="btn-secondary" onClick={saveTimetable}>Share →</button>
              </div>
              <TimetableGrid timetable={timetables[selected]} />
              {shareCode && <SharePanel shareCode={shareCode} />}
            </>
          )}
          {timetables.length === 0 && !loading && (
            <div className="empty-state">
              <div className="icon">🗓️</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No timetable yet</p>
              <p>Add your courses on the left and hit Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
