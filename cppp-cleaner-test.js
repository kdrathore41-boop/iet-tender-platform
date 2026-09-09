const { cleanCPPTenders } = require("./cppp-cleaner");

const testTenders = [
  {
    title: "Road Construction Work at Maharashtra"
  },
  {
    title: "Pre bid meeting"
  },
  {
    title: "Corrigendum for Tender"
  },
  {
    title: "Construction of Government Building"
  },
  {
    title: "Bid Due Date Extension"
  }
];

const cleaned = cleanCPPTenders(testTenders);

console.log("Original records:", testTenders.length);
console.log("Genuine tenders:", cleaned.length);
console.log("Cleaned tenders:", cleaned);

module.exports = {
  cleaned
};
