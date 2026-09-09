// IET Live API
// CPPP Live + Clean Tender Feed
// Existing api.js remains untouched

const http = require("http");
const fs = require("fs");

const { fetchCPPP } = require("./tender-collector");
const { normalizeCPPTenders } = require("./cppp-adapter");
const { cleanCPPTenders } = require("./cppp-cleaner");
const { normalizeTenders } = require("./tender-source");

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Health
  if (pathname === "/api/health") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      success: true,
      platform: "IET - India E-Tender Platform",
      status: "Backend is working",
      version: "live",
      source: "CPPP",
      message: "IET Live API is ready"
    }));

    return;
  }

  // LIVE CPPP TENDERS
  if (pathname === "/api/tenders" || pathname === "/api/cppp") {
    try {
      const result = await fetchCPPP();

      const records = result.tenders.map((tender, index) => ({
        id: `CPPP-LIVE-${index + 1}`,
        title: tender.title,
        officialLink: tender.officialLink,
        officialSource: "CPPP",
        status: "Open"
      }));

      const cleaned = cleanCPPTenders(records);
      const tenders = normalizeCPPTenders(cleaned);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: true,
        platform: "IET - India E-Tender Platform",
        source: "CPPP",
        sourceType: "live-clean",
        originalCount: records.length,
        cleanedCount: tenders.length,
        fetchedAt: result.fetchedAt,
        tenders
      }));

    } catch (error) {
      res.writeHead(502, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: false,
        source: "CPPP",
        error: "Unable to fetch live CPPP tenders",
        details: error.message
      }));
    }

    return;
  }

  // Demo data backup
  if (pathname === "/api/demo-tenders") {
    try {
      const data = fs.readFileSync("./data.json", "utf8");
      const json = JSON.parse(data);
      const tenders = normalizeTenders(json.tenders);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: true,
        sourceType: "demo",
        count: tenders.length,
        tenders
      }));

    } catch (error) {
      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: false,
        error: "Unable to load demo tender data",
        details: error.message
      }));
    }

    return;
  }

  // Unknown endpoint
  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    success: false,
    error: "API endpoint not found",
    path: req.url
  }));
});

server.listen(PORT, () => {
  console.log(`IET Live API running on port ${PORT}`);
});
