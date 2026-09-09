// IET API V2
// Safe version - keeps the existing api.js untouched

const http = require("http");
const fs = require("fs");

const { normalizeTenders } = require("./tender-source");
const { fetchCPPP } = require("./tender-collector");
const { normalizeCPPTenders } = require("./cppp-adapter");
const { cleanCPPTenders } = require("./cppp-cleaner");

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
      version: "v2",
      message: "IET API V2 is ready"
    }));

    return;
  }

  // Existing demo data
  if (pathname === "/api/tenders") {
    try {
      const data = fs.readFileSync("./data.json", "utf8");
      const json = JSON.parse(data);

      const tenders = normalizeTenders(json.tenders);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: true,
        count: tenders.length,
        sourceType: "demo",
        tenders
      }));

    } catch (error) {
      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: false,
        error: "Unable to load tender data",
        details: error.message
      }));
    }

    return;
  }

  // Live CPPP
  if (pathname === "/api/cppp") {
    try {
      const result = await fetchCPPP();

      const records = result.tenders.map((tender, index) => ({
        id: `CPPP-LIVE-${index + 1}`,
        title: tender.title,
        officialLink: tender.officialLink,
        officialSource: "CPPP"
      }));

      const tenders = normalizeCPPTenders(records);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: true,
        source: "CPPP",
        sourceType: "live-public-listing",
        fetchedAt: result.fetchedAt,
        count: tenders.length,
        tenders
      }));

    } catch (error) {
      res.writeHead(502, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: false,
        source: "CPPP",
        error: "Unable to fetch CPPP public listing",
        details: error.message
      }));
    }

    return;
  }

  // Clean live CPPP
  if (pathname === "/api/cppp-clean") {
    try {
      const result = await fetchCPPP();

      const records = result.tenders.map((tender, index) => ({
        id: `CPPP-LIVE-${index + 1}`,
        title: tender.title,
        officialLink: tender.officialLink,
        officialSource: "CPPP"
      }));

      const cleaned = cleanCPPTenders(records);
      const tenders = normalizeCPPTenders(cleaned);

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        success: true,
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
        error: "Unable to create clean CPPP feed",
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
  console.log(`IET API V2 running on port ${PORT}`);
});
