import { useState } from "react";
import axios from "axios";

export default function SharePanel({ shareCode }) {
  const [friendCode, setFriendCode] = useState("");
  const [freeSlots, setFreeSlots] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function checkOverlap() {
    if (!friendCode.trim()) return;
    setError("");
    try {
      const { data } = await axios.post("/api/overlap", { code_a: shareCode, code_b: friendCode.trim() });
      setFreeSlots(data.free_slots);
    } catch { setError("Timetable not found for that code."); }
  }

  return (
    <div className="share-panel">
      <h3>Share Your Timetable</h3>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>Give this code to your friend:</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="code-display">{shareCode}</div>
        <button className="btn-secondary" style={{ width: "auto" }} onClick={copyCode}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      <h3 style={{ marginBottom: 10 }}>Find Free Slots with a Friend</h3>
      <div className="overlap-row">
        <input placeholder="Enter friend's share code" value={friendCode} onChange={(e) => setFriendCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkOverlap()} />
        <button className="btn-secondary" style={{ width: "auto" }} onClick={checkOverlap}>Check →</button>
      </div>
      {error && <p className="error">{error}</p>}

      {freeSlots.length > 0 && (
        <>
          <p style={{ fontSize: 13, marginTop: 14, marginBottom: 8, color: "#15803d", fontWeight: 700 }}>
            🟢 {freeSlots.length} common free slots
          </p>
          <div className="free-slots">
            {freeSlots.map((s, i) => (
              <span key={i} className="free-slot-tag">{s.day.slice(0, 3)} {s.start_time}–{s.end_time}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
