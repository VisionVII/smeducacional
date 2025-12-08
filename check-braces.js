const fs = require('fs');
const content = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');
const lines = content.split('\n');
let opens = 0, closes = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/\{/g) || []).length;
  const closeCount = (line.match(/\}/g) || []).length;
  opens += openCount;
  closes += closeCount;

  const diff = opens - closes;
  if (diff > 0 && i > 100) {
    console.log(`Linha ${i + 1}: opens=${opens}, closes=${closes}, diff=${diff}`);
    console.log('  ' + line.substring(0, 120));
  }
}

console.log(`\nTotal: opens=${opens}, closes=${closes}, diff=${opens - closes}`);
