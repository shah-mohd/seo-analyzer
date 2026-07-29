const WEIGHTS = {
  technical: 0.3,
  onPage: 0.3,
  performance: 0.2,
  content: 0.2,
};

function scoreCategory(checks) {
  const earned = checks.reduce((sum, check) => sum + check.points, 0);
  const possible = checks.reduce((sum, check) => sum + check.maxPoints, 0);

  if (possible === 0) return 0;

  return Math.round((earned / possible) * 100);
}

function calculateScores({
  seoAudit,
  technicalSeo,
  performance,
  contentAnalysis,
}) {
  const onPageScore = scoreCategory(seoAudit);
  const technicalScore = scoreCategory(technicalSeo);
  const performanceScore = scoreCategory(performance);
  const contentScore = scoreCategory(contentAnalysis);

  const overallScore = Math.round(
    technicalScore * WEIGHTS.technical +
      onPageScore * WEIGHTS.onPage +
      performanceScore * WEIGHTS.performance +
      contentScore * WEIGHTS.content,
  );

  return {
    technical: technicalScore,
    onPage: onPageScore,
    performance: performanceScore,
    content: contentScore,
    overall: overallScore,
  };
}

module.exports = { calculateScores };
