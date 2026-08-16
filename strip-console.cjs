const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.ts" -o -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  content = content.replace(/^[ \t]*console\.log\(.*?\);\s*$/gm, '');
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log(`Stripped console logs from ${file}`);
  }
});
