// IET Live CPPP Cleaner
// Fetches live CPPP data and removes notices/corrigendums.

const { cleanCPPTenders } = require("./cppp-cleaner");

const LIVE_CPPP_API =
  "https://iet-tender-platform.onrender.com/api/cppp";

async function fetchCleanCPPP() {
  const response = await fetch(LIVE_CPPP_API);

  if (!response.ok) {
    throw new Error(
      `Live CPPP API failed with status ${response.status}`
    );
  }

  const data = await response.json();

  if (!data.success || !Array.isArray(data.tenders)) {
    throw new Error("Invalid CPPP live data");
  }

  const cleaned = cleanCPPTenders(data.tenders);

  return {
    success: true,
    source: "CPPP",
    sourceType: "live-clean",
    originalCount: data.tenders.length,
    cleanedCount: cleaned.length,
    tenders: cleaned
  };
}

module.exports = {
  fetchCleanCPPP
};
