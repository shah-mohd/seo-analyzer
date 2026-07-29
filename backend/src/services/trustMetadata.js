const cheerio = require("cheerio");

function checkOpenGraph($) {
  const ogTags = {
    title: $('meta[property="og:title"]').attr("content"),
    description: $('meta[property="og:description"]').attr("content"),
    image: $('meta[property="og:image"]').attr("content"),
  };

  const foundCount = Object.values(ogTags).filter(Boolean).length;
  const passed = foundCount === 3;

  return {
    label: "Open Graph metadata",
    passed,
    points: foundCount * 2, // 2 points each, out of 6
    maxPoints: 6,
    value: ogTags,
    note: passed
      ? "All key Open Graph tags are present"
      : `${foundCount}/3 Open Graph tags found`,
  };
}

function checkTwitterCard($) {
  const twitterTags = {
    card: $('meta[name="twitter:card"]').attr("content"),
    title: $('meta[name="twitter:title"]').attr("content"),
    description: $('meta[name="twitter:description"]').attr("content"),
  };

  const foundCount = Object.values(twitterTags).filter(Boolean).length;
  const passed = foundCount === 3;

  return {
    label: "Twitter Card metadata",
    passed,
    points: foundCount * 2,
    maxPoints: 6,
    value: twitterTags,
    note: passed
      ? "All key Twitter Card tags are present"
      : `${foundCount}/3 Twitter Card tags found`,
  };
}

function runTrustMetadata(html) {
  const $ = cheerio.load(html);
  return [checkOpenGraph($), checkTwitterCard($)];
}

module.exports = { runTrustMetadata };
