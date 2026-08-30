const http = require("http");
const fs = require("fs");
const { normalizeTenders } = require("./tender-source");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

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

  if (pathname === "/api/health") {

    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      success: true,
      platform: "IET - India E-Tender Platform",
      status: "Backend is working",
      message: "IET API is ready"
    }));

    return;
  }

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
        tenders: tenders
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
  console.log(`IET API running on port ${PORT}`);
});
