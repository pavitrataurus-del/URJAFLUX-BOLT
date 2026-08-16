const fs = require('fs');
const content = fs.readFileSync('src/components/ReportsPage.tsx', 'utf8');

const regex = /hi: {([^}]*)}/s;
const matches = content.match(regex);
console.log(matches ? matches[1] : 'Not found');
