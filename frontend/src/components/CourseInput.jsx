const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const COLORS = ["#bfdbfe", "#bbf7d0", "#fde68a", "#fecaca", "#e9d5ff", "#fed7aa"];

export default function CourseInput({ courses, onChange }) {
  function addCourse() {
    onChange([...courses, { name: "", slots: [{ day: "Monday", start_time: "09:00", end_time: "10:00" }] }]);
  }

  function removeCourse(i) {
    onChange(courses.filter((_, idx) => idx !== i));
  }

  function updateCourse(i, field, value) {
    const updated = courses.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    onChange(updated);
  }

  function addSlot(i) {
    const updated = courses.map((c, idx) =>
      idx === i ? { ...c, slots: [...c.slots, { day: "Monday", start_time: "10:00", end_time: "11:00" }] } : c
    );
    onChange(updated);
  }

  function removeSlot(ci, si) {
    const updated = courses.map((c, idx) =>
      idx === ci ? { ...c, slots: c.slots.filter((_, s) => s !== si) } : c
    );
    onChange(updated);
  }

  function updateSlot(ci, si, field, value) {
    const updated = courses.map((c, idx) =>
      idx === ci
        ? { ...c, slots: c.slots.map((s, sidx) => sidx === si ? { ...s, [field]: value } : s) }
        : c
    );
    onChange(updated);
  }

  return (
    <div className="card">
      <h3>Courses</h3>
      {courses.map((course, ci) => (
        <div key={ci} className="course-item" style={{ borderLeftColor: COLORS[ci % COLORS.length], borderLeftWidth: 3 }}>
          <div className="course-header">
            <input
              placeholder="Course name"
              value={course.name}
              onChange={(e) => updateCourse(ci, "name", e.target.value)}
              style={{ fontWeight: 600 }}
            />
            <button className="btn-icon" onClick={() => removeCourse(ci)}>✕</button>
          </div>
          {course.slots.map((slot, si) => (
            <div key={si} className="slot-row">
              <select value={slot.day} onChange={(e) => updateSlot(ci, si, "day", e.target.value)}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="time" value={slot.start_time} onChange={(e) => updateSlot(ci, si, "start_time", e.target.value)} />
              <input type="time" value={slot.end_time} onChange={(e) => updateSlot(ci, si, "end_time", e.target.value)} />
              <button className="btn-icon" onClick={() => removeSlot(ci, si)}>✕</button>
            </div>
          ))}
          <button className="add-slot-btn" onClick={() => addSlot(ci)}>+ Add slot option</button>
        </div>
      ))}
      <button className="btn" onClick={addCourse} style={{ marginTop: 4 }}>+ Add Course</button>
    </div>
  );
}
