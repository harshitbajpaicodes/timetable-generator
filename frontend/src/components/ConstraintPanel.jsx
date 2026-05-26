export default function ConstraintPanel({ constraints, onChange }) {
  return (
    <div className="card">
      <h3>Constraints</h3>
      <div className="constraint-row">
        <label>Avoid classes before</label>
        <input
          type="time"
          style={{ width: 120 }}
          value={constraints.avoid_before}
          onChange={(e) => onChange({ ...constraints, avoid_before: e.target.value })}
        />
      </div>
      <div className="constraint-row">
        <label>Avoid back-to-back</label>
        <input
          type="checkbox"
          style={{ width: "auto" }}
          checked={constraints.avoid_back_to_back}
          onChange={(e) => onChange({ ...constraints, avoid_back_to_back: e.target.checked })}
        />
      </div>
    </div>
  );
}
