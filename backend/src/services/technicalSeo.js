const cheerio = require("cheerio");

function checkHttps(url) {
  const isHttps = url.startsWith("https://");
  return {
    label: "HTTPS / SSL",
    passed: isHttps,
    points: isHttps ? 10 : 0,
    maxPoints: 10,
    note: isHttps ? "Site is served over HTTPS" : "Site is not using HTTPS",
  };
}

async function checkRobotsTxt(url) {
  try {
    const robotsUrl = new URL("/robots.txt", url).toString();
    const response = await fetch(robotsUrl);
    const exists = response.status === 200;

    return {
      label: "robots.txt",
      passed: exists,
      points: exists ? 5 : 0,
      maxPoints: 5,
      note: exists ? "robots.txt found" : "No robots.txt found",
    };
  } catch (error) {
    return {
      label: "robots.txt",
      passed: false,
      points: 0,
      maxPoints: 5,
      note: "Could not check robots.txt",
    };
  }
}

async function checkSitemap(url) {
  try {
    const sitemapUrl = new URL("/sitemap.xml", url).toString();
    const response = await fetch(sitemapUrl);
    const exists = response.status === 200;

    return {
      label: "sitemap.xml",
      passed: exists,
      points: exists ? 5 : 0,
      maxPoints: 5,
      note: exists
        ? "sitemap.xml found"
        : "No sitemap.xml found at the default location",
    };
  } catch (error) {
    return {
      label: "sitemap.xml",
      passed: false,
      points: 0,
      maxPoints: 5,
      note: "Could not check sitemap.xml",
    };
  }
}

function checkCanonical($) {
  const canonical = $('link[rel="canonical"]').attr("href");

  return {
    label: "Canonical tag",
    passed: Boolean(canonical),
    points: canonical ? 5 : 0,
    maxPoints: 5,
    value: canonical || null,
    note: canonical
      ? `Canonical tag points to ${canonical}`
      : "No canonical tag found",
  };
}

function checkMobileFriendly($) {
  const viewport = $('meta[name="viewport"]').attr("content");
  const hasViewport = Boolean(viewport);

  return {
    label: "Mobile friendliness",
    passed: hasViewport,
    points: hasViewport ? 10 : 0,
    maxPoints: 10,
    note: hasViewport
      ? "Viewport meta tag is set up correctly"
      : "No viewport meta tag - page likely isn't mobile-friendly",
  };
}

function checkIndexability($) {
  const metaRobots = $('meta[name="robots"]').attr("content") || "";
  const isBlocked = metaRobots.toLowerCase().includes("noindex");

  return {
    label: "Indexability",
    passed: !isBlocked,
    points: isBlocked ? 0 : 10,
    maxPoints: 10,
    note: isBlocked
      ? "Page has a 'noindex' tag - it's telling search engines not to index it"
      : "Page is indexable",
  };
}

function checkStructuredData($) {
  const scripts = $('script[type="application/ld+json"]');

  if (scripts.length === 0) {
    return {
      label: "Structured data",
      passed: false,
      points: 0,
      maxPoints: 5,
      note: "No JSON-LD structured data found",
    };
  }

  // make sure at least one of the scripts actually contains valid JSON
  let validCount = 0;
  scripts.each((_, el) => {
    try {
      JSON.parse($(el).html());
      validCount++;
    } catch (err) {
      // invalid JSON in that particular script tag, just skip it
    }
  });

  const passed = validCount > 0;

  return {
    label: "Structured data",
    passed,
    points: passed ? 5 : 0,
    maxPoints: 5,
    note: passed
      ? `Found ${validCount} valid structured data block(s)`
      : "Structured data found but it wasn't valid JSON",
  };
}

function checkRedirect(wasRedirected, finalUrl) {
  return {
    label: "Redirect handling",
    passed: true, // this one is informational, not really a pass/fail
    points: 5,
    maxPoints: 5,
    note: wasRedirected
      ? `URL redirected to ${finalUrl}`
      : "No redirect - URL loaded directly",
  };
}

async function runTechnicalSeo(html, url, crawlResult) {
  const $ = cheerio.load(html);

  // run the network-based checks (robots.txt, sitemap) at the same time
  // instead of one after another, since they don't depend on each other
  const [robotsCheck, sitemapCheck] = await Promise.all([
    checkRobotsTxt(url),
    checkSitemap(url),
  ]);

  return [
    checkHttps(url),
    robotsCheck,
    sitemapCheck,
    checkCanonical($),
    checkMobileFriendly($),
    checkIndexability($),
    checkStructuredData($),
    checkRedirect(crawlResult.wasRedirected, crawlResult.finalUrl),
  ];
}

module.exports = { runTechnicalSeo };
