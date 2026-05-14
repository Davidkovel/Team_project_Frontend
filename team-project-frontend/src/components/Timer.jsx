import { useState, useEffect, useRef } from "react";
import "../styles/Timer.css";

export default function Timer({ duration = 60, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percent = (timeLeft / duration) * 100;

  return (
    <div className="timer">
      <div className="timer-bar-wrapper">
        <div
          className="timer-bar"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="timer-label">
        {minutes > 0
          ? `${minutes}:${String(seconds).padStart(2, "0")}`
          : `${seconds} сек`}
      </span>
    </div>
  );
}

// Timer usage example:
// <Timer duration={60} onExpire={() => console.log("Час вийшов")} />