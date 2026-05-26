const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const COLORS = ["#bfdbfe", "#bbf7d0", "#fde68a", "#fecaca", "#e9d5ff", "#fed7aa"];

function timeToHour(t) {
  return parseInt(t.split(":")[0]);
}

export default function TimetableGrid({ timetable }) {
  if (!timetable) return null;

  const courseNames = Object.keys(timetable);
  const colorMap = {};
  courseNames.forEach((name, i) => { colorMap[name] = COLORS[i % COLORS.length]; });

  function getCourse(day, hour) {
    for (const [name, slot] of Object.entries(timetable)) {
      if (slot.day === day) {
        const start = timeToHour(slot.start_time);
        const end = timeToHour(slot.end_time);
        if (hour >= start && hour < end) return { name, slot };
      }
    }
    return null;
  }

  return (
    <div className="grid-wrap">
      <div className="tt-grid">
        <div className="grid-cell header"></div>
        {DAYS.map((d) => (
          <div key={d} className="grid-cell header">{d.slice(0, 3)}</div>
        ))}
        {HOURS.map((hour) => (
          <>
            <div key={`t${hour}`} className="grid-cell time">{hour}:00</div>
            {DAYS.map((day) => {
              const found = getCourse(day, hour);
              return (
                <div key={`${day}${hour}`} className="grid-cell">
                  {found && timeToHour(found.slot.start_time) === hour && (
                    <div
                      className="course-block"
                      style={{ background: colorMap[found.name] }}
                    >
                      {found.name}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
