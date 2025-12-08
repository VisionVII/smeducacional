const fs = require('fs');
const content = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');
const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Contar { e } nesta linha
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') {
      stack.push({ line: i + 1, col: j + 1, char: '{' });
    } else if (line[j] === '}') {
      if (stack.length > 0) {
        stack.pop();
      } else {
        console.log(`Linha ${i + 1}: Fecha } sem abrir`);
      }
    }
  }
}

if (stack.length > 0) {
  console.log(`\nChaves não fechadas: ${stack.length}`);
  for (const item of stack.slice(-5)) {
    const lineContent = lines[item.line - 1].substring(0, 120);
    console.log(`  Linha ${item.line}, col ${item.col}: ${lineContent}`);
  }
}
