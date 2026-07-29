// color based on how good the score
function getScoreColor(score) {
  if (score >= 80) return "#2e7d32"; // green
  if (score >= 50) return "#f9a825"; // yellow
  return "#c62828"; // red
}

export default function ScoreCard({ label, score }) {
  return (
    <div className="score-card">
      <div
        className="score-circle"
        style={{ borderColor: getScoreColor(score) }}
      >
        <span style={{ color: getScoreColor(score) }}>{score}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}
