const fs = require('fs');
const content = fs.readFileSync('src/components/ReportsPage.tsx', 'utf8');

const regex = /[\u0900-\u097F]+.*?[\(\)]/g;
const matches = content.match(regex);
console.log(matches);
