const http = require("http");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api/health") {

    res.writeHead(200);

    res.end(JSON.stringify({
      success: true,
      platform: "IET - India E-Tender Platform",
      status: "Backend is working",
      message: "IET API is ready"
    }));

    return;
  }


  if (req.url === "/api/tenders") {

    try {

      const data =
        fs.readFileSync("./data.json", "utf8");

      const json =
        JSON.parse(data);

      res.writeHead(200);

      res.end(JSON.stringify({
        success: true,
        count: json.tenders.length,
        tenders: json.tenders
      }));

    } catch (error) {

      res.writeHead(500);

      res.end(JSON.stringify({
        success: false,
        error: "Unable to load tender data"
      }));

    }

    return;
  }


  res.writeHead(404);

  res.end(JSON.stringify({
    success: false,
    error: "API endpoint not found"
  }));

});


server.listen(PORT, () => {

  console.log(
    `IET API running on port ${PORT}`
  );

});
