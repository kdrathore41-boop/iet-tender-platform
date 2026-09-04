/*
 IET - CPPP Source #1
 --------------------
 Central Public Procurement Portal

 This module provides the source configuration
 and a safe entry point for officially obtained
 CPPP tender records.

 It does NOT bypass CAPTCHA or restricted access.
*/

const CPPP_SOURCE = {
  name: "Central Public Procurement Portal",
  shortName: "CPPP",
  country: "India",
  type: "Government",
  officialUrl: "https://www.eprocure.gov.in/eprocure/app"
};

function prepareCPPPRecords(records) {
  if (!Array.isArray(records)) {
    throw new Error("CPPP records must be an array");
  }

  return records;
}

module.exports = {
  CPPP_SOURCE,
  prepareCPPPRecords
};
