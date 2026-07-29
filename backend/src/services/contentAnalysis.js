
const cheerio = require("cheerio");

// pulls out just the readable text, ignoring scripts, styles, etc.
function extractVisibleText($) {
  $("script, style, noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function countSentences(text) {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  // rough syllable estimate - count groups of vowels
  const matches = word.match(/[aeiouy]+/g);
  return matches ? matches.length : 1;
}

// simplified Flesch Reading Ease score
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = countSentences(text);
  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);

  if (wordCount === 0 || sentenceCount === 0) return 0;

  const score =
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function checkContentLength(wordCount) {
  const passed = wordCount >= 300;

  return {
    label: "Content length",
    passed,
    points: passed ? 10 : Math.round((wordCount / 300) * 10),
    maxPoints: 10,
    value: `${wordCount} words`,
    note: passed ? "Good amount of content" : "Content is thin - aim for at least 300 words",
  };
}

function checkReadability(score) {
  // 60+ is considered "plain English" and easy for most people to read
  const passed = score >= 50;

  return {
    label: "Readability",
    passed,
    points: passed ? 10 : Math.round((score / 50) * 10),
    maxPoints: 10,
    value: `Flesch reading ease: ${score}`,
    note: passed ? "Content is reasonably easy to read" : "Content might be difficult to read - try shorter sentences and simpler words",
  };
}

function checkKeywordUsage($, text) {
  const title = $("title").first().text().trim();
  if (!title) {
    return { label: "Keyword presence", passed: false, points: 0, maxPoints: 5, note: "No title to base keyword check on" };
  }

  // just use the first meaningful word of the title as the "main keyword"
  // this is a simple stand-in for real keyword
  const mainKeyword = title.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!mainKeyword) {
    return { label: "Keyword presence", passed: false, points: 0, maxPoints: 5, note: "Could not determine a keyword from the title" };
  }

  const occurrences = (text.toLowerCase().match(new RegExp(mainKeyword, "g")) || []).length;
  const passed = occurrences > 0;

  return {
    label: "Keyword presence",
    passed,
    points: passed ? 5 : 0,
    maxPoints: 5,
    value: `"${mainKeyword}" appears ${occurrences} times`,
    note: passed ? "Main keyword from the title also appears in the content" : "Keyword from the title doesn't appear in the body text",
  };
}

function checkHeadingHierarchy($) {
  const headings = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    headings.push(Number(el.tagName.replace("h", "")));
  });

  if (headings.length === 0) {
    return { label: "Heading hierarchy", passed: false, points: 0, maxPoints: 5, note: "No headings found" };
  }

  // a "skip" is going from h1 straight to h3, skipping h2, for example
  let hasSkip = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) hasSkip = true;
  }

  return {
    label: "Heading hierarchy",
    passed: !hasSkip,
    points: hasSkip ? 2 : 5,
    maxPoints: 5,
    note: hasSkip ? "Heading levels are skipped (e.g. H1 straight to H3)" : "Headings are properly nested",
  };
}

function runContentAnalysis(html) {
  const $ = cheerio.load(html);
  const text = extractVisibleText($);
  const wordCount = countWords(text);
  const readabilityScore = calculateReadability(text);

  return [
    checkContentLength(wordCount),
    checkReadability(readabilityScore),
    checkKeywordUsage($, text),
    checkHeadingHierarchy($),
  ];
}

module.exports = { runContentAnalysis };
