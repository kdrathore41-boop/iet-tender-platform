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
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl(url) {
  return String(url || "")
    .replace(/&amp;/gi, "&")
    .trim();
}

function extractLatestTenders(html) {
  const tenders = [];

  // Find every table row on the public CPPP page.
  const rowRegex =
    /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    const cells = [];

    const cellRegex =
      /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;

    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cleanText(cellMatch[1]));
    }

    // Latest Tender rows have at least 5 cells.
    if (cells.length < 5) {
      continue;
    }

    const serialNo = cells[0];
    const title = cells[1];
    const referenceNo = cells[2];
    const closingDate = cells[3];
    const bidOpeningDate = cells[4];

    // Serial number must look like 1, 2, 3...
    if (!/^\d+\.?$/.test(serialNo)) {
      continue;
    }

    // Ignore headers / empty rows.
    if (
      !title ||
      !referenceNo ||
      title.toLowerCase() === "tender title"
    ) {
      continue;
    }

    /*
     * Find a link anywhere inside this row.
     */
    const links = [];

    const linkRegex =
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;

    let linkMatch;

    while ((linkMatch = linkRegex.exec(rowHtml)) !== null) {
      links.push(cleanUrl(linkMatch[1]));
    }

    if (links.length === 0) {
      continue;
    }

    /*
     * Prefer the first actual tender-detail style link.
     */
    let officialLink = links.find(link => {
      const lower = link.toLowerCase();

      return (
        lower.includes("directlink") ||
        lower.includes("viewtender") ||
        lower.includes("frontendviewtender")
      );
    });

    if (!officialLink) {
      officialLink = links[0];
    }

    const absoluteLink =
      officialLink.startsWith("http")
        ? officialLink
        : new URL(
            officialLink,
            CPPP_URL
          ).href;

    tenders.push({
      serialNo,
      title,
      referenceNo,
      closingDate,
      bidOpeningDate,
      officialLink: absoluteLink
    });
  }

  /*
   * Remove duplicate tender records.
   */
  const unique = [];
  const seen = new Set();

  for (const tender of tenders) {
    const key =
      tender.referenceNo ||
      tender.officialLink;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(tender);
  }

  /*
   * Keep only the first 10 Latest Tender records.
   * CPPP homepage currently displays 10 in this section.
   */
  return unique.slice(0, 10);
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

  const tenders =
    extractLatestTenders(html);

  return {
    source: "CPPP",
    success: true,
    fetchedAt:
      new Date().toISOString(),
    tenderCount: tenders.length,
    tenders
  };
}

module.exports = {
  CPPP_URL,
  cleanText,
  cleanUrl,
  extractLatestTenders,
  fetchCPPP
};
