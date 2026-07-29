const { crawlPage } = require("./crawler");
const { runSeoAudit } = require("./seoAudit");
const { runTechnicalSeo } = require("./technicalSeo");
const { runPerformanceAnalysis } = require("./performance");
const { runContentAnalysis } = require("./contentAnalysis");
const { runTrustMetadata } = require("./trustMetadata");
const { calculateScores } = require("./scoring");

async function analyzeSite(url) {
  // step 1: download the page
  const crawlResult = await crawlPage(url);
  const { html } = crawlResult;

  // step 2: run all the checks
  const [seoAudit, technicalSeo, performance] = await Promise.all([
    Promise.resolve(runSeoAudit(html, crawlResult.finalUrl)),
    runTechnicalSeo(html, crawlResult.finalUrl, crawlResult),
    runPerformanceAnalysis(crawlResult.finalUrl, crawlResult.loadTimeMs),
  ]);

  const contentAnalysis = runContentAnalysis(html);
  const trustMetadata = runTrustMetadata(html);

  // step 3: turn all those checks into scores
  const scores = calculateScores({
    seoAudit,
    technicalSeo,
    performance,
    contentAnalysis,
  });

  // step 4: put it all together into one report
  return {
    url,
    finalUrl: crawlResult.finalUrl,
    analyzedAt: new Date().toISOString(),
    scores,
    checks: {
      seoAudit,
      technicalSeo,
      performance,
      contentAnalysis,
      trustMetadata,
    },
  };
}

module.exports = { analyzeSite };
