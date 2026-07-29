# SEO Analyzer — A Woorank-style Website Auditor

This website tells you how good or bad, it is at SEO — kind of like a simplified, self-built version of Woorank. You put in a URL, it crawls the page, checks a bunch of things Google cares about, and gives you a score out of 100 with a breakdown.
No paid APIs. No Woorank API. Everything is built from scratch using open-source tools.

## What it actually does

paste in a website link:

1. Downloads the page's HTML
2. Reads through it looking for SEO problems (missing title, no alt text, broken headings, etc.)
3. Checks technical stuff (is it on HTTPS? does robots.txt exist? is there a sitemap?)
4. Opens the page in a real (headless) browser to check performance and mobile-friendliness
5. Reads the actual text content and checks things like readability and word count
6. Adds it all up into scores, and shows you a report

## the architecture

instead of doing everything in one shot, the work is split into pieces:

```
User (React app)
      ↓ submits URL
Express API  →  "okay, got it, here's your job ID"
      ↓ (quietly, in the background)
Job Queue (Redis)
      ↓
Worker  →  crawls the page, runs checks, uses headless Chrome for the heavy stuff
      ↓
MongoDB  ←  worker saves the finished report here
      ↑
Express API reads from MongoDB when the user checks back for results
```

## Everything it checks

**On-page SEO**

- Title tag — does it exist, is it a good length (roughly 50–60 characters)
- Meta description — exists, good length (roughly 150–160 characters)
- Headings (H1 through H6) — is there exactly one H1, is the order logical
- Image alt text — flags images missing descriptions
- URL structure — checks length, readability, messy query strings
- Internal links — links pointing to the same site
- External links — links pointing elsewhere, checks if any are broken

**Technical SEO**

- HTTPS — is the site secure
- robots.txt — does it exist, what does it allow/block
- sitemap.xml — does it exist
- Mobile friendliness — viewport tag check + rendering check
- Canonical tags — set correctly to avoid duplicate content issues
- Redirects — flags redirect chains or loops
- Indexability — checks if the page is telling Google "don't index me" by accident
- Structured data — looks for schema.org / JSON-LD markup

**Performance**

- Page speed basics
- Core Web Vitals (via Lighthouse) — the same metrics Google uses for ranking

**Content**

- Keyword presence — how often the main keyword shows up
- Content length — total word count
- Readability — how easy the text is to read (Flesch-Kincaid style scoring)
- Heading hierarchy — makes sure headings are logically nested

**Trust & social metadata**

- Open Graph tags (for Facebook/LinkedIn link previews)
- Twitter Card tags
- General social meta presence

---

## How the scoring works

Each category (Technical, On-Page, Performance, Content) gets its own score out of 100, and then those four are combined (weighted) into one overall score out of 100.

The logic is simple: every check is worth a certain number of points. If the site passes the check, it gets the points. If it fails, it gets zero (or partial credit for things like "title exists but is too long"). Add up the points in a category, divide by the total possible points, multiply by 100 — that's the category score.

Example (simplified):

| Check                | Points | Passed? |
| -------------------- | ------ | ------- |
| Has title tag        | 10     | ✅      |
| Title length is good | 5      | ❌      |
| Has meta description | 10     | ✅      |
| Has exactly one H1   | 10     | ✅      |
| ...                  | ...    | ...     |

Category score = (points earned ÷ total possible points) × 100

The four category scores are then averaged (or weighted, if you want technical SEO to matter more than content, for example) to get the final overall score.

This doesn't need to match how Woorank actually calculates things internally — nobody knows their exact formula anyway. What matters is that your logic is consistent and clearly explained, which this is.

---

## API documentation

### `POST /api/analyze`

Starts a new analysis.

**Request body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "jobId": "64f8a2b1c9e77a001f3d5e21",
  "status": "pending"
}
```

### `GET /api/results/:id`

Checks the status of a job, or returns the finished report.

**While still working:**

```json
{
  "jobId": "64f8a2b1c9e77a001f3d5e21",
  "status": "processing"
}
```

**Once complete:**

```json
{
  "jobId": "64f8a2b1c9e77a001f3d5e21",
  "status": "complete",
  "url": "https://example.com",
  "scores": {
    "technical": 82,
    "onPage": 74,
    "performance": 65,
    "content": 90,
    "overall": 78
  },
  "report": {
    "seoAudit": { ... },
    "technicalSeo": { ... },
    "performance": { ... },
    "contentAnalysis": { ... },
    "trustMetadata": { ... }
  }
}
```
