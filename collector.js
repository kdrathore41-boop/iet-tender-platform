const fs = require("fs");

const INPUT_FILE = "./data.json";
const OUTPUT_FILE = "./validated-tenders.json";

function validateTender(tender) {
  const required = [
    "id",
    "title",
    "organization",
    "location",
    "state",
    "category",
    "publishDate",
    "closingDate",
    "officialSource",
    "officialLink"
  ];

  const missing = required.filter(
    field =>
      !tender[field] ||
      String(tender[field]).trim() === ""
  );

  return {
    valid: missing.length === 0,
    missing
  };
}

function main() {
  console.log("IET Tender Data Validator");
  console.log("-------------------------");

  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error("data.json not found");
  }

  const data = JSON.parse(
    fs.readFileSync(INPUT_FILE, "utf8")
  );

  if (!Array.isArray(data.tenders)) {
    throw new Error(
      "data.json must contain a 'tenders' array"
    );
  }

  const validTenders = [];
  const rejected = [];

  data.tenders.forEach((tender, index) => {
    const result = validateTender(tender);

    if (result.valid) {
      validTenders.push({
        ...tender,
        verificationStatus: "SOURCE_REVIEW_REQUIRED",
        lastUpdated: new Date().toISOString()
      });
    } else {
      rejected.push({
        index,
        id: tender.id || null,
        missing: result.missing
      });
    }
  });

  const output = {
    platform: "IET - India E-Tender Platform",
    generatedAt: new Date().toISOString(),
    totalInput: data.tenders.length,
    valid: validTenders.length,
    rejected: rejected.length,
    tenders: validTenders,
    rejectedRecords: rejected
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log(`Input tenders: ${output.totalInput}`);
  console.log(`Valid tenders: ${output.valid}`);
  console.log(`Rejected: ${output.rejected}`);
  console.log(`Created: ${OUTPUT_FILE}`);

  if (rejected.length === 0) {
    console.log("IET validation: PASS");
  } else {
    console.log("IET validation: REVIEW REQUIRED");
  }
}

try {
  main();
} catch (error) {
  console.error("Collector error:", error.message);
  process.exit(1);
      }
