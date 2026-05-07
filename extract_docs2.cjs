const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readDocx(filePath) {
  const tmp = path.join(process.env.TEMP, 'docx_extract_' + Date.now());
  fs.mkdirSync(tmp, { recursive: true });
  const zipPath = path.join(tmp, 'doc.zip');
  fs.copyFileSync(filePath, zipPath);
  execSync(`powershell -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tmp}\\extracted' -Force"`, { timeout: 15000 });
  const xmlPath = path.join(tmp, 'extracted', 'word', 'document.xml');
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  fs.rmSync(tmp, { recursive: true, force: true });
  return text;
}

const refDir = 'C:\\Users\\5613574\\Downloads\\LTC-eSports\\LTC-eSports\\reference-files';
let output = '';
output += '=== FILE 1: PROJECT SCOPE ===\n';
output += readDocx(path.join(refDir, 'STA+Project+Scope+WishawYMCA_2026 (1) (1).docx'));
output += '\n\n=== FILE 2: DIGITAL BADGING BRIEF ===\n';
output += readDocx(path.join(refDir, 'wymca-digital-badging-breif.docx'));
fs.writeFileSync('reference_text.txt', output, 'utf8');
console.log('Written to reference_text.txt');
