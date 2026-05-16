function ResultBars({ question }) {
  const total = question.options?.reduce((s, o) => s + (o.votes || o.votesCount || 0), 0) || 0;
  return (
    <div>
      {(question.options || []).map(opt => {
        const votes = opt.votes || opt.votesCount || 0;
        const pct = total > 0 ? Math.round(votes / total * 100) : 0;
        return (
          <div key={opt.id} className="result-bar-wrap">
            <div className="result-bar-label">
              <span>{opt.text}</span>
              <span style={{ color: "var(--accent2)", fontWeight: 700 }}>{pct}% <span className="meta">({votes})</span></span>
            </div>
            <div className="result-bar-track">
              <div className="result-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <div className="meta mt-8">Всього голосів: {total}</div>
    </div>
  );
}

export { ResultBars };