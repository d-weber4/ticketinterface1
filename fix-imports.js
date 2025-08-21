const fs = require('fs');
const path = require('path');

const exts = ['.js', '.jsx', '.ts', '.tsx'];

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Regex: matches 'package@version' or "@scope/package@version"
  const importRegex = /(['"`])(@?[\w\-\/]+)@[\d.]+(['"`])/g;
  const newContent = content.replace(importRegex, '$1$2$3');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(fullPath))) {
      fixImportsInFile(fullPath);
    }
  });
}

// Start from the current directory
walk(process.cwd());
console.log('Import path fix complete.');