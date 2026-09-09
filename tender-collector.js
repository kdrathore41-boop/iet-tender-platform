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

/*
 * Extract the Latest Tenders table from CPPP.
 *
 * Expected public fields:
 * Tender Title
 * Reference No
 * Closing Date
 * Bid Opening Date
 */
function extractLatestTenders(html) {
  const tenders = [];

  /*
   * First find the Latest Tenders section.
   * We intentionally stop before Latest Corrigendums.
   */
  const latestMatch = html.match(
    /Latest\s+Tenders([\s\S]*?)(?=Latest\s+Corrigendums|$)/i
  );

  if (!latestMatch) {
    return [];
  }

  const section = latestMatch[1];

  /*
   * Extract table rows.
   */
  const rowRegex =
    /<tr[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;

  while ((rowMatch = rowRegex.exec(section)) !== null) {
    const row = rowMatch[1];

    /*
     * Extract cells.
     */
    const cells = [];

    const cellRegex =
      /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;

    let cellMatch;

    while ((cellMatch = cellRegex.exec(row)) !== null) {
      cells.push(
        cleanText(cellMatch[1])
      );
    }

    /*
     * A valid Latest Tender row normally contains:
     *
     * Number
     * Tender Title
     * Reference No
     * Closing Date
     * Bid Opening Date
     */
    if (cells.length < 5) {
      continue;
    }

    const number = cells[0];
    const title = cells[1];
    const referenceNo = cells[2];
    const closingDate = cells[3];
    const bidOpeningDate = cells[4];

    /*
     * Skip table header.
     */
    if (
      title.toLowerCase() === "tender title" ||
      referenceNo.toLowerCase() === "reference no"
    ) {
      continue;
    }

    if (!title || !referenceNo) {
      continue;
    }

    /*
     * Find the tender-detail link inside this row.
     */
    const linkMatch =
      row.match(
        /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/i
      );

    if (!linkMatch) {
      continue;
    }

    const officialLink = cleanUrl(
      linkMatch[1]
    );

    if (!officialLink) {
      continue;
    }

    const absoluteLink =
      officialLink.startsWith("http")
        ? officialLink
        : new URL(
            officialLink,
            CPPP_URL
          ).href;

    tenders.push({
      serialNo: number,
      title,
      referenceNo,
      closingDate,
      bidOpeningDate,
      officialLink: absoluteLink
    });
  }

  /*
   * Remove duplicate tender links.
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
