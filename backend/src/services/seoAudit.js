// Checks all the basic OnPage SEO stuff - just by reading the HTML
const cheerio = require("cheerio");

function checkTitle($) {
  const title = $("title").first().text().trim();

  if (!title) {
    return {
      label: "Meta title",
      passed: false,
      points: 0,
      maxPoints: 10,
      note: "No <title> tag found",
    };
  }

  const length = title.length;
  const goodLength = length >= 30 && length <= 60;

  return {
    label: "Meta title",
    passed: goodLength,
    points: goodLength ? 10 : 5, // partial credit if it exists but is the wrong length
    maxPoints: 10,
    value: title,
    note: goodLength
      ? `Good length (${length} characters)`
      : `Title is ${length} characters - aim for 30 to 60`,
  };
}

function checkMetaDescription($) {
  const description = $('meta[name="description"]').attr("content") || "";

  if (!description) {
    return {
      label: "Meta description",
      passed: false,
      points: 0,
      maxPoints: 10,
      note: "No meta description found",
    };
  }

  const length = description.length;
  const goodLength = length >= 70 && length <= 160;

  return {
    label: "Meta description",
    passed: goodLength,
    points: goodLength ? 10 : 5,
    maxPoints: 10,
    value: description,
    note: goodLength
      ? `Good length (${length} characters)`
      : `Description is ${length} characters - aim for 70 to 160`,
  };
}

function checkHeadings($) {
  const h1s = $("h1");
  const headingCounts = {};

  for (let level = 1; level <= 6; level++) {
    headingCounts[`h${level}`] = $(`h${level}`).length;
  }

  const hasOneH1 = h1s.length === 1;

  return {
    label: "Heading structure",
    passed: hasOneH1,
    points: hasOneH1 ? 10 : h1s.length === 0 ? 0 : 5,
    maxPoints: 10,
    value: headingCounts,
    note: hasOneH1
      ? "Exactly one H1, which is what you want"
      : h1s.length === 0
        ? "No H1 tag found on the page"
        : `Found ${h1s.length} H1 tags - a page should only have one`,
  };
}

function checkImageAltText($) {
  const images = $("img");
  const totalImages = images.length;

  if (totalImages === 0) {
    return {
      label: "Image alt text",
      passed: true,
      points: 10,
      maxPoints: 10,
      note: "No images on the page",
    };
  }

  let missingAlt = 0;
  images.each((_, img) => {
    const alt = $(img).attr("alt");
    if (!alt || !alt.trim()) missingAlt++;
  });

  const percentMissing = Math.round((missingAlt / totalImages) * 100);
  const passed = missingAlt === 0;

  return {
    label: "Image alt text",
    passed,
    points: passed
      ? 10
      : Math.max(0, 10 - Math.ceil((missingAlt / totalImages) * 10)),
    maxPoints: 10,
    value: `${totalImages - missingAlt}/${totalImages} images have alt text`,
    note: passed
      ? "All images have alt text"
      : `${missingAlt} of ${totalImages} images (${percentMissing}%) are missing alt text`,
  };
}

function checkUrlStructure(url) {
  const parsed = new URL(url);
  const path = parsed.pathname;

  const isTooLong = url.length > 100;
  const hasUnderscores = path.includes("_");
  const hasMessyParams = parsed.search.length > 30; // long query strings are usually not clean

  const issues = [];
  if (isTooLong) issues.push("URL is quite long");
  if (hasUnderscores) issues.push("uses underscores instead of hyphens");
  if (hasMessyParams) issues.push("has a long query string");

  const passed = issues.length === 0;

  return {
    label: "URL structure",
    passed,
    points: passed ? 5 : Math.max(0, 5 - issues.length * 2),
    maxPoints: 5,
    note: passed ? "URL looks clean" : issues.join(", "),
  };
}

function checkLinks($, baseUrl) {
  const baseHost = new URL(baseUrl).hostname;
  let internalLinks = 0;
  let externalLinks = 0;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return;

    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname === baseHost) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch (err) {
      // not a valid URL, skip it
    }
  });

  const hasLinks = internalLinks + externalLinks > 0;

  return {
    label: "Internal & external links",
    passed: hasLinks,
    points: hasLinks ? 5 : 0,
    maxPoints: 5,
    value: { internalLinks, externalLinks },
    note: hasLinks
      ? `${internalLinks} internal links, ${externalLinks} external links`
      : "No links found on the page",
  };
}

// this is the function everything calls
function runSeoAudit(html, url) {
  const $ = cheerio.load(html);

  const checks = [
    checkTitle($),
    checkMetaDescription($),
    checkHeadings($),
    checkImageAltText($),
    checkUrlStructure(url),
    checkLinks($, url),
  ];

  return checks;
}

module.exports = { runSeoAudit };
