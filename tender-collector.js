// IET Automatic Tender Collector
// Source #1: Central Public Procurement Portal (CPPP)
//
// Safe public-source collector.
// Does NOT bypass CAPTCHA or restricted access.

const CPPP_URL =
  "https://www.eprocure.gov.in/eprocure/app";

function cleanText(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLatestTenders(html) {
  const tenders = [];

  /*
   * CPPP homepage contains several different link sections.
   * We only accept links that look like actual tender-detail links.
   * Navigation, enrollment, password and nodal-officer links
   * are intentionally ignored.
   */

  const linkRegex =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1] || "";

    const title = cleanText(
      match[2].replace(/<[^>]+>/g, " ")
    );

    if (!title) {
      continue;
    }

    const lowerTitle = title.toLowerCase();
    const lowerHref = href.toLowerCase();

    // Ignore obvious website navigation links.
    const ignoredWords = [
      "online bidder enrollment",
      "generate / forgot password",
      "find my nodal officer",
      "home",
      "login",
      "contact us",
      "sitemap"
    ];

    if (
      ignoredWords.some(word =>
        lowerTitle.includes(word)
      )
    ) {
      continue;
    }

    /*
     * Ignore corrigendum / notice type entries.
     * These are useful later as a separate data type,
     * but they are not primary tenders for this collector.
     */
    const noticeWords = [
      "corrigendum",
      "prebid query",
      "bid due date extension",
      "date extended",
      "counter sign not required",
      "form-b"
    ];

    if (
      noticeWords.some(word =>
        lowerTitle.includes(word)
      )
    ) {
      continue;
    }

    /*
     * Accept only links that CPPP uses for tender/detail
     * style navigation.
     */
    const looksLikeTender =
      lowerHref.includes("frontendviewtender") ||
      lowerHref.includes("viewtender") ||
      lowerHref.includes("directlink");

    if (!looksLikeTender) {
      continue;
    }

    /*
     * Additional protection against obvious right-menu links.
     */
    if (
      lowerHref.includes("webhomeborder") ||
      lowerTitle.startsWith("online bidder")
    ) {
      continue;
    }

    const officialLink = href.startsWith("http")
      ? href
      : new URL(href, CPPP_URL).href;

    tenders.push({
      title,
      officialLink
    });
  }

  /*
   * Remove duplicate links.
   */
  const unique = [];
  const seen = new Set();

  for (const tender of tenders) {
    if (seen.has(tender.officialLink)) {
      continue;
    }

    seen.add(tender.officialLink);
    unique.push(tender);
  }

  return unique;
}

async function fetchCPPP() {
  const response = await fetch(CPPP_URL, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language":
        "en-IN,en;q=0.9",
      "Referer":
        "https://www.eprocure.gov.in/"
    }
  });

  const html = await response.text();

  if (!response.ok) {
    throw new Error(
      `CPPP request failed with status ${response.status}`
    );
  }

  const tenders = extractLatestTenders(html);

  return {
    source: "CPPP",
    success: true,
    fetchedAt: new Date().toISOString(),
    tenderCount: tenders.length,
    tenders
  };
}

module.exports = {
  CPPP_URL,
  extractLatestTenders,
  fetchCPPP
};
