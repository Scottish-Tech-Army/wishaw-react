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

function readXlsx(filePath) {
  const tmp = path.join(process.env.TEMP, 'xlsx_extract_' + Date.now());
  fs.mkdirSync(tmp, { recursive: true });
  const zipPath = path.join(tmp, 'book.zip');
  fs.copyFileSync(filePath, zipPath);
  execSync(`powershell -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tmp}\\extracted' -Force"`, { timeout: 15000 });
  
  // Read shared strings
  const ssPath = path.join(tmp, 'extracted', 'xl', 'sharedStrings.xml');
  let strings = [];
  if (fs.existsSync(ssPath)) {
    const ssXml = fs.readFileSync(ssPath, 'utf8');
    const matches = ssXml.match(/<t[^>]*>([^<]*)<\/t>/g);
    if (matches) {
      strings = matches.map(m => m.replace(/<[^>]+>/g, ''));
    }
  }
  
  // Read sheets
  const sheetsDir = path.join(tmp, 'extracted', 'xl', 'worksheets');
  const sheetFiles = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.xml'));
  let result = '';
  for (const sf of sheetFiles) {
    result += `\n=== Sheet: ${sf} ===\n`;
    const sheetXml = fs.readFileSync(path.join(sheetsDir, sf), 'utf8');
    const rows = sheetXml.match(/<row[^>]*>.*?<\/row>/gs);
    if (rows) {
      for (const row of rows) {
        const cells = row.match(/<c[^>]*>.*?<\/c>/gs) || [];
        const vals = cells.map(c => {
          const isShared = c.includes('t="s"');
          const vMatch = c.match(/<v>([^<]*)<\/v>/);
          if (!vMatch) return '';
          if (isShared) return strings[parseInt(vMatch[1])] || vMatch[1];
          return vMatch[1];
        });
        result += vals.join(' | ') + '\n';
      }
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  return result;
}

const refDir = 'C:\\Users\\5613574\\Downloads\\LTC-eSports\\LTC-eSports\\reference-files';

console.log('=============================================');
console.log('=== FILE 1: PROJECT SCOPE ===');
console.log('=============================================');
console.log(readDocx(path.join(refDir, 'STA+Project+Scope+WishawYMCA_2026 (1) (1).docx')));

console.log('\n\n=============================================');
console.log('=== FILE 2: DIGITAL BADGING BRIEF ===');
console.log('=============================================');
console.log(readDocx(path.join(refDir, 'wymca-digital-badging-breif.docx')));

console.log('\n\n=============================================');
console.log('=== FILE 3: BADGE TRACKER SAMPLE ===');
console.log('=============================================');
console.log(readXlsx(path.join(refDir, 'digital-badge-tracker-sample.xlsx')));
