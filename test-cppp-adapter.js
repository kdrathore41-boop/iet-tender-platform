const {
  normalizeCPPTender
} = require("./cppp-adapter");

const sampleCPPTender = {
  tenderId: "CPPP-TEST-001",
  tenderTitle: "Sample Government Road Work",
  organization: "Public Works Department",
  location: "Bhopal",
  state: "Madhya Pradesh",
  category: "Road",
  estimatedValue: "₹5 Crore",
  publishedDate: "28 August 2026",
  bidSubmissionEndDate: "30 September 2026",
  tenderFee: "₹5,000",
  emd: "₹10,00,000",
  workPeriod: "12 Months",
  status: "Open",
  officialLink:
    "https://www.eprocure.gov.in/eprocure/app"
};

try {

  const tender =
    normalizeCPPTender(sampleCPPTender);

  console.log(
    JSON.stringify(tender, null, 2)
  );

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

  const missing =
    required.filter(
      field =>
        !tender[field] ||
        String(tender[field]).trim() === ""
    );

  if (missing.length > 0) {

    console.error(
      "TEST FAILED"
    );

    console.error(
      "Missing:",
      missing.join(", ")
    );

    process.exit(1);
  }

  console.log(
    "CPPP ADAPTER TEST: PASS"
  );

} catch (error) {

  console.error(
    "CPPP ADAPTER TEST: FAILED"
  );

  console.error(
    error.message
  );

  process.exit(1);
    }
