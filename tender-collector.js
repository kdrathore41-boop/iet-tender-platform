// IET Automatic Tender Collector
// Source #1: Central Public Procurement Portal (CPPP)
//
// Safe public-source collector.
// Does NOT bypass CAPTCHA or restricted access.

const CPPP_URL =
  "https://www.eprocure.gov.in/eprocure/app";

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLatestTenders(html) {
  const tenders = [];

  const linkRegex =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const title = cleanText(
      match[2].replace(/<[^>]+>/g, " ")
    );

    const href = match[1];

    if (!title) {
      continue;
    }

    if (
      href.includes("FrontEndViewTender") ||
      href.includes("viewTender") ||
      href.includes("DirectLink")
    ) {
      tenders.push({
        title,
        officialLink: href.startsWith("http")
          ? href
          : new URL(href, CPPP_URL).href
      });
    }
  }

  return tenders;
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
