// IET - CPPP Integration Test
// CPPP Source -> CPPP Adapter -> IET Format

const {
  prepareCPPPRecords
} = require("./cppp-source");

const {
  normalizeCPPTenders
} = require("./cppp-adapter");

const sampleRecords = [
  {
    tenderId: "CPPP-INTEGRATION-001",
    tenderTitle: "Sample Government Road Work",
    organization: "Public Works Department",
    location: "Bhopal",
    state: "Madhya Pradesh",
    category: "Road",
    estimatedValue: "₹5 Crore",
    publishedDate: "4 September 2026",
    bidSubmissionEndDate: "30 September 2026",
    tenderFee: "₹5,000",
    emd: "₹10,00,000",
    workPeriod: "12 Months",
    status: "Open",
    officialLink:
      "https://www.eprocure.gov.in/eprocure/app"
  }
];

try {
  const prepared =
    prepareCPPPRecords(sampleRecords);

  const tenders =
    normalizeCPPTenders(prepared);

  if (tenders.length !== 1) {
    throw new Error(
      `Expected 1 tender, got ${tenders.length}`
    );
  }

  const tender = tenders[0];

  const required = [
    "id",
    "title",
    "organization",
    "location",
    "state",
    "category",
    "value",
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

  if (missing.length > 0) {
    throw new Error(
      `Missing fields: ${missing.join(", ")}`
    );
  }

  console.log(
    JSON.stringify(tender, null, 2)
  );

  console.log(
    "CPPP INTEGRATION TEST: PASS"
  );

} catch (error) {

  console.error(
    "CPPP INTEGRATION TEST: FAILED"
  );

  console.error(error.message);

  process.exit(1);
    }
