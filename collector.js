const fs = require("fs");

const INPUT_FILE = "./data.json";

function validateTender(tender) {

  const requiredFields = [
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

  const missing = requiredFields.filter(
    field =>
      !tender[field] ||
      String(tender[field]).trim() === ""
  );

  return {
    valid: missing.length === 0,
    missing
  };
}


function runCollector() {

  console.log("=================================");
  console.log("IET Tender Collector");
  console.log("=================================");

  try {

    const raw =
      fs.readFileSync(INPUT_FILE, "utf8");

    const data =
      JSON.parse(raw);

    if (!Array.isArray(data.tenders)) {
      throw new Error(
        "data.json must contain a tenders array"
      );
    }

    let valid = 0;
    let invalid = 0;

    data.tenders.forEach((tender, index) => {

      const result =
        validateTender(tender);

      if (result.valid) {

        valid++;

        console.log(
          `✓ Tender ${index + 1}: ${tender.id}`
        );

      } else {

        invalid++;

        console.log(
          `✗ Tender ${index + 1}: ${tender.id || "Unknown"}`
        );

        console.log(
          "  Missing:",
          result.missing.join(", ")
        );
      }

    });


    console.log("---------------------------------");

    console.log(
      `Total: ${data.tenders.length}`
    );

    console.log(
      `Valid: ${valid}`
    );

    console.log(
      `Invalid: ${invalid}`
    );

    console.log("---------------------------------");

    if (invalid === 0) {

      console.log(
        "IET Collector validation: PASS"
      );

    } else {

      console.log(
        "IET Collector validation: REVIEW REQUIRED"
      );

    }

  } catch (error) {

    console.error(
      "Collector error:",
      error.message
    );

    process.exit(1);
  }
}


runCollector();
