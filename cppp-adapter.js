/*
 IET - CPPP Adapter
 ------------------
 Converts officially obtained CPPP tender records
 into the standard IET tender format.

 IMPORTANT:
 This file does NOT bypass CAPTCHA or restricted access.
 It expects tender data to be supplied from an
 authorised/public source.
*/

function normalizeCPPTender(source) {

  if (!source || typeof source !== "object") {
    throw new Error("Invalid CPPP tender record");
  }

  return {
    id: source.id || source.tenderId || "",

    title: source.title || source.tenderTitle || "",

    organization:
      source.organization ||
      source.organisation ||
      source.department ||
      "",

    location:
      source.location ||
      source.city ||
      "",

    state:
      source.state ||
      "",

    category:
      source.category ||
      "",

    value:
      source.value ||
      source.estimatedValue ||
      "",

    publishDate:
      source.publishDate ||
      source.publishedDate ||
      "",

    closingDate:
      source.closingDate ||
      source.bidSubmissionEndDate ||
      "",

    tenderFee:
      source.tenderFee ||
      "",

    emd:
      source.emd ||
      "",

    workPeriod:
      source.workPeriod ||
      "",

    status:
      source.status ||
      "Open",

    officialSource: "CPPP",

    officialLink:
      source.officialLink ||
      source.url ||
      "https://www.eprocure.gov.in/eprocure/app",

    verificationStatus:
      "SOURCE_REVIEW_REQUIRED",

    lastUpdated:
      new Date().toISOString()
  };
}


function normalizeCPPTenders(records) {

  if (!Array.isArray(records)) {
    throw new Error("CPPP records must be an array");
  }

  return records
    .map(normalizeCPPTender)
    .filter(tender => tender.id && tender.title);
}


module.exports = {
  normalizeCPPTender,
  normalizeCPPTenders
};
