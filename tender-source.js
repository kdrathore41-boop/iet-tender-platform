// IET Tender Source #1
// Central Public Procurement Portal (CPPP)

const CPPP_SOURCE = {
  name: "Central Public Procurement Portal",
  shortName: "CPPP",
  country: "India",
  type: "Government",
  officialUrl: "https://www.eprocure.gov.in/eprocure/app"
};

// Convert source data into IET's standard tender format
function normalizeTender(tender) {
  return {
    id: tender.id || "",
    title: tender.title || "",
    organization: tender.organization || "",
    location: tender.location || "",
    state: tender.state || "",
    category: tender.category || "",
    value: tender.value || "",
    publishDate: tender.publishDate || "",
    closingDate: tender.closingDate || "",
    tenderFee: tender.tenderFee || "",
    emd: tender.emd || "",
    workPeriod: tender.workPeriod || "",
    status: tender.status || "Open",
    officialSource: CPPP_SOURCE.shortName,
    officialLink: tender.officialLink || CPPP_SOURCE.officialUrl
  };
}

// Prepare multiple tenders for IET
function normalizeTenders(tenders) {
  if (!Array.isArray(tenders)) {
    return [];
  }

  return tenders.map(normalizeTender);
}

module.exports = {
  CPPP_SOURCE,
  normalizeTender,
  normalizeTenders
};
