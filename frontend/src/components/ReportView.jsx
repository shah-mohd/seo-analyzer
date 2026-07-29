import ScoreCard from "./ScoreCard";

function CheckList({ title, checks }) {
  return (
    <div className="check-section">
      <h3>{title}</h3>
      <ul>
        {checks.map((check, index) => (
          <li key={index} className={check.passed ? "passed" : "failed"}>
            <span className="status-icon">{check.passed ? "✅" : "⚠️"}</span>
            <div>
              <strong>{check.label}</strong>
              <p>{check.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportView({ result }) {
  const { url, scores, checks } = result.report;

  return (
    <div className="report">
      <h2>Report for {url}</h2>

      <div className="score-grid">
        <ScoreCard label="Overall" score={scores.overall} />
        <ScoreCard label="Technical SEO" score={scores.technical} />
        <ScoreCard label="On-Page SEO" score={scores.onPage} />
        <ScoreCard label="Performance" score={scores.performance} />
        <ScoreCard label="Content" score={scores.content} />
      </div>

      <CheckList title="On-Page SEO" checks={checks.seoAudit} />
      <CheckList title="Technical SEO" checks={checks.technicalSeo} />
      <CheckList title="Performance" checks={checks.performance} />
      <CheckList title="Content" checks={checks.contentAnalysis} />
      <CheckList
        title="Trust & Social Metadata"
        checks={checks.trustMetadata}
      />
    </div>
  );
}
