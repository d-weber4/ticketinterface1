const fs = require('fs');
const path = require('path');

const exts = ['.ts', '.tsx'];

function commentUnusedImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let newLines = [...lines];

  // Find all import lines
  lines.forEach((line, idx) => {
    const importMatch = line.match(/^import\s+(\{[^}]+\}|\w+|\*\s+as\s+\w+)\s+from\s+['"][^'"]+['"]/);
    if (importMatch) {
      // Extract imported identifiers
      let identifiers = [];
      const curly = importMatch[1].match(/\{([^}]+)\}/);
      if (curly) {
        identifiers = curly[1].split(',').map(s => s.trim().split(' as ')[0]);
      } else if (importMatch[1].startsWith('* as ')) {
        identifiers = [importMatch[1].replace('* as ', '').trim()];
      } else {
        identifiers = [importMatch[1].trim()];
      }

      // Check if any identifier is used in the rest of the file
      const rest = lines.slice(0, idx).concat(lines.slice(idx + 1)).join('\n');
      const unused = identifiers.every(id => !new RegExp(`\\b${id}\\b`).test(rest));
      if (unused) {
        newLines[idx] = '// ' + line;
        console.log(`Commented unused import in: ${filePath} (${line.trim()})`);
      }
    }
  });

  const newContent = newLines.join('\n');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(fullPath))) {
      commentUnusedImportsInFile(fullPath);
    }
  });
}

walk(process.cwd());
console.log('Unused import fix complete.');