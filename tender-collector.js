
// IET Automatic Tender Collector
// Source #1: Central Public Procurement Portal (CPPP)

const CPPP_URL = "https://www.eprocure.gov.in/eprocure/app";

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLatestTenders(html) {
  const tenders = [];

  // Read tender links from the public CPPP Latest Tenders section.
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const title = cleanText(
      match[2].replace(/<[^>]+>/g, " ")
    );

    const href = match[1];

    if (!title) {
      continue;
    }

    // Keep only likely tender links.
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
  const response = await fetch(CPPP_URL);

  if (!response.ok) {
    throw new Error(
      `CPPP request failed with status ${response.status}`
    );
  }

  const html = await response.text();

  return {
    source: "CPPP",
    success: true,
    fetchedAt: new Date().toISOString(),
    tenderCount: extractLatestTenders(html).length,
    tenders: extractLatestTenders(html)
  };
}

module.exports = {
  CPPP_URL,
  extractLatestTenders,
  fetchCPPP
};
