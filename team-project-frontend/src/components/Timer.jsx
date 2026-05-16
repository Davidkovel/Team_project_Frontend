import { useState, useEffect, useRef } from "react";
import "../styles/Timer.css";


function QuestionTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!seconds) return;
    const id = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(id); onExpire?.(); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [seconds]);
 
  const pct = (left / seconds) * 100;
  const danger = left <= 10;
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="timer-wrap">
        <span>⏱</span>
        <span className={danger ? "timer-danger" : ""}>{left}с</span>
        <div className="timer-bar">
          <div className="timer-bar-fill" style={{ width: `${pct}%`, background: danger ? "var(--danger)" : "var(--accent2)" }} />
        </div>
      </div>
    </div>
  );
}

export default QuestionTimer;