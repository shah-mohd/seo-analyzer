// This is the very first step of the analysis: download the page.

async function crawlPage(url) {
  const startTime = Date.now();

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow", // follow redirects like a browser would
    headers: {
      // some sites block requests that don't look like a real browser
      "User-Agent":
        "Mozilla/5.0 (compatible; SimpleSEOBot/1.0; +https://github.com/your-username/seo-analyzer)",
    },
  });

  const loadTimeMs = Date.now() - startTime;
  const html = await response.text();

  return {
    html,
    statusCode: response.status,
    finalUrl: response.url, // if the site redirected, this is where it ended up
    wasRedirected: response.url !== url,
    headers: Object.fromEntries(response.headers.entries()),
    loadTimeMs,
  };
}

module.exports = { crawlPage };
