// IET CPPP Cleaner
// Keeps genuine tender records separate from notices/corrigendums.

const NOTICE_WORDS = [
  "corrigendum",
  "pre bid meeting",
  "pre-bid meeting",
  "bid due date extension",
  "date extended",
  "amendment",
  "extension of bid",
  "extended by",
  "clarification",
  "notice"
];

function isGenuineTender(tender) {
  const title = String(tender?.title || "").trim().toLowerCase();

  if (!title) {
    return false;
  }

  return !NOTICE_WORDS.some(word => title.includes(word));
}

function cleanCPPTenders(tenders) {
  if (!Array.isArray(tenders)) {
    return [];
  }

  return tenders.filter(isGenuineTender);
}

module.exports = {
  isGenuineTender,
  cleanCPPTenders
};
