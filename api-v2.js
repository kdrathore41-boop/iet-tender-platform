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
  if (pathname
