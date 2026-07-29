const puppeteer = require("puppeteer");

async function runLighthouseAudit(url) {
  // lighthouse
  const lighthouse = (await import("lighthouse")).default;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const { port } = new URL(browser.wsEndpoint());

    const result = await lighthouse(url, {
      port,
      output: "json",
      onlyCategories: ["performance"],
    });

    const lhr = result.lhr;

    return {
      performanceScore: Math.round(lhr.categories.performance.score * 100),
      metrics: {
        firstContentfulPaint: lhr.audits["first-contentful-paint"].displayValue,
        largestContentfulPaint:
          lhr.audits["largest-contentful-paint"].displayValue,
        cumulativeLayoutShift:
          lhr.audits["cumulative-layout-shift"].displayValue,
        totalBlockingTime: lhr.audits["total-blocking-time"].displayValue,
        speedIndex: lhr.audits["speed-index"].displayValue,
      },
    };
  } finally {
    await browser.close();
  }
}

function checkBasicPageSpeed(loadTimeMs) {
  // fallback / baseline check that always works, even without Lighthouse
  const seconds = loadTimeMs / 1000;
  const passed = seconds < 2;

  return {
    label: "Basic page load time",
    passed,
    points: passed ? 10 : seconds < 4 ? 5 : 0,
    maxPoints: 10,
    value: `${seconds.toFixed(2)}s`,
    note: passed ? "Page loaded quickly" : "Page took a while to respond",
  };
}

async function runPerformanceAnalysis(url, loadTimeMs) {
  const checks = [checkBasicPageSpeed(loadTimeMs)];

  try {
    const lighthouseResult = await runLighthouseAudit(url);

    checks.push({
      label: "Core Web Vitals (Lighthouse)",
      passed: lighthouseResult.performanceScore >= 50,
      points: Math.round((lighthouseResult.performanceScore / 100) * 20),
      maxPoints: 20,
      value: lighthouseResult.metrics,
      note: `Lighthouse performance score: ${lighthouseResult.performanceScore}/100`,
    });
  } catch (error) {
    // Lighthouse can fail on sites that block headless browsers, slow
    // servers, etc. - we don't want that to break the whole report
    checks.push({
      label: "Core Web Vitals (Lighthouse)",
      passed: false,
      points: 0,
      maxPoints: 20,
      note: "Could not run Lighthouse for this site: " + error.message,
    });
  }

  return checks;
}

module.exports = { runPerformanceAnalysis };
